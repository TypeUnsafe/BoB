let myTitleComponent = new BoB.Element({
  tagName:"my-title",
  template: (element, data) => `<h1>${element.title}</h1>`,
  created: (element, data) => {
    console.log(element, element.title);
    element.subscribe('yo/clicked');

    element.onMessage =  (topic, message) => {
      element.title = "You've been clicked!";
      element.refresh();
    }
  },
  attached: (element, data) => {

  }
});


