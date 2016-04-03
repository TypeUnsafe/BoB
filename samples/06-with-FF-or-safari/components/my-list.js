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
    element.subscribe("add/human");
    element.onMessage = (topic, message) => {
      data.humans.push(message.human);
      element.refresh();
    }
  }
});
