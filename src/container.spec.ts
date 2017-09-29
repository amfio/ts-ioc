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
  });
});
