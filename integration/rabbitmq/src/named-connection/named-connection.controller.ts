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
import { CONNECTION_NAME, PREFIX } from './named-connection.constants';

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

  @Get(`${PREFIX}-rpc`)
  async getRpc() {
    return this.amqpConnection.request({
      exchange: 'exchange3',
      routingKey: 'rpc-2',
    });
  }

  @RabbitRPC({
    connection: CONNECTION_NAME,
    routingKey: `${PREFIX}-rpc`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-rpc`,
  })
  rpc(message: object) {
    return {
      echo: message,
    };
  }

  @RabbitRPC({
    connection: CONNECTION_NAME,
    routingKey: `${PREFIX}-intercepted-rpc`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-intercepted-rpc`,
  })
  @UseInterceptors(TransformInterceptor)
  interceptedRpc() {
    return {
      message: 42,
    };
  }

  @RabbitRPC({
    connection: CONNECTION_NAME,
    routingKey: `${PREFIX}-piped-rpc`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-piped-rpc`,
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
    routingKey: `${PREFIX}-piped-param-rpc`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-piped-param-rpc`,
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
    routingKey: `${PREFIX}-guarded-rpc`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-guarded-rpc`,
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
    routingKey: `${PREFIX}-error-reply-rpc`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-error-reply-rpc`,
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ReplyErrorCallback,
  })
  errorReplyRpc(message: object) {
    throw new RpcException(message);
  }

  @RabbitRPC({
    connection: CONNECTION_NAME,
    routingKey: `${PREFIX}-non-json-rpc`,
    exchange: `${PREFIX}-exchange`,
    queue: `${PREFIX}-non-json-rpc`,
    allowNonJsonMessages: true,
  })
  nonJsonRpc(nonJsonMessage: any) {
    return {
      echo: nonJsonMessage,
    };
  }
}
