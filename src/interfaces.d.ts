declare interface DependencyOptions {
  isSingleton: boolean;
}

declare interface WrappedDependency<T> {
  getInstance(): T;
}

declare type Service<T=any> = new (...dependenciesSymbols: Array<any>) => T;
