/**
 * Bob is a WebComponents framework
 * Inspired from http://www.html5rocks.com/en/tutorials/webcomponents/customelements
 * @type {{Element, Broker}}
 */
let BoB = (function () {
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

      elementProto.createdCallback = options.created !== undefined
        ? function() {
          shadow = this.createShadowRoot();
          options.created(this, data);
          shadow.innerHTML = options.template(data);
        }
        : () => {throw Error(`${options.tagName.toLowerCase()}: created method is undefined!`);};

      elementProto.refresh = function () {
        shadow.innerHTML = options.template(options.data);
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
  return {Element: Element, Broker: Broker};
}());
