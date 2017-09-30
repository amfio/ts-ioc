# TS IOC
## Installation
Until I get around to publishing it to NPM, you can install TS-IOC using the following command:

`npm i git@github.com:amfio/ts-ioc.git` 

## Documentation
### Registering a service
You can regiser service using the `container.registerService<ServiceInterface>(serviceIdentifier: Symbol, service: ServiceInterface)` method:
```js
import { container } from 'ts-ioc';

// must be unique per service type
const PLAYER_SERVICE_IDENTIFIER = Symbol('PlayerService');

interface PlayerInterface {
  play(): void;
}

class PlayStationPlayer implements PlayerInterface {
  play() {
    
  }
}

// register the service
container.registerService<PlayerInterface>(PLAYER_SERVICE_IDENTIFIER, PlayStationPlayer)


// retrieve an instance of the service
const playerService = container.get<PlayerInterface>(PLAYER_SERVICE_IDENTIFIER);
```

### Registering a service with dependencies
If your service has dependencies you can add them when registering the service using the `addDependencies(dependenciesIdentifiers: Array<Symbol>)` method. Using this method, you must register all dependecies at once, such as:
```js
const ROOT_SERVICE_IDENTIFIER = Symbol('RootService');
class RootService {
  constructor(Dependency1Service: d1, Dependency2Service: d2) {

  }
}

const DEPENENCY_1_IDENTIFIER = Symbol('Dependency1Service');
class Dependency1Service {

}

const DEPENENCY_2_IDENTIFIER = Symbol('Dependency2Service');
class Dependency2Service {

}

container.registerService<RootService>(ROOT_SERVICE_IDENTIFIER, Service).addDependencies([DEPENENCY_1_IDENTIFIER, DEPENENCY_2_IDENTIFIER ...]);

container.registerService<Dependency1Service>(DEPENENCY_1_IDENTIFIER, Dependency1Service);
container.registerService<Dependency2Service>(DEPENENCY_2_IDENTIFIER, Dependency2Service);

// retrieve an instance of the service that has had it's dependencies injected
const rootService = container.get<RootService>(ROOT_SERVICE_IDENTIFIER);
```


Alternatively you can register each dependency separately using the `addDependency(dependencyIdentifier: Symbol, dependencyParamIndex: number)` method:
```js
container.registerService<ServiceInterface>(SERVICE_IDENTIFIER, Service)
  .addDependency(DEPENENCY_1_IDENTIFIER, 0)
  .addDependency(DEPENENCY_2_IDENTIFIER, 1);
```

### Registering a factory
You can register a factory function that returns the dependency using the `container.registerFactory<DependencyInterface>(dependencyIdentifier: Symbol, factoryFunction: () => DependencyInterface)` method.
```js
import { container } from 'ts-ioc';

// must be unique per service type
const PLAYER_SERVICE_IDENTIFIER = Symbol('PlayerService');

interface PlayerInterface {
  play(): void;
}

const playStationPlayerFactory = () => {
  return {
    play: () => {
      //
    }
  };
};

// register the service
container.registerFactory<PlayerInterface>(PLAYER_SERVICE_IDENTIFIER, playStationPlayerFactory)


// retrieve an instance of the service
const playerService = container.get<PlayerInterface>(PLAYER_SERVICE_IDENTIFIER);
```

### Registering a factory with dependencies
You can inject dependencies into the factory function the same way as services. For example:
```js
interface ServiceInterface {
  exampleMethod(): string;
}

const factoryFunction = (dependency1: Dependency1Interface, dependency2: Dependency2Interface) => {
  return {
    exampleMethod: () => 'hello'
  };
};

container.registerFactory<ServiceInterface>(factoryFunction, factoryFunction).addDependencies([DEPENENCY_1_IDENTIFIER, DEPENENCY_2_IDENTIFIER]);
```

### Registering services/factories as transient or singleton
By default, all services are treated as singletons and will only be instantiated once. You can make a service transient using the depenceny options parameter, e.g.
```js
import { container } from 'ts-ioc';

const SERVICE_IDENTIFIER = Symbol('Service1');

class Service {

}

container.registerService<Service>(SERVICE_IDENTIFIER, Service, { isSingleton: false });

const serviceInstance1 = container.get<Service>(SERVICE_IDENTIFIER);
const serviceInstance2 = container.get<Service>(SERVICE_IDENTIFIER);

// serviceInstance1 !== serviceInstance2
```

### Registering a constant
You can register constants using the `registerConstant<ConstantType>(CONSTANT_IDENTIFIER, constantValue: ConstantType)` method. For example:

```js
const PI_CONSTANT = Symbol('Pi');
container.registerConstant<number>(PI_CONSTANT, 3.142);

const pi = container.get<number>(PI_CONSTANT); // 3.142
```

### Using decorators
A handy shortcut for register services and their dependecies is by using the `service(SERVICE_IDENTIFIER: SYMBOL)` and `inject(SERVICE_IDENTIFIER: SYMBOL)` decorators, as in the following example:
```js
const ROOT_SERVICE_IDENTIFIER = Symbol('RootService');
const DEPENENCY_1_IDENTIFIER = Symbol('Dependency1Service');
const DEPENENCY_2_IDENTIFIER = Symbol('Dependency2Service');

@service(ROOT_SERVICE_IDENTIFIER);
class RootService {
  constructor(
    @inject(DEPENENCY_1_IDENTIFIER) Dependency1Service: d1,
    @inject(DEPENENCY_2_IDENTIFIER) Dependency2Service: d2
  ) {

  }
}

@service(DEPENENCY_1_IDENTIFIER);
class Dependency1Service {

}

@service(DEPENENCY_2_IDENTIFIER);
class Dependency2Service {

}

// retrieve an instance of the service that has had it's dependencies injected
const rootService = container.get<RootService>(ROOT_SERVICE_IDENTIFIER);
```
