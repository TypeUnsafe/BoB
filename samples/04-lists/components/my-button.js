let myButtonComponent = new BoB.Element({
  tagName:"my-button",
  template: (element, data) => `<button>Add Human</button>`,
  created: (element, data) => {

  },
  events: (element, data) => {
    element.addEventListener('click', (e) => {
      element.publish('add/human', {human:{name: "Somebody " + Math.floor((Math.random() * 10) + 1)}});
    });
  }
});
