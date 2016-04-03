let myFormComponent = new BoB.Element({
  tagName:"my-form",
  template: (element, data) => `<div>
    <form>
      <input type="text" placeholder="${data.placeholder}"/>
      <button onclick="return false">Click Me!</button>
    </form>
    <!-- my other component -->
    <my-display title="Form sample"></my-display>
  </div>`,
  created: (element, data) => {
    
    element.first("button").addEventListener('click', (e) => {
      let value = element.first("input").value;
      let myDisplayTag = element.first("my-display");
      myDisplayTag.title = value;
      myDisplayTag.refresh();
    });
  },
  attached: (element, data) => {}
});