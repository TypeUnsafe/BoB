/*[md]
# BoB - Tiny Web Component Framework

BoB is a WebComponents framework, Inspired from [http://www.html5rocks.com/en/tutorials/webcomponents/customelements](http://www.html5rocks.com/en/tutorials/webcomponents/customelements).

BoB provides 3 Classes:

- `BoB.Element`
- `BoB.Broker`
- `BoB.Router`
*/
'use babel'; // for Atom support only
let root = this;
if (typeof exports === 'undefined') { root.BoB = root.BoB || {}; }

(function (BoB) {
/*[md]
## Class Element

### Methods

This class allows to define and register custom elements

#### constructor

- `@param options`

Minimal options are: `tagName` and `template`:

```javascript
  let myTag = new BoB.Element({
  tagName:"my-tag",
  template: (element, data) => `<p>${data.message}</p>`
});
```

Other options: (wip)

#### register

- `@param data`
- `@returns {HTMLElement}`

Put a tag in you HTML code: `<my-tag></my-tag>`, then, you have to register your component to mount it to the DOM:

```javascript
myTag.register({message:"Hello"})
```

You can path data to the component as parameter of `register` method. 
For example if your template equals to:

```javascript
(element, data) => `<p>${data.firstName} ${data.lastName}</p>`
```

Then you can register your component like this:
```javascript
myTag.register({firstName:"Bob", lastName:"Morane"})
```

##### element methods (wip)


##### element attributes (wip)
*/
  class Element {

    constructor(options) { this.options = options; }

    register(data) {
      let elementProto = Object.create(HTMLElement.prototype), options = this.options, shadow = null;
      options.data = data;

      elementProto.createdCallback = function() {
        shadow = this.createShadowRoot();
        shadow.innerHTML = options.template(this, data);
        if (options.created !== undefined) options.created(this, data);
      };
      
      elementProto.refresh = function () {
        shadow.innerHTML = options.template(this, options.data);
      };

      elementProto.attachedCallback = options.attached !== undefined
        ? function() { options.attached(this, data); } : function() {};

      elementProto.detachedCallback = options.detached !== undefined
        ? function() { options.detached(this, data); } : function() {};

      // TODO: elementProto.attributeChangedCallback

      elementProto.subscribe = function(topic) {
        (data.broker !== undefined
          ? () => data.broker.addSubscription(topic, this)
          : () => {throw Error(`${options.tagName.toLowerCase()}: broker is undefined!`);})();
      };
      
      elementProto.unsubscribe = function(topic) {
        //TODO
      };

      elementProto.publish = function(topic, message) {
        (data.broker !== undefined
          ? () => data.broker.notify(topic, message)
          : () => {throw Error(`${options.tagName.toLowerCase()}: broker is undefined!`);})();
      };

      elementProto.first = function (selector) {
        return this.shadowRoot.querySelector(selector);
      };

      elementProto.select = function (selector) {
        return Array.from(this.shadowRoot.querySelectorAll(selector));
      };

      document.registerElement(options.tagName, {prototype: elementProto});
      return elementProto;
    }
  }

/*[md]
## Class Broker

### Methods
This class allows to create a messages broker to communicate between components

#### constructor

- `@param options`

All options passed to the constructor become properties of the instance of Broker

#### addSubscription

- `@param topic`
- `@param object`

Description: (wip)

#### removeSubscription

- `@param topic`
- `@param object`

Description: (wip)

#### notify

- `@param topic`
- `@param message`
- `@returns object`

Description: (wip)
*/
  class Broker {
    constructor(options) {
      Object.assign(this, options);
      this.subscriptions = [];
    }

    addSubscription(topic, object) {
      this.subscriptions.push({topic: topic, subscriber: object});
    }

    removeSubscription(topic, object) {/*TODO*/}

    notify(topic, message) {
      this.subscriptions
        .filter(item => item.topic == topic)
        .forEach(item => {
          let getOnMessageMethod = item.subscriber.onMessage !== undefined
            ? () => item.subscriber.onMessage(topic, message)
            : () => {throw Error(`${item.subscriber.tagName.toLowerCase()}: onMessage method is undefined!`);};
          getOnMessageMethod();
        });
    }
  }

/*[md]
## Class Router

### Methods
This class allows to create a router to listen popstate events

#### constructor

- `@param options`

All options passed to the constructor become properties of the instance of Router

Mandatory: you need to pass a `broker` and a `topic` to the constructor:

```javascript
let router = new BoB.Router({broker: broker, topic:"router"})
router.listen();
```

Then you can subscribe to the topic of the router

```javascript
let observer = {
  onMessage: (topic, message) => {
    console.log("observer", message);
  }
};
broker.addSubscription("router", observer);
router.listen();
```

**Remark:** BoB.Element instances can subscribe to any topic.

#### match

- `@param uri`

the `match` method works with the `uri` parameter:

- removes `#/` from uri, ie: `http://localhost:3006/#/hello/bob/morane` becomes `/hello/bob/morane`
- extracts "parameters" of the uri, ie: `["bob", "morane"]`
- extracts "route", ie: `"hello"` 
- and then notify the messages broker when popstate event

#### listen

Description: (wip)

*/
  class Router {

    constructor (options={}) {
      Object.assign(this, options);
      //TODO check broker and topic properties here(?)
    }

    match (uri) { //using hash
      uri = uri.replace("#\/","");
      let uriParts = uri.split("/").filter((part)=>part.length>0);
      let route = uriParts[0];
      let params = uriParts.slice(1);
      
      (this.broker !== undefined && this.topic !== undefined
        ? () => this.broker.notify(this.topic, {route, params, uri})
        : () => {throw Error(`${this.constructor.name}: broker or/and topic is(are) undefined!`);})();
    }

    listen () {
      // when router is listening
      // check url at first time (first load) (useful to bookmark functionality)
      this.match(window.location.hash);
      /* subscribe to onpopstate */
      window.onpopstate = (event) => {
        this.match(window.location.hash);
      };
    }
  }
  
  BoB.Element = Element;
  BoB.Broker = Broker;
  BoB.Router = Router;
  
})(root.BoB || exports);