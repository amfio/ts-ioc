export class WrappedConstant<T> implements WrappedDependency<T> {
  constructor(
    private name: Symbol,
    private instance: T
  ) {}

  public getInstance(): T {
    return this.instance;
  }
}
