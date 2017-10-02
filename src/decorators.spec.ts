import {
  createDecoratorsForContainer,
  InjectDecorator,
  ServiceDecorator,
  inject as defaultInject,
  service as defaultService
} from './decorators';

import {
  IOCContainer,
  container as defaultContainer
} from './container';

import { assert } from 'chai';

describe('decorators', () => {
  let container: IOCContainer;
  let inject: InjectDecorator;
  let service: ServiceDecorator;

  const SERVICE_1 = Symbol('Service 1');
  const SERVICE_2 = Symbol('Service 2');
  const SERVICE_3 = Symbol('Service 3');

  beforeEach(() => {
    container = new IOCContainer();
    const decorators = createDecoratorsForContainer(container);
    inject = decorators.inject;
    service = decorators.service;
  });

  describe('services', () => {
    it('should allow access to services that have been added using decorator', () => {
      // declare service-1
      @service(SERVICE_1)
      class Service1 {
        public method1 = () => 'Hello';
      }

      const serviceInstance = container.get<Service1>(SERVICE_1);

      assert.instanceOf(serviceInstance, Service1);
      assert.equal(serviceInstance.method1(), 'Hello');
    });

    it('should treat services as singletons by default', () => {
      @service(SERVICE_1)
      class Service1 {
        public method1 = () => 'Hello';
      }

      const serviceInstance1 = container.get<Service1>(SERVICE_1);
      const serviceInstance2 = container.get<Service1>(SERVICE_1);

      assert.instanceOf(serviceInstance1, Service1);
      assert.instanceOf(serviceInstance2, Service1);
      assert.equal(serviceInstance1, serviceInstance2);
    });
  });

  describe('injecting', () => {
    it('should inject other decorated services into decorated services', () => {
      @service(SERVICE_1)
      class Service1 {
        public getHello = () => 'Hello';
      }

      @service(SERVICE_2)
      class Service2 {
        public getWorld = () => 'World';
      }

      @service(SERVICE_3)
      class Service3 {
        constructor(@inject(SERVICE_1) private s1: Service1, @inject(SERVICE_2) private s2: Service2) {

        }
        public getHelloWorld = () => this.s1.getHello() + ' ' + this.s2.getWorld();
      }

      const serviceInstance = container.get<Service3>(SERVICE_3);

      assert.equal(serviceInstance.getHelloWorld(), 'Hello World');
    });

    it('should inject non-decorated services into decorated services', () => {
      class Service1 {
        public getHello = () => 'Hello';
      }

      class Service2 {
        public getWorld = () => 'World';
      }

      @service(SERVICE_3)
      class Service3 {
        constructor(@inject(SERVICE_1) private s1: Service1, @inject(SERVICE_2) private s2: Service2) {

        }
        public getHelloWorld = () => this.s1.getHello() + ' ' + this.s2.getWorld();
      }

      container.registerService<Service1>(SERVICE_1, Service1);
      container.registerService<Service2>(SERVICE_2, Service2);

      const serviceInstance = container.get<Service3>(SERVICE_3);

      assert.equal(serviceInstance.getHelloWorld(), 'Hello World');
    });

    it('should throw an error if you don\'t inject one of the dependencies in a service', () => {
      class Service1 {
        public getHello = () => 'Hello';
      }

      class Service2 {
        public getWorld = () => 'World';
      }

      container.registerService<Service1>(SERVICE_1, Service1);
      container.registerService<Service2>(SERVICE_2, Service2);

      assert.throws(() => {
        @service(SERVICE_3)
        class Service3 {
          constructor(
            @inject(SERVICE_1) private s1: Service1,
            private s2: Service2 // oh no, this service hasn't been injected
          ) {}
          public getHelloWorld = () => this.s1.getHello() + ' ' + this.s2.getWorld();
        }
      });
    });

    it('should throw an error if you inject a service that doesn\'t exist', () => {
      @service(SERVICE_1)
      class Service1 {
        public getHello = () => 'Hello';
      }

      // @service(SERVICE_2) oh no, it hasn't been registered but we still depend on it later
      class Service2 {
        public getWorld = () => 'World';
      }

      @service(SERVICE_3)
      class Service3 {
        constructor(
          @inject(SERVICE_1) private s1: Service1,
          @inject(SERVICE_2) private s2: Service2
        ) {}
        public getHelloWorld = () => this.s1.getHello() + ' ' + this.s2.getWorld();
      }

      assert.throws(() => {
        container.get<Service3>(SERVICE_3);
      });
    });

    describe('multiple containers', () => {
      let container1: IOCContainer;
      let injectDecorator1: InjectDecorator;
      let serviceDecorator1: ServiceDecorator;
      let container2: IOCContainer;
      let injectDecorator2: InjectDecorator;
      let serviceDecorator2: ServiceDecorator;

      beforeEach(() => {
        container1 = new IOCContainer();
        const decorators1 = createDecoratorsForContainer(container1);
        injectDecorator1 = decorators1.inject;
        serviceDecorator1 = decorators1.service;

        container2 = new IOCContainer();
        const decorators2 = createDecoratorsForContainer(container2);
        injectDecorator2 = decorators2.inject;
        serviceDecorator2 = decorators2.service;
      });

      it('should allow you to register services to each container without them being accessible from the other container', () => {
        const SERVICE_A = Symbol('ServiceA');
        const SERVICE_B = Symbol('ServiceB');

        @serviceDecorator1(SERVICE_A)
        class ServiceA {
          public getHello = () => 'Hello';
        }

        @serviceDecorator2(SERVICE_B)
        class ServiceB {
          public getHello = () => 'Hello';
        }

        const serviceA = container1.get<ServiceA>(SERVICE_A);
        const serviceB = container2.get<ServiceB>(SERVICE_B);

        // try get instance of the two services from their correct containers
        assert.instanceOf(serviceA, ServiceA);
        assert.instanceOf(serviceB, ServiceB);

        // try get instance of the two services from the containers where they were NOT registered
        assert.throws(() => {
          container1.get<ServiceB>(SERVICE_B);
        });
        assert.throws(() => {
          container2.get<ServiceA>(SERVICE_A);
        });
      });
    });
  });

  describe('default container and injections', () => {
    it('should inject other services into a decorated service', () => {
      it('should inject other decorated services into decorated services', () => {
        @defaultService(SERVICE_1)
        class Service1 {
          public getHello = () => 'Hello';
        }

        @defaultService(SERVICE_2)
        class Service2 {
          public getWorld = () => 'World';
        }

        @defaultService(SERVICE_3)
        class Service3 {
          constructor(@defaultInject(SERVICE_1) private s1: Service1, @defaultInject(SERVICE_2) private s2: Service2) {

          }
          public getHelloWorld = () => this.s1.getHello() + ' ' + this.s2.getWorld();
        }

        const serviceInstance = container.get<Service3>(SERVICE_3);

        assert.equal(serviceInstance.getHelloWorld(), 'Hello World');
      });
    });
  });
});
