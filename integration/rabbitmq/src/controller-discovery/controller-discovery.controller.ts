import {
  AmqpConnection,
  MessageHandlerErrorBehavior,
  RabbitPayload,
  RabbitRPC,
} from '@golevelup/nestjs-rabbitmq';
import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ReplyErrorCallback } from '../rpc/reply.error.callback';
import { TransformInterceptor } from '../transform.interceptor';
import { RpcException } from '../rpc/rpc-exception';
import { DenyGuard } from '../deny.guard';
import { ValidationPipe } from '../validation.pipe';

@Controller('controller-discovery')
export class ControllerDiscoveryController {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('rpc')
  async getRpc() {
    return this.amqpConnection.request({
      exchange: 'exchange2',
      routingKey: 'rpc-2',
    });
  }

  @RabbitRPC({
    routingKey: 'rpc-2',
    exchange: 'exchange2',
    queue: 'rpc-2',
  })
  rpc(message: object) {
    return {
      echo: message,
    };
  }

  @RabbitRPC({
    routingKey: 'intercepted-rpc-2',
    exchange: 'exchange2',
    queue: 'intercepted-rpc-2',
  })
  @UseInterceptors(TransformInterceptor)
  interceptedRpc() {
    return {
      message: 42,
    };
  }

  @RabbitRPC({
    routingKey: 'piped-rpc-2',
    exchange: 'exchange2',
    queue: 'piped-rpc-2',
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
    routingKey: 'piped-param-rpc-2',
    exchange: 'exchange2',
    queue: 'piped-param-rpc-2',
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
    routingKey: 'guarded-rpc-2',
    exchange: 'exchange2',
    queue: 'guarded-rpc-2',
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
    routingKey: 'error-reply-rpc-2',
    exchange: 'exchange2',
    queue: 'error-reply-rpc-2',
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ReplyErrorCallback,
  })
  errorReplyRpc(message: object) {
    throw new RpcException(message);
  }

  @RabbitRPC({
    routingKey: 'non-json-rpc-2',
    exchange: 'exchange2',
    queue: 'non-json-rpc-2',
    allowNonJsonMessages: true,
  })
  nonJsonRpc(nonJsonMessage: any) {
    return {
      echo: nonJsonMessage,
    };
  }
}
