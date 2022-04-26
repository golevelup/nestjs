import {
  MessageHandlerErrorBehavior,
  RabbitPayload,
  RabbitRPC,
} from '@golevelup/nestjs-rabbitmq';
import {
  Controller,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ReplyErrorCallback } from '../../rpc/reply.error.callback';
import { TransformInterceptor } from '../../transform.interceptor';
import { RpcException } from '../../rpc/rpc-exception';
import { DenyGuard } from '../../deny.guard';
import { ValidationPipe } from '../../validation.pipe';
import { PREFIX } from '../controller-discovery.constants';

@Controller('controller-discovery')
export class SubmoduleController {
  @RabbitRPC({
    routingKey: `${PREFIX}-rpc-submodule`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-rpc-submodule`,
  })
  rpc(message: object) {
    return {
      echo: message,
    };
  }

  @RabbitRPC({
    routingKey: `${PREFIX}-intercepted-rpc-submodule`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-intercepted-rpc-submodule`,
  })
  @UseInterceptors(TransformInterceptor)
  interceptedRpc() {
    return {
      message: 42,
    };
  }

  @RabbitRPC({
    routingKey: `${PREFIX}-piped-rpc-submodule`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-piped-rpc-submodule`,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ReplyErrorCallback,
  })
  @UsePipes(ValidationPipe)
  pipedRpc(@RabbitPayload() message: number) {
    return {
      message,
    };
  }

  @RabbitRPC({
    routingKey: `${PREFIX}-piped-param-rpc-submodule`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-piped-param-rpc-submodule`,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ReplyErrorCallback,
  })
  // eslint-disable-next-line sonarjs/no-identical-functions
  pipedParamRpc(@RabbitPayload(ValidationPipe) message: number) {
    return {
      message,
    };
  }

  @RabbitRPC({
    routingKey: `${PREFIX}-guarded-rpc-submodule`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-guarded-rpc-submodule`,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ReplyErrorCallback,
  })
  @UseGuards(DenyGuard)
  guardedRpc() {
    return {
      message: 'success',
    };
  }

  @RabbitRPC({
    routingKey: `${PREFIX}-error-reply-rpc-submodule`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-error-reply-rpc-submodule`,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ReplyErrorCallback,
  })
  errorReplyRpc(message: object) {
    throw new RpcException(message);
  }

  @RabbitRPC({
    routingKey: `${PREFIX}-non-json-rpc-submodule`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-non-json-rpc-submodule`,
    allowNonJsonMessages: true,
  })
  nonJsonRpc(nonJsonMessage: any) {
    return {
      echo: nonJsonMessage,
    };
  }
}
