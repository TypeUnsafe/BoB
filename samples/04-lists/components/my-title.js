let myTitleComponent = new BoB.Element({
  tagName:"my-title",
  template: (element, data) => `<h1>${element.title}</h1>`,
  created: (element, data) => {
  },
  attached: (element, data) => {
  }
});

