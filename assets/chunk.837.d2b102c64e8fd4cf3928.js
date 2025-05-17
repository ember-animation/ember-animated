(globalThis.webpackChunk_ember_auto_import_=globalThis.webpackChunk_ember_auto_import_||[]).push([[837],{1993:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{MoveSVG:()=>l,default:()=>a})
var n=i(62554),r=(i(63787),i(34721)),s=i(51229)
function o(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function a(t,e,i={}){return new l(t,e,i).run()}a.property=function(t){return this.bind(null,t)}
class l extends n.A{constructor(t,e,i={}){super(e,i),o(this,"prior",null),o(this,"tween",null),this.dimension=t}interrupted(t){this.prior=t.find((t=>t instanceof l&&t.dimension===this.dimension))}*animate(){if(this.prior){let t=this.prior
t.assertHasTween(),this.tween=new r.A(0,Number(this.sprite.getFinalDimension(this.dimension))-t.tween.finalValue,this.duration,this.opts.easing).plus(t.tween)}else this.tween=new r.A(Number(this.sprite.getInitialDimension(this.dimension)),Number(this.sprite.getFinalDimension(this.dimension)),this.duration,this.opts.easing)
for(;!this.tween.done;)this.sprite.element[this.dimension].baseVal.value=this.tween.currentValue,yield(0,s.mf)()}assertHasTween(){if(!this.tween)throw new Error("motion does not have tween")}}},4674:function(t,e){window._eai_r=require,window._eai_d=define},8800:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{default:()=>l})
var n=i(61603),r=i(62663),s=i.n(r),o=i(94438)
function a(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}class l extends(s()){constructor(...t){super(...t),a(this,"tagName",""),a(this,"isEmberAnimatedListElement",!0),a(this,"child",void 0),a(this,"elementToChild",void 0)}didRender(){super.didRender()
let t=this.elementToChild,e=this.child
this._forEachElement((i=>{t.set(i,e)}))}_forEachElement(t){let{firstNode:e,lastNode:i}=(0,o.Z)(this),r=e
for(;r&&(r.nodeType===Node.ELEMENT_NODE?t(r):/^\s*$/.test(r.textContent)||(0,n.warn)("Found bare text content inside an animator",!1,{id:"ember-animated-bare-text"}),r!==i);)r=r.nextSibling}}},9460:(t,e,i)=>{"use strict"
function n(t,e){let i=[],n=[]
for(let r of t)e(r)?i.push(r):n.push(r)
return[i,n]}i.d(e,{A:()=>n})},11287:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{default:()=>h})
var n,r=i(62663),s=i.n(r),o=i(4471),a=i(78183)
function l(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}var u=(0,i(11465).createTemplateFactory)({id:"Hvm3yyo8",block:'[[[6,[39,0],[[30,0,["predicate"]]],[["key","rules","use","duration","group","initialInsertion","finalRemoval"],[[30,0,["key"]],[30,0,["rules"]],[30,0,["use"]],[30,0,["duration"]],[30,0,["realGroup"]],[30,0,["initialInsertion"]],[30,0,["finalRemoval"]]]],[["default"],[[[[41,[30,1],[[[1,"    "],[18,2,null],[1,"\\n"]],[]],[[[1,"    "],[18,3,null],[1,"\\n"]],[]]]],[1]]]]]],["currentPredicate","&default","&else"],false,["animated-value","if","yield"]]',moduleName:"/Users/sastapov/Code/tmp/ember-animated/addon/dist/components/animated-if.js",isStrictMode:!1})
class h extends(s()){constructor(...t){super(...t),l(this,"tagName",""),l(this,"group",void 0),l(this,"finalRemoval",void 0),l(this,"initialInsertion",void 0),l(this,"key",void 0),l(this,"rules",void 0),l(this,"use",void 0),l(this,"duration",void 0)}get realGroup(){return this.group||`animated_if_${Math.floor(1e6*Math.random())}`}}n=h,l(h,"positionalParams",["predicate"]),(0,a.n)(n.prototype,"realGroup",[(0,o.computed)("group")]),(0,r.setComponentTemplate)(u,h)},13825:(t,e,i)=>{"use strict"
i.d(e,{_W:()=>p})
var n=i(71223),r=i(50123),s=i(4471),o=i(75592),a=i.n(o),l=i(40491),u=i(35455),h=i(51229),d=i(83919)
function m(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function p(t){let e=function(t){let e=function(i,n){return void 0!==e.setup&&e.setup(i,n),(0,s.computed)(t)(...arguments)}
return a()._setClassicDecorator(e),e}((function(i){return new _(this,t,e,i)}))
return Object.setPrototypeOf(e,v.prototype),e}let c,f=0
c=class{}
class v extends c{constructor(...t){super(...t),m(this,"_bufferPolicy",void 0),m(this,"_observes",void 0)}restartable(){return this._bufferPolicy=b,this}drop(){return this._bufferPolicy=S,this}observes(...t){return this._observes=t,this}setup(t,e){if(super.setup&&super.setup(...arguments),this._observes){let i="_ember_animated_handler_"+f++
t[i]=function(){let t=this[e];(0,n.scheduleOnce)("actions",t,"_safePerform")}
for(let e=0;e<this._observes.length;++e){let n=this._observes[e];(0,r.addObserver)(t,n,null,i)}}}}let y=(g=()=>new WeakMap,(0,d.I)("ember-scheduler.priv",g))
var g
function w(t){return y.get(t)}class _{constructor(t,e,i,n){m(this,"concurrency",0),m(this,"isRunning",!1),y.set(this,{context:t,implementation:e,instances:[],taskProperty:i,name:n})}perform(...t){let e=this,i=w(this),r=i.context,s=i.implementation,o=i.taskProperty._bufferPolicy
if(r.isDestroyed)throw new Error(`Tried to perform task ${i.name} on an already destroyed object`)
return function(t,e){if(t.willDestroy){if(!t.willDestroy.__ember_processes_destroyers__){let e=t.willDestroy,i=[]
t.willDestroy=function(){for(const t of i)t()
e.apply(t,arguments)},t.willDestroy.__ember_processes_destroyers__=i}t.willDestroy.__ember_processes_destroyers__.push((()=>{try{e.cancelAll()}catch(t){if("TaskCancelation"!==t.message)throw t}}))}}(r,this),(0,u.cH)((function*(){l.O&&(0,u.GP)((t=>{(0,h.W5)().then((()=>{throw t}))}))
try{if(e._addInstance((0,u.ss)()),o){let t=o(e,i)
t&&(yield t)}return yield*function*(t){let e,i,r,s=!0
for(;;){if((0,n.join)((()=>{try{e=s?t.next(r):t.throw(r)}catch(t){i=t}})),i)throw i
if(e.done)return e.value
try{r=yield e.value,s=!0}catch(t){r=t,s=!1}}}(s.call(r,...t))}finally{(0,n.join)((()=>{e._removeInstance((0,u.ss)())}))}}))}cancelAll(){w(this).instances.forEach((t=>(0,u.ds)(t)))}_addInstance(t){w(this).instances.push(t),(0,s.set)(this,"isRunning",!0),(0,s.set)(this,"concurrency",this.concurrency+1)}_removeInstance(t){let e=w(this).instances
e.splice(e.indexOf(t),1),(0,s.set)(this,"concurrency",this.concurrency-1),(0,s.set)(this,"isRunning",this.concurrency>0)}_safePerform(){let{context:t}=w(this)
t.isDestroyed||this.perform()}}function b(t,e){const i=e.instances
for(const n of i.slice(0,-1))(0,u.ds)(n)}function S(t,e){let i=e.instances
for(let n=1;n<i.length;n++)(0,u.ds)(i[n])}},15686:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{Opacity:()=>d,default:()=>l,fadeIn:()=>u,fadeOut:()=>h})
var n=i(51229),r=i(62554),s=i(34721),o=i(95457)
function a(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function l(t,e={}){return new d(t,e).run()}function u(t,e={}){return l(t,Object.assign({to:1},e))}function h(t,e={}){return l(t,Object.assign({to:0},e))}class d extends r.A{constructor(...t){super(...t),a(this,"prior",null),a(this,"tween",null)}interrupted(t){this.prior=t.find((t=>t instanceof this.constructor))}*animate(){let t,{sprite:e,duration:i,opts:r}=this,a=null!=r.to?r.to:null!=e.finalComputedStyle?parseFloat(e.finalComputedStyle.opacity):1
if(this.prior){let e=this.prior
e.assertHasTween(),t=e.tween.currentValue}else t=null!=r.from?r.from:null!=e.initialComputedStyle?parseFloat(e.initialComputedStyle.opacity):0
let l=Math.abs(t-a)*i
for(this.tween=new s.A(t,a,l,void 0!==this.opts.easing?this.opts.easing:o.A);!this.tween.done;)e.applyStyles({opacity:`${this.tween.currentValue}`}),yield(0,n.mf)()}assertHasTween(){if(!this.tween)throw new Error("motion does not have tween")}}},21708:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{AdjustColor:()=>m,default:()=>d})
var n=i(51229),r=i(62554),s=(i(63787),i(34721)),o=i(95457)
function a(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}i(57493)
class l{static fromComputedStyle(t){let e=h(t)
return new l(e,e.m[0])}static fromUserProvidedColor(t){return new l(function(t){let e=document.createElement("div")
e.style.display="none",e.style.color=t,document.body.appendChild(e)
let i=h(getComputedStyle(e).color)
return e.remove(),i}(t),t)}toString(){return`rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`}constructor({r:t,g:e,b:i,a:n},r){a(this,"r",void 0),a(this,"g",void 0),a(this,"b",void 0),a(this,"a",void 0),this.sourceString=r,this.r=t,this.g=e,this.b=i,this.a=n}}class u{constructor(t,e,i,n=o.A){a(this,"rTween",void 0),a(this,"gTween",void 0),a(this,"bTween",void 0),a(this,"aTween",void 0),this.rTween=new s.A(t.r*t.a,e.r*e.a,i,n),this.gTween=new s.A(t.g*t.a,e.g*e.a,i,n),this.bTween=new s.A(t.b*t.a,e.b*e.a,i,n),this.aTween=new s.A(t.a,e.a,i,n)}get currentValue(){let t=this.aTween.currentValue||1
return new l({r:Math.floor(this.rTween.currentValue/t),g:Math.floor(this.gTween.currentValue/t),b:Math.floor(this.bTween.currentValue/t),a:this.aTween.currentValue},"")}get done(){return[this.rTween,this.gTween,this.bTween,this.aTween].every((t=>t.done))}}function h(t){let e=/^rgb\((\d+), (\d+), (\d+)\)/.exec(t)
if(e)return{r:parseInt(e[1]),g:parseInt(e[2]),b:parseInt(e[3]),a:1,m:e}
if(e=/^rgba\((\d+), (\d+), (\d+), (\d+(?:\.\d+)?)\)/.exec(t),e)return{r:parseInt(e[1]),g:parseInt(e[2]),b:parseInt(e[3]),a:parseFloat(e[4]),m:e}
throw new Error(`unable to parse color ${t}`)}function d(t,e,i={}){return new m(t,e,i).run()}d.property=function(t){return this.bind(null,t)}
class m extends r.A{constructor(t,e,i={}){var n,r
super(e,i),n=this,(r=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(r="colorTween"))in n?Object.defineProperty(n,r,{value:null,enumerable:!0,configurable:!0,writable:!0}):n[r]=null,this.propertyName=t}*animate(){let t,e
for(null!=this.opts.from?t=l.fromUserProvidedColor(this.opts.from):this.sprite.initialComputedStyle?t=l.fromComputedStyle(this.sprite.initialComputedStyle[this.propertyName]):(this.sprite.assertHasFinalBounds(),t=l.fromComputedStyle(this.sprite.finalComputedStyle[this.propertyName])),null!=this.opts.to?e=l.fromUserProvidedColor(this.opts.to):this.sprite.finalComputedStyle?e=l.fromComputedStyle(this.sprite.finalComputedStyle[this.propertyName]):(this.sprite.assertHasInitialBounds(),e=l.fromComputedStyle(this.sprite.initialComputedStyle[this.propertyName])),this.colorTween=new u(t,e,this.duration,this.opts.easing);!this.colorTween.done;)this.sprite.applyStyles({[this.propertyName]:this.colorTween.currentValue.toString()}),yield(0,n.mf)()}}},26125:(t,e,i)=>{"use strict"
i.d(e,{A:()=>a,r:()=>o})
var n=i(35455)
function r(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}const s=(0,i(83919).I)("transition-context",(()=>new WeakMap))
function*o(t,e){yield*e(t),yield(0,n.r)()}class a{static forSprite(t){return s.get(t)}constructor(t,e,i,n,s,o,a,l,u){r(this,"_prepared",new Set),r(this,"prepareSprite",void 0),this._duration=t,this._insertedSprites=e,this._keptSprites=i,this._removedSprites=n,this._sentSprites=s,this._receivedSprites=o,this._beacons=a,this.onMotionStart=l,this.onMotionEnd=u}get duration(){return this._duration}get insertedSprites(){return this._prepareSprites(this._insertedSprites)}get keptSprites(){return this._prepareSprites(this._keptSprites)}get removedSprites(){return this._prepareSprites(this._removedSprites)}get sentSprites(){return this._prepareSprites(this._sentSprites)}get receivedSprites(){return this._prepareSprites(this._receivedSprites)}get beacons(){return this._beacons}_prepareSprites(t){return t.forEach((t=>{s.set(t,this)})),this.prepareSprite?t.map((t=>(this._prepared.has(t)||(this._prepared.add(t),t=this.prepareSprite(t)),t))):t}}},30482:(t,e,i)=>{"use strict"
i.d(e,{E:()=>o,n:()=>s})
var n=i(51229)
const r=(0,i(83919).I)("motion-bridges",(()=>new WeakMap))
function s(t,e){r.set(e,t),(0,n.mf)().then((()=>{r.get(e)===t&&r.delete(e)}))}function o(t){return r.get(t)}},32987:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{default:()=>j})
var n=i(82735),r=i(62663),s=i.n(r),o=i(63991),a=i(4471),l=i(51229),u=i(62554),h=i(34721)
function d(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}class m extends u.A{constructor(...t){super(...t),d(this,"prior",null),d(this,"widthTween",null),d(this,"heightTween",null)}interrupted(t){let e=t.find((t=>t instanceof this.constructor))
e&&(this.prior=e)}*animate(){let t,e,i=this.sprite,n=this.duration
for(i.assertHasInitialBounds(),i.assertHasFinalBounds(),this.prior?(t=this.widthTween=new h.A(0,i.finalBounds.width/i.finalCumulativeTransform.a-this.prior.sprite.finalBounds.width,n,this.opts.easing).plus(this.prior.widthTween),e=this.heightTween=new h.A(0,i.finalBounds.height/i.finalCumulativeTransform.d-this.prior.sprite.finalBounds.height,n,this.opts.easing).plus(this.prior.heightTween)):(t=this.widthTween=new h.A(i.initialBounds.width/i.initialCumulativeTransform.a,i.finalBounds.width/i.finalCumulativeTransform.a,n,this.opts.easing),e=this.heightTween=new h.A(i.initialBounds.height/i.initialCumulativeTransform.d,i.finalBounds.height/i.finalCumulativeTransform.d,n,this.opts.easing));!t.done||!e.done;)i.applyStyles({width:`${t.currentValue}px`,height:`${e.currentValue}px`}),yield(0,l.mf)()}}var p,c=i(13825),f=i(63787),v=i(94438),y=i(78183)
function g(t,e,i){(function(t,e){if(e.has(t))throw new TypeError("Cannot initialize the same private elements twice on an object")})(t,e),e.set(t,i)}function w(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}var _=(0,i(11465).createTemplateFactory)({id:"QsMl8X50",block:'[[[44,[[28,[37,1],[[30,0,["tag"]]],null]],[[[1,"  "],[8,[30,1],[[16,0,[29,["animated-container ",[30,2]]]],[17,3]],null,[["default"],[[[[1,"\\n    "],[18,4,null],[1,"\\n  "]],[]]]]],[1,"\\n"]],[1]]]],["Tag","@class","&attrs","&default"],false,["let","element","yield"]]',moduleName:"/Users/sastapov/Code/tmp/ember-animated/addon/dist/components/animated-container.js",isStrictMode:!1}),b=new WeakMap,S=new WeakMap,T=new WeakMap
class j extends(s()){constructor(t){super(t),w(this,"tagName",""),g(this,b,void(0,y.i)(this,"motionService")),w(this,"tag","div"),w(this,"onInitialRender",!1),w(this,"motion",m),w(this,"_inserted",!1),w(this,"_startingUp",!1),w(this,"sprite",null),g(this,S,void(0,y.i)(this,"isAnimating")),g(this,T,void(0,y.i)(this,"animate")),this.motionService.register(this).observeDescendantAnimations(this,this.maybeAnimate)}didInsertElement(){super.didInsertElement(),this._inserted=!0}_ownElement(){if(!this._inserted)return
let{firstNode:t,lastNode:e}=(0,v.Z)(this),i=t
for(;i;){if(i.nodeType===Node.ELEMENT_NODE)return i
if(i===e)break
i=i.nextSibling}}willDestroyElement(){super.willDestroyElement(),this.motionService.unregister(this).unobserveDescendantAnimations(this,this.maybeAnimate)}maybeAnimate({duration:t,task:e}){this._startingUp||this.animate.perform(t,e)}beginStaticMeasurement(){this.sprite&&this.sprite.unlock()}endStaticMeasurement(){this.sprite&&this.sprite.lock()}}p=j,(0,y.g)(p.prototype,"motionService",[(0,n.inject)("-ea-motion")]),(0,y.g)(p.prototype,"isAnimating",[(0,o.alias)("animated.isRunning")]),(0,y.n)(p.prototype,"maybeAnimate",[a.action]),(0,y.g)(p.prototype,"animate",[(0,c._W)((function*(t,e){this._startingUp=!0
let i,n,r=this.motionService,s=this._ownElement()
s?(i=f.A.sizedStartingAt(s),this.sprite=i,i.lock(),n=!0):n=this.onInitialRender
try{yield(0,l.Tz)(),yield(0,l.W5)()}finally{this._startingUp=!1}yield*r.staticMeasurement((()=>{i?i.measureFinalBounds():(i=f.A.sizedEndingAt(this._ownElement()),this.sprite=i)})),n&&(yield*new this.motion(this.sprite,{duration:t})._run()),yield e,this.sprite.unlock(),this.sprite=null})).restartable()]),(0,r.setComponentTemplate)(_,j)},34721:(t,e,i)=>{"use strict"
i.d(e,{A:()=>a})
var n=i(51229),r=i(87271)
function s(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}const o=(0,i(83919).I)("tween",(()=>[]))
class a{constructor(t,e,i,n=r.easeInAndOut){if(s(this,"curve",void 0),s(this,"diff",void 0),this.initialValue=t,this.finalValue=e,"function"!=typeof n)throw new Error("Tried to make a Tween with an invalid easing function")
this.curve=u.findOrCreate(i,n),this.diff=e-t}get currentValue(){return this.initialValue+this.diff*this.curve.spaceProgress}get done(){return this.curve.done}plus(t){return new l([this,t],((t,e)=>t.currentValue+e.currentValue))}}class l{constructor(t,e){s(this,"_finalValue",null),s(this,"inputs",void 0),this.combinator=e,this._finalValue=null,this.inputs=t.map((t=>t.done?new a(t.currentValue,t.currentValue,0):t))}get finalValue(){if(null==this._finalValue){let t=0
for(const e of this.inputs)t+=e.finalValue
this._finalValue=t}return this._finalValue}get currentValue(){return this.combinator(...this.inputs)}get done(){return!this.inputs.find((t=>!t.done))}}class u{static findOrCreate(t,e){let i=o.find((i=>i.duration===t&&i.easing===e))
if(i)return i
let r=new this(t,e)
return o.push(r),(0,n.mf)().then((()=>{o.splice(o.indexOf(r),1)})),r}constructor(t,e){s(this,"startTime",void 0),s(this,"_doneFrames",0),s(this,"_lastTick",void 0),s(this,"_runTime",void 0),s(this,"_timeProgress",void 0),s(this,"_spaceProgress",void 0),this.duration=t,this.easing=e,this.startTime=n.pm.now(),this._tick()}_tick(){this._lastTick!==n.JL.currentFrameClock&&(this._lastTick=n.JL.currentFrameClock,this._runTime=n.pm.now()-this.startTime,this._timeProgress=0===this.duration?1:Math.min(this._runTime/this.duration,1),this._spaceProgress=this.easing(this._timeProgress),this._timeProgress>=1&&this._doneFrames++)}get runTime(){return this._tick(),this._runTime}get timeProgress(){return this._tick(),this._timeProgress}get spaceProgress(){return this._tick(),this._spaceProgress}get done(){return this._tick(),this._doneFrames>1}}},35455:(t,e,i)=>{"use strict"
i.d(e,{A:()=>l,GP:()=>h,_7:()=>b,cH:()=>a,ds:()=>u,r:()=>m,ss:()=>d,vX:()=>S})
var n=i(51229),r=i(83919)
function s(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function o(t,e){return(0,r.I)(`scheduler.${t}`,e)}function a(t){return new _(t,!1).promise}function l(t){return new _(t,!0).promise}function u(t){if(t===d()){let t=new Error("TaskCancelation")
throw t.message="TaskCancelation",t}let e=w.get(t)
e&&e.stop()}function h(t){y("logErrors").errorLogger=t}function d(){let t=f()
if(t)return t.promise}async function m(){return Promise.all(y("childrenSettled").linked.map((t=>t.promise.catch((()=>null)))))}function p(t){return"TaskCancelation"===t.message}let c,f,v
{const t=o("routines",(()=>({cur:void 0,prior:[]})))
c=function(e,i){t.prior.unshift({microroutine:t.cur,throw:void 0}),t.cur=e
try{return i()}finally{let e=t.prior.shift()
if(t.cur=e.microroutine,e.throw)throw e.throw}},f=function(){return t.cur},v=function(e){return t.prior.find((t=>t.microroutine===e))}}function y(t){let e=f()
if(!e)throw new Error(`${t}: only works inside a running microroutine`)
return e}let g=o("loggedErrors",(()=>new WeakSet)),w=o("microRoutines",(()=>new WeakMap))
class _{constructor(t,e){if(s(this,"generator",void 0),s(this,"resolve",void 0),s(this,"reject",void 0),s(this,"stopped",!1),s(this,"state",void 0),s(this,"linked",[]),s(this,"errorLogger",void 0),s(this,"promise",void 0),this.generator=t(),this.promise=new Promise(((t,e)=>{this.resolve=t,this.reject=e})),w.set(this.promise,this),(0,n.tP)(this.promise,this.stop.bind(this)),e){let t=y("spawnChild")
t.linked.push(this),this.errorLogger=t.errorLogger}this.wake("fulfilled",void 0)}wake(t,e){this.stopped||c(this,(()=>{try{this.state="fulfilled"===t?this.generator.next(e):this.generator.throw(e),this.state.done?this.resolve(this.state.value):Promise.resolve(this.state.value).then((t=>this.wake("fulfilled",t)),(t=>this.wake("rejected",t)))}catch(t){this.state={done:!0,value:void 0},this.linked.forEach((t=>{t.stop()})),p(t)||(this.reject(t),this.errorLogger&&(g.has(t)||(g.add(t),this.errorLogger.call(null,t))))}}))}stop(){var t
this.stopped=!0,this.state&&(t=this.state.value)&&"function"==typeof t.then&&(0,n.mZ)(this.state.value),this.linked.forEach((t=>{t.stop()}))
let e=new Error("TaskCancelation")
if(e.message="TaskCancelation",f()===this)throw e
let i=v(this)
i?i.throw=e:c(this,(()=>function(t){let e=new Error("TaskCancelation")
e.message="TaskCancelation"
try{t.throw(e)}catch(t){if(!p(t))throw t}}(this.generator)))}}function b(...t){return function(...e){return Promise.all(t.map((t=>t.apply(null,e))))}}function S(...t){return function(...e){return l((function*(){for(let i of t)yield i.apply(null,e)}))}}},38590:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{AdjustCSS:()=>l,default:()=>a})
var n=i(62554),r=i(34721),s=i(51229)
function o(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function a(t,e,i={}){return new l(t,e,i).run()}i(63787),a.property=function(t){return this.bind(null,t)}
class l extends n.A{constructor(t,e,i={}){super(e,i),o(this,"prior",null),o(this,"tween",null),this.propertyName=t}interrupted(t){this.prior=t.find((t=>t instanceof l&&t.propertyName===this.propertyName))}*animate(){let{value:t,unit:e}=this._splitUnit(this.sprite.finalComputedStyle[this.propertyName])
if(this.prior){let e=this.prior
e.assertHasTween(),this.tween=new r.A(0,t-e.tween.finalValue,this.duration,this.opts.easing).plus(e.tween)}else this.sprite.assertHasInitialBounds(),this.tween=new r.A(this._splitUnit(this.sprite.initialComputedStyle[this.propertyName]).value,t,this.duration,this.opts.easing)
for(;!this.tween.done;)this.sprite.applyStyles({[this.propertyName]:`${this.tween.currentValue}${e}`}),yield(0,s.mf)()}_splitUnit(t){if("letter-spacing"===this.propertyName&&"normal"===t)return{value:0,unit:"px"}
let e=/(\d+(?:\.\d+)?)(\w+)/.exec(t)
if(!e)throw new Error(`Unable to use adjustCSS for property ${this.propertyName} which has value ${t}`)
return{value:parseFloat(e[1]),unit:e[2]||""}}assertHasTween(){if(!this.tween)throw new Error("motion does not have tween")}}},41441:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{CompensateForScale:()=>l,default:()=>a})
var n=i(51229),r=i(62554),s=i(34721)
function o(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function a(t,e={}){return new l(t,e).run()}class l extends r.A{constructor(...t){super(...t),o(this,"widthTween",null),o(this,"heightTween",null)}*animate(){let t=this.duration
this.sprite.assertHasInitialBounds(),this.sprite.assertHasFinalBounds()
let e=this.sprite,i=e.finalCumulativeTransform.a/e.initialCumulativeTransform.a,r=e.finalCumulativeTransform.d/e.initialCumulativeTransform.d
for(this.widthTween=new s.A(e.transform.a,e.transform.a*i,t),this.heightTween=new s.A(e.transform.d,e.transform.d*r,t);!this.widthTween.done||!this.heightTween.done;)e.scale(this.widthTween.currentValue/e.transform.a,this.heightTween.currentValue/e.transform.d),yield(0,n.mf)()}}},44029:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{default:()=>A})
var n,r=i(82735),s=i(4471),o=i(63991),a=i(62663),l=i.n(a),u=i(13825),h=i(51229),d=i(30482),m=i(26125),p=i(35455),c=i(63787),f=i(9460),v=(i(57493),i(78183))
function y(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function g(t,e,i){(function(t,e){if(e.has(t))throw new TypeError("Cannot initialize the same private elements twice on an object")})(t,e),e.set(t,i)}var w=(0,i(11465).createTemplateFactory)({id:"lSFxMeWn",block:'[[[18,1,null]],["&default"],false,["yield"]]',moduleName:"/Users/sastapov/Code/tmp/ember-animated/addon/dist/components/animated-orphans.js",isStrictMode:!1}),_=new WeakMap,b=new WeakMap,S=new WeakMap,T=new WeakMap,j=new WeakMap,k=new WeakMap
class A extends(l()){constructor(...t){super(...t),g(this,_,void(0,v.i)(this,"motionService")),y(this,"_newOrphanTransitions",[]),y(this,"_elementToChild",new WeakMap),y(this,"_childToTransition",new WeakMap),y(this,"_inserted",!1),y(this,"_cycleCounter",0),g(this,b,void(0,v.i)(this,"isAnimating")),g(this,S,void(0,v.i)(this,"animate")),g(this,T,void(0,v.i)(this,"startAnimation")),g(this,j,void(0,v.i)(this,"runAnimation")),g(this,k,void(0,v.i)(this,"finalizeAnimation"))}init(...t){super.init(...t),this.classNames=this.classNames.concat(["animated-orphans"])}didInsertElement(){super.didInsertElement(),this._inserted=!0,this.motionService.register(this).observeOrphans(this.animateOrphans).observeAnimations(this.reanimate)}willDestroyElement(){super.willDestroyElement(),this.motionService.unregister(this).unobserveOrphans(this.animateOrphans).unobserveAnimations(this.reanimate)}animateOrphans(t,e,i,n){this._newOrphanTransitions.push({removedSprites:t.map((t=>(t.assertHasOwner(),t.owner=t.owner.clone(),t.owner.flagForRemoval(),t))),transition:e,duration:i,shouldAnimateRemoved:n}),this.reanimate()}reanimate(){if(!this.get("startAnimation.isRunning")){let t=new c.A(this.element,!0,null,null),e=this._findActiveSprites(t)
this.animate.perform({ownSprite:t,activeSprites:e})}}beginStaticMeasurement(){}endStaticMeasurement(){}_findActiveSprites(t){return this._inserted?Array.from(this.element.children).map((e=>{let i=this._elementToChild.get(e)
if(!i.shouldRemove){let n=c.A.positionedStartingAt(e,t)
return n.owner=i,i.flagForRemoval(),n}e.remove()})).filter(Boolean):[]}_groupActiveSprites(t){let e=[]
for(let i of t){let t=i
t.assertHasOwner()
let{transition:n,duration:r}=this._childToTransition.get(t.owner),s=e.find((t=>t.transition===n))
s||(s={transition:n,duration:r,sprites:[]},e.push(s)),s.sprites.push(t)}return e}_prepareSprite(t){t.hide()
let e=t.element.cloneNode(!0)
return(0,d.n)(t.element,e),t.element=e,t}_onFirstMotionStart(t,e,i){if(-1===t.indexOf(i)){let e=Object.assign({},i.initialComputedStyle)
delete e["line-height"],i.applyStyles(e),this.element.appendChild(i.element),i.lock(),i.reveal(),t.push(i),this._elementToChild.set(i.element,i.owner)}i.assertHasOwner(),i.owner.block(e)}_onMotionStart(t,e){e.assertHasOwner(),e.reveal(),e.owner.block(t)}_onMotionEnd(t,e){e.assertHasOwner(),e.owner.unblock(t)}}n=A,(0,v.g)(n.prototype,"motionService",[(0,r.inject)("-ea-motion")]),(0,v.n)(n.prototype,"animateOrphans",[s.action]),(0,v.n)(n.prototype,"reanimate",[s.action]),(0,v.g)(n.prototype,"isAnimating",[(0,o.alias)("animate.isRunning")]),(0,v.g)(n.prototype,"animate",[(0,u._W)((function*({ownSprite:t,activeSprites:e}){yield this.startAnimation.perform(t)
let{matchingAnimatorsFinished:i}=yield this.runAnimation.perform(e,t)
yield this.finalizeAnimation.perform(e,i)})).restartable()]),(0,v.g)(n.prototype,"startAnimation",[(0,u._W)((function*(t){yield(0,h.Tz)(),t.measureFinalBounds()}))]),(0,v.g)(n.prototype,"runAnimation",[(0,u._W)((function*(t,e){yield*this.motionService.staticMeasurement((()=>{}))
{let e=Object.create(null)
for(let i of t)e[`${i.owner.group}/${i.owner.id}`]=!0
for(let t of this._newOrphanTransitions)t.removedSprites=t.removedSprites.filter((t=>(t.assertHasOwner(),!e[`${t.owner.group}/${t.owner.id}`])))}let{farMatches:i,matchingAnimatorsFinished:n}=yield this.motionService.get("farMatch").perform((0,p.ss)(),[],[],t.concat(...this._newOrphanTransitions.map((t=>t.removedSprites)))),r=this._cycleCounter++
for(let{transition:s,duration:o,sprites:a}of this._groupActiveSprites(t)){let[t,e]=(0,f.A)(a,(t=>{let e=i.get(t)
return!!e&&(t.endAtSprite(e),e.revealed&&!t.revealed&&t.startAtSprite(e),!0)})),n=new m.A(o,[],[],e,t,[],{},this._onMotionStart.bind(this,r),this._onMotionEnd.bind(this,r));(0,p.A)((function*(){yield(0,h.W5)(),t.forEach((t=>t.hide())),yield*(0,m.r)(n,s)}))}for(;this._newOrphanTransitions.length>0;){let n=this._newOrphanTransitions.pop(),{transition:s,duration:o,removedSprites:a,shouldAnimateRemoved:l}=n
if(0===a.length)continue
for(let t of a){let i=t
i.assertHasOwner(),i.rehome(e),this._childToTransition.set(i.owner,n)}let[u,d]=(0,f.A)(a,(t=>{let e=i.get(t)
return!!e&&(t.endAtSprite(e),e.revealed&&!t.revealed&&t.startAtSprite(e),!0)})),c=this;(0,p.A)((function*(){if(yield(0,h.W5)(),u.forEach((t=>t.hide())),!s)return
let e
if(e=l?d:[],0===e.length&&0===u.length)return
let i=new m.A(o,[],[],e,u,[],{},c._onFirstMotionStart.bind(c,t,r),c._onMotionEnd.bind(c,r))
i.prepareSprite=c._prepareSprite.bind(c),yield*(0,m.r)(i,s)}))}return yield(0,p.r)(),{matchingAnimatorsFinished:n}}))]),(0,v.g)(n.prototype,"finalizeAnimation",[(0,u._W)((function*(t,e){yield e
for(let i of t)i.element.remove()}))]),(0,a.setComponentTemplate)(w,A)},48463:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{default:()=>d})
var n,r=i(4471),s=i(62663),o=i.n(s),a=i(81389),l=i(78183)
function u(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}var h=(0,i(11465).createTemplateFactory)({id:"YbNzh3mL",block:'[[[6,[39,0],[[30,0,["items"]]],[["key","rules","use","duration","group","watch","initialInsertion","finalRemoval"],[[30,0,["key"]],[30,0,["rules"]],[30,0,["use"]],[30,0,["duration"]],[30,0,["group"]],[30,0,["watch"]],[30,0,["initialInsertion"]],[30,0,["finalRemoval"]]]],[["default"],[[[[1,"  "],[18,2,[[30,1]]],[1,"\\n"]],[1]]]]]],["item","&default"],false,["animated-each","yield"]]',moduleName:"/Users/sastapov/Code/tmp/ember-animated/addon/dist/components/animated-value.js",isStrictMode:!1})
class d extends(o()){constructor(...t){super(...t),u(this,"value",void 0),u(this,"tagName",""),u(this,"finalRemoval",void 0),u(this,"initialInsertion",void 0),u(this,"watch",void 0),u(this,"key",void 0),u(this,"group",void 0),u(this,"rules",void 0),u(this,"use",void 0),u(this,"duration",void 0)}get items(){return(0,a.A)([this.value])}}n=d,u(d,"positionalParams",["value"]),(0,l.n)(n.prototype,"items",[(0,r.computed)("value")]),(0,s.setComponentTemplate)(h,d)},48960:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{default:()=>y})
var n,r=i(4471),s=i(81389),o=i(82735),a=i.n(o),l=i(13825),u=i(51229),h=i(78183)
function d(t,e,i){(function(t,e){if(e.has(t))throw new TypeError("Cannot initialize the same private elements twice on an object")})(t,e),e.set(t,i)}function m(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}var p=new WeakMap,c=new WeakMap,f=new WeakMap,v=new WeakMap
class y extends(a()){constructor(...t){super(...t),m(this,"_rendezvous",[]),m(this,"_measurements",[]),m(this,"_animators",(0,s.A)()),m(this,"_orphanObserver",null),m(this,"_animationObservers",[]),m(this,"_descendantObservers",[]),m(this,"_ancestorObservers",new WeakMap),m(this,"_beacons",null),d(this,p,void(0,h.i)(this,"_invalidateIsAnimating")),d(this,c,void(0,h.i)(this,"waitUntilIdle")),d(this,f,void(0,h.i)(this,"addBeacon")),d(this,v,void(0,h.i)(this,"farMatch"))}register(t){return this._animators.pushObject(t),this}unregister(t){return this._animators.removeObject(t),this}observeOrphans(t){if(this._orphanObserver)throw new Error("Only one animated-orphans component can be used at one time")
return this._orphanObserver=t,this}unobserveOrphans(t){return this._orphanObserver===t&&(this._orphanObserver=null),this}observeAnimations(t){return this._animationObservers.push(t),this}unobserveAnimations(t){let e=this._animationObservers.indexOf(t)
return-1!==e&&this._animationObservers.splice(e,1),this}observeDescendantAnimations(t,e){return this._descendantObservers.push({component:t,fn:e}),this}unobserveDescendantAnimations(t,e){let i=this._descendantObservers.find((i=>i.component===t&&i.fn===e))
return i&&this._descendantObservers.splice(this._descendantObservers.indexOf(i),1),this}observeAncestorAnimations(t,e){let i
for(let n of w(t))if("isEmberAnimatedListElement"in n)i=n.child.id
else if(null!=i){let t=this._ancestorObservers.get(n)
t||this._ancestorObservers.set(n,t=new Map),t.set(e,i),i=null}return this}unobserveAncestorAnimations(t,e){for(let i of w(t)){let t=this._ancestorObservers.get(i)
t&&t.delete(e)}return this}get isAnimating(){return this.isAnimatingSync}get isAnimatingSync(){return this._animators.any((t=>t.isAnimating))}matchDestroyed(t,e,i,n){this._orphanObserver&&t.length>0?this._orphanObserver(t,e,i,n):this.farMatch.perform(null,[],[],t,!0)}hasBeacon(t){return this._beacons?.[t]}willAnimate({task:t,duration:e,component:i,children:n}){let r={task:t,duration:e},s=[...w(i)]
for(let{component:a,fn:l}of this._descendantObservers)-1!==s.indexOf(a)&&l(r)
let o=this._ancestorObservers.get(i)
if(o)for(let[a,l]of o.entries()){let t=n.find((t=>t.id===l))
t&&a(t.state)}for(let a of this._animationObservers)a(r)}*staticMeasurement(t){let e={fn:t,resolved:!1,value:null}
this._measurements.push(e)
try{if(yield(0,u.W5)(),!e.resolved){let t=this._animators
t.forEach((t=>t.beginStaticMeasurement())),this._measurements.forEach((t=>{try{t.value=t.fn()}catch(t){setTimeout((function(){throw t}),0)}t.resolved=!0})),t.forEach((t=>t.endStaticMeasurement()))}return e.value}finally{this._measurements.splice(this._measurements.indexOf(e),1)}}}function g(t,e){t.inserted.concat(t.kept).forEach((i=>{let n=e.removed.find((t=>i.owner.group==t.owner.group&&i.owner.id===t.owner.id))
n&&(t.matches.set(i,n),t.otherTasks.set(e.runAnimationTask,!0),e.matches.set(n,i),e.otherTasks.set(t.runAnimationTask,!0))}))}function*w(t){let e=t.parentView
for(;e;)yield e,e=e.parentView}n=y,(0,h.n)(n.prototype,"isAnimating",[(0,r.computed)()]),(0,h.n)(n.prototype,"isAnimatingSync",[(0,r.computed)("_animators.@each.isAnimating")]),(0,h.g)(n.prototype,"_invalidateIsAnimating",[(0,l._W)((function*(){yield(0,u.mf)(),this.notifyPropertyChange("isAnimating")})).observes("isAnimatingSync")]),(0,h.g)(n.prototype,"waitUntilIdle",[(0,l._W)((function*(){for(;;)if(yield(0,u.mf)(),!this.isAnimatingSync&&(yield(0,u.mf)(),!this.isAnimatingSync))return}))]),(0,h.g)(n.prototype,"addBeacon",[(0,l._W)((function*(t,e){this._beacons||(this._beacons={}),this._beacons[t]=e,yield(0,u.W5)(),yield(0,u.W5)(),this._beacons=null}))]),(0,h.g)(n.prototype,"farMatch",[(0,l._W)((function*(t,e,i,n,r=!1){let s=new Map,o={inserted:e,kept:i,removed:n,matches:s,runAnimationTask:t,otherTasks:new Map}
return this._rendezvous.push(o),yield(0,u.W5)(),r&&(yield(0,u.Tz)(),yield(0,u.W5)(),yield(0,u.W5)()),this.farMatch.concurrency>1&&this._rendezvous.forEach((t=>{t!==o&&(g(o,t),g(t,o))})),this._rendezvous.splice(this._rendezvous.indexOf(o),1),{farMatches:s,matchingAnimatorsFinished:(0,u.vd)([...o.otherTasks.keys()]),beacons:this._beacons}}))])},51229:(t,e,i)=>{"use strict"
i.d(e,{JL:()=>o,Tz:()=>f,W5:()=>p,mZ:()=>u,mf:()=>h,pm:()=>v,tP:()=>l,uk:()=>c,vd:()=>g})
var n=i(71223),r=i(83919)
function s(t,e){return(0,r.I)(`concurrency-helpers.${t}`,e)}const o=s("frameState",(()=>({nextFrame:null,nextFrameWaiters:[],currentFrameClock:-1/0}))),a=s("cancellation",(()=>new WeakMap))
function l(t,e){a.set(t,e)}function u(t){let e=a.get(t)
e&&e(t)}function h(){let t
o.nextFrame||(o.nextFrame=requestAnimationFrame(d))
let e=new Promise((e=>{t=e}))
return o.nextFrameWaiters.push({resolve:t,promise:e}),l(e,m),e}function d(t){o.nextFrame=null,o.currentFrameClock=t
let e=o.nextFrameWaiters
o.nextFrameWaiters=[]
for(const i of e)i.resolve()}function m(t){let e=o.nextFrameWaiters.find((e=>e.promise===t))
if(e){let t=o.nextFrameWaiters.indexOf(e)
t>-1&&o.nextFrameWaiters.splice(t,1)}}function p(){return new Promise((t=>t()))}function c(t=0){if(v.now===y){let e,i=new Promise((i=>{e=window.setTimeout(i,t)}))
return l(i,(()=>{clearTimeout(e)})),i}{let e=!1,i=v.now(),n=new Promise((n=>{!function r(){e||(v.now()-i>t&&n(),h().then(r))}()}))
return l(n,(()=>{e=!0})),n}}function f(){let t,e=new Promise((e=>{t=(0,n.schedule)("afterRender",(()=>e()))}))
return l(e,(()=>{(0,n.cancel)(t)})),e}let v=s("clock",(()=>({now:()=>(new Date).getTime()})))
const y=s("originalClock",(()=>v.now))
function g(t){return Promise.all(t.map((t=>{if(t)return t.catch((()=>null))})))}},57493:()=>{[window.Element,window.CharacterData,window.DocumentType].filter((t=>t)).map((t=>t.prototype)).forEach((function(t){Object.prototype.hasOwnProperty.call(t,"remove")||Object.defineProperty(t,"remove",{configurable:!0,enumerable:!0,writable:!0,value:function(){this.parentNode.removeChild(this)}})}))},62554:(t,e,i)=>{"use strict"
i.d(e,{A:()=>u})
var n=i(35455),r=i(51229),s=i(30482),o=i(26125)
function a(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}const l=(0,i(83919).I)("motion",(()=>new WeakMap))
class u{constructor(t,e={}){a(this,"_motionList",void 0),a(this,"_inheritedMotionList",void 0),this.sprite=t,this.opts=e,this.sprite=t,this.opts=e,this._setupMotionList()}get duration(){return null!=this.opts.duration?this.opts.duration:o.A.forSprite(this.sprite).duration}run(){let t=o.A.forSprite(this.sprite),e=this
return(0,n.A)((function*(){t.onMotionStart(e.sprite)
try{yield*e._run()}finally{t.onMotionEnd(e.sprite)}}))}interrupted(t){}*animate(){}*_run(){try{let t=this._motionList.filter((t=>t!==this))
this._inheritedMotionList&&(t=t.concat(this._inheritedMotionList)),t.length>0&&this.interrupted(t),yield*this.animate()}finally{(0,r.mf)().then((()=>this._clearMotionList()))}}_setupMotionList(){let t=this.sprite.element,e=l.get(t)
e||l.set(t,e=[]),this._motionList=e,(0,r.W5)().then((()=>{this._motionList&&this._motionList.unshift(this)}))
let i=(0,s.E)(t)
if(i){let t=l.get(i)
t&&(this._inheritedMotionList=t)}}_clearMotionList(){if(this._motionList){let t=this._motionList.indexOf(this)
this._motionList.splice(t,1),0===this._motionList.length&&l.delete(this.sprite.element),this._motionList=void 0}}}},62674:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{default:()=>m,toDown:()=>d,toLeft:()=>l,toRight:()=>u,toUp:()=>h})
var n=i(87974),r=i(51229),s=i(34721)
function o(t,e={}){return new a(t,e).run()}class a extends n.Move{constructor(t,e={}){if(super(t,e),i=this,s=void 0,(r=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(r="source"))in i?Object.defineProperty(i,r,{value:s,enumerable:!0,configurable:!0,writable:!0}):i[r]=s,!(this.opts.source instanceof n.Move))throw new Error("Follow requires a `source` Move to follow")
var i,r,s
this.source=this.opts.source}*animate(){this.source.assertHasTweens()
let t=this.source,e=this.sprite,i=e.transform.tx-t.sprite.transform.tx,n=e.transform.ty-t.sprite.transform.ty
for(this.xTween=new s.A(i,i,0).plus(t.xTween),this.yTween=new s.A(n,n,0).plus(t.yTween),this.sprite.endRelativeTo(t.sprite);!this.xTween.done||!this.yTween.done;)e.translate(this.xTween.currentValue-e.transform.tx,this.yTween.currentValue-e.transform.ty),yield(0,r.mf)()}}const l=m.bind(null,"x",-1),u=m.bind(null,"x",1),h=m.bind(null,"y",-1),d=m.bind(null,"y",1)
function*m(t,e,i){let r,{position:s,size:a,startTranslatedBy:l,endTranslatedBy:u}=function(t,e){let i,n,r,s
return"x"===t.toLowerCase()?(n=t=>t.width,e>0?(i=t=>t.left,r=(t,e)=>t.startTranslatedBy(e,0),s=(t,e)=>t.endTranslatedBy(e,0)):(i=t=>-t.right,r=(t,e)=>t.startTranslatedBy(-e,0),s=(t,e)=>t.endTranslatedBy(-e,0))):(n=t=>t.height,e>0?(i=t=>t.top,r=(t,e)=>t.startTranslatedBy(0,e),s=(t,e)=>t.endTranslatedBy(0,e)):(i=t=>-t.bottom,r=(t,e)=>t.startTranslatedBy(0,-e),s=(t,e)=>t.endTranslatedBy(0,-e))),{position:i,size:n,startTranslatedBy:r,endTranslatedBy:s}}(t,e)
if(i.insertedSprites[0])r=i.insertedSprites[0].finalBounds
else{if(!i.keptSprites[0])throw new Error("Unimplemented")
r=i.keptSprites[0].finalBounds}if(i.insertedSprites[0]){let t=0
i.removedSprites.forEach((e=>{e.assertHasInitialBounds()
let i=s(r)-s(e.initialBounds)
i>t&&(t=i)}))
let e=i.insertedSprites[0]
if(e.assertHasFinalBounds(),t+=a(e.finalBounds),l(e,-t),i.removedSprites[0]){u(i.removedSprites[0],t)
let r=new n.Move(i.removedSprites[0])
r.run()
for(const t of i.removedSprites)o(t,{source:r})
o(e,{source:r})}else new n.Move(e).run()}else{if(!i.keptSprites[0])throw new Error("Unimplemented2")
{const t=new n.Move(i.keptSprites[0])
t.run(),i.removedSprites.forEach((e=>{o(e,{source:t})}))}}}},63787:(t,e,i)=>{"use strict"
i.d(e,{A:()=>E})
var n=i(61603),r=i(75592),s=i.n(r)
class o{constructor(t,e,i,n,r,s){this.a=t,this.b=e,this.c=i,this.d=n,this.tx=r,this.ty=s}serialize(){return`matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.tx}, ${this.ty})`}isIdentity(){return this===a||1===this.a&&0===this.b&&0===this.c&&1===this.d&&0===this.tx&&0===this.ty}mult(t){return this===a?t:t===a?this:new o(this.a*t.a+this.c*t.b,this.b*t.a+this.d*t.b,this.a*t.c+this.c*t.d,this.b*t.c+this.d*t.d,this.a*t.tx+this.c*t.ty+this.tx,this.b*t.tx+this.d*t.ty+this.ty)}}const a=new o(1,0,0,1,0,0),l=/matrix\((.*)\)/
function u(t){let e=null,i=t
for(;i&&1===i.nodeType;){let t=h(i)
t===a||t.isIdentity()||(e=e?t.mult(e):t),i=i.parentElement}return e||a}function h(t){let e=window.getComputedStyle(t),i=""!==e.transform?e.transform:t.style.transform
if("none"===i)return a
let n=function(t){const e=l.exec(t)
if(!e||!e[1])return a
const[i,n,r,s,u,h]=e[1].split(",").map(parseFloat)
return new o(i,n,r,s,u,h)}(i)
if(1!==n.a||0!==n.b||0!==n.c||1!==n.d){let i=""!==e.getPropertyValue("transform-origin")?e.getPropertyValue("transform-origin"):t.style.getPropertyValue("transform-origin"),[r,s]=i.split(" ").map(parseFloat)
return 0===r&&0===s?n:new o(1,0,0,1,r,s).mult(n).mult(new o(1,0,0,1,-r,-s))}return n}var d=i(30482)
function m(t,e,i,n=[]){if(p(e)&&"0px"===e.getPropertyValue(`border-${i}-width`)&&"0px"===e.getPropertyValue(`padding-${i}`)){let e
if(e="top"===i?function(t){for(let e=0;e<t.children.length;e++){let i=t.children[e],n=getComputedStyle(i)
if("none"!==n.clear)return
if(p(n))return[i,n]}}(t):function(t){for(let e=t.children.length-1;e>=0;e--){let i=t.children[e],n=getComputedStyle(i)
if("none"!==n.clear)return
if(p(n))return[i,n]}}(t),e){let[t,r]=e
n.push(t),m(t,r,i,n)}}return n}function p(t){return"block"===t.display&&("static"===t.position||"relative"===t.position)&&"none"===t.getPropertyValue("float")&&"visible"===t.overflow}var c,f=i(78183)
function v(t,e,i){(function(t,e){if(e.has(t))throw new TypeError("Cannot initialize the same private elements twice on an object")})(t,e),e.set(t,i)}function y(t,e){let i=Object.getOwnPropertyDescriptor(t,e)||{}
0!=i.enumerable&&(i.enumerable=!1,Object.defineProperty(t,e,i))}var g=new WeakMap,w=new WeakMap,_=new WeakMap,b=new WeakMap
class S{static fromRect(t={}){return new DOMRect(t.x??0,t.y??0,t.width??0,t.height??0)}constructor(t,e,i,n){v(this,g,void(0,f.i)(this,"x")),v(this,w,void(0,f.i)(this,"y")),v(this,_,void(0,f.i)(this,"width")),v(this,b,void(0,f.i)(this,"height")),null!=t&&(this.x=t),null!=e&&(this.y=e),null!=i&&(this.width=i),null!=n&&(this.height=n)}get top(){return this.y}get right(){return this.x+this.width}get bottom(){return this.y+this.height}get left(){return this.x}toJSON(){return{x:this.x,y:this.y,width:this.width,height:this.height,top:this.top,right:this.right,bottom:this.bottom,left:this.left}}}function T(t,e,i){return new DOMRect(t.x+e,t.y+i,t.width,t.height)}function j(t,e,i){return new DOMRect(t.x,t.y,e,i)}function k(t,e){return T(t,-e.left,-e.top)}c=S,(0,f.g)(c.prototype,"x",[y],(function(){return 0})),(0,f.g)(c.prototype,"y",[y],(function(){return 0})),(0,f.g)(c.prototype,"width",[y],(function(){return 0})),(0,f.g)(c.prototype,"height",[y],(function(){return 0})),"undefined"==typeof window||window.DOMRect||(window.DOMRect=S)
const A=Object.freeze(new DOMRect(0,0,0,0))
function C(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}const B=(0,i(83919).I)("sprite",(()=>new WeakMap))
class E{static offsetParentStartingAt(t){let e=O(t)
return e||(e=document.getElementsByTagName("body")[0]),new this(e,!0,null,null)}static offsetParentEndingAt(t){let e=O(t)
return e||(e=document.getElementsByTagName("body")[0]),new this(e,!1,null,null)}static positionedStartingAt(t,e){if(!e.initialBounds)throw new Error("offset sprite must have initial bounds")
return new this(t,!0,"position",e)}static positionedEndingAt(t,e){if(!e.finalBounds)throw new Error("offset sprite must have final bounds")
return new this(t,!1,"position",e)}static sizedStartingAt(t){return new this(t,!0,"size",null)}static sizedEndingAt(t){let e=new this(t,!1,"size",null)
return e._initialBounds=A,e._initialComputedStyle=e._finalComputedStyle,e._initialPosition=e._finalPosition,e._originalInitialBounds=e._initialBounds,e._initialCumulativeTransform=e._finalCumulativeTransform,e}constructor(t,e,i,n){C(this,"__element",void 0),C(this,"owner",null),C(this,"_transform",null),C(this,"_cumulativeTransform",null),C(this,"_offsetSprite",void 0),C(this,"_lockedToInitialPosition",void 0),C(this,"_finalComputedStyle",null),C(this,"_finalBounds",null),C(this,"_originalFinalBounds",null),C(this,"_finalPosition",null),C(this,"_finalCumulativeTransform",null),C(this,"_initialComputedStyle",null),C(this,"_initialBounds",null),C(this,"_originalInitialBounds",null),C(this,"_initialPosition",null),C(this,"_initialCumulativeTransform",null),C(this,"_revealed",void 0),C(this,"_imposedStyle",null),C(this,"_styleCache",null),C(this,"_collapsingChildren",null),C(this,"_lockMode",void 0),C(this,"_inInitialPosition",!1),this.element=t,this._offsetSprite=n,this._lockedToInitialPosition=e,e?this.measureInitialBounds():this.measureFinalBounds()
let r=B.get(t)
if(r&&i){if(this._styleCache=r._styleCache,this._revealed=r._revealed,this._imposedStyle=r._imposedStyle,this._collapsingChildren=r._collapsingChildren,this._lockMode=r._lockMode,i!==r._lockMode)throw new Error(`probable bug in ember-animated: can't change lock mode from ${r._lockMode} to ${i}`)}else this._styleCache=null,this._revealed=null,this._lockMode=i,"position"===i?(this._rememberPosition(),this._cacheOriginalStyles()):"size"===this._lockMode&&(this._rememberSize(),this._cacheOriginalStyles())
s().testing&&Object.seal(this)}get initialBounds(){return this._initialBounds}get absoluteInitialBounds(){return this._offsetSprite?T(this._initialBounds,this._offsetSprite.initialBounds.left,this._offsetSprite.initialBounds.top):this._initialBounds}get finalBounds(){return this._finalBounds}get absoluteFinalBounds(){return this._offsetSprite?T(this._finalBounds,this._offsetSprite.finalBounds.left,this._offsetSprite.finalBounds.top):this._finalBounds}get initialComputedStyle(){return this._initialComputedStyle}get finalComputedStyle(){return this._finalComputedStyle}getInitialDimension(t){return this._initialPosition[t]}getFinalDimension(t){return this._finalPosition[t]}get initialCumulativeTransform(){return this._initialCumulativeTransform}get finalCumulativeTransform(){return this._finalCumulativeTransform}get originalInitialBounds(){return this._originalInitialBounds}get originalFinalBounds(){return this._originalFinalBounds}getCurrentBounds(){return this._offsetSprite?k(this.element.getBoundingClientRect(),this._offsetSprite.getCurrentBounds()):this.element.getBoundingClientRect()}_getCurrentPosition(){let{element:t}=this
if(x(t))return{x:M(t,"x"),y:M(t,"y"),cx:M(t,"cx"),cy:M(t,"cy"),r:M(t,"r"),width:M(t,"width"),height:M(t,"height"),transform:t.getAttribute("transform")}
{let t=this.element.style
return{top:t.top,left:t.left,bottom:t.bottom,right:t.right,transform:t.transform,classList:Array.from(this.element.classList)}}}_reapplyPosition(t){if(t)if(x(this.element)){let{element:e}=this
I(e,"x",t),I(e,"y",t),I(e,"cx",t),I(e,"cy",t),I(e,"r",t),I(e,"width",t),I(e,"height",t),function(t,e,i){let n=i[e]
n?t.setAttribute(e,n):t.removeAttribute(e)}(e,"transform",t)}else{let e=this.element.style,i=t
e.top=i.top??"",e.left=i.left??"",e.right=i.right??"",e.bottom=i.bottom??"",e.transform=i.transform??""
for(let t of i.classList)this.element.classList.add(t)
for(let t of Array.from(this.element.classList))i.classList.includes(t)||this.element.classList.remove(t)}}measureInitialBounds(){if(this._initialBounds)throw new Error("Sprite already has initial bounds")
this._inInitialPosition=!0,this._offsetSprite?this._initialBounds=k(this.element.getBoundingClientRect(),this._offsetSprite.initialBounds):this._initialBounds=this.element.getBoundingClientRect(),this._initialComputedStyle=F(this.element),this._initialPosition=this._getCurrentPosition(),this._originalInitialBounds=this._initialBounds,this._initialCumulativeTransform=u(this.element)}assertHasInitialBounds(){if(!this._initialBounds)throw new Error("sprite does not have initialBounds")}assertHasOwner(){if(!this.owner)throw new Error("sprite does not have owner")}measureFinalBounds(){if(this._finalBounds)throw new Error("Sprite already has final bounds")
this._inInitialPosition=!1,this._offsetSprite?this._finalBounds=k(this.element.getBoundingClientRect(),this._offsetSprite.finalBounds):this._finalBounds=this.element.getBoundingClientRect(),this._finalComputedStyle=F(this.element),this._finalPosition=this._getCurrentPosition(),this._originalFinalBounds=this._finalBounds,this._finalCumulativeTransform=u(this.element)}assertHasFinalBounds(){if(!this._finalBounds)throw new Error("sprite does not have finalBounds")}difference(t,e,i){let n=this[t].left,r=this[t].top
return this._offsetSprite&&(n+=this._offsetSprite[t].left,r+=this._offsetSprite[t].top),e._offsetSprite&&(n-=e._offsetSprite[i].left,r-=e._offsetSprite[i].top),{dx:n-e[i].left,dy:r-e[i].top}}set element(t){this.__element=t}get element(){return this.__element}get transform(){return this._transform||(this._transform=h(this.element)),this._transform}get cumulativeTransform(){return this._cumulativeTransform||(this._cumulativeTransform=u(this.element)),this._cumulativeTransform}get revealed(){return null==this._revealed&&(this._revealed=!this.__element.classList.contains("ember-animated-hidden")),this._revealed}_rememberSize(){let t=this.initialCumulativeTransform||this.finalCumulativeTransform,e=this.initialBounds||this.finalBounds
this._imposedStyle={},x(this.element)||(""===this.element.style.width&&(this._imposedStyle.width=e.width/t.a+"px",this._imposedStyle["box-sizing"]="border-box"),""===this.element.style.height&&(this._imposedStyle.height=e.height/t.d+"px",this._imposedStyle["box-sizing"]="border-box"))}_lazyOffsets(t){let e
return()=>(e||(e=function(t,e,i,n){let r,s=t.getBoundingClientRect(),o=s.left,a=s.top
if("fixed"!==e.position&&(r=n.element),r){"BODY"===r.tagName?(o+=window.scrollX,a+=window.scrollY):(o+=r.scrollLeft,a+=r.scrollTop)
let t=getComputedStyle(r)
if("static"!==t.position||"none"!==t.transform){let e=r.getBoundingClientRect()
o-=e.left+parseFloat(t.borderLeftWidth||"0"),a-=e.top+parseFloat(t.borderTopWidth||"0")
let i=u(r)
o/=i.a,a/=i.d}}return o-=i.tx,a-=i.ty,{top:a,left:o}}(this.element,t,this.transform,this._offsetSprite)),e)}_rememberPosition(){let t=getComputedStyle(this.element),e=this.element.style,i=this._lazyOffsets(t),n=0,r=0
this._rememberSize(),x(this.element)||("absolute"!==t.position&&"fixed"!==t.position&&(this._imposedStyle.position="absolute"),""===e.top&&""===e.bottom?(this._imposedStyle.top=`${i().top}px`,this._imposedStyle["margin-top"]="0px"):this._imposedStyle.position&&(r=i().top-parseFloat(t.top||"0")),""===e.left&&""===e.bottom?(this._imposedStyle.left=`${i().left}px`,this._imposedStyle["margin-left"]="0px"):this._imposedStyle.position&&(n=i().left-parseFloat(t.left||"0")),(n||r)&&(this._transform=this.transform.mult(new o(1,0,0,1,n,r)),this._imposedStyle.transform=this.transform.serialize()),this._collapsingChildren=m(this.element,t,"top"))}_cacheOriginalStyles(){let t={},e=this.element.style
Object.keys(this._imposedStyle).forEach((i=>{t[i]=e[i]})),this._styleCache=t}lock(){this._reapplyPosition(this._initialPosition),this.applyStyles(this._imposedStyle),this._handleMarginCollapse(),B.set(this.element,this),this._inInitialPosition=this._lockedToInitialPosition}unlock(){(0,n.warn)("Probable bug in ember-animated: an interrupted sprite tried to unlock itself.\n       This is usually caused by a direct child of an animated component also being an\n       animated component. To fix it, wrap the child in another DOM element.\n       https://github.com/ember-animation/ember-animated/issues/178",this.stillInFlight(),{id:"ember-animated-sprite-unlock"}),B.delete(this.element)
let t=this._styleCache
Object.keys(t).forEach((e=>{W(this.element,e,t[e])})),this._reapplyPosition(this._finalPosition),this._clearMarginCollapse()}applyStyles(t){if(!this._lockMode)throw new Error("can't apply styles to non-lockable sprite")
t!==this._imposedStyle&&Object.keys(t).forEach((e=>{null==this._imposedStyle[e]&&(this._styleCache[e]=this.element.style.getPropertyValue(e)),this._imposedStyle[e]=t[e]})),Object.keys(t).forEach((e=>{let i=t[e]
if("string"!=typeof i)throw new Error(`Sprite#applyStyles only accepts string values. Convert any numeric values to strings (with appropriate units) before calling. You passed ${e}=${i}`)
W(this.element,e,t[e])}))}stillInFlight(){return B.get(this.element)===this}hide(){this._revealed=!1,this.__element.classList.add("ember-animated-hidden")}reveal(){this.revealed||(this._revealed=!0,this.__element.classList.remove("ember-animated-hidden"))}display(t){t?this.__element.classList.remove("ember-animated-none"):this.__element.classList.add("ember-animated-none")}translate(t,e){let i=this.transform
i=i.mult(new o(1,0,0,1,t/i.a,e/i.d)),this._transform=i,this.applyStyles({transform:i.serialize(),"transform-origin":"0 0"})}scale(t,e){let i=this.transform.mult(new o(t,0,0,e,0,0))
this._transform=i,this.applyStyles({transform:i.serialize(),"transform-origin":"0 0"})}rehome(t){let e=T(this.absoluteInitialBounds,-t.initialBounds.left,-t.initialBounds.top),i=this._offsetSprite.cumulativeTransform,n=t.cumulativeTransform,r=this.transform
r=r.mult(new o(i.a/n.a,0,0,i.d/n.d,(e.left-r.tx)/r.a,(e.top-r.ty)/r.d)),this._transform=r,this._imposedStyle.transform=r.serialize(),this._imposedStyle["transform-origin"]="0 0",this._imposedStyle.top="0px",this._imposedStyle.left="0px",this._offsetSprite=t,this._initialBounds=e,this._inInitialPosition=!0}_handleMarginCollapse(){if(this._collapsingChildren){const t=this._collapsingChildren
for(const e of t)e.classList.add("ember-animated-top-collapse")}}_clearMarginCollapse(){if(this._collapsingChildren){const t=this._collapsingChildren
for(const e of t)e.classList.remove("ember-animated-top-collapse")}}startAtSprite(t){(0,d.n)(t.element,this.element)
let e=this.difference("finalBounds",t,"initialBounds")
this.startTranslatedBy(-e.dx,-e.dy),this._initialBounds=j(this._initialBounds,t.initialBounds.width,t.initialBounds.height),this._initialComputedStyle=t.initialComputedStyle,this._initialCumulativeTransform=t.initialCumulativeTransform}startAtPixel({x:t,y:e}){let i=0,n=0
null!=t&&(i=t-this._finalBounds.left,this._offsetSprite&&(i-=this._offsetSprite.finalBounds.left)),null!=e&&(n=e-this._finalBounds.top,this._offsetSprite&&(n-=this._offsetSprite.finalBounds.top)),this.startTranslatedBy(i,n)}startTranslatedBy(t,e){let i=this._initialBounds,n=0,r=0
this._offsetSprite&&(n=this._offsetSprite.finalBounds.left-this._offsetSprite.initialBounds.left,r=this._offsetSprite.finalBounds.top-this._offsetSprite.initialBounds.top),this._initialBounds=T(this._finalBounds,t-n,e-r),this._inInitialPosition?this.translate(this._initialBounds.left-i.left,this._initialBounds.top-i.top):(this.translate(this._initialBounds.left-this._finalBounds.left,this._initialBounds.top-this._finalBounds.top),this._inInitialPosition=!0)}moveToFinalPosition(){if(this._inInitialPosition){let t=this._initialBounds,e=this._finalBounds,i=e.left-t.left,n=e.top-t.top
this.translate(i,n),this._inInitialPosition=!1}}endAtSprite(t){let e=t.difference("finalBounds",this,"initialBounds")
this.endTranslatedBy(e.dx,e.dy),this._finalBounds=j(this._finalBounds,t.finalBounds.width,t.finalBounds.height),this._finalComputedStyle=t.finalComputedStyle,this._finalCumulativeTransform=t.finalCumulativeTransform}endAtPixel({x:t,y:e}){let i=0,n=0
null!=t&&(i=t-this._initialBounds.left,this._offsetSprite&&(i-=this._offsetSprite.initialBounds.left)),null!=e&&(n=e-this._initialBounds.top,this._offsetSprite&&(n-=this._offsetSprite.initialBounds.top)),this.endTranslatedBy(i,n)}endTranslatedBy(t,e){this._finalBounds=T(this._initialBounds,t,e)}endRelativeTo(t){this.endTranslatedBy(t.finalBounds.left-t.initialBounds.left,t.finalBounds.top-t.initialBounds.top)}}const P="http://www.w3.org/2000/svg"
function x(t){return t.namespaceURI===P&&(t.parentElement||!1)&&t.parentElement.namespaceURI===P}function O(t){if(x(t)){let e=t.parentElement
for(;e&&e.namespaceURI===P;){if("svg"===e.tagName)return e
e=e.parentElement}}let e=t.offsetParent,i=t.parentElement
for(;i&&e&&i!==e;){let t=window.getComputedStyle(i)
if("none"!==(""!==t.transform?t.transform:i.style.transform))return i
i=i.parentElement}return e}function M(t,e){return t[e]?t[e].baseVal.value:null}function I(t,e,i){"number"==typeof i[e]&&(t[e].baseVal.value=i[e])}function W(t,e,i){if(/[A-Z]/.test(e))throw new Error(`applyStyles expects all CSS property names to be formatted as in CSS. Not camelcased. You passed ${e}.`)
t.style.setProperty(e,i)}function F(t){let e=getComputedStyle(t),i=new z
for(let n of N)i[n]=e.getPropertyValue(n)
return i}class z{constructor(){C(this,"opacity",void 0),C(this,"font-size",void 0),C(this,"font-family",void 0),C(this,"font-weight",void 0),C(this,"color",void 0),C(this,"background-color",void 0),C(this,"border-color",void 0),C(this,"letter-spacing",void 0),C(this,"line-height",void 0),C(this,"text-align",void 0),C(this,"text-transform",void 0),C(this,"padding",void 0),C(this,"padding-top",void 0),C(this,"padding-bottom",void 0),C(this,"padding-left",void 0),C(this,"padding-right",void 0),C(this,"border-radius",void 0),C(this,"border-top-left-radius",void 0),C(this,"border-top-right-radius",void 0),C(this,"border-bottom-left-radius",void 0),C(this,"border-bottom-right-radius",void 0),C(this,"box-shadow",void 0)}}const N=["opacity","font-size","font-family","font-weight","color","background-color","border-color","letter-spacing","line-height","text-align","text-transform","padding","padding-top","padding-bottom","padding-left","padding-right","border-radius","border-top-left-radius","border-top-right-radius","border-bottom-left-radius","border-bottom-right-radius","box-shadow"]},69423:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{AnimatedBeacon:()=>d.default,AnimatedContainer:()=>m.default,AnimatedOrphans:()=>f.default,Motion:()=>l.A,Tween:()=>h.A,afterRender:()=>n.Tz,allSettled:()=>n.vd,animatedEach:()=>p.default,animatedIf:()=>c.default,animatedValue:()=>v.default,childrenSettled:()=>r.r,clock:()=>n.pm,continueMotions:()=>u.n,current:()=>r.ss,microwait:()=>n.W5,parallel:()=>r._7,printSprites:()=>a,rAF:()=>n.mf,serial:()=>r.vX,spawn:()=>r.cH,spawnChild:()=>r.A,stop:()=>r.ds,task:()=>s._W,wait:()=>n.uk})
var n=i(51229),r=i(35455),s=i(13825),o=i(40491)
let a
a=o.O?function(t,e){let i=null,n=e?e+" ":"",r=["inserted","kept","removed","sent","received"].map((e=>e+"="+t[`_${e}Sprites`].map((t=>(null==i&&(i=!t.element.parentElement||t.element.parentElement.classList.contains("animated-orphans")),t.owner.id))).join(","))).join(" | ")
console.log(n+r+(i?" | (orphan)":""))}:function(){}
var l=i(62554),u=i(30482),h=i(34721),d=i(75028),m=i(32987),p=i(82404),c=i(11287),f=i(44029),v=i(48463)},71017:(t,e,i)=>{var n={"./af":22895,"./af.js":22895,"./ar":34747,"./ar-dz":398,"./ar-dz.js":398,"./ar-kw":94014,"./ar-kw.js":94014,"./ar-ly":22083,"./ar-ly.js":22083,"./ar-ma":30442,"./ar-ma.js":30442,"./ar-ps":88657,"./ar-ps.js":88657,"./ar-sa":33632,"./ar-sa.js":33632,"./ar-tn":51010,"./ar-tn.js":51010,"./ar.js":34747,"./az":46144,"./az.js":46144,"./be":27525,"./be.js":27525,"./bg":84387,"./bg.js":84387,"./bm":77901,"./bm.js":77901,"./bn":79492,"./bn-bd":95495,"./bn-bd.js":95495,"./bn.js":79492,"./bo":1515,"./bo.js":1515,"./br":96544,"./br.js":96544,"./bs":95319,"./bs.js":95319,"./ca":26944,"./ca.js":26944,"./cs":11098,"./cs.js":11098,"./cv":74277,"./cv.js":74277,"./cy":15864,"./cy.js":15864,"./da":60803,"./da.js":60803,"./de":87015,"./de-at":51717,"./de-at.js":51717,"./de-ch":30875,"./de-ch.js":30875,"./de.js":87015,"./dv":20650,"./dv.js":20650,"./el":79637,"./el.js":79637,"./en-au":31994,"./en-au.js":31994,"./en-ca":21352,"./en-ca.js":21352,"./en-gb":61253,"./en-gb.js":61253,"./en-ie":68770,"./en-ie.js":68770,"./en-il":29545,"./en-il.js":29545,"./en-in":20743,"./en-in.js":20743,"./en-nz":36908,"./en-nz.js":36908,"./en-sg":93870,"./en-sg.js":93870,"./eo":5004,"./eo.js":5004,"./es":70040,"./es-do":30988,"./es-do.js":30988,"./es-mx":47628,"./es-mx.js":47628,"./es-us":34469,"./es-us.js":34469,"./es.js":70040,"./et":27245,"./et.js":27245,"./eu":66542,"./eu.js":66542,"./fa":39629,"./fa.js":39629,"./fi":5605,"./fi.js":5605,"./fil":76637,"./fil.js":76637,"./fo":46151,"./fo.js":46151,"./fr":29108,"./fr-ca":49765,"./fr-ca.js":49765,"./fr-ch":34478,"./fr-ch.js":34478,"./fr.js":29108,"./fy":32597,"./fy.js":32597,"./ga":75860,"./ga.js":75860,"./gd":54559,"./gd.js":54559,"./gl":80503,"./gl.js":80503,"./gom-deva":78866,"./gom-deva.js":78866,"./gom-latn":98877,"./gom-latn.js":98877,"./gu":54296,"./gu.js":54296,"./he":54627,"./he.js":54627,"./hi":42159,"./hi.js":42159,"./hr":30826,"./hr.js":30826,"./hu":8339,"./hu.js":8339,"./hy-am":42630,"./hy-am.js":42630,"./id":47833,"./id.js":47833,"./is":3388,"./is.js":3388,"./it":94377,"./it-ch":94677,"./it-ch.js":94677,"./it.js":94377,"./ja":32049,"./ja.js":32049,"./jv":73972,"./jv.js":73972,"./ka":36520,"./ka.js":36520,"./kk":37642,"./kk.js":37642,"./km":91596,"./km.js":91596,"./kn":73173,"./kn.js":73173,"./ko":64214,"./ko.js":64214,"./ku":38724,"./ku-kmr":29523,"./ku-kmr.js":29523,"./ku.js":38724,"./ky":3152,"./ky.js":3152,"./lb":85806,"./lb.js":85806,"./lo":45481,"./lo.js":45481,"./lt":68680,"./lt.js":68680,"./lv":44914,"./lv.js":44914,"./me":54502,"./me.js":54502,"./mi":38562,"./mi.js":38562,"./mk":26808,"./mk.js":26808,"./ml":67661,"./ml.js":67661,"./mn":24523,"./mn.js":24523,"./mr":66743,"./mr.js":66743,"./ms":77024,"./ms-my":667,"./ms-my.js":667,"./ms.js":77024,"./mt":20053,"./mt.js":20053,"./my":68690,"./my.js":68690,"./nb":92172,"./nb.js":92172,"./ne":44057,"./ne.js":44057,"./nl":15442,"./nl-be":15862,"./nl-be.js":15862,"./nl.js":15442,"./nn":87624,"./nn.js":87624,"./oc-lnc":58548,"./oc-lnc.js":58548,"./pa-in":31723,"./pa-in.js":31723,"./pl":13596,"./pl.js":13596,"./pt":53108,"./pt-br":45669,"./pt-br.js":45669,"./pt.js":53108,"./ro":36891,"./ro.js":36891,"./ru":97509,"./ru.js":97509,"./sd":60739,"./sd.js":60739,"./se":62748,"./se.js":62748,"./si":62872,"./si.js":62872,"./sk":51330,"./sk.js":51330,"./sl":94763,"./sl.js":94763,"./sq":89792,"./sq.js":89792,"./sr":7193,"./sr-cyrl":99288,"./sr-cyrl.js":99288,"./sr.js":7193,"./ss":94410,"./ss.js":94410,"./sv":52322,"./sv.js":52322,"./sw":20982,"./sw.js":20982,"./ta":44851,"./ta.js":44851,"./te":26263,"./te.js":26263,"./tet":2827,"./tet.js":2827,"./tg":37593,"./tg.js":37593,"./th":7892,"./th.js":7892,"./tk":19741,"./tk.js":19741,"./tl-ph":98789,"./tl-ph.js":98789,"./tlh":6562,"./tlh.js":6562,"./tr":37318,"./tr.js":37318,"./tzl":88520,"./tzl.js":88520,"./tzm":80607,"./tzm-latn":88841,"./tzm-latn.js":88841,"./tzm.js":80607,"./ug-cn":24904,"./ug-cn.js":24904,"./uk":48112,"./uk.js":48112,"./ur":90463,"./ur.js":90463,"./uz":16407,"./uz-latn":4801,"./uz-latn.js":4801,"./uz.js":16407,"./vi":48533,"./vi.js":48533,"./x-pseudo":56325,"./x-pseudo.js":56325,"./yo":35064,"./yo.js":35064,"./zh-cn":13298,"./zh-cn.js":13298,"./zh-hk":78782,"./zh-hk.js":78782,"./zh-mo":94291,"./zh-mo.js":94291,"./zh-tw":48550,"./zh-tw.js":48550}
function r(t){var e=s(t)
return i(e)}function s(t){if(!i.o(n,t)){var e=new Error("Cannot find module '"+t+"'")
throw e.code="MODULE_NOT_FOUND",e}return n[t]}r.keys=function(){return Object.keys(n)},r.resolve=s,t.exports=r,r.id=71017},74821:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{Scale:()=>l,default:()=>a})
var n=i(51229),r=i(62554),s=i(34721)
function o(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function a(t,e={}){return new l(t,e).run()}class l extends r.A{constructor(...t){super(...t),o(this,"widthTween",null),o(this,"heightTween",null)}*animate(){this.sprite.assertHasInitialBounds(),this.sprite.assertHasFinalBounds()
let t,e,i=this.sprite,r=this.duration
i.originalInitialBounds?(t=i.initialBounds.width/i.originalInitialBounds.width,e=i.initialBounds.height/i.originalInitialBounds.height):(t=i.initialBounds.width/i.originalFinalBounds.width,e=i.initialBounds.height/i.originalFinalBounds.height)
let o=i.finalBounds.width/i.initialBounds.width,a=i.finalBounds.height/i.initialBounds.height
for(this.widthTween=new s.A(i.transform.a*t,i.transform.a*t*o,r,this.opts.easing),this.heightTween=new s.A(i.transform.d*e,i.transform.d*e*a,r,this.opts.easing);!this.widthTween.done||!this.heightTween.done;)i.scale(this.widthTween.currentValue/i.transform.a,this.heightTween.currentValue/i.transform.d),yield(0,n.mf)()}}},74988:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{default:()=>r})
var n=i(15686)
function*r({removedSprites:t,insertedSprites:e,keptSprites:i,duration:r}){yield Promise.all(t.map((t=>{if(t.revealed)return(0,n.default)(t,{to:0,duration:r/2})}))),e.concat(i).map((t=>(0,n.default)(t,{to:1,duration:r/2})))}},75028:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{default:()=>y})
var n,r=i(62663),s=i.n(r),o=i(82735),a=i(13825),l=i(51229),u=i(94438),h=i(63787),d=i(78183)
function m(t,e,i){(function(t,e){if(e.has(t))throw new TypeError("Cannot initialize the same private elements twice on an object")})(t,e),e.set(t,i)}function p(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}var c=(0,i(11465).createTemplateFactory)({id:"w9+R1zyh",block:'[[[18,1,null]],["&default"],false,["yield"]]',moduleName:"/Users/sastapov/Code/tmp/ember-animated/addon/dist/components/animated-beacon.js",isStrictMode:!1}),f=new WeakMap,v=new WeakMap
class y extends(s()){constructor(...t){super(...t),p(this,"name",void 0),p(this,"tagName",""),p(this,"_inserted",!1),m(this,f,void(0,d.i)(this,"motionService")),m(this,v,void(0,d.i)(this,"participate"))}didInsertElement(){super.didInsertElement(),this._inserted=!0,this.animationStarting=this.animationStarting.bind(this),this.motionService.observeAnimations(this.animationStarting)}willDestroyElement(){super.willDestroyElement(),this.motionService.unobserveAnimations(this.animationStarting)}animationStarting(){this.participate.perform()}_firstChildElement(){if(this._inserted){let{firstNode:t,lastNode:e}=(0,u.Z)(this),i=t
for(;i;){if(i.nodeType===Node.ELEMENT_NODE)return i
if(i===e)break
i=i.nextSibling}}}}n=y,(0,d.g)(n.prototype,"motionService",[(0,o.inject)("-ea-motion")]),(0,d.g)(n.prototype,"participate",[(0,a._W)((function*(){if(!this.name)throw new Error("Beacons must have a name.")
if(this.motionService.hasBeacon(this.name))return
let t=this._firstChildElement()
if(!t)return
let e=h.A.offsetParentStartingAt(t),i=h.A.positionedStartingAt(t,e)
yield(0,l.Tz)(),yield(0,l.W5)(),yield*this.motionService.staticMeasurement((()=>{e.measureFinalBounds(),i.measureFinalBounds()})),yield this.motionService.addBeacon.perform(this.name,i)}))]),(0,r.setComponentTemplate)(c,y)},82141:(t,e,i)=>{"use strict"
i.d(e,{A:()=>s})
var n=i(51229)
let r=(0,i(83919).I)("time-control",(()=>n.pm.now))
class s{constructor(){if(n.pm.now!==r)throw new Error("Only one TimeControl may be active at a time")
this._timer=r(),this._runningSpeed=!1,this._runStartedAt=null,n.pm.now=()=>this.now()}finished(){n.pm.now=r}now(){return this._runningSpeed?(r()-this._runStartedAt)*this._runningSpeed+this._timer:this._timer}advance(t){if(this._runningSpeed)throw new Error("You can't advance a running TimeControl. Use either runAtSpeed or advance but not both at once.")
return this._timer+=t,(0,n.mf)().then(n.mf).then(n.mf)}runAtSpeed(t){this._timer=this.now(),this._runningSpeed=t,this._runStartedAt=r()}pause(){this._timer=this.now(),this._runningSpeed=!1,this._runstartedAt=null}}},82404:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{default:()=>E})
var n=i(63991),r=i(4471),s=i(82735),o=i(62663),a=i.n(o),l=i(49388),u=i(13825),h=i(35455),d=i(51229),m=i(26125),p=i(63787),c=i(94438),f=i(9460)
function v(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}class y{constructor(t,e,i,n){v(this,"state","new"),v(this,"removalBlockers",0),v(this,"removalCycle",null),this.group=t,this.id=e,this.value=i,this.index=n,this.removalBlockers=0,this.removalCycle=null}block(t){null!=this.removalCycle&&this.removalCycle!==t||(this.removalCycle=t,this.removalBlockers++)}unblock(t){this.removalCycle===t&&this.removalBlockers--}flagForRemoval(){this.removalCycle=null,this.removalBlockers=0,this.state="removing"}get shouldRemove(){return"removing"===this.state&&this.removalBlockers<1}clone(){return new y(this.group,this.id,this.value,this.index)}}var g,w=i(78183)
function _(t,e,i){(function(t,e){if(e.has(t))throw new TypeError("Cannot initialize the same private elements twice on an object")})(t,e),e.set(t,i)}function b(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}var S=(0,i(11465).createTemplateFactory)({id:"fvPv8xtf",block:'[[[42,[28,[37,1],[[28,[37,1],[[30,0,["renderedChildren"]]],null]],null],"id",[[[8,[39,2],null,[["@child","@elementToChild"],[[30,1],[30,0,["_elementToChild"]]]],[["default"],[[[[18,2,[[30,1,["value"]],[30,1,["index"]]]]],[]]]]]],[1]],[[[18,3,null]],[]]]],["child","&default","&else"],false,["each","-track-array","ea-list-element","yield"]]',moduleName:"/Users/sastapov/Code/tmp/ember-animated/addon/dist/components/animated-each.js",isStrictMode:!1}),T=new WeakMap,j=new WeakMap,k=new WeakMap,A=new WeakMap,C=new WeakMap,B=new WeakMap
class E extends(a()){constructor(...t){super(...t),b(this,"tagName",""),_(this,T,void(0,w.i)(this,"motionService")),b(this,"items",void 0),b(this,"group",void 0),b(this,"duration",void 0),b(this,"use",void 0),b(this,"rules",void 0),b(this,"initialInsertion",!1),b(this,"finalRemoval",!1),b(this,"key",void 0),b(this,"watch",void 0),b(this,"_elementToChild",new WeakMap),b(this,"_prevItems",[]),b(this,"_prevSignature",[]),b(this,"_firstTime",!0),b(this,"_inserted",!1),b(this,"_renderedChildren",[]),b(this,"_renderedChildrenStartedMoving",!1),b(this,"_cycleCounter",0),b(this,"_keptSprites",null),b(this,"_insertedSprites",null),b(this,"_removedSprites",null),b(this,"_lastTransition",null),b(this,"_ancestorWillDestroyUs",!1),_(this,j,void(0,w.i)(this,"isAnimating")),_(this,k,void(0,w.i)(this,"animate")),_(this,A,void(0,w.i)(this,"startAnimation")),_(this,C,void(0,w.i)(this,"runAnimation")),_(this,B,void(0,w.i)(this,"finalizeAnimation"))}init(){super.init(),this.motionService.register(this).observeDescendantAnimations(this,this.maybeReanimate).observeAncestorAnimations(this,this.ancestorIsAnimating),this._installObservers()}_installObservers(){let t=this.key
null!=t&&"@index"!==t&&"@identity"!==t&&this.addObserver(`items.@each.${t}`,this,this._invalidateRenderedChildren)
let e=this._deps
if(e)for(let i of e)this.addObserver(`items.@each.${i}`,this,this._invalidateRenderedChildren)}get _deps(){let t=this.watch
if("string"==typeof t)return t.split(/\s*,\s*/)}get durationWithDefault(){let t=this.duration
return null==t?500:t}_invalidateRenderedChildren(){this.notifyPropertyChange("renderedChildren")}_identitySignature(t,e){if(!t)return[]
let i=this._deps,n=[]
for(let s=0;s<t.length;s++){let o=t[s]
if(n.push(e(o,s)),i)for(const t of i)n.push((0,r.get)(o,t))}return n}get renderedChildren(){let t=this._firstTime
this._firstTime=!1
let e=this.keyGetter,i=this._renderedChildren,n=this._prevItems,r=this._prevSignature,s=this.items,o=this._identitySignature(s,e),a=this.group||"__default__"
this._prevItems=s?s.slice():[],this._prevSignature=o,s||(s=[])
let l=new Map
i.forEach(((t,e)=>{l.set(t.id,e)}))
let u=new Map
s.forEach(((t,i)=>{u.set(e(t,i),i)}))
let h=s.map(((t,i)=>{let n=e(t,i)
if(null!=l.get(n)){let e=new y(a,n,t,i)
return e.state="kept",e}return new y(a,n,t,i)})).concat(i.filter((t=>!(t.shouldRemove&&this._renderedChildrenStartedMoving||null!=u.get(t.id)))).map((t=>(t.flagForRemoval(),t))))
if(this._renderedChildren=h,this._renderedChildrenStartedMoving=!1,"undefined"==typeof FastBoot&&!function(t,e){if(t.length!==e.length)return!1
for(let i=0;i<t.length;i++)if(t[i]!==e[i])return!1
return!0}(r,o)){let e=this._transitionFor(t,n,s)
this.animate.perform(e,t)}return h}get keyGetter(){return(0,c.I)(this.key)}didInsertElement(){super.didInsertElement(),this._inserted=!0}*_ownElements(){if(!this._inserted)return
let{firstNode:t,lastNode:e}=(0,c.Z)(this),i=t
for(;i&&(i.nodeType===Node.ELEMENT_NODE&&(yield i),i!==e);)i=i.nextSibling}maybeReanimate(){this.animate.isRunning&&!this.startAnimation.isRunning&&this.animate.perform(this._lastTransition)}ancestorIsAnimating(t){if("removing"!==t||this._ancestorWillDestroyUs){if("removing"!==t&&this._ancestorWillDestroyUs){this._ancestorWillDestroyUs=!1
let t=this._transitionFor(this._firstTime,[],this._prevItems)
this.animate.perform(t)}}else this._ancestorWillDestroyUs=!0,this._letSpritesEscape()}_letSpritesEscape(){let t,e=this._transitionFor(this._firstTime,this._prevItems,[]),i=[]
for(let n of this._ownElements()){t||(t=p.A.offsetParentStartingAt(n))
let e=p.A.positionedStartingAt(n,t)
e.owner=this._elementToChild.get(n),i.push(e)}this.motionService.matchDestroyed(i,e,this.durationWithDefault,this.finalRemoval)}willDestroyElement(){super.willDestroyElement(),this._ancestorWillDestroyUs||this._letSpritesEscape(),this.motionService.unregister(this).unobserveDescendantAnimations(this,this.maybeReanimate).unobserveAncestorAnimations(this,this.ancestorIsAnimating)}beginStaticMeasurement(){this._keptSprites&&(this._keptSprites.forEach((t=>t.unlock())),this._insertedSprites.forEach((t=>t.unlock())),this._removedSprites.forEach((t=>t.display(!1))))}endStaticMeasurement(){this._keptSprites&&(this._keptSprites.forEach((t=>t.lock())),this._insertedSprites.forEach((t=>t.lock())),this._removedSprites.forEach((t=>t.display(!0))))}_findCurrentSprites(){let t,e=[]
for(let i of this._ownElements()){t||(t=p.A.offsetParentStartingAt(i))
let n=p.A.positionedStartingAt(i,t)
e.push(n)}return{currentSprites:e,parent:t}}_partitionKeptAndRemovedSprites(t){t.forEach((t=>{if(!t.element.parentElement)return
let e=this._elementToChild.get(t.element)
if(t.owner=e,this._ancestorWillDestroyUs)this._removedSprites.push(t)
else switch(e.state){case"kept":case"new":this._keptSprites.push(t)
break
case"removing":this._removedSprites.push(t)
break
default:throw(0,l.Ay)(e.state)}}))}_motionStarted(t,e){t.reveal(),t.owner.block(e)}_motionEnded(t,e){t.owner.unblock(e)}_transitionFor(t,e,i){let n=this.rules
return n?n({firstTime:t,oldItems:e,newItems:i}):this.use}}g=E,b(E,"positionalParams",["items"]),(0,w.g)(g.prototype,"motionService",[(0,s.inject)("-ea-motion")]),(0,w.n)(g.prototype,"_deps",[(0,r.computed)("watch")]),(0,w.n)(g.prototype,"durationWithDefault",[(0,r.computed)("duration")]),(0,w.n)(g.prototype,"renderedChildren",[(0,r.computed)("items.[]","group")]),(0,w.g)(g.prototype,"isAnimating",[(0,n.alias)("animate.isRunning")]),(0,w.n)(g.prototype,"keyGetter",[(0,r.computed)("key")]),(0,w.n)(g.prototype,"maybeReanimate",[r.action]),(0,w.n)(g.prototype,"ancestorIsAnimating",[r.action]),(0,w.g)(g.prototype,"animate",[(0,u._W)((function*(t,e){let{parent:i,currentSprites:n,insertedSprites:r,keptSprites:s,removedSprites:o}=yield this.startAnimation.perform(t,(0,h.ss)()),{matchingAnimatorsFinished:a}=yield this.runAnimation.perform(t,i,n,r,s,o,e)
yield this.finalizeAnimation.perform(r,s,o,a)})).restartable()]),(0,w.g)(g.prototype,"startAnimation",[(0,u._W)((function*(t,e){this._lastTransition=t
let i=this._keptSprites=[],n=this._removedSprites=[],r=this._insertedSprites=[],{currentSprites:s,parent:o}=this._findCurrentSprites()
return this.motionService.willAnimate({task:e,duration:this.durationWithDefault,component:this,children:this._renderedChildren}),s.forEach((t=>t.lock())),yield(0,d.Tz)(),{parent:o,currentSprites:s,insertedSprites:r,keptSprites:i,removedSprites:n}}))]),(0,w.g)(g.prototype,"runAnimation",[(0,u._W)((function*(t,e,i,n,r,s,o){this._partitionKeptAndRemovedSprites(i),yield*this.motionService.staticMeasurement((()=>{e&&!e.finalBounds&&e.measureFinalBounds()
for(let t of this._ownElements())if(!i.find((e=>e.element===t))){e||(e=p.A.offsetParentEndingAt(t))
let i=p.A.positionedEndingAt(t,e)
i.owner=this._elementToChild.get(t),i.hide(),n.push(i)}r.forEach((t=>t.measureFinalBounds()))}))
let{farMatches:a,matchingAnimatorsFinished:l,beacons:u}=yield this.motionService.get("farMatch").perform((0,h.ss)(),n,r,s)
e&&!e.initialBounds&&e.measureInitialBounds()
let[c,v]=(0,f.A)(s,(t=>{let e=a.get(t)
return!!e&&(t.endAtSprite(e),e.revealed&&!t.revealed&&t.startAtSprite(e),!0)})),[y,g]=(0,f.A)(n,(t=>{let e=a.get(t)
return!!e&&(t.startAtSprite(e),!0)})),[w,_]=(0,f.A)(r,(t=>{let e=a.get(t)
return!!e&&(e.revealed&&!t.revealed&&t.startAtSprite(e),!0)}))
if(yield(0,d.W5)(),w.forEach((t=>t.hide())),c.forEach((t=>t.hide())),o&&!this.initialInsertion&&(g.forEach((t=>t.reveal())),g=[]),this._renderedChildrenStartedMoving=!0,!t||0===g.length&&0===_.length&&0===v.length&&0===c.length&&0===y.length&&0===w.length)return{matchingAnimatorsFinished:l}
let b=new m.A(this.durationWithDefault,g,_,v,c,y.concat(w),u,(t=>this._motionStarted(t,S)),(t=>this._motionEnded(t,S))),S=this._cycleCounter++
return yield*(0,m.r)(b,t),{matchingAnimatorsFinished:l}}))]),(0,w.g)(g.prototype,"finalizeAnimation",[(0,u._W)((function*(t,e,i,n){yield n,e.forEach((t=>{t.unlock(),t.reveal()})),t.forEach((t=>{t.unlock(),t.reveal()})),this._keptSprites=null,this._removedSprites=null,this._insertedSprites=null,i.length>0&&(this.notifyPropertyChange("renderedChildren"),yield(0,d.Tz)())}))]),(0,o.setComponentTemplate)(S,E)},83919:(t,e,i)=>{"use strict"
function n(t,e){const i=Symbol.for(t)
return Object.getOwnPropertySymbols(window.emberAnimatedSingleton).indexOf(i)>-1||(window.emberAnimatedSingleton[i]=e()),window.emberAnimatedSingleton[i]}i.d(e,{I:()=>n}),window.emberAnimatedSingleton=window.emberAnimatedSingleton||{}},87271:(t,e,i)=>{"use strict"
function n(t){return.5-Math.cos(t*Math.PI)/2}i.r(e),i.d(e,{easeIn:()=>l,easeInAndOut:()=>n,easeOut:()=>u})
const r=.5+1/Math.PI,s=1/(2*r),o=(2-Math.PI)/4,a=Math.PI/2*r
function l(t){return t<s?n(t*r):a*t+o}function u(t){return 1-l(1-t)}},87974:(t,e,i)=>{"use strict"
i.r(e),i.d(e,{ContinuePrior:()=>d,Move:()=>l,continuePrior:()=>h,default:()=>a})
var n=i(51229),r=i(62554),s=i(34721)
function o(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t
var e=t[Symbol.toPrimitive]
if(void 0!==e){var i=e.call(t,"string")
if("object"!=typeof i)return i
throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t)
return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function a(t,e={}){return new l(t,e).run()}class l extends r.A{constructor(...t){super(...t),o(this,"prior",null),o(this,"xTween",null),o(this,"yTween",null)}interrupted(t){this.prior=t.find((t=>t instanceof l))}*animate(){let t=this.duration
this.sprite.assertHasInitialBounds(),this.sprite.assertHasFinalBounds()
let e,i,n=this.sprite
{let t=n.initialBounds,r=n.finalBounds
e=r.left-t.left,i=r.top-t.top}if(this.prior){let r=this.prior
r.assertHasTweens()
let o=r.xTween,a=r.yTween,l=n.transform.tx-o.currentValue,h=n.transform.ty-a.currentValue
e-=o.finalValue-o.currentValue,i-=a.finalValue-a.currentValue
let d=u(e)?0:t,m=u(i)?0:t
this.xTween=new s.A(l,l+e,d,this.opts.easing).plus(r.xTween),this.yTween=new s.A(h,h+i,m,this.opts.easing).plus(r.yTween)}else this.xTween=new s.A(n.transform.tx,n.transform.tx+e,u(e)?0:t,this.opts.easing),this.yTween=new s.A(n.transform.ty,n.transform.ty+i,u(i)?0:t,this.opts.easing)
yield*this._moveIt()}*_moveIt(){this.assertHasTweens()
let t=this.sprite
for(;!this.xTween.done||!this.yTween.done;)t.translate(this.xTween.currentValue-t.transform.tx,this.yTween.currentValue-t.transform.ty),yield(0,n.mf)()}assertHasTweens(){if(!this.xTween)throw new Error("motion does not have xTween")
if(!this.yTween)throw new Error("motion does not have yTween")}}function u(t){return Math.abs(t)<1e-5}function h(t,e={}){return new d(t,e).run()}class d extends l{*animate(){this.prior&&(this.xTween=this.prior.xTween,this.yTween=this.prior.yTween,yield*this._moveIt())}}},94438:(t,e,i)=>{"use strict"
i.d(e,{I:()=>u,Z:()=>l})
var n=i(4471),r=i(24666),s=i(75592),o=i.n(s)
const{getViewBounds:a}=o().ViewUtils
function l(t){let e=a(t)
return{firstNode:e.firstNode,lastNode:e.lastNode}}function u(t){switch(t){case"@index":return h
case"@identity":case void 0:case null:return d
default:return e=>(0,n.get)(e,t)}}function h(t,e){return String(e)}function d(t){switch(typeof t){case"string":case"number":return String(t)
default:return(0,r.guidFor)(t)}}},95457:(t,e,i)=>{"use strict"
function n(t){return t}i.d(e,{A:()=>n})}}])
