import {
  AmqpConnectionManager,
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
import { CONNECTION_NAME } from './named-connection.constants';

@Controller('named-connection')
export class NamedConnectionController {
  constructor(private readonly amqpConnectionManager: AmqpConnectionManager) {}

  get amqpConnection() {
    return this.amqpConnectionManager.getConnection(CONNECTION_NAME);
  }

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('rpc')
  async getRpc() {
    return this.amqpConnection.request({
      exchange: 'exchange3',
      routingKey: 'rpc-2',
    });
  }

  @RabbitRPC({
    connection: CONNECTION_NAME,
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
    connection: CONNECTION_NAME,
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
    connection: CONNECTION_NAME,
    routingKey: 'piped-rpc-2',
    exchange: 'exchange3',
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
    connection: CONNECTION_NAME,
    routingKey: 'piped-param-rpc-2',
    exchange: 'exchange3',
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
    connection: CONNECTION_NAME,
    routingKey: 'guarded-rpc-2',
    exchange: 'exchange3',
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
    connection: CONNECTION_NAME,
    routingKey: 'error-reply-rpc-2',
    exchange: 'exchange3',
    queue: 'error-reply-rpc-2',
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ReplyErrorCallback,
  })
  errorReplyRpc(message: object) {
    throw new RpcException(message);
  }

  @RabbitRPC({
    connection: CONNECTION_NAME,
    routingKey: 'non-json-rpc-2',
    exchange: 'exchange3',
    queue: 'non-json-rpc-2',
    allowNonJsonMessages: true,
  })
  nonJsonRpc(nonJsonMessage: any) {
    return {
      echo: nonJsonMessage,
    };
  }
}
