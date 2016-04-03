/**
 * BoB Demo
 */

let broker = new BoB.Broker();

let myTitleComponent = new BoB.Element({
  tagName:"my-title",
  template: (element, data) => `<h1>${data.title}</h1>`,
  //created: (element, data) => {},
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

    element.subscribe("yo/tada");
    element.subscribe("hi/tada");

    element.onMessage = (topic, message) => {

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
      element.publish('yo/tada', "YOU'VE BEEN NOTIFIED!");
    });
  }
});

let otherButtonComponent = new BoB.Element({
  tagName:"other-button",
  template: (element, data) => `<button>Click me too!</button>`,
  created: (element, data) => {
    element.addEventListener('click', (e) => {
      element.publish("hi/tada", "You've been notified!!!");
    });
  }
});

taDaComponent.register({message:"World!", broker: broker});
myTitleComponent.register({title:"Who is this BoB?"});
littleButtonComponent.register({broker: broker});
otherButtonComponent.register({broker: broker});