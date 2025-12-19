let _nestjs_common = require("@nestjs/common");
let crypto = require("crypto");
let lodash = require("lodash");

//#region src/injectDecoratorFactory.ts
/**
* Creates a decorator that can be used as a convenience to inject a specific token
*
* Instead of using @Inject(SOME_THING_TOKEN) this can be used to create a new named Decorator
* such as @InjectSomeThing() which will hide the token details from users making APIs easier
* to consume
* @param token
*/
const makeInjectableDecorator = (token) => () => (0, _nestjs_common.Inject)(token);

//#endregion
//#region src/mixins.ts
const makeInjectableMixin = (name) => (mixinClass) => {
	Object.defineProperty(mixinClass, "name", { value: `${name}-${(0, crypto.randomUUID)()}` });
	(0, _nestjs_common.Injectable)()(mixinClass);
	return mixinClass;
};

//#endregion
//#region src/options.ts
function createAsyncOptionsProvider(provide, options) {
	if (options.useFactory) return {
		provide,
		useFactory: options.useFactory,
		inject: options.inject || []
	};
	return {
		provide,
		useFactory: async (optionsFactory) => {
			return optionsFactory.createOptions();
		},
		inject: [options.useClass || (0, lodash.get)(options, "useExisting.provide", options.useExisting.value.constructor.name)]
	};
}

//#endregion
exports.createAsyncOptionsProvider = createAsyncOptionsProvider;
exports.makeInjectableDecorator = makeInjectableDecorator;
exports.makeInjectableMixin = makeInjectableMixin;