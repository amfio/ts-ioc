import { container } from './../src/container';
import { service, inject } from './../src/decorators';

@service('service1')
class Service1 {
  constructor(@inject('service2') service2: Service2) {
    return;
  }
}

@service('service2')
class Service2 {
  constructor(@inject('service3') service3: Service3) {
    return;
  }
}

@service('service3')
class Service3 {
  constructor(@inject('service1') service1: Service1) {
    return;
  }
}

container.get<Service3>('service1');
