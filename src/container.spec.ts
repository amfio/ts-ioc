import { IOCContainer } from './container';
import { assert } from 'chai';

describe('Container', () => {
  let container: IOCContainer;

  beforeEach(() => {
    container = new IOCContainer();
  });

  describe('class service injection', () => {
    const SERVICE_IDENTIFIER_1 = Symbol('test1');
    const SERVICE_IDENTIFIER_2 = Symbol('test2');
    const SERVICE_IDENTIFIER_3 = Symbol('test3');

    class Service1 {
      public method1 = () => 'Hello';
    }

    class Service2 {
      public method2 = () => 'World!';
    }

    class Service3 {
      constructor(private service1: Service1, private service2: Service2) {}

      public method3 = () => `${this.service1.method1()}, ${this.service2.method2()}`;
    }

    describe('happy dependencies', () => {
      it('should return the service that has been registered under the correct symbol', () => {
        container.registerService<Service1>(SERVICE_IDENTIFIER_1, Service1);
        container.registerService<Service2>(SERVICE_IDENTIFIER_2, Service2);

        const service1 = container.get<Service1>(SERVICE_IDENTIFIER_1);
        const service2 = container.get<Service2>(SERVICE_IDENTIFIER_2);

        assert.instanceOf(service1, Service1);
        assert.instanceOf(service2, Service2);
      });

      it('should return the same instance of the service if singleton-ness is not specified', () => {
        container.registerService<Service1>(SERVICE_IDENTIFIER_1, Service1);

        const serviceInstance1 = container.get<Service1>(SERVICE_IDENTIFIER_1);
        const serviceInstance2 = container.get<Service1>(SERVICE_IDENTIFIER_1);

        assert.instanceOf(serviceInstance1, Service1);
        assert.instanceOf(serviceInstance2, Service1);
        assert.equal(serviceInstance1, serviceInstance2);
      });

      it('should return the same instance of the service if singleton', () => {
        container.registerService<Service1>(SERVICE_IDENTIFIER_1, Service1, { isSingleton: true });

        const serviceInstance1 = container.get<Service1>(SERVICE_IDENTIFIER_1);
        const serviceInstance2 = container.get<Service1>(SERVICE_IDENTIFIER_1);

        assert.instanceOf(serviceInstance1, Service1);
        assert.instanceOf(serviceInstance2, Service1);
        assert.equal(serviceInstance1, serviceInstance2);
      });

      it('should return different instances of the service if not singleton', () => {
        container.registerService<Service1>(SERVICE_IDENTIFIER_1, Service1, { isSingleton: false });

        const serviceInstance1 = container.get<Service1>(SERVICE_IDENTIFIER_1);
        const serviceInstance2 = container.get<Service1>(SERVICE_IDENTIFIER_1);

        assert.instanceOf(serviceInstance1, Service1);
        assert.instanceOf(serviceInstance2, Service1);
        assert.notEqual(serviceInstance1, serviceInstance2);
      });

      it('should inject any dependencies into the service (added together)', () => {
        container.registerService<Service1>(SERVICE_IDENTIFIER_1, Service1);
        container.registerService<Service2>(SERVICE_IDENTIFIER_2, Service2);
        container.registerService<Service3>(SERVICE_IDENTIFIER_3, Service3)
          .addDependencies(SERVICE_IDENTIFIER_1, SERVICE_IDENTIFIER_2);

        const service3 = container.get<Service3>(SERVICE_IDENTIFIER_3);

        assert.instanceOf(service3, Service3);
        assert.equal(service3.method3(), 'Hello, World!');
      });

      it('should inject any dependencies into the service (added individually)', () => {
        container.registerService<Service1>(SERVICE_IDENTIFIER_1, Service1);
        container.registerService<Service2>(SERVICE_IDENTIFIER_2, Service2);
        container.registerService<Service3>(SERVICE_IDENTIFIER_3, Service3)
          .addDependency(SERVICE_IDENTIFIER_1, 0)
          .addDependency(SERVICE_IDENTIFIER_2, 1);

        const service3 = container.get<Service3>(SERVICE_IDENTIFIER_3);

        assert.instanceOf(service3, Service3);
        assert.equal(service3.method3(), 'Hello, World!');
      });
    });

    describe('sad dependencies', () => {
      it('should return null if trying to access a service that hasn\'t been registers', () => {
        assert.throws(() => {
          container.get<Service1>(SERVICE_IDENTIFIER_1);
        });
      });

      it('should throw an error if getting a service that has missing dependencies', () => {
        container.registerService<Service1>(SERVICE_IDENTIFIER_1, Service1);
        // container.registerService<Service2>(SERVICE_IDENTIFIER_2, Service2); // oh no, not registered!
        container.registerService<Service3>(SERVICE_IDENTIFIER_3, Service3)
          .addDependency(SERVICE_IDENTIFIER_1, 0)
          .addDependency(SERVICE_IDENTIFIER_2, 1);

        assert.throws(() => {
          container.get<Service3>(SERVICE_IDENTIFIER_3);
        });
      });

      it('should throw an error if not registering enough dependencies (addDependency)', () => {
        container.registerService<Service1>(SERVICE_IDENTIFIER_1, Service1);
        container.registerService<Service2>(SERVICE_IDENTIFIER_2, Service2);
        container.registerService<Service3>(SERVICE_IDENTIFIER_3, Service3)
          .addDependency(SERVICE_IDENTIFIER_1, 0);
          // .addDependency(SERVICE_IDENTIFIER_2, 1); // oh no, only registered one of its 2 dependencies

        assert.throws(() => {
          container.get<Service3>(SERVICE_IDENTIFIER_3);
        });
      });

      it('should throw an error if not registering enough dependencies (addDependencies)', () => {
        container.registerService<Service1>(SERVICE_IDENTIFIER_1, Service1);
        container.registerService<Service2>(SERVICE_IDENTIFIER_2, Service2);

        assert.throws(() => {
        container.registerService<Service3>(SERVICE_IDENTIFIER_3, Service3)
          .addDependencies(SERVICE_IDENTIFIER_1); // oh no, only registered one of its 2 dependencies
        });
      });

      it('should throw an error if registering the same depenecency position', () => {
        container.registerService<Service1>(SERVICE_IDENTIFIER_1, Service1);
        container.registerService<Service2>(SERVICE_IDENTIFIER_2, Service2);

        assert.throws(() => {
        container.registerService<Service3>(SERVICE_IDENTIFIER_3, Service3)
          .addDependency(SERVICE_IDENTIFIER_1, 0)
          .addDependency(SERVICE_IDENTIFIER_2, 0); // oh no, we have already registered a dependecy here
        });
      });

      it('should throw an error if there is a circular dependency', () => {
        class ServiceA {
          constructor(serviceb: ServiceB) {
            return;
          }
        }

        class ServiceB {
          constructor(serviceb: ServiceC) {
            return;
          }
        }

        class ServiceC {
          constructor(serviceb: ServiceA) {
            return;
          }
        }

        container.registerService<ServiceA>(SERVICE_IDENTIFIER_1, ServiceA).addDependencies(SERVICE_IDENTIFIER_2);
        container.registerService<ServiceB>(SERVICE_IDENTIFIER_2, ServiceB).addDependencies(SERVICE_IDENTIFIER_3);
        container.registerService<ServiceC>(SERVICE_IDENTIFIER_3, ServiceC).addDependencies(SERVICE_IDENTIFIER_1);

        assert.throws(() => {
          container.get<ServiceA>(SERVICE_IDENTIFIER_1);
        });
      });
    });

    describe('overriding', () => {
      it('should allow you override a service', () => {
        const SERVICE_IDENTIFIER = Symbol('ServiceIdentifier');

        interface IService {
          stringify: () => string;
        }

        class ServiceA implements IService {
          public stringify = () => 'service a';
        }

        class ServiceB implements IService {
          public stringify = () => 'service b';
        }

        container.registerService<IService>(SERVICE_IDENTIFIER, ServiceA);
        container.registerService<IService>(SERVICE_IDENTIFIER, ServiceB);

        const service = container.get<IService>(SERVICE_IDENTIFIER);

        assert.instanceOf(service, ServiceB);
        assert.equal(service.stringify(), 'service b');
      });
    });
  });

  describe('function service injection', () => {
    it('should allow you to register a factory', () => {
      const FUNC_SERVICE = Symbol('FuncService');

      interface IService {
        method1: () => string;
      }

      const factory = () => {
        return {
          method1: () => 'Hello'
        };
      };
      container.registerFactory<IService>(FUNC_SERVICE, factory);

      const service = container.get<IService>(FUNC_SERVICE);

      assert.equal(service.method1(), 'Hello');
    });

    it('should allow you to inject a function-service into a class service, and vice versa', () => {
      const HELLO_SERVICE = Symbol('HelloService');
      const SPACE_SERVICE = Symbol('SpaceService');
      const WORLD_SERVICE = Symbol('WorldService');

      interface IHelloService {
        hello: () => string;
      }

      interface IWorldService {
        world: () => string;
      }

      const helloServiceFactory = () => {
        return {
          hello: () => 'Hello'
        };
      };

      class SpaceService {
        constructor(private funcService1: IHelloService) {}

        public space = () => this.funcService1.hello() + ', ';
      }

      const worldServiceFactory = (spaceService: SpaceService) => {
        return {
          world: () => spaceService.space() + 'World!'
        };
      };

      container.registerFactory<IHelloService>(HELLO_SERVICE, helloServiceFactory);
      container.registerService<SpaceService>(SPACE_SERVICE, SpaceService).addDependencies(HELLO_SERVICE);
      container.registerFactory<IWorldService>(WORLD_SERVICE, worldServiceFactory).addDependencies(SPACE_SERVICE);

      const service = container.get<IWorldService>(WORLD_SERVICE);

      assert.equal(service.world(), 'Hello, World!');
    });
  });

  describe('constant injection', () => {
    const CONSTANT_1 = Symbol('Constant1');
    const CONSTANT_2 = Symbol('Constant2');
    const CONSTANT_3 = Symbol('Constant3');

    beforeEach(() => {
      container.registerConstant<number>(CONSTANT_1, 5);
      container.registerConstant<string>(CONSTANT_2, 'Hello');
    });

    it('should return the constant', () => {
      const constant1 = container.get<number>(CONSTANT_1);
      const constant2 = container.get<string>(CONSTANT_2);

      assert.equal(constant1, 5);
      assert.equal(constant2, 'Hello');
    });

    it('should throw error if constant isn\'t defined', () => {
      assert.throws(() => {
        container.get<number>(CONSTANT_3);
      });
    });

    it('should inject constants into services', () => {
      const SERVICE_1 = Symbol('Service1');

      class Service1 {
        constructor(private constant1: number, private constant2: string) {}

        public combineConstants = () => `${this.constant2} ${this.constant1}`;
      }

      container.registerService<Service1>(SERVICE_1, Service1).addDependencies(CONSTANT_1, CONSTANT_2);

      const service = container.get<Service1>(SERVICE_1);

      assert.equal(service.combineConstants(), 'Hello 5');
    });
  });
});
