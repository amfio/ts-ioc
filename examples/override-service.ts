import { container } from './../src/container';
import { service, inject } from './../src/decorators';

interface IHelloService {
  hello(): string;
}

class HelloService implements IHelloService {
  public hello() {
    return 'Hello';
  }
}

class BonjourService implements IHelloService {
  public hello() {
    return 'Bonjour';
  }
}

class WorldService {
  public world() {
    return 'World';
  }
}

class HelloWorldService {
  constructor (private helloService: HelloService, private worldService: WorldService) {

  }

  public helloWorld() {
    return `${this.helloService.hello()} ${this.worldService.world()}`;
  }
}

// Register services/dependencies as usual
container.registerService<IHelloService>('HelloService', HelloService);
container.registerService('WorldService', WorldService);
container.registerService('HelloWorldService', HelloWorldService).addDependencies('HelloService', 'WorldService');

container.registerService<IHelloService>('HelloService', BonjourService);

const helloWorldService = container.get<HelloWorldService>('HelloWorldService');
console.log(helloWorldService.helloWorld());
