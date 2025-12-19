import { Type } from "@nestjs/common";
import { ModuleMetadata, Provider } from "@nestjs/common/interfaces";

//#region src/injectDecoratorFactory.d.ts

/**
 * Creates a decorator that can be used as a convenience to inject a specific token
 *
 * Instead of using @Inject(SOME_THING_TOKEN) this can be used to create a new named Decorator
 * such as @InjectSomeThing() which will hide the token details from users making APIs easier
 * to consume
 * @param token
 */
declare const makeInjectableDecorator: (token: string | symbol) => (() => ParameterDecorator);
//#endregion
//#region src/mixins.d.ts
declare const makeInjectableMixin: (name: string) => (mixinClass: any) => any;
//#endregion
//#region src/options.d.ts
interface OptionsFactory<T> {
  createOptions(): Promise<T> | T;
}
interface AsyncOptionsFactoryProvider<T> extends Pick<ModuleMetadata, 'imports' | 'exports'> {
  useExisting?: {
    value: OptionsFactory<T>;
    provide?: string | symbol | Type<any>;
  };
  useClass?: Type<OptionsFactory<T>>;
  useFactory?: (...args: any[]) => Promise<T> | T;
  inject?: any[];
}
declare function createAsyncOptionsProvider<T>(provide: string | symbol | Type<any>, options: AsyncOptionsFactoryProvider<T>): Provider;
//#endregion
export { AsyncOptionsFactoryProvider, OptionsFactory, createAsyncOptionsProvider, makeInjectableDecorator, makeInjectableMixin };
//# sourceMappingURL=index.d.cts.map