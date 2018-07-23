//BEGIN-SNIPPET transitions-moveover-snippet.js
import Component from '@ember/component';
import { toLeft, toRight } from 'ember-animated/transitions/move-over';


export default Component.extend({
  init(){
    this._super();
    this.words = ['hello', 'goodbye'];
    this.message = 'hello';
  },

  toLeft,
  toRight,

  rules({ oldItems, newItems}){
    if(newItems[0]==="goodbye" && oldItems[0]==="hello"){
      return toRight;
    }else{
      return toLeft;
    }
  },

  actions: {
    chooseMessage(selected) {
      this.set('message', selected);
    },
  }


});
//END-SNIPPET