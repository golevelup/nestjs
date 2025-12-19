import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { get } from "lodash";

//#region src/injectDecoratorFactory.ts
/**
* Creates a decorator that can be used as a convenience to inject a specific token
*
* Instead of using @Inject(SOME_THING_TOKEN) this can be used to create a new named Decorator
* such as @InjectSomeThing() which will hide the token details from users making APIs easier
* to consume
* @param token
*/
const makeInjectableDecorator = (token) => () => Inject(token);

//#endregion
//#region src/mixins.ts
const makeInjectableMixin = (name) => (mixinClass) => {
	Object.defineProperty(mixinClass, "name", { value: `${name}-${randomUUID()}` });
	Injectable()(mixinClass);
	return mixinClass;
};

//#endregion
//#region \0@oxc-project+runtime@0.103.0/helpers/asyncToGenerator.js
function asyncGeneratorStep(n, t, e, r, o, a, c) {
	try {
		var i = n[a](c), u = i.value;
	} catch (n$1) {
		e(n$1);
		return;
	}
	i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
	return function() {
		var t = this, e = arguments;
		return new Promise(function(r, o) {
			var a = n.apply(t, e);
			function _next(n$1) {
				asyncGeneratorStep(a, r, o, _next, _throw, "next", n$1);
			}
			function _throw(n$1) {
				asyncGeneratorStep(a, r, o, _next, _throw, "throw", n$1);
			}
			_next(void 0);
		});
	};
}

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
		useFactory: function() {
			var _ref = _asyncToGenerator(function* (optionsFactory) {
				return optionsFactory.createOptions();
			});
			return function useFactory(_x) {
				return _ref.apply(this, arguments);
			};
		}(),
		inject: [options.useClass || get(options, "useExisting.provide", options.useExisting.value.constructor.name)]
	};
}

//#endregion
export { createAsyncOptionsProvider, makeInjectableDecorator, makeInjectableMixin };
//# sourceMappingURL=index.mjs.map