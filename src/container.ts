import { WrappedFactory } from './wrappers/wrapped-factory';
import { WrappedConstant } from './wrappers/wrapped-constant';

export class IOCContainer {
  private registeredDependencies = new Map<Symbol, WrappedDependency<Dependency>>();

  public registerFactory<T>(name: Symbol, factory: Factory<T>, options: DependencyOptions = { isSingleton: true }) {
    const wrappedDependency = new WrappedFactory(name, factory, options, this);

    this.registeredDependencies.set(name, wrappedDependency);

    return wrappedDependency;
  }

  public registerService<T>(name: Symbol, service: Service<T>, options: DependencyOptions = { isSingleton: true }) {
    // convert the service into a factory
    const factory = (...dependencies: Array<Dependency>) => {
      return new service(...dependencies);
    };

    // So we can better handle errors by knowing how many dependencies the service
    // should have
    Object.defineProperty(factory, 'length', { value: service.length });

    const wrappedDependency = new WrappedFactory(name, factory, options, this);

    this.registeredDependencies.set(name, wrappedDependency);

    return wrappedDependency;
  }

  public registerConstant<T>(name: Symbol, dependency: T) {
    const wrappedDependency = new WrappedConstant<T>(name, dependency);

    this.registeredDependencies.set(name, wrappedDependency);

    return wrappedDependency;
  }

  public get<T>(name: Symbol): T {
    const wrappedDependency = this.registeredDependencies.get(name);

    if (!wrappedDependency) {
      throw new Error(`Dependency ${name} has not been registered.`);
    }

    return wrappedDependency.getInstance();
  }

  public clear() {
    this.registeredDependencies = new Map<Symbol, WrappedDependency<Dependency>>();
  }
}

export const container = new IOCContainer();
