import { container as defaultContainer, IOCContainer } from './container';
import { ServiceNotDecoratedError } from './errors';

export type ServiceDecorator = (dependencyIdentifier: DependencyIdentifier, dependencyOptions?: DependencyOptions) => Function;
export type InjectDecorator = (dependencyIdentifier: DependencyIdentifier) => Function;

export function createDecoratorsForContainer(container: IOCContainer): { service: ServiceDecorator, inject: InjectDecorator } {
  let currentServiceIdentifier: DependencyIdentifier;
  let currentService: Service<any>;
  let dependenciesWaitingToBeInjected: Array<DependencyIdentifier>;
  resetInjections();

  function resetInjections() {
    currentServiceIdentifier = null;
    currentService = null;
    dependenciesWaitingToBeInjected = new Array<DependencyIdentifier>();
  }

  function serviceDecorator(dependencyIdentifier: DependencyIdentifier, dependencyOptions: DependencyOptions = { isSingleton: true }) {
    return function(targettedService: Service<any>) {

      if (currentService !== null && currentService !== targettedService) {
        const erroredServiceIdentifer = currentServiceIdentifier;
        resetInjections();
        throw new ServiceNotDecoratedError(erroredServiceIdentifer);
      }

      try {
        container.registerService(dependencyIdentifier, targettedService, dependencyOptions).addDependencies(...dependenciesWaitingToBeInjected);
      } catch (e) {
        throw e;
      } finally {
        resetInjections();
      }
    };
  }

  function injectDecorator(dependencyIdentifier: DependencyIdentifier) {
    return function (targettedService: Service<any>, propertyKey: string | symbol, parameterIndex: number) {
      if (currentService !== null && currentService !== targettedService) {
        const erroredServiceIdentifer = currentServiceIdentifier;
        resetInjections();
        throw new ServiceNotDecoratedError(erroredServiceIdentifer);
      }
      currentServiceIdentifier = dependencyIdentifier;
      currentService = targettedService;
      dependenciesWaitingToBeInjected[parameterIndex] = dependencyIdentifier;
    };
  }

  return {
    service: serviceDecorator,
    inject: injectDecorator
  };
}

const { service, inject } = createDecoratorsForContainer(defaultContainer);
export {
  service,
  inject
};
