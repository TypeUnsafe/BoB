/**
 * Created by k33g_org on 01/04/16.
 */

let myFormComponent = new BoB.Element({
  tagName:"my-form",
  template: (element, data) => `<div>
    <form>
      <input type="text" placeholder="${data.placeholder}"/>
      <button onclick="return false">Click Me!</button>
    </form>
  </div>`,
  created: (element, data) => {
    element.first("button").addEventListener('click', (e) => {
      console.log("Value", element.first("input").value);
    });
  },
  attached: (element, data) => {

  }
});