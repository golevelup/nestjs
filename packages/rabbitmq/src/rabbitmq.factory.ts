import { ParamData } from '@nestjs/common';
import { isObject } from 'lodash';
import { RABBIT_PARAM_TYPE } from './rabbitmq.constants';

export class RabbitRpcParamsFactory {
  public exchangeKeyForValue(type: number, data: ParamData, args: any[]) {
    if (!args || type !== RABBIT_PARAM_TYPE) {
      return null;
    }

    return data && !isObject(data) ? args[0]?.[data] : args[0];
  }
}
