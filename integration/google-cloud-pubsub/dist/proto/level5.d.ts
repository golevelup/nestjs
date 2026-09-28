import type { BinaryWriteOptions } from '@protobuf-ts/runtime';
import type { IBinaryWriter } from '@protobuf-ts/runtime';
import type { BinaryReadOptions } from '@protobuf-ts/runtime';
import type { IBinaryReader } from '@protobuf-ts/runtime';
import type { PartialMessage } from '@protobuf-ts/runtime';
import { MessageType } from '@protobuf-ts/runtime';
export interface Level5ProtocolBuffer {
  field1: string;
  field2: number;
  field3: boolean;
  field4: number;
  field5: Uint8Array;
  field6: string[];
  field7: number;
  field8: bigint;
  nested1?: Level5ProtocolBuffer_Nested1L5ProtocolBuffer;
}
export interface Level5ProtocolBuffer_Nested1L5ProtocolBuffer {
  nestedField1: string;
  nested2?: Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer;
}
export interface Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer {
  nestedField2: number;
  nested3?: Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer;
}
export interface Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer {
  nestedField3: boolean;
}
declare class Level5ProtocolBuffer$Type extends MessageType<Level5ProtocolBuffer> {
  constructor();
  create(value?: PartialMessage<Level5ProtocolBuffer>): Level5ProtocolBuffer;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Level5ProtocolBuffer,
  ): Level5ProtocolBuffer;
  internalBinaryWrite(
    message: Level5ProtocolBuffer,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const Level5ProtocolBuffer: Level5ProtocolBuffer$Type;
declare class Level5ProtocolBuffer_Nested1L5ProtocolBuffer$Type extends MessageType<Level5ProtocolBuffer_Nested1L5ProtocolBuffer> {
  constructor();
  create(
    value?: PartialMessage<Level5ProtocolBuffer_Nested1L5ProtocolBuffer>,
  ): Level5ProtocolBuffer_Nested1L5ProtocolBuffer;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Level5ProtocolBuffer_Nested1L5ProtocolBuffer,
  ): Level5ProtocolBuffer_Nested1L5ProtocolBuffer;
  internalBinaryWrite(
    message: Level5ProtocolBuffer_Nested1L5ProtocolBuffer,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const Level5ProtocolBuffer_Nested1L5ProtocolBuffer: Level5ProtocolBuffer_Nested1L5ProtocolBuffer$Type;
declare class Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer$Type extends MessageType<Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer> {
  constructor();
  create(
    value?: PartialMessage<Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer>,
  ): Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer,
  ): Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer;
  internalBinaryWrite(
    message: Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer: Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer$Type;
declare class Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer$Type extends MessageType<Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer> {
  constructor();
  create(
    value?: PartialMessage<Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer>,
  ): Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer,
  ): Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer;
  internalBinaryWrite(
    message: Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer: Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer$Type;
export {};
