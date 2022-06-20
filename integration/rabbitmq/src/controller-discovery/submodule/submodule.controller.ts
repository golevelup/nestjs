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

@Controller('controller-discovery')
export class SubmoduleController {
  @RabbitRPC({
    routingKey: 'rpc-submodule',
    exchange: 'exchange2',
    queue: 'rpc-submodule',
  })
  rpc(message: object) {
    return {
      echo: message,
    };
  }

  @RabbitRPC({
    routingKey: 'intercepted-rpc-submodule',
    exchange: 'exchange2',
    queue: 'intercepted-rpc-submodule',
  })
  @UseInterceptors(TransformInterceptor)
  interceptedRpc() {
    return {
      message: 42,
    };
  }

  @RabbitRPC({
    routingKey: 'piped-rpc-submodule',
    exchange: 'exchange2',
    queue: 'piped-rpc-submodule',
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
    routingKey: 'piped-param-rpc-submodule',
    exchange: 'exchange2',
    queue: 'piped-param-rpc-submodule',
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
    routingKey: 'guarded-rpc-submodule',
    exchange: 'exchange2',
    queue: 'guarded-rpc-submodule',
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
    routingKey: 'error-reply-rpc-submodule',
    exchange: 'exchange2',
    queue: 'error-reply-rpc-submodule',
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ReplyErrorCallback,
  })
  errorReplyRpc(message: object) {
    throw new RpcException(message);
  }

  @RabbitRPC({
    routingKey: 'non-json-rpc-submodule',
    exchange: 'exchange2',
    queue: 'non-json-rpc-submodule',
    allowNonJsonMessages: true,
  })
  nonJsonRpc(nonJsonMessage: any) {
    return {
      echo: nonJsonMessage,
    };
  }
}
