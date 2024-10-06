import { PipeTransform, Injectable } from '@nestjs/common';
import { RpcException } from './rpc/rpc-exception';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any) {
    if (value !== 42) {
      throw new RpcException('expected number as payload');
    }
    return value;
  }
}
