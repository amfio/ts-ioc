import { CircularDependencyError } from './../errors';
import { IOCContainer } from './../container';

// TODO: There surely must be a better way?
const isClass = (func: Function) => {
  return /^\s*class\s+/.test(func.toString());
};

export class WrappedService<T> implements WrappedDependency<T> {
  private name: string;
  private instance: T;
  private isBeingInstantiated = false;

  private dependencies = new Array<Symbol>();

  constructor(
    symbol: Symbol,
    private instantiator: Service<T>,
    private options: DependencyOptions,
    private container: IOCContainer
  ) {
    this.name = symbol.toString();
  }

  public getInstance(): T {
    if (this.instance) {
      return this.instance;
    }

    // if we are already in the process of instanciating this dependency then we must
    // be in the middle of a circular dependency
    if (this.isBeingInstantiated) {
      throw new CircularDependencyError(this.name);
    }

    const instance = this.createInstance();

    if (this.options.isSingleton) {
      this.instance = instance;
    }

    return instance;
  }

  public addDependencies(...dependenciesNames: Array<Symbol>) {
    if (dependenciesNames.length !== this.instantiator.length) {
      throw new Error(`Error adding depencencies to ${this.name}. ${dependenciesNames.length} dependencies specified when only ${this.instantiator.length} required`);
    }

    this.dependencies = dependenciesNames;
  }

  public addDependency(dependencyName: Symbol, paramIndex: number) {
    if (this.dependencies[(paramIndex)]) {
      throw new Error(`Error adding dependency ${dependencyName} to ${this.name} at position ${paramIndex}. Dependency at that position exists already.`);
    }

    if (paramIndex >= this.instantiator.length) {
      throw new Error(`Error adding dependency ${dependencyName} to ${this.name} at position ${paramIndex}. Service only has ${this.instantiator.length} dependencies.`);
    }

    this.dependencies[paramIndex] = dependencyName;

    return this;
  }

  private hasCorrectNumberOfDependencies() {
    return this.dependencies.length !== this.instantiator.length;
  }

  private createInstance() {
    if (this.hasCorrectNumberOfDependencies()) {
      throw new Error(`Tried to create instance of ${this.name} but it takes ${this.instantiator.length} arguments and only ${this.dependencies.length} dependecies are registered`);
    }

    this.isBeingInstantiated = true;

    let newInstance;
    try {
      if (isClass(this.instantiator)) {
        newInstance = new (this.instantiator as any)(...this.getDependencies());
      } else {
        newInstance = (this.instantiator as any)(...this.getDependencies());
      }
    } catch (error) {
      if (error instanceof CircularDependencyError) {
        error.addDependencyToChain(this.name);
      }

      throw error;
    } finally {
      this.isBeingInstantiated = false;
    }

    return newInstance;
  }

  private getDependencies() {
    return this.dependencies.map((dependencyName, index) => {
      if (!dependencyName) {
        throw new Error(`Error getting dependencies for ${this.name}. No dependecy at position ${index} is specified`);
      }

      return this.container.get(dependencyName);
    });
  }
}
