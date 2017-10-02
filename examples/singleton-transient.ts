import { container } from './../src/container';
import { service, inject } from './../src/decorators';

class ServiceA {
  private static numberOfInstancesOfClass = 0;
  private numberOfTimesTestMethodCalled = 0;

  constructor() {
    ServiceA.numberOfInstancesOfClass++;
  }

  public test() {
    this.numberOfTimesTestMethodCalled++;
    console.log(`Service A has ${ServiceA.numberOfInstancesOfClass} instances and the test function has been called ${this.numberOfTimesTestMethodCalled} time(s)`);
  }
}

class ServiceB {
  private static numberOfInstancesOfClass = 0;
  private numberOfTimesTestMethodCalled = 0;

  constructor() {
    ServiceB.numberOfInstancesOfClass++;
  }

  public test() {
    this.numberOfTimesTestMethodCalled++;
    console.log(`Service B has ${ServiceB.numberOfInstancesOfClass} instances and the test function has been called ${this.numberOfTimesTestMethodCalled} time(s)`);
  }
}

container.registerService('ServiceA', ServiceA, { isSingleton: true }); // default behavior
container.registerService('ServiceB', ServiceB, { isSingleton: false }); // override default behavior

console.log('Creating three instances of the singleton:');
const instance1ServiceA = container.get<ServiceA>('ServiceA');
instance1ServiceA.test();
const instance2ServiceA = container.get<ServiceA>('ServiceA');
instance2ServiceA.test();
const instance3ServiceA = container.get<ServiceA>('ServiceA');
instance3ServiceA.test();

console.log('\nCreating three instances of the transients:');
const instance1ServiceB = container.get<ServiceB>('ServiceB');
instance1ServiceB.test();
const instance2ServiceB = container.get<ServiceB>('ServiceB');
instance2ServiceB.test();
const instance3ServiceB = container.get<ServiceB>('ServiceB');
instance3ServiceB.test();
