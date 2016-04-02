# BoB
The smallest WebComponents framework, **only for Chrome**

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

### BoB provides a router

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


## TODO

- documentation
- samples
- ...

