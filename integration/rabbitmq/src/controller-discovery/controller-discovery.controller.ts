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
import { PREFIX } from './controller-discovery.constants';

@Controller('controller-discovery')
export class ControllerDiscoveryController {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get(`${PREFIX}-rpc`)
  async getRpc() {
    return this.amqpConnection.request({
      exchange: `${PREFIX}-exchange`,
      routingKey: `${PREFIX}-rpc`,
    });
  }

  @RabbitRPC({
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
