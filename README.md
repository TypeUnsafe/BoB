# BoB
The smallest WebComponents framework, **only for Chrome** (and for FF or Safari Tech Preview with Polyfill)

## Who is this BoB?

### Setup

```html
<script src="../src/bob.js"></script>
```

### Create a component

```javascript
let myTitleComponent = new BoB.Element({
  tagName:"my-title",
  template: (element, data) => `<h1>${data.title}</h1>`,
  created: (element, data) => {
    console.info("myTitleComponent is created")
  },
  attached: (element, data) => {
    console.info("myTitleComponent is attached")
    data.title = "[" + data.title + "]";
    element.refresh(); // refresh template with new data
  }
});
```

#### Component with dom events

You need to set the `events` property in the options for the element constructor, to define event listeners;

```javascript
let littleButtonComponent = new BoB.Element({
  tagName:"little-button",
  template: (element, data) => `<button>Click me!</button>`,
  created: (element, data) => {
    // foo
  },
  events: (element, data) => {
    element.addEventListener('click', (e) => {
      // clicked
    });
  }
});
```

### Access to nested item in a component

`element` has 2 selector methods:

- `element.first(selector)`: returns the first found node
- `element.select(selector)`: returns an array of all found nodes

```javascript
let myFormComponent = new BoB.Element({
  tagName:"my-form",
  template: (element, data) => `<div>
    <form>
      <input type="text" placeholder="${data.placeholder}"/>
      <button onclick="return false">Click Me!</button>
    </form>
    <!-- my other component -->
    <my-display title="Form sample"></my-display>
  </div>`,
  created: (element, data) => {
    // foo
  },
  attached: (element, data) => {
    // foo
  },
  events: (element, data) => {
    element.first("button").addEventListener('click', (e) => {
      let value = element.first("input").value;
      let myDisplayTag = element.first("my-display");
      myDisplayTag.title = value;
      myDisplayTag.refresh();
    });
  }
});
```

### Mount a component

Add the new tag in your html code:

```html
<my-title></my-title>
```

Register the component:

```javascript
myTitleComponent.register({title:"Who is this BoB?"});
```

And now, you can access to `title` with `data.title` (ie: see `attached` method).

### Components communication

**BoB** provides a messages broker (`BoB.Broker`)

Define a new broker:

```javascript
let broker = new BoB.Broker();
```

Pass the broker to the component at registration:

```javascript
littleButtonComponent.register({broker: broker});
```

And now the element can `subscribe` to a topic and `publish` on a topic. This is the `onMessage` method that is triggered when there is a message on a subscribed topic:

```javascript
element.subscribe("yo/tada");
element.subscribe("hi/tada");

element.onMessage = (topic, message) => {

  if (topic=="yo/tada") element.first("b").innerHTML = message;

  if (topic=="hi/tada") {
    data.message = message;
    element.refresh();
    element.publish("infos", "I'm refreshed!");
  }
}
```

### Play with tag attributes

```html
<my-title title="Hello World! I'm BoB!"></my-title>
```

For example, if you want to get the value of the title attribute to use it (ie with the template), you can use element (ie: `element.title`) instead of data:

```javascript
let myTitleComponent = new BoB.Element({
  tagName:"my-title",
  template: (element, data) => `<h1>${element.title}</h1>`,
  created: (element, data) => {
    console.log(element.title);
  }
});
```

## BoB provides a router

You need define a broker and a router:

```javascript
let broker = new BoB.Broker();

let router = new BoB.Router({broker: broker, topic:"router"});
router.listen();
```

Now, on each `popstate` event, the router publish route's root, uri and params on the "router" topic.
Then you can define a kind of **observer** object to be notified:

```javascript
let observer = {
  onMessage: (topic, message) => {
    console.log("route", message.route); // if uri == "yo/1/2/3" you get "yo"
    console.log("uri", message.uri);
    console.log("route", message.params); // if uri == "yo/1/2/3" you get [1,2,3]
  }
};
broker.addSubscription("router", observer);
```

Of course, you can subscribe to the router with a `BoB.Element`:

