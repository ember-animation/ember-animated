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

  rules(message){
    if(message==="hello"){
      return toLeft;
    }else{
      return toRight;
    }
  },

  actions: {
    chooseMessage(word) {
      this.set('message', word);
    }
  }


});
//END-SNIPPET