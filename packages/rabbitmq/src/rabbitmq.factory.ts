import { ParamData } from '@nestjs/common';
import { isObject } from 'lodash';
import {
  RABBIT_HEADER_TYPE,
  RABBIT_PARAM_TYPE,
  RABBIT_REQUEST_TYPE,
} from './rabbitmq.constants';

export class RabbitRpcParamsFactory {
  public exchangeKeyForValue(type: number, data: ParamData, args: any[]) {
    if (!args) {
      return null;
    }

    let index = 0;
    if (type === RABBIT_PARAM_TYPE) {
      index = 0;
    } else if (type === RABBIT_REQUEST_TYPE) {
      index = 1;
    } else if (type === RABBIT_HEADER_TYPE) {
      index = 2;
    }

    return data && !isObject(data) ? args[index]?.[data] : args[index];
  }
}
