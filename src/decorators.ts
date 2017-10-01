import { container as defaultContainer, IOCContainer } from './container';

// Implementing decorators is new to me. These are more of an experiment out of interest

export type ServiceDecorator = (dependencyName: Symbol, dependencyOptions?: DependencyOptions) => Function;
export type InjectDecorator = (dependencyName: Symbol) => Function;

export function createDecoratorsForContainer(container: IOCContainer): { service: ServiceDecorator, inject: InjectDecorator } {
  let currentServiceSymbol: Symbol;
  let currentService: Service<any>;
  let dependenciesWaitingToBeInjected: Array<Symbol>;
  resetInjections();

  function resetInjections() {
    currentServiceSymbol = null;
    currentService = null;
    dependenciesWaitingToBeInjected = new Array<Symbol>();
  }

  function serviceDecorator(dependencyName: Symbol, dependencyOptions: DependencyOptions = { isSingleton: true }) {
    return function(targettedService: Service<any>) {

      if (currentService !== null && currentService !== targettedService) {
        resetInjections();
        throw Error(`Injecting dependencies into ${currentServiceSymbol} but it is not decorated with @service`);
      }

      try {
        container.registerService(dependencyName, targettedService, dependencyOptions).addDependencies(...dependenciesWaitingToBeInjected);
      } catch (e) {
        throw e;
      } finally {
        resetInjections();
      }
    };
  }

  function injectDecorator(dependencyName: Symbol) {
    return function (targettedService: Service<any>, propertyKey: string | symbol, parameterIndex: number) {
      if (currentService !== null && currentService !== targettedService) {
        resetInjections();
        throw Error(`Injecting occured on multiple different targets. Make sure you have decorated ${currentServiceSymbol} with @service`);
      }
      currentServiceSymbol = dependencyName;
      currentService = targettedService;
      dependenciesWaitingToBeInjected[parameterIndex] = dependencyName;
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
