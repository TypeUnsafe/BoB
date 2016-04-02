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

