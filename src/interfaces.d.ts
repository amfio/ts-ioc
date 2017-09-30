type Dependency = any;

declare interface DependencyOptions {
  isSingleton: boolean;
}

declare interface WrappedDependency<T> {
  getInstance(): T;
}

declare type Factory<T> = (...dependencies: Array<Dependency>) => T;
declare type Service<T> = new (...dependencies: Array<Dependency>) => T;
