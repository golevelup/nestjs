export class Nack {
  constructor(private readonly _requeue: boolean = false) {}

  get requeue() {
    return this._requeue;
  }
}

export type RpcResponse<T> = T | Nack;
export type SubscribeResponse = Nack | undefined | void;
