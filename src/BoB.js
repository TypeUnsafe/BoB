/*[md]
# BoB - Tiny Web Component Framework

BoB is a WebComponents framework, Inspired from [http://www.html5rocks.com/en/tutorials/webcomponents/customelements](http://www.html5rocks.com/en/tutorials/webcomponents/customelements).

BoB provides 5 Classes:

- `BoB.Element`
- `BoB.Broker`
- `BoB.Router`
- `BoB.Model`
- `BoB.Collection`
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

    constructor(options = {}) {
      this.options = options;
    }

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
    constructor(options = {}) {
      Object.assign(this, options);
      this.subscriptions = [];
    }

    addSubscription(topic, object) {
      this.subscriptions.push({topic: topic, subscriber: object});
    }

    removeSubscription(topic, object) {/*TODO*/}

    notify(topic, message) {
      if(this.log) console.info(topic, message);
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

/*[md]
## Class Model

### Sample

```javascript
class Cow extends BoB.Model {
  constructor(fields, broker) {
    super(
      fields,
      {
        broker: broker,
        topic:"model/cow",
        events:{onSet:true, onSave:true, onFetch:true, onRemove:true},
        url:"/api/cows"
      }
    );
  }
}
```
*/
  class Model {
    constructor(fields, options) {
      this.fields = fields;
      this.events = {};
      Object.assign(this, options);
      this.state = {};
    }

    subscribe (topic) {
      (this.broker !== undefined
        ? () => this.broker.addSubscription(topic, this)
        : () => {throw Error(`${this.constructor.name}: broker is undefined!`);})();
    }

    unsubscribe (topic) {
    //TODO
    }

    publish (topic, message) {
      (this.broker !== undefined
        ? () => this.broker.notify(topic, message)
        : () => {throw Error(`${this.constructor.name}: broker is undefined!`);})();
    }

    get (fieldName) {
      return this.fields[fieldName];
    }

    set (fieldName, value) {
      let old = this.fields[fieldName];
      this.fields[fieldName] = value;
      // publish
      if(this.events["onSet"]==true) {
        (this.topic !== undefined
          ? ()=> this.publish(this.topic+"/set", {field: fieldName, value: value, old: old})
          : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
      }
      return this;
    }

    toString () {
      return JSON.stringify(this.fields)
    }
    toObject () {
      return Object.assign({}, this.fields);
    }
    id() { return this.get("_id");}

    // REST API
    //TODO: check if url exists
    save() {
      if (this.id() == undefined) {
        // create (insert)
        return fetch(this.url, {
          method: 'POST',
          body: this.toString(),
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }).then((response) => response.json()).then(data => {
          this.fields = data;
          // Notifications
          if(this.events["onSave"]==true) {
            (this.topic !== undefined
              ? ()=> this.publish(this.topic+"/save/create", this.toObject())
              : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
          }
          this.state.created = Date();
          return data;
        }).catch((error) => error);

      } else {
        // update
        return fetch(`${this.url}/${this.id()}`, {
          method: 'PUT',
          body: this.toString(),
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }).then((response) => response.json()).then(data => {
          this.fields = data;
          // Notifications
          if(this.events["onSave"]==true) {
            (this.topic !== undefined
              ? ()=> this.publish(this.topic+"/save/update", this.toObject())
              : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
          }
          this.state.updated = Date();
          return data;
        }).catch((error) => error);
        
      }
    }

    fetch(id) { // get
      return fetch(`${this.url}/${this.id()}`, {
        method: 'GET',
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }).then((response) => response.json()).then(data => {
        this.fields = data;
        // Notifications
        if(this.events["onFetch"]==true) {
          (this.topic !== undefined
            ? ()=> this.publish(this.topic+"/fetch", this.toObject())
            : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
        }
        this.state.fetched = Date();
        return data;
      }).catch((error) => error);
    }

    remove(id) { // delete
      return fetch(`${this.url}/${this.id()}`, {
        method: 'DELETE',
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }).then((response) => response.json()).then(data => {
        this.fields = data;
        // Notifications
        if(this.events["onRemove"]==true) {
          (this.topic !== undefined
            ? ()=> this.publish(this.topic+"/remove", this.toObject())
            : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
        }
        this.state.removed = Date();
        return data;
      }).catch((error) => error);
    }

  }

/*[md]
## Class Collection

### Sample

 ```javascript
class Cows extends BoB.Collection {
  constructor(broker) {
    super({
      model: Cow
      broker: broker,
      topic:"collection/cows",
      events:{onAdd:true, onFetch:true},
      url:"/api/cows"
    });
  }
}
 ```
*/
  class Collection {

    constructor (options) {
      this.models = [];
      this.events = {};
      Object.assign(this, options);
    }

    subscribe (topic) {
      (this.broker !== undefined
        ? () => this.broker.addSubscription(topic, this)
        : () => {throw Error(`${this.constructor.name}: broker is undefined!`);})();
    }

    unsubscribe (topic) {
      //TODO
    }

    publish (topic, message) {
      (this.broker !== undefined
        ? () => this.broker.notify(topic, message)
        : () => {throw Error(`${this.constructor.name}: broker is undefined!`);})();
    }
    
    add (model) { // model
      this.models.push(model);
      // Notifications
      if(this.events["onAdd"]==true) {
        (this.topic !== undefined
          ? ()=> this.publish(this.topic+"/add", model.fields)
          : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
      }
      return new Promise((resolve, reject) => {
        resolve(model);
      });
      
    }

    addFields (fields) { // model fields
      let model = new this.model(fields, this.broker!==undefined?this.broker:undefined);
      this.models.push(model);
      // Notifications
      if(this.events["onAdd"]==true) {
        (this.topic !== undefined
          ? ()=> this.publish(this.topic+"/add", fields)
          : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
      }
      return new Promise((resolve, reject) => {
        resolve(model);
      });
    }

    remove (model) { //remove from collection
      var index = this.models.indexOf(model);
      if (index > -1) {
        this.models.splice(index, 1);
      }
      // Notifications
      if(this.events["onRemove"]==true) {
        (this.topic !== undefined
          ? ()=> this.publish(this.topic+"/remove", model.fields)
          : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
      }
      return new Promise((resolve, reject) => {
        resolve(model);
      });
    }

    removeAtIndex (index) { //remove from collection
      let model = this.models[index];
      this.models.splice(index, 1);
      // Notifications
      if(this.events["onRemove"]==true) {
        (this.topic !== undefined
          ? ()=> this.publish(this.topic+"/remove", model.fields)
          : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
      }
      return new Promise((resolve, reject) => {
        resolve(model);
      });
    }

    each (callbck) {
      this.models.forEach(callbck);
    }

    filter (callbck) {
      return this.models.filter(callbck)
    }

    map (callbck) {
      return this.models.map(callbck)
    }

    size () { return this.models.length; }
    
    toObjects () {
      let models = [];
      this.each((model) => models.push(model.fields));
      return models;
    }
    toString () {
      return JSON.stringify(this.toObjects());
    }

    fetch (params) { // use params if you want add something to url, ie: api/cows/search/cook

      return fetch(params==undefined ? this.url : this.url+params, {
        method: 'GET',
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }).then((response) => response.json()).then(jsonModels => {
        this.models = []; /* empty list */

        jsonModels.forEach((fields) => {
          let model = new this.model(fields, this.broker!==undefined?this.broker:undefined);
          model.state.fetched = Date();
          this.add(model); // always initialize a model like that
        });

        // Notifications
        if(this.events["onFetch"]==true) {
          (this.topic !== undefined
            ? ()=> this.publish(this.topic+"/fetch", jsonModels)
            : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
        }
        return jsonModels;
      }).catch((error) => error);

    }

    synchronise() {
      //TODO
    }

    localFetch (key) {
      this.models = []; /* empty list */
      JSON.parse(localStorage.getItem(key)).forEach(fields => {
        let model = new this.model(fields, this.broker!==undefined?this.broker:undefined);
        model.state.localFetched = Date();
        this.add(model); // always initialize a model like that
      });
      // Notifications
      if(this.events["onFetch"]==true) {
        (this.topic !== undefined
          ? ()=> this.publish(this.topic+"/local/fetch", this.toObjects())
          : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
      }
    }
    localSave (key) {
      localStorage.setItem(key, this.toString());
      if(this.events["onSave"]==true) {
        (this.topic !== undefined
          ? ()=> this.publish(this.topic+"/local/save", this.toObjects())
          : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
      }
    }
    localRemove (key) {
      localStorage.removeItem(key);
      if(this.events["onRemove"]==true) {
        (this.topic !== undefined
          ? ()=> this.publish(this.topic+"/local/remove", this.toObjects())
          : ()=>{throw Error(`${this.constructor.name}: topic is undefined!`);})();
      }
    }
  }
  
  BoB.Element = Element;
  BoB.Broker = Broker;
  BoB.Router = Router;

  BoB.Model = Model;
  BoB.Collection = Collection;
  
})(root.BoB || exports);