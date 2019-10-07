import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { Promise, wait } from 'ember-animated';

module('Unit | Service | motion', function(hooks) {
  setupTest(hooks);

  test('it can do basic far matching', async function(assert) {
    let service = this.owner.lookup('service:-ea-motion');

    let sprite1 = { owner: { id: 1 } };
    let sprite2 = { owner: { id: 2 } };

    let p1 = service.get('farMatch').perform(null, [], [], [sprite1]);
    let p2 = service.get('farMatch').perform(null, [sprite1, sprite2], [], []);

    let { farMatches } = await p1;
    assert.ok(farMatches.get(sprite1), 'p1 saw a match for sprite1');

    farMatches = (await p2).farMatches;
    assert.ok(farMatches.get(sprite1), 'p2 saw a match for sprite1');
    assert.ok(!farMatches.get(sprite2), 'p2 saw no match for sprite2');

    assert.ok(service);
  });

  test('entangles animations with matches', async function(assert) {
    let service = this.owner.lookup('service:-ea-motion');
    let log = [];

    let sprite1 = { owner: { id: 1 } };
    let sprite2 = { owner: { id: 2 } };

    let resolveAnimation1, resolveAnimation2;
    let animation1 = new Promise(r => resolveAnimation1 = r);
    let animation2 = new Promise(r => resolveAnimation2 = r);

    let p1 = service.get('farMatch').perform(animation1, [], [], [sprite1]);
    let p2 = service.get('farMatch').perform(animation2, [sprite1, sprite2], [], []);

    let { matchingAnimatorsFinished: finished1 } = await p1;
    finished1.then(() => log.push('p1 matching animators finished'));

    let { matchingAnimatorsFinished: finished2 } = await p2;
    finished2.then(() => log.push('p2 matching animators finished'));

    await wait(5);
    log.push('resolving animation 1');
    resolveAnimation1();
    await wait(5);
    log.push('resolving animation 2');
    resolveAnimation2();
    await finished1;
    await finished2;
    assert.deepEqual(log, ['resolving animation 1', 'p2 matching animators finished', 'resolving animation 2', 'p1 matching animators finished']);
  });

  test('does not entangle animations without matches', async function(assert) {
    let service = this.owner.lookup('service:-ea-motion');
    let log = [];

    let sprite1 = { owner: { id: 1 } };
    let sprite2 = { owner: { id: 2 } };

    let resolveAnimation1, resolveAnimation2;
    let animation1 = new Promise(r => resolveAnimation1 = r);
    let animation2 = new Promise(r => resolveAnimation2 = r);

    let p1 = service.get('farMatch').perform(animation1, [], [], [sprite1]);
    let p2 = service.get('farMatch').perform(animation2, [sprite2], [], []);

    let { matchingAnimatorsFinished } = await p1;
    matchingAnimatorsFinished.then(() => log.push('p1 matching animators finished'));

    matchingAnimatorsFinished = (await p2).matchingAnimatorsFinished;
    matchingAnimatorsFinished.then(() => log.push('p2 matching animators finished'));

    await wait(5);
    log.push('resolving animation 1');
    resolveAnimation1();
    await wait(5);
    log.push('resolving animation 2');
    resolveAnimation2();
    await matchingAnimatorsFinished;
    assert.deepEqual(log, ['p1 matching animators finished', 'p2 matching animators finished', 'resolving animation 1', 'resolving animation 2']);
  });
});
