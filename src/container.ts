import { WrappedFactory } from './wrappers/wrapped-factory';
import { WrappedConstant } from './wrappers/wrapped-constant';
import { DependencyNotFoundError } from './errors';

export class IOCContainer {
  private registeredDependencies = new Map<DependencyIdentifier, WrappedDependency<Dependency>>();

  public registerFactory<T>(serviceIdentifier: DependencyIdentifier, factory: Factory<T>, options: DependencyOptions = { isSingleton: true }) {
    const wrappedDependency = new WrappedFactory(serviceIdentifier, factory, options, this);

    this.registeredDependencies.set(serviceIdentifier, wrappedDependency);

    return wrappedDependency;
  }

  public registerService<T>(serviceIdentifier: DependencyIdentifier, service: Service<T>, options: DependencyOptions = { isSingleton: true }) {
    // convert the service into a factory
    const factory = (...dependencies: Array<Dependency>) => {
      return new service(...dependencies);
    };

    // So we can better handle errors by knowing how many dependencies the service
    // should have
    Object.defineProperty(factory, 'length', { value: service.length });

    const wrappedDependency = new WrappedFactory(serviceIdentifier, factory, options, this);

    this.registeredDependencies.set(serviceIdentifier, wrappedDependency);

    return wrappedDependency;
  }

  public registerConstant<T>(constantIdentifier: DependencyIdentifier, dependency: T) {
    const wrappedDependency = new WrappedConstant<T>(constantIdentifier, dependency);

    this.registeredDependencies.set(constantIdentifier, wrappedDependency);

    return wrappedDependency;
  }

  public get<T>(dependencyIdentifer: DependencyIdentifier): T {
    const wrappedDependency = this.registeredDependencies.get(dependencyIdentifer);

    if (!wrappedDependency) {
      throw new DependencyNotFoundError(dependencyIdentifer);
    }

    return wrappedDependency.getInstance();
  }

  public clear() {
    this.registeredDependencies = new Map<DependencyIdentifier, WrappedDependency<Dependency>>();
  }
}

export const container = new IOCContainer();
