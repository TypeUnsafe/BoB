let broker = new BoB.Broker();

myTitleComponent.register({broker: broker});
myButtonComponent.register({broker: broker});
myListComponent.register({broker: broker, humans:[
  {name:"John Doe"}, {name:"Jane Doe"}, {name:"Bob Morane"}
]});
