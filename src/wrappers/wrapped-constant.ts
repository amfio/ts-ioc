export class WrappedConstant<T> implements WrappedDependency<T> {
  constructor(
    private identifer: DependencyIdentifier,
    private instance: T
  ) {}

  public getInstance(): T {
    return this.instance;
  }
}
