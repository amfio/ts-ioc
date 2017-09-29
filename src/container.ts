import { WrappedService } from './wrappers/service';

type Dependency = any;

export class IOCContainer {
  private dependencies = new Map<Symbol, WrappedDependency<Dependency>>();

  public registerService<T>(name: Symbol, service: Service<T>, options: DependencyOptions = { isSingleton: true }) {
    const wrappedDependency = new WrappedService(name, service, options, this);

    this.dependencies.set(name, wrappedDependency);

    return wrappedDependency;
  }

  public get<T>(name: Symbol): T {
    const wrappedDependency = this.dependencies.get(name);

    if (!wrappedDependency) {
      throw new Error(`Dependency ${name} has not been registered.`);
    }

    return wrappedDependency.getInstance();
  }
}

export const container = new IOCContainer();
