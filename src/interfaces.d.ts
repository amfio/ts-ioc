declare interface DependencyOptions {
  isSingleton: boolean;
}

declare interface WrappedDependency<T> {
  getInstance(): T;
}

type ClassService<T> = new (...dependenciesSymbols: Array<any>) => T;
type FunctionService<T> = (...dependenciesSymbols: Array<any>) => T;

declare type Service<T=any> = ClassService<T> | FunctionService<T>;
