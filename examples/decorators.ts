import { container } from './../src/container';
import { service, inject } from './../src/decorators';

// Dependency identifiers (could be in own file)
const HELLO_SERVICE = Symbol('HelloService');
const WORLD_SERVICE = Symbol('WorldService');
const HELLO_WORLD_SERVICE = Symbol('WorldService');

// Hello service and interface (could be in own file(s))
interface IHelloService {
  hello(): string;
}

@service(HELLO_SERVICE)
class HelloService implements IHelloService {
  public hello() {
    return 'Hello';
  }
}

// World service and interface (could be in own file(s))
interface IWorldService {
  world(): string;
}

@service(WORLD_SERVICE)
class WorldService implements IWorldService {
  public world() {
    return 'Decorator World!';
  }
}

// HelloWorld service and interface (could be in own file(s))
interface IHelloWorldService {
  helloWorld(): string;
}

@service(HELLO_WORLD_SERVICE)
class HelloWorldService implements IHelloWorldService {
  constructor(
    @inject(HELLO_SERVICE) private helloService: IHelloService,
    @inject(WORLD_SERVICE) private worldService: IWorldService
  ) {
    return;
  }

  public helloWorld() {
    return `${this.helloService.hello()} ${this.worldService.world()}`;
  }
}

// Main app/bootstrap
const helloWorldService = container.get<IHelloWorldService>(HELLO_WORLD_SERVICE);
console.log(helloWorldService.helloWorld());
