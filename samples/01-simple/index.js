/**
 * BoB Demo
 */

let broker = new BoB.Broker();

let myTitleComponent = new BoB.Element({
  tagName:"my-title",
  template: (element, data) => `<h1>${data.title}</h1>`,
  created: (element, data) => {},
  attached: (element, data) => {
    console.info("myTitleComponent[attached]", element, data)
    data.title = "[" + data.title + "]";
    element.refresh();
  }
});

let taDaComponent = new BoB.Element({
  tagName:"ta-da",
  template: (element, data) => `<b>Hello ${data.message}</b>`,
  created: (element, data) => {

    //data.broker.addSubscription("yo/tada", element);
    //data.broker.addSubscription("hi/tada", element);

    element.subscribe("yo/tada");
    element.subscribe("hi/tada");

    element.onMessage = (topic, message) => {

      //console.log(element.select("b"));

      if (topic=="yo/tada") element.first("b").innerHTML = message;

      if (topic=="hi/tada") {
        data.message = message;
        element.refresh();
      }
    }
  }
});

let littleButtonComponent = new BoB.Element({
  tagName:"little-button",
  template: (element, data) => `<button>Click me!</button>`,
  created: (element, data) => {
    element.addEventListener('click', (e) => {
      //data.broker.notify("yo/tada", "You've been notified!");
      element.publish('yo/tada', "YOU'VE BEEN NOTIFIED!");
    });
  }
});

let otherButtonComponent = new BoB.Element({
  tagName:"other-button",
  template: (element, data) => `<button>Click me too!</button>`,
  created: (element, data) => {
    element.addEventListener('click', (e) => {
      //data.broker.notify("hi/tada", "You've been notified!");
      element.publish("hi/tada", "You've been notified!!!");
    });
  }
});


taDaComponent.register({message:"World!", broker: broker});
myTitleComponent.register({title:"Who is this BoB?"});
littleButtonComponent.register({broker: broker});
otherButtonComponent.register({broker: broker});