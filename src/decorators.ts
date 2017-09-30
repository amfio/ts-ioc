import { container } from './container';

// Implementing decorators is new to me. These are more of an experiment out of interest

let currentServiceSymbol: Symbol;
let currentService: Service<any>;
let dependenciesWaitingToBeInjected: Array<Symbol>;
resetInjections();

function resetInjections() {
  currentServiceSymbol = null;
  currentService = null;
  dependenciesWaitingToBeInjected = new Array<Symbol>();
}

export function service(dependencyName: Symbol, dependencyOptions: DependencyOptions = { isSingleton: true }) {
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

export function inject(dependencyName: Symbol) {
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
