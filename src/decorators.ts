import { container } from './container';

// Implementing decorators is new to me. These are more of an experiment out of interest

let currentTargetSymbol: Symbol;
let currentTarget: Service;
let dependenciesWaitingToBeInjected: Array<Symbol>;
resetInjections();

function resetInjections() {
  currentTargetSymbol = null;
  currentTarget = null;
  dependenciesWaitingToBeInjected = new Array<Symbol>();
}

export function service(dependencyName: Symbol, dependencyOptions: DependencyOptions = { isSingleton: true }) {
  return function(constructor: Service) {

    if (currentTarget !== null && currentTarget !== constructor) {
      resetInjections();
      throw Error(`Injecting dependencies into ${currentTargetSymbol} but it is not decorated with @service`);
    }

    try {
      container.registerService(dependencyName, constructor, dependencyOptions).addDependencies(...dependenciesWaitingToBeInjected);
    } catch (e) {
      throw e;
    } finally {
      resetInjections();
    }
  };
}

export function inject(dependencyName: Symbol) {
  return function (target: Service, propertyKey: string | symbol, parameterIndex: number) {
    if (currentTarget !== null && currentTarget !== target) {
      resetInjections();
      throw Error(`Injecting occured on multiple different targets. Make sure you have decorated ${currentTargetSymbol} with @service`);
    }
    currentTargetSymbol = dependencyName;
    currentTarget = target;
    dependenciesWaitingToBeInjected[parameterIndex] = dependencyName;
  };
}
