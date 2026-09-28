import { MessageType } from '@protobuf-ts/runtime';
import { Level5ProtocolBuffer } from '../proto/level5';
export declare const topics: readonly [
  {
    readonly name: 'order.created';
    readonly schema: {
      readonly definition: {
        readonly fields: readonly [
          {
            readonly name: 'field1';
            readonly type: 'string';
          },
          {
            readonly name: 'field2';
            readonly type: 'int';
          },
          {
            readonly name: 'field3';
            readonly type: 'boolean';
          },
          {
            readonly name: 'field4';
            readonly type: 'double';
          },
          {
            readonly name: 'field5';
            readonly type: {
              readonly fields: readonly [
                {
                  readonly name: 'nestedField1';
                  readonly type: 'string';
                },
              ];
              readonly name: 'Nested1';
              readonly type: 'record';
            };
          },
          {
            readonly name: 'field6';
            readonly type: readonly ['double', 'null'];
          },
        ];
        readonly name: 'Level3';
        readonly type: 'record';
      };
      readonly encoding: 'BINARY';
      readonly name: 'order.created.schema';
      readonly type: 'AVRO';
    };
    readonly subscriptions: readonly [
      {
        readonly name: 'order.created.subscription.order-processor-service';
        readonly batchManagerOptions: {
          readonly maxMessages: 15;
        };
      },
      {
        readonly name: 'order.created.subscription.analytic-service';
      },
    ];
  },
  {
    readonly name: 'order.created.dead-letter-queue';
    readonly subscriptions: readonly [
      {
        readonly name: 'order.created.dead-letter-queue.subscription';
      },
    ];
  },
  {
    readonly name: 'payment.processed';
    readonly schema: {
      readonly definition: MessageType<Level5ProtocolBuffer>;
      readonly encoding: 'BINARY';
      readonly name: 'payment.processed.schema';
      readonly type: 'PROTOCOL_BUFFER';
    };
    readonly subscriptions: readonly [
      {
        readonly name: 'payment.processed.payment-processor-service';
      },
      {
        readonly name: 'payment.processed.analytic-service';
      },
    ];
  },
  {
    readonly name: 'payment.processed.dead-letter-queue';
    readonly subscriptions: readonly [
      {
        readonly name: 'payment.processed.dead-letter-queue.subscription';
      },
    ];
  },
];
declare const googleCloudPubsubKit: {
  _GoogleCloudPubsubPayloadsMap: import('@golevelup/nestjs-google-cloud-pubsub/lib/client').InferPayloadMap<
    readonly [
      {
        readonly name: 'order.created';
        readonly schema: {
          readonly definition: {
            readonly fields: readonly [
              {
                readonly name: 'field1';
                readonly type: 'string';
              },
              {
                readonly name: 'field2';
                readonly type: 'int';
              },
              {
                readonly name: 'field3';
                readonly type: 'boolean';
              },
              {
                readonly name: 'field4';
                readonly type: 'double';
              },
              {
                readonly name: 'field5';
                readonly type: {
                  readonly fields: readonly [
                    {
                      readonly name: 'nestedField1';
                      readonly type: 'string';
                    },
                  ];
                  readonly name: 'Nested1';
                  readonly type: 'record';
                };
              },
              {
                readonly name: 'field6';
                readonly type: readonly ['double', 'null'];
              },
            ];
            readonly name: 'Level3';
            readonly type: 'record';
          };
          readonly encoding: 'BINARY';
          readonly name: 'order.created.schema';
          readonly type: 'AVRO';
        };
        readonly subscriptions: readonly [
          {
            readonly name: 'order.created.subscription.order-processor-service';
            readonly batchManagerOptions: {
              readonly maxMessages: 15;
            };
          },
          {
            readonly name: 'order.created.subscription.analytic-service';
          },
        ];
      },
      {
        readonly name: 'order.created.dead-letter-queue';
        readonly subscriptions: readonly [
          {
            readonly name: 'order.created.dead-letter-queue.subscription';
          },
        ];
      },
      {
        readonly name: 'payment.processed';
        readonly schema: {
          readonly definition: MessageType<Level5ProtocolBuffer>;
          readonly encoding: 'BINARY';
          readonly name: 'payment.processed.schema';
          readonly type: 'PROTOCOL_BUFFER';
        };
        readonly subscriptions: readonly [
          {
            readonly name: 'payment.processed.payment-processor-service';
          },
          {
            readonly name: 'payment.processed.analytic-service';
          },
        ];
      },
      {
        readonly name: 'payment.processed.dead-letter-queue';
        readonly subscriptions: readonly [
          {
            readonly name: 'payment.processed.dead-letter-queue.subscription';
          },
        ];
      },
    ]
  >;
  GoogleCloudPubsubAbstractPublisher: typeof import('@golevelup/nestjs-google-cloud-pubsub/lib/google-cloud-pubsub.abstract-publisher').GoogleCloudPubsubAbstractPublisher;
  GoogleCloudPubsubBatchSubscribe: <
    TopicName extends
      | 'order.created'
      | 'order.created.dead-letter-queue'
      | 'payment.processed'
      | 'payment.processed.dead-letter-queue',
  >(
    topic: TopicName,
    subscription: (
      | Extract<
          {
            readonly name: 'order.created';
            readonly schema: {
              readonly definition: {
                readonly fields: readonly [
                  {
                    readonly name: 'field1';
                    readonly type: 'string';
                  },
                  {
                    readonly name: 'field2';
                    readonly type: 'int';
                  },
                  {
                    readonly name: 'field3';
                    readonly type: 'boolean';
                  },
                  {
                    readonly name: 'field4';
                    readonly type: 'double';
                  },
                  {
                    readonly name: 'field5';
                    readonly type: {
                      readonly fields: readonly [
                        {
                          readonly name: 'nestedField1';
                          readonly type: 'string';
                        },
                      ];
                      readonly name: 'Nested1';
                      readonly type: 'record';
                    };
                  },
                  {
                    readonly name: 'field6';
                    readonly type: readonly ['double', 'null'];
                  },
                ];
                readonly name: 'Level3';
                readonly type: 'record';
              };
              readonly encoding: 'BINARY';
              readonly name: 'order.created.schema';
              readonly type: 'AVRO';
            };
            readonly subscriptions: readonly [
              {
                readonly name: 'order.created.subscription.order-processor-service';
                readonly batchManagerOptions: {
                  readonly maxMessages: 15;
                };
              },
              {
                readonly name: 'order.created.subscription.analytic-service';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'order.created.dead-letter-queue';
            readonly subscriptions: readonly [
              {
                readonly name: 'order.created.dead-letter-queue.subscription';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'payment.processed';
            readonly schema: {
              readonly definition: MessageType<Level5ProtocolBuffer>;
              readonly encoding: 'BINARY';
              readonly name: 'payment.processed.schema';
              readonly type: 'PROTOCOL_BUFFER';
            };
            readonly subscriptions: readonly [
              {
                readonly name: 'payment.processed.payment-processor-service';
              },
              {
                readonly name: 'payment.processed.analytic-service';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'payment.processed.dead-letter-queue';
            readonly subscriptions: readonly [
              {
                readonly name: 'payment.processed.dead-letter-queue.subscription';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
    )['subscriptions'][number]['name'],
  ) => (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<
      (
        payload: import('@golevelup/nestjs-google-cloud-pubsub').GoogleCloudPubsubMessage<
          import('@golevelup/nestjs-google-cloud-pubsub/lib/client').InferPayloadMap<
            readonly [
              {
                readonly name: 'order.created';
                readonly schema: {
                  readonly definition: {
                    readonly fields: readonly [
                      {
                        readonly name: 'field1';
                        readonly type: 'string';
                      },
                      {
                        readonly name: 'field2';
                        readonly type: 'int';
                      },
                      {
                        readonly name: 'field3';
                        readonly type: 'boolean';
                      },
                      {
                        readonly name: 'field4';
                        readonly type: 'double';
                      },
                      {
                        readonly name: 'field5';
                        readonly type: {
                          readonly fields: readonly [
                            {
                              readonly name: 'nestedField1';
                              readonly type: 'string';
                            },
                          ];
                          readonly name: 'Nested1';
                          readonly type: 'record';
                        };
                      },
                      {
                        readonly name: 'field6';
                        readonly type: readonly ['double', 'null'];
                      },
                    ];
                    readonly name: 'Level3';
                    readonly type: 'record';
                  };
                  readonly encoding: 'BINARY';
                  readonly name: 'order.created.schema';
                  readonly type: 'AVRO';
                };
                readonly subscriptions: readonly [
                  {
                    readonly name: 'order.created.subscription.order-processor-service';
                    readonly batchManagerOptions: {
                      readonly maxMessages: 15;
                    };
                  },
                  {
                    readonly name: 'order.created.subscription.analytic-service';
                  },
                ];
              },
              {
                readonly name: 'order.created.dead-letter-queue';
                readonly subscriptions: readonly [
                  {
                    readonly name: 'order.created.dead-letter-queue.subscription';
                  },
                ];
              },
              {
                readonly name: 'payment.processed';
                readonly schema: {
                  readonly definition: MessageType<Level5ProtocolBuffer>;
                  readonly encoding: 'BINARY';
                  readonly name: 'payment.processed.schema';
                  readonly type: 'PROTOCOL_BUFFER';
                };
                readonly subscriptions: readonly [
                  {
                    readonly name: 'payment.processed.payment-processor-service';
                  },
                  {
                    readonly name: 'payment.processed.analytic-service';
                  },
                ];
              },
              {
                readonly name: 'payment.processed.dead-letter-queue';
                readonly subscriptions: readonly [
                  {
                    readonly name: 'payment.processed.dead-letter-queue.subscription';
                  },
                ];
              },
            ]
          >[TopicName]
        >[],
      ) => Promise<void>
    >,
  ) => TypedPropertyDescriptor<
    (
      payload: import('@golevelup/nestjs-google-cloud-pubsub').GoogleCloudPubsubMessage<
        import('@golevelup/nestjs-google-cloud-pubsub/lib/client').InferPayloadMap<
          readonly [
            {
              readonly name: 'order.created';
              readonly schema: {
                readonly definition: {
                  readonly fields: readonly [
                    {
                      readonly name: 'field1';
                      readonly type: 'string';
                    },
                    {
                      readonly name: 'field2';
                      readonly type: 'int';
                    },
                    {
                      readonly name: 'field3';
                      readonly type: 'boolean';
                    },
                    {
                      readonly name: 'field4';
                      readonly type: 'double';
                    },
                    {
                      readonly name: 'field5';
                      readonly type: {
                        readonly fields: readonly [
                          {
                            readonly name: 'nestedField1';
                            readonly type: 'string';
                          },
                        ];
                        readonly name: 'Nested1';
                        readonly type: 'record';
                      };
                    },
                    {
                      readonly name: 'field6';
                      readonly type: readonly ['double', 'null'];
                    },
                  ];
                  readonly name: 'Level3';
                  readonly type: 'record';
                };
                readonly encoding: 'BINARY';
                readonly name: 'order.created.schema';
                readonly type: 'AVRO';
              };
              readonly subscriptions: readonly [
                {
                  readonly name: 'order.created.subscription.order-processor-service';
                  readonly batchManagerOptions: {
                    readonly maxMessages: 15;
                  };
                },
                {
                  readonly name: 'order.created.subscription.analytic-service';
                },
              ];
            },
            {
              readonly name: 'order.created.dead-letter-queue';
              readonly subscriptions: readonly [
                {
                  readonly name: 'order.created.dead-letter-queue.subscription';
                },
              ];
            },
            {
              readonly name: 'payment.processed';
              readonly schema: {
                readonly definition: MessageType<Level5ProtocolBuffer>;
                readonly encoding: 'BINARY';
                readonly name: 'payment.processed.schema';
                readonly type: 'PROTOCOL_BUFFER';
              };
              readonly subscriptions: readonly [
                {
                  readonly name: 'payment.processed.payment-processor-service';
                },
                {
                  readonly name: 'payment.processed.analytic-service';
                },
              ];
            },
            {
              readonly name: 'payment.processed.dead-letter-queue';
              readonly subscriptions: readonly [
                {
                  readonly name: 'payment.processed.dead-letter-queue.subscription';
                },
              ];
            },
          ]
        >[TopicName]
      >[],
    ) => Promise<void>
  >;
  GoogleCloudPubsubSubscribe: <
    TopicName extends
      | 'order.created'
      | 'order.created.dead-letter-queue'
      | 'payment.processed'
      | 'payment.processed.dead-letter-queue',
  >(
    topic: TopicName,
    subscription: (
      | Extract<
          {
            readonly name: 'order.created';
            readonly schema: {
              readonly definition: {
                readonly fields: readonly [
                  {
                    readonly name: 'field1';
                    readonly type: 'string';
                  },
                  {
                    readonly name: 'field2';
                    readonly type: 'int';
                  },
                  {
                    readonly name: 'field3';
                    readonly type: 'boolean';
                  },
                  {
                    readonly name: 'field4';
                    readonly type: 'double';
                  },
                  {
                    readonly name: 'field5';
                    readonly type: {
                      readonly fields: readonly [
                        {
                          readonly name: 'nestedField1';
                          readonly type: 'string';
                        },
                      ];
                      readonly name: 'Nested1';
                      readonly type: 'record';
                    };
                  },
                  {
                    readonly name: 'field6';
                    readonly type: readonly ['double', 'null'];
                  },
                ];
                readonly name: 'Level3';
                readonly type: 'record';
              };
              readonly encoding: 'BINARY';
              readonly name: 'order.created.schema';
              readonly type: 'AVRO';
            };
            readonly subscriptions: readonly [
              {
                readonly name: 'order.created.subscription.order-processor-service';
                readonly batchManagerOptions: {
                  readonly maxMessages: 15;
                };
              },
              {
                readonly name: 'order.created.subscription.analytic-service';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'order.created.dead-letter-queue';
            readonly subscriptions: readonly [
              {
                readonly name: 'order.created.dead-letter-queue.subscription';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'payment.processed';
            readonly schema: {
              readonly definition: MessageType<Level5ProtocolBuffer>;
              readonly encoding: 'BINARY';
              readonly name: 'payment.processed.schema';
              readonly type: 'PROTOCOL_BUFFER';
            };
            readonly subscriptions: readonly [
              {
                readonly name: 'payment.processed.payment-processor-service';
              },
              {
                readonly name: 'payment.processed.analytic-service';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'payment.processed.dead-letter-queue';
            readonly subscriptions: readonly [
              {
                readonly name: 'payment.processed.dead-letter-queue.subscription';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
    )['subscriptions'][number]['name'],
  ) => (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<
      (
        payload: import('@golevelup/nestjs-google-cloud-pubsub').GoogleCloudPubsubMessage<
          import('@golevelup/nestjs-google-cloud-pubsub/lib/client').InferPayloadMap<
            readonly [
              {
                readonly name: 'order.created';
                readonly schema: {
                  readonly definition: {
                    readonly fields: readonly [
                      {
                        readonly name: 'field1';
                        readonly type: 'string';
                      },
                      {
                        readonly name: 'field2';
                        readonly type: 'int';
                      },
                      {
                        readonly name: 'field3';
                        readonly type: 'boolean';
                      },
                      {
                        readonly name: 'field4';
                        readonly type: 'double';
                      },
                      {
                        readonly name: 'field5';
                        readonly type: {
                          readonly fields: readonly [
                            {
                              readonly name: 'nestedField1';
                              readonly type: 'string';
                            },
                          ];
                          readonly name: 'Nested1';
                          readonly type: 'record';
                        };
                      },
                      {
                        readonly name: 'field6';
                        readonly type: readonly ['double', 'null'];
                      },
                    ];
                    readonly name: 'Level3';
                    readonly type: 'record';
                  };
                  readonly encoding: 'BINARY';
                  readonly name: 'order.created.schema';
                  readonly type: 'AVRO';
                };
                readonly subscriptions: readonly [
                  {
                    readonly name: 'order.created.subscription.order-processor-service';
                    readonly batchManagerOptions: {
                      readonly maxMessages: 15;
                    };
                  },
                  {
                    readonly name: 'order.created.subscription.analytic-service';
                  },
                ];
              },
              {
                readonly name: 'order.created.dead-letter-queue';
                readonly subscriptions: readonly [
                  {
                    readonly name: 'order.created.dead-letter-queue.subscription';
                  },
                ];
              },
              {
                readonly name: 'payment.processed';
                readonly schema: {
                  readonly definition: MessageType<Level5ProtocolBuffer>;
                  readonly encoding: 'BINARY';
                  readonly name: 'payment.processed.schema';
                  readonly type: 'PROTOCOL_BUFFER';
                };
                readonly subscriptions: readonly [
                  {
                    readonly name: 'payment.processed.payment-processor-service';
                  },
                  {
                    readonly name: 'payment.processed.analytic-service';
                  },
                ];
              },
              {
                readonly name: 'payment.processed.dead-letter-queue';
                readonly subscriptions: readonly [
                  {
                    readonly name: 'payment.processed.dead-letter-queue.subscription';
                  },
                ];
              },
            ]
          >[TopicName]
        >,
      ) => Promise<void>
    >,
  ) => TypedPropertyDescriptor<
    (
      payload: import('@golevelup/nestjs-google-cloud-pubsub').GoogleCloudPubsubMessage<
        import('@golevelup/nestjs-google-cloud-pubsub/lib/client').InferPayloadMap<
          readonly [
            {
              readonly name: 'order.created';
              readonly schema: {
                readonly definition: {
                  readonly fields: readonly [
                    {
                      readonly name: 'field1';
                      readonly type: 'string';
                    },
                    {
                      readonly name: 'field2';
                      readonly type: 'int';
                    },
                    {
                      readonly name: 'field3';
                      readonly type: 'boolean';
                    },
                    {
                      readonly name: 'field4';
                      readonly type: 'double';
                    },
                    {
                      readonly name: 'field5';
                      readonly type: {
                        readonly fields: readonly [
                          {
                            readonly name: 'nestedField1';
                            readonly type: 'string';
                          },
                        ];
                        readonly name: 'Nested1';
                        readonly type: 'record';
                      };
                    },
                    {
                      readonly name: 'field6';
                      readonly type: readonly ['double', 'null'];
                    },
                  ];
                  readonly name: 'Level3';
                  readonly type: 'record';
                };
                readonly encoding: 'BINARY';
                readonly name: 'order.created.schema';
                readonly type: 'AVRO';
              };
              readonly subscriptions: readonly [
                {
                  readonly name: 'order.created.subscription.order-processor-service';
                  readonly batchManagerOptions: {
                    readonly maxMessages: 15;
                  };
                },
                {
                  readonly name: 'order.created.subscription.analytic-service';
                },
              ];
            },
            {
              readonly name: 'order.created.dead-letter-queue';
              readonly subscriptions: readonly [
                {
                  readonly name: 'order.created.dead-letter-queue.subscription';
                },
              ];
            },
            {
              readonly name: 'payment.processed';
              readonly schema: {
                readonly definition: MessageType<Level5ProtocolBuffer>;
                readonly encoding: 'BINARY';
                readonly name: 'payment.processed.schema';
                readonly type: 'PROTOCOL_BUFFER';
              };
              readonly subscriptions: readonly [
                {
                  readonly name: 'payment.processed.payment-processor-service';
                },
                {
                  readonly name: 'payment.processed.analytic-service';
                },
              ];
            },
            {
              readonly name: 'payment.processed.dead-letter-queue';
              readonly subscriptions: readonly [
                {
                  readonly name: 'payment.processed.dead-letter-queue.subscription';
                },
              ];
            },
          ]
        >[TopicName]
      >,
    ) => Promise<void>
  >;
};
declare const GoogleCloudPubsubAbstractPublisher: typeof import('@golevelup/nestjs-google-cloud-pubsub/lib/google-cloud-pubsub.abstract-publisher').GoogleCloudPubsubAbstractPublisher,
  GoogleCloudPubsubBatchSubscribe: <
    TopicName extends
      | 'order.created'
      | 'order.created.dead-letter-queue'
      | 'payment.processed'
      | 'payment.processed.dead-letter-queue',
  >(
    topic: TopicName,
    subscription: (
      | Extract<
          {
            readonly name: 'order.created';
            readonly schema: {
              readonly definition: {
                readonly fields: readonly [
                  {
                    readonly name: 'field1';
                    readonly type: 'string';
                  },
                  {
                    readonly name: 'field2';
                    readonly type: 'int';
                  },
                  {
                    readonly name: 'field3';
                    readonly type: 'boolean';
                  },
                  {
                    readonly name: 'field4';
                    readonly type: 'double';
                  },
                  {
                    readonly name: 'field5';
                    readonly type: {
                      readonly fields: readonly [
                        {
                          readonly name: 'nestedField1';
                          readonly type: 'string';
                        },
                      ];
                      readonly name: 'Nested1';
                      readonly type: 'record';
                    };
                  },
                  {
                    readonly name: 'field6';
                    readonly type: readonly ['double', 'null'];
                  },
                ];
                readonly name: 'Level3';
                readonly type: 'record';
              };
              readonly encoding: 'BINARY';
              readonly name: 'order.created.schema';
              readonly type: 'AVRO';
            };
            readonly subscriptions: readonly [
              {
                readonly name: 'order.created.subscription.order-processor-service';
                readonly batchManagerOptions: {
                  readonly maxMessages: 15;
                };
              },
              {
                readonly name: 'order.created.subscription.analytic-service';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'order.created.dead-letter-queue';
            readonly subscriptions: readonly [
              {
                readonly name: 'order.created.dead-letter-queue.subscription';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'payment.processed';
            readonly schema: {
              readonly definition: MessageType<Level5ProtocolBuffer>;
              readonly encoding: 'BINARY';
              readonly name: 'payment.processed.schema';
              readonly type: 'PROTOCOL_BUFFER';
            };
            readonly subscriptions: readonly [
              {
                readonly name: 'payment.processed.payment-processor-service';
              },
              {
                readonly name: 'payment.processed.analytic-service';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'payment.processed.dead-letter-queue';
            readonly subscriptions: readonly [
              {
                readonly name: 'payment.processed.dead-letter-queue.subscription';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
    )['subscriptions'][number]['name'],
  ) => (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<
      (
        payload: import('@golevelup/nestjs-google-cloud-pubsub').GoogleCloudPubsubMessage<
          import('@golevelup/nestjs-google-cloud-pubsub/lib/client').InferPayloadMap<
            readonly [
              {
                readonly name: 'order.created';
                readonly schema: {
                  readonly definition: {
                    readonly fields: readonly [
                      {
                        readonly name: 'field1';
                        readonly type: 'string';
                      },
                      {
                        readonly name: 'field2';
                        readonly type: 'int';
                      },
                      {
                        readonly name: 'field3';
                        readonly type: 'boolean';
                      },
                      {
                        readonly name: 'field4';
                        readonly type: 'double';
                      },
                      {
                        readonly name: 'field5';
                        readonly type: {
                          readonly fields: readonly [
                            {
                              readonly name: 'nestedField1';
                              readonly type: 'string';
                            },
                          ];
                          readonly name: 'Nested1';
                          readonly type: 'record';
                        };
                      },
                      {
                        readonly name: 'field6';
                        readonly type: readonly ['double', 'null'];
                      },
                    ];
                    readonly name: 'Level3';
                    readonly type: 'record';
                  };
                  readonly encoding: 'BINARY';
                  readonly name: 'order.created.schema';
                  readonly type: 'AVRO';
                };
                readonly subscriptions: readonly [
                  {
                    readonly name: 'order.created.subscription.order-processor-service';
                    readonly batchManagerOptions: {
                      readonly maxMessages: 15;
                    };
                  },
                  {
                    readonly name: 'order.created.subscription.analytic-service';
                  },
                ];
              },
              {
                readonly name: 'order.created.dead-letter-queue';
                readonly subscriptions: readonly [
                  {
                    readonly name: 'order.created.dead-letter-queue.subscription';
                  },
                ];
              },
              {
                readonly name: 'payment.processed';
                readonly schema: {
                  readonly definition: MessageType<Level5ProtocolBuffer>;
                  readonly encoding: 'BINARY';
                  readonly name: 'payment.processed.schema';
                  readonly type: 'PROTOCOL_BUFFER';
                };
                readonly subscriptions: readonly [
                  {
                    readonly name: 'payment.processed.payment-processor-service';
                  },
                  {
                    readonly name: 'payment.processed.analytic-service';
                  },
                ];
              },
              {
                readonly name: 'payment.processed.dead-letter-queue';
                readonly subscriptions: readonly [
                  {
                    readonly name: 'payment.processed.dead-letter-queue.subscription';
                  },
                ];
              },
            ]
          >[TopicName]
        >[],
      ) => Promise<void>
    >,
  ) => TypedPropertyDescriptor<
    (
      payload: import('@golevelup/nestjs-google-cloud-pubsub').GoogleCloudPubsubMessage<
        import('@golevelup/nestjs-google-cloud-pubsub/lib/client').InferPayloadMap<
          readonly [
            {
              readonly name: 'order.created';
              readonly schema: {
                readonly definition: {
                  readonly fields: readonly [
                    {
                      readonly name: 'field1';
                      readonly type: 'string';
                    },
                    {
                      readonly name: 'field2';
                      readonly type: 'int';
                    },
                    {
                      readonly name: 'field3';
                      readonly type: 'boolean';
                    },
                    {
                      readonly name: 'field4';
                      readonly type: 'double';
                    },
                    {
                      readonly name: 'field5';
                      readonly type: {
                        readonly fields: readonly [
                          {
                            readonly name: 'nestedField1';
                            readonly type: 'string';
                          },
                        ];
                        readonly name: 'Nested1';
                        readonly type: 'record';
                      };
                    },
                    {
                      readonly name: 'field6';
                      readonly type: readonly ['double', 'null'];
                    },
                  ];
                  readonly name: 'Level3';
                  readonly type: 'record';
                };
                readonly encoding: 'BINARY';
                readonly name: 'order.created.schema';
                readonly type: 'AVRO';
              };
              readonly subscriptions: readonly [
                {
                  readonly name: 'order.created.subscription.order-processor-service';
                  readonly batchManagerOptions: {
                    readonly maxMessages: 15;
                  };
                },
                {
                  readonly name: 'order.created.subscription.analytic-service';
                },
              ];
            },
            {
              readonly name: 'order.created.dead-letter-queue';
              readonly subscriptions: readonly [
                {
                  readonly name: 'order.created.dead-letter-queue.subscription';
                },
              ];
            },
            {
              readonly name: 'payment.processed';
              readonly schema: {
                readonly definition: MessageType<Level5ProtocolBuffer>;
                readonly encoding: 'BINARY';
                readonly name: 'payment.processed.schema';
                readonly type: 'PROTOCOL_BUFFER';
              };
              readonly subscriptions: readonly [
                {
                  readonly name: 'payment.processed.payment-processor-service';
                },
                {
                  readonly name: 'payment.processed.analytic-service';
                },
              ];
            },
            {
              readonly name: 'payment.processed.dead-letter-queue';
              readonly subscriptions: readonly [
                {
                  readonly name: 'payment.processed.dead-letter-queue.subscription';
                },
              ];
            },
          ]
        >[TopicName]
      >[],
    ) => Promise<void>
  >,
  GoogleCloudPubsubSubscribe: <
    TopicName extends
      | 'order.created'
      | 'order.created.dead-letter-queue'
      | 'payment.processed'
      | 'payment.processed.dead-letter-queue',
  >(
    topic: TopicName,
    subscription: (
      | Extract<
          {
            readonly name: 'order.created';
            readonly schema: {
              readonly definition: {
                readonly fields: readonly [
                  {
                    readonly name: 'field1';
                    readonly type: 'string';
                  },
                  {
                    readonly name: 'field2';
                    readonly type: 'int';
                  },
                  {
                    readonly name: 'field3';
                    readonly type: 'boolean';
                  },
                  {
                    readonly name: 'field4';
                    readonly type: 'double';
                  },
                  {
                    readonly name: 'field5';
                    readonly type: {
                      readonly fields: readonly [
                        {
                          readonly name: 'nestedField1';
                          readonly type: 'string';
                        },
                      ];
                      readonly name: 'Nested1';
                      readonly type: 'record';
                    };
                  },
                  {
                    readonly name: 'field6';
                    readonly type: readonly ['double', 'null'];
                  },
                ];
                readonly name: 'Level3';
                readonly type: 'record';
              };
              readonly encoding: 'BINARY';
              readonly name: 'order.created.schema';
              readonly type: 'AVRO';
            };
            readonly subscriptions: readonly [
              {
                readonly name: 'order.created.subscription.order-processor-service';
                readonly batchManagerOptions: {
                  readonly maxMessages: 15;
                };
              },
              {
                readonly name: 'order.created.subscription.analytic-service';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'order.created.dead-letter-queue';
            readonly subscriptions: readonly [
              {
                readonly name: 'order.created.dead-letter-queue.subscription';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'payment.processed';
            readonly schema: {
              readonly definition: MessageType<Level5ProtocolBuffer>;
              readonly encoding: 'BINARY';
              readonly name: 'payment.processed.schema';
              readonly type: 'PROTOCOL_BUFFER';
            };
            readonly subscriptions: readonly [
              {
                readonly name: 'payment.processed.payment-processor-service';
              },
              {
                readonly name: 'payment.processed.analytic-service';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
      | Extract<
          {
            readonly name: 'payment.processed.dead-letter-queue';
            readonly subscriptions: readonly [
              {
                readonly name: 'payment.processed.dead-letter-queue.subscription';
              },
            ];
          },
          {
            name: TopicName;
          }
        >
    )['subscriptions'][number]['name'],
  ) => (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<
      (
        payload: import('@golevelup/nestjs-google-cloud-pubsub').GoogleCloudPubsubMessage<
          import('@golevelup/nestjs-google-cloud-pubsub/lib/client').InferPayloadMap<
            readonly [
              {
                readonly name: 'order.created';
                readonly schema: {
                  readonly definition: {
                    readonly fields: readonly [
                      {
                        readonly name: 'field1';
                        readonly type: 'string';
                      },
                      {
                        readonly name: 'field2';
                        readonly type: 'int';
                      },
                      {
                        readonly name: 'field3';
                        readonly type: 'boolean';
                      },
                      {
                        readonly name: 'field4';
                        readonly type: 'double';
                      },
                      {
                        readonly name: 'field5';
                        readonly type: {
                          readonly fields: readonly [
                            {
                              readonly name: 'nestedField1';
                              readonly type: 'string';
                            },
                          ];
                          readonly name: 'Nested1';
                          readonly type: 'record';
                        };
                      },
                      {
                        readonly name: 'field6';
                        readonly type: readonly ['double', 'null'];
                      },
                    ];
                    readonly name: 'Level3';
                    readonly type: 'record';
                  };
                  readonly encoding: 'BINARY';
                  readonly name: 'order.created.schema';
                  readonly type: 'AVRO';
                };
                readonly subscriptions: readonly [
                  {
                    readonly name: 'order.created.subscription.order-processor-service';
                    readonly batchManagerOptions: {
                      readonly maxMessages: 15;
                    };
                  },
                  {
                    readonly name: 'order.created.subscription.analytic-service';
                  },
                ];
              },
              {
                readonly name: 'order.created.dead-letter-queue';
                readonly subscriptions: readonly [
                  {
                    readonly name: 'order.created.dead-letter-queue.subscription';
                  },
                ];
              },
              {
                readonly name: 'payment.processed';
                readonly schema: {
                  readonly definition: MessageType<Level5ProtocolBuffer>;
                  readonly encoding: 'BINARY';
                  readonly name: 'payment.processed.schema';
                  readonly type: 'PROTOCOL_BUFFER';
                };
                readonly subscriptions: readonly [
                  {
                    readonly name: 'payment.processed.payment-processor-service';
                  },
                  {
                    readonly name: 'payment.processed.analytic-service';
                  },
                ];
              },
              {
                readonly name: 'payment.processed.dead-letter-queue';
                readonly subscriptions: readonly [
                  {
                    readonly name: 'payment.processed.dead-letter-queue.subscription';
                  },
                ];
              },
            ]
          >[TopicName]
        >,
      ) => Promise<void>
    >,
  ) => TypedPropertyDescriptor<
    (
      payload: import('@golevelup/nestjs-google-cloud-pubsub').GoogleCloudPubsubMessage<
        import('@golevelup/nestjs-google-cloud-pubsub/lib/client').InferPayloadMap<
          readonly [
            {
              readonly name: 'order.created';
              readonly schema: {
                readonly definition: {
                  readonly fields: readonly [
                    {
                      readonly name: 'field1';
                      readonly type: 'string';
                    },
                    {
                      readonly name: 'field2';
                      readonly type: 'int';
                    },
                    {
                      readonly name: 'field3';
                      readonly type: 'boolean';
                    },
                    {
                      readonly name: 'field4';
                      readonly type: 'double';
                    },
                    {
                      readonly name: 'field5';
                      readonly type: {
                        readonly fields: readonly [
                          {
                            readonly name: 'nestedField1';
                            readonly type: 'string';
                          },
                        ];
                        readonly name: 'Nested1';
                        readonly type: 'record';
                      };
                    },
                    {
                      readonly name: 'field6';
                      readonly type: readonly ['double', 'null'];
                    },
                  ];
                  readonly name: 'Level3';
                  readonly type: 'record';
                };
                readonly encoding: 'BINARY';
                readonly name: 'order.created.schema';
                readonly type: 'AVRO';
              };
              readonly subscriptions: readonly [
                {
                  readonly name: 'order.created.subscription.order-processor-service';
                  readonly batchManagerOptions: {
                    readonly maxMessages: 15;
                  };
                },
                {
                  readonly name: 'order.created.subscription.analytic-service';
                },
              ];
            },
            {
              readonly name: 'order.created.dead-letter-queue';
              readonly subscriptions: readonly [
                {
                  readonly name: 'order.created.dead-letter-queue.subscription';
                },
              ];
            },
            {
              readonly name: 'payment.processed';
              readonly schema: {
                readonly definition: MessageType<Level5ProtocolBuffer>;
                readonly encoding: 'BINARY';
                readonly name: 'payment.processed.schema';
                readonly type: 'PROTOCOL_BUFFER';
              };
              readonly subscriptions: readonly [
                {
                  readonly name: 'payment.processed.payment-processor-service';
                },
                {
                  readonly name: 'payment.processed.analytic-service';
                },
              ];
            },
            {
              readonly name: 'payment.processed.dead-letter-queue';
              readonly subscriptions: readonly [
                {
                  readonly name: 'payment.processed.dead-letter-queue.subscription';
                },
              ];
            },
          ]
        >[TopicName]
      >,
    ) => Promise<void>
  >;
export type GoogleCloudPubsubPayloadsMap =
  typeof googleCloudPubsubKit._GoogleCloudPubsubPayloadsMap;
export declare class GoogleCloudPubsubPublisher extends GoogleCloudPubsubAbstractPublisher<GoogleCloudPubsubPayloadsMap> {}
export { GoogleCloudPubsubSubscribe, GoogleCloudPubsubBatchSubscribe };
