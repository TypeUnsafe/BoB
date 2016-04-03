/**
 * Bob is a WebComponents framework
 * Inspired from http://www.html5rocks.com/en/tutorials/webcomponents/customelements
 * @type {{Element, Broker}}
 */
let BoB = (function () {
  /**
   * Element
   */
  class Element {
    /**
     * 
     * @param options
     */
    constructor(options) { this.options = options; }

    /**
     * 
     * @param data
     * @returns {HTMLElement}
     */
    register(data) {
      let elementProto = Object.create(HTMLElement.prototype), options = this.options, shadow = null;
      options.data = data;

      /*
      elementProto.createdCallback = options.created !== undefined
        ? function() {
          shadow = this.createShadowRoot();
          shadow.innerHTML = options.template(this, data);
          options.created(this, data);
          //shadow.innerHTML = options.template(data);
        }
        : () => {throw Error(`${options.tagName.toLowerCase()}: created method is undefined!`);};
      */
      elementProto.createdCallback = function() {
        shadow = this.createShadowRoot();
        shadow.innerHTML = options.template(this, data);
        if (options.created !== undefined) options.created(this, data);
      };
      
      elementProto.refresh = function () {
        shadow.innerHTML = options.template(this, options.data);
      };

      elementProto.attachedCallback = options.attached !== undefined
        ? function() { options.attached(this, data); } : function() {};

      elementProto.detachedCallback = options.detached !== undefined
        ? function() { options.detached(this, data); } : function() {};

      // TODO: elementProto.attributeChangedCallback

      elementProto.subscribe = function(topic) {
        (data.broker !== undefined
          ? () => data.broker.addSubscription(topic, this)
          : () => {throw Error(`${options.tagName.toLowerCase()}: broker is undefined!`);})();
      };
      
      elementProto.unsubscribe = function(topic) {
        //TODO
      };

      elementProto.publish = function(topic, message) {
        (data.broker !== undefined
          ? () => data.broker.notify(topic, message)
          : () => {throw Error(`${options.tagName.toLowerCase()}: broker is undefined!`);})();
      };

      elementProto.first = function (selector) {
        return this.shadowRoot.querySelector(selector);
      };

      elementProto.select = function (selector) {
        return Array.from(this.shadowRoot.querySelectorAll(selector));
      };

      document.registerElement(options.tagName, {prototype: elementProto});
      return elementProto;
    }
  }

  /**
   * Broker
   */
  class Broker {
    /**
     * 
     * @param options
     */
    constructor(options) {
      Object.assign(this, options);
      this.subscriptions = [];
    }

    /**
     * 
     * @param topic
     * @param object
     */
    addSubscription(topic, object) {
      this.subscriptions.push({topic: topic, subscriber: object});
    }

    /**
     * 
     * @param topic
     * @param object
     */
    removeSubscription(topic, object) {/*TODO*/}

    /**
     * 
     * @param topic
     * @param message
     */
    notify(topic, message) {
      this.subscriptions
        .filter(item => item.topic == topic)
        .forEach(item => {
          let getOnMessageMethod = item.subscriber.onMessage !== undefined
            ? () => item.subscriber.onMessage(topic, message)
            : () => {throw Error(`${item.subscriber.tagName.toLowerCase()}: onMessage method is undefined!`);};
          getOnMessageMethod();
        });
    }
  }

  /**
   * Router
   */
  class Router {
    /**
     *
     * @param options
     */
    constructor (options={}) {
      Object.assign(this, options);
    }

    /**
     *
     * @param uri
     */
    match (uri) { //using hash
      // remove #/ from uri
      uri = uri.replace("#\/","");
      // ie: http://localhost:3006/#/hello/bob/morane
      // becomes /hello/bob/morane
      // to split uri with "/" and keep only no empty items
      let uriParts = uri.split("/").filter((part)=>part.length>0);
      // ie: ["hello", "bob", "morane"]
      // key to search -> "hello"
      let route = uriParts[0];
      // parameters to pass to the method -> ["bob", "morane"]
      let params = uriParts.slice(1);
      
      (this.broker !== undefined && this.topic !== undefined
        ? () => this.broker.notify(this.topic, {route, params, uri})
        : () => {throw Error(`${this.constructor.name}: broker or/and topic is(are) undefined!`);})();
    }

    /**
     *
     */
    listen () {
      // when router is listening
      // check url at first time (first load) (useful to bookmark functionality)
      this.match(window.location.hash);
      /* subscribe to onpopstate */
      window.onpopstate = (event) => {
        this.match(window.location.hash);
      };
    }
  }
  
  return {Element: Element, Broker: Broker, Router: Router};
}());
