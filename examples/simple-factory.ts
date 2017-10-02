import { container } from './../src/container';
import { service, inject } from './../src/decorators';

interface IHelloService {
  hello(): string;
}

type IWorldFunction = () => string;

interface IHelloWorldService {
  helloWorld(): string;
}

container.registerFactory<IHelloService>('HelloService', () => {
  return {
    hello: () => 'Hello'
  };
});

container.registerFactory<IWorldFunction>('WorldFunction', () => {
  return () => 'Factory World!';
});

container.registerFactory<IHelloWorldService>('HelloWorldService', (helloService: IHelloService, worldFunction: IWorldFunction) => {
  return {
    helloWorld: () => `${helloService.hello()} ${worldFunction()}`
  };
}).addDependencies('HelloService', 'WorldFunction');

const helloWorldService = container.get<IHelloWorldService>('HelloWorldService');

console.log(helloWorldService.helloWorld());
