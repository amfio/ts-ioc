import { CircularDependencyError } from './../errors';
import { IOCContainer } from './../container';

export class WrappedFactory<T> implements WrappedDependency<T> {
  private name: string;
  private instance: T;
  private isBeingInstantiated = false;

  private dependencies = new Array<Symbol>();

  constructor(
    symbol: Symbol,
    private factoryFunction: Factory<T>,
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
    this.dependencies = dependenciesNames;
    this.ensureCorrectNumberOfDependencies();
  }

  public addDependency(dependencyName: Symbol, paramIndex: number) {
    if (this.dependencies[(paramIndex)]) {
      throw new Error(`Error adding dependency ${dependencyName.toString()} to ${this.name} at position ${paramIndex}. Dependency at that position exists already.`);
    }

    if (paramIndex >= this.factoryFunction.length) {
      throw new Error(`Error adding dependency ${dependencyName.toString()} to ${this.name} at position ${paramIndex}. Service only has ${this.factoryFunction.length} dependencies.`);
    }

    this.dependencies[paramIndex] = dependencyName;

    return this;
  }

  private locateIndexOfMissingDependency(): number {
    if (this.dependencies.length !== this.factoryFunction.length) {
      return this.dependencies.length;
    }

    for (let i = 0; i < this.dependencies.length; i++) {
      if (!this.dependencies[i]) {
        return i;
      }
    }
    return -1;
  }

  private ensureCorrectNumberOfDependencies() {
    const indexOfMissingDependency = this.locateIndexOfMissingDependency();
    if (indexOfMissingDependency !== -1) {
      throw new Error(`Error adding depencencies to ${this.name}. Dependency missing at index ${indexOfMissingDependency}. ${this.factoryFunction.length} required`);
    }
  }

  private createInstance() {
    this.ensureCorrectNumberOfDependencies();

    this.isBeingInstantiated = true;

    let newInstance;
    try {
      newInstance = this.factoryFunction(...this.getDependencies());
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
