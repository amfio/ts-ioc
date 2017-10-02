import { container } from './../src/container';
import { service, inject } from './../src/decorators';

class HelloWorldService {
  constructor (private helloConstant: string, private worldConstant: string) {

  }

  public helloWorld() {
    return `${this.helloConstant} ${this.worldConstant}`;
  }
}

container.registerConstant<string>('HelloConstant', 'Hello');

container.registerConstant<string>('WorldConstant', 'Constant World');

container.registerService('HelloWorldService', HelloWorldService).addDependencies('HelloConstant', 'WorldConstant');

const helloWorldService = container.get<HelloWorldService>('HelloWorldService');
console.log(helloWorldService.helloWorld());
