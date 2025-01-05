import { MODULE_OPTIONS_TOKEN } from './rabbitmq-module-definition';

export const RABBIT_HANDLER = Symbol('RABBIT_HANDLER');
export const RABBIT_CONFIG_TOKEN = MODULE_OPTIONS_TOKEN;
export const RABBIT_PARAM_TYPE = 3;
export const RABBIT_HEADER_TYPE = 4;
export const RABBIT_REQUEST_TYPE = 5;
export const RABBIT_CONTEXT_TYPE_KEY = 'rmq';
export const PRECONDITION_FAILED_CODE = 406;
