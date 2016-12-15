import Motion from 'ember-animated/motion';
import Sprite from 'ember-animated/sprite';
import $ from 'jquery';
import Tween from 'ember-animated/tween';
import Transform from 'ember-animated/transform';
import { rAF } from 'ember-animated/concurrency-helpers';

export default class TurnAround extends Motion {
  * animate() {
    let arrow = $(this.sprite.element).find('button > span');
    if (arrow.length < 1) {
      return;
    }
    let sprite = new Sprite(arrow[0]);
    let finalRadians = Math.atan2(sprite.transform.c, sprite.transform.a);
    let initialRadians = finalRadians - Math.PI;
    let tween = new Tween(initialRadians, finalRadians, this.duration);
    sprite.lock();
    try {
    sprite.applyStyles({
      display: 'block'
    });
    while (!tween.done) {
      let cos = Math.cos(tween.currentValue);
      let sin = Math.sin(tween.currentValue);
      let t = sprite.transform.mult(new Transform(cos, sin, -sin, cos, 0, 0));
      sprite.applyStyles({
        transform: t.serialize()
      });
      yield rAF();
    }
    } finally {
      sprite.unlock();
    }
  }
}
