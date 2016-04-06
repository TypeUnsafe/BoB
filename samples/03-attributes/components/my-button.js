let myButtonComponent = new BoB.Element({
  tagName:"my-button",
  template: (element, data) => `<button>Click me!</button>`,
  created: (element, data) => {

  },
  events: (element, data) => {
    element.addEventListener('click', (e) => {
      element.publish('yo/clicked', null);
    });
  }
});
