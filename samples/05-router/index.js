let broker = new BoB.Broker();

myTitleComponent.register({broker: broker});

/*
  router publish route's root, uri and params on "router" topic
 */
let router = new BoB.Router({broker: broker, topic:"router"});
router.listen();

let observer = {
  onMessage: (topic, message) => {
    console.log("observer", message);
  }
};
broker.addSubscription("router", observer);