```javascript
let myTitleComponent = new BoB.Element({
  tagName:"my-title",
  template: (element, data) => `<h1>${element.title}</h1>`,
  created: (element, data) => {
    element.subscribe("router");
    element.onMessage = (topic, message) => {
      element.title = message.uri;
      element.refresh();
    };
  }
});
```

## Models and Collections

*Documentation and samples are in progress...*

- models and collections can use REST API
- collections provide helpers to deals with local storage

### Define a model

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

### Define a collection

```javascript
class Cows extends BoB.Collection {
  constructor(broker) {
    super(
      {
        model: Cow,
        broker: broker,
        topic:"collection/cows",
        events:{onSave: true, onAdd:true, onFetch:true, onRemove:true},
        url:"/api/cows"
      }
    );
  }
}
```

### Play with models and collections

```javascript
let broker = new BoB.Broker({log:true}); // if log is true you can see all messages (and publication topics)
let cookie = new Cow({name:"Cookie"}, broker); // this is a modet
let cows = new Cows(broker); // this is a collection

cookie.save().then(()=>{
  cookie.set("name", "COOKIE");
  cookie.save().then(data => {
    cookie.fetch().then(()=> {
      cookie.remove()
    })
  });
});

cows.fetch().then((data) => {
  console.log(cows.toString())
});
```

## Cook Book

### Iterate on list and display result

```javascript
let myListComponent = new BoB.Element({
  tagName:"my-list",
  template: (element, data) => `
  <ul>${
    data.humans.map(
      (human) => `
        <li>
          <b>${human.name}</b>
        </li>
        `
    ).join("")    
    }</ul>
  `,
  created: (element, data) => {
    // foo ...
  }
});
```
And:

```javascript
myListComponent.register({humans:[
  {name:"John Doe"}, {name:"Jane Doe"}, {name:"Bob Morane"}
]});
```

You can see a complete sample in `samples/04-lists`

### Use BoB with FireFox or Safari Tech Preview

- You need the last version (>=45) of FF (or Safari tech preview)
- You need a WebComponent Polyfill: [http://webcomponents.org/polyfills/](http://webcomponents.org/polyfills/)

#### Setup

First you have to get `webcomponents.js`, then:

```html
<script src="webcomponents.min.js"></script>
<script src="../../src/BoB.js"></script>
```

### Create components for package view in AtomEditor

In `lib/bob-package-views.js` (if you've named your package `bob-package`):

```javascript
'use babel';

import BoB from './bob';

let myTitleComponent = new BoB.Element({
  tagName:"my-title",
  template: (element, data) => `<h1>${element.title}</h1>`
});

let myApplicationComponent = new BoB.Element({
  tagName:"my-application",
  template: (element, data) => `
  <div>
    <my-title title="Bob Package"></my-title>
    <h2>${data.info}</h2>
  </div>
  `,
  created: (element, data) => {
    console.log(data);
  }
});

export default class BobPackageView {

  constructor(serializedState) {
    // Register BoB Elements
    myTitleComponent.register();
    myApplicationComponent.register({info:"Work in progress..."});
    // Create root element
    this.element = document.createElement('my-application');
    this.element.classList.add('bob-package');

  }
  
  etc...
```

### How to style BoB.Element

#### From "outside"

**my-button.js** file:
```javascript
let myButtonComponent = new BoB.Element({
  tagName:"my-button",
  template: (element, data) => `<button>Click me!</button>`,
});
```

**index.html** file:
```html
<style>
  my-button::shadow button {
    color: blue
  }
</style>
  
<my-component></my-component>
```

#### From "inside"

**my-button.js** file:
```javascript
let myButtonComponent = new BoB.Element({
  tagName:"my-button",
  template: (element, data) => `
    <style>
      button { color: blue } 
    </style>
    <button>Click me!</button>
  `,
});
```

#### From "inside", with an external css file

**my-button.css** file:
```css
button { color: blue } 
```

**my-button.js** file:
```javascript
let myButtonComponent = new BoB.Element({
  tagName:"my-button",
  template: (element, data) => `
    <style>
      @import "./components/my-button.css" 
    </style>
    <button>Click me!</button>
  `,
});
```


## TODO

- documentation
- samples
- ...

