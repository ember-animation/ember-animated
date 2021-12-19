//BEGIN-SNIPPET person-snippet.js
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import faker from 'faker';

export default class extends JSONAPIAdapter {
  shouldReloadAll() {
    return true;
  }

  _makeFakePeople() {
    if (!this._fakePeople) {
      let people = [];
      for (let i = 0; i < 8; i++) {
        people.push(
          Object.seal({
            type: 'person',
            id: String(i),
            attributes: Object.seal({
              name: faker.name.firstName(),
              'avatar-url': faker.internet.avatar(),
            }),
          }),
        );
      }
      // This is a shorthand way to deep copy everything, because
      // Ember Data will mutate the objects we give it.
      this._fakePeople = JSON.stringify({
        data: people,
      });
    }
    return JSON.parse(this._fakePeople);
  }

  findAll() {
    return this._makeFakePeople();
  }

  findRecord(store, type, id) {
    let payload = this._makeFakePeople();
    return {
      data: payload.data.find((entry) => entry.id === id),
    };
  }
}
//END-SNIPPET
