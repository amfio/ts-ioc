import { container } from './../src/container';
import { service, inject } from './../src/decorators';

class HelloService {
  public hello() {
    return 'Hello';
  }
}

class WorldService {
  public world() {
    return 'Service World';
  }
}

class HelloWorldService {
  constructor (private helloService: HelloService, private worldService: WorldService) {

  }

  public helloWorld() {
    return `${this.helloService.hello()} ${this.worldService.world()}`;
  }
}

container.registerService('HelloService', HelloService);

container.registerService('WorldService', WorldService);

container.registerService('HelloWorldService', HelloWorldService).addDependency('WorldService', 1); // only registered one of the dependencies! :(

const helloWorldService = container.get<HelloWorldService>('HelloWorldService');
console.log(helloWorldService.helloWorld());
