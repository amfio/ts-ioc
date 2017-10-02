class IOCError extends Error {}

export class CircularDependencyError extends IOCError {
  private dependencyChain = new Array<DependencyIdentifier>();

  constructor(terminalDependencyIdentifier: DependencyIdentifier) {
    super();
    this.addDependencyToChain(terminalDependencyIdentifier);
  }

  public addDependencyToChain(dependecyIdentifier: DependencyIdentifier) {
    this.dependencyChain.push(dependecyIdentifier);
    this.updateErrorMessage();
  }

  private updateErrorMessage() {
    const dependencyChainString = this.dependencyChain.reverse().map((d) => d.toString()).join(' -> ');
    this.message = `Circular dependency found: ${dependencyChainString}`;
  }
}

export class DependencyNotFoundError extends IOCError {
  constructor(dependencyIdentifier: DependencyIdentifier) {
    super(`Dependency not found: ${dependencyIdentifier.toString()}`);
  }
}

export class ServiceNotDecoratedError extends IOCError {
  constructor(dependencyIdentifier: DependencyIdentifier) {
    super(`Injecting dependencies into ${dependencyIdentifier.toString()} but it is not decorated with @service`);
  }
}

export class MissingDependencyError extends IOCError {
  constructor(dependencyIdentifier: DependencyIdentifier, indexOfMissingDependency: number) {
    super(`Error adding depencencies to ${dependencyIdentifier.toString()}. Dependency missing at index ${indexOfMissingDependency}`);
  }
}

export class AddDependencyError extends IOCError {
  constructor(serviceIdentifier: DependencyIdentifier, newDependencyName: DependencyIdentifier, indexOfDependency: number, message: string) {
    super(`Error adding dependency ${newDependencyName.toString()} to ${serviceIdentifier.toString()} at position ${indexOfDependency}. ${message}`);
  }
}
