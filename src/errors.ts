export class CircularDependencyError extends Error {
  private dependencyChain = new Array<string>();

  constructor(terminalDependencyName: string) {
    super();
    this.addDependencyToChain(terminalDependencyName);
  }

  public addDependencyToChain(dependecyName: string) {
    this.dependencyChain.push(dependecyName);
    this.updateErrorMessage();
  }

  private updateErrorMessage() {
    const dependencyChainString = this.dependencyChain.reverse().map((d) => d.toString()).join(' -> ');
    this.message = `Circular dependency found: ${dependencyChainString}`;
  }
}
