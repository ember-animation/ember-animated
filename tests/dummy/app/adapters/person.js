import DS from 'ember-data';
import faker from 'faker';

export default DS.JSONAPIAdapter.extend({
  shouldReloadAll() {
    return true;
  },
  _makeFakePeople() {
    if (!this._fakePeople) {
      let people = [];
      for (let i = 0; i < 10; i++) {
        people.push({
          type: 'person',
          id: String(i),
          attributes: {
            name: faker.name.firstName(),
            'avatar-url': faker.internet.avatar()
          }
        });
      }
      this._fakePeople = {
        data: people
      };
    }
    return this._fakePeople;
  },
  findAll() {
    return this._makeFakePeople();
  },
  findRecord(store, type, id) {
    let payload = this._makeFakePeople();
    return {
      data: payload.data.find(entry => entry.id === id)
    };
  }
});
