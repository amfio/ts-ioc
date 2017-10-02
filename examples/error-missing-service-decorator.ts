import { container } from './../src/container';
import { service, inject } from './../src/decorators';

// HelloWorld service and interface (could be in own file(s))
interface IHelloWorldService {
  helloWorld(): string;
}

// @service(HELLO_WORLD_SERVICE) // OH NO! We did not add the service decorator! :(
class HelloWorldService implements IHelloWorldService {
  constructor(
    @inject('HelloService') private helloService: IHelloService,
    @inject('WorldService') private worldService: IWorldService
  ) {
    return;
  }

  public helloWorld() {
    return `${this.helloService.hello()} ${this.worldService.world()}`;
  }
}

// Hello service and interface (could be in own file(s))
interface IHelloService {
  hello(): string;
}

@service('HelloService')
class HelloService implements IHelloService {
  public hello() {
    return 'Hello';
  }
}

// World service and interface (could be in own file(s))
interface IWorldService {
  world(): string;
}

@service('WorldService')
class WorldService implements IWorldService {
  public world() {
    return 'Decorator World!';
  }
}

// Main app/bootstrap
const helloWorldService = container.get<IHelloWorldService>('HelloWorldService');
console.log(helloWorldService.helloWorld());
