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


