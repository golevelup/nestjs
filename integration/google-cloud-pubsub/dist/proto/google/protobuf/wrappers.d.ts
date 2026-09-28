import type { BinaryWriteOptions } from '@protobuf-ts/runtime';
import type { IBinaryWriter } from '@protobuf-ts/runtime';
import type { BinaryReadOptions } from '@protobuf-ts/runtime';
import type { IBinaryReader } from '@protobuf-ts/runtime';
import type { PartialMessage } from '@protobuf-ts/runtime';
import type { JsonValue } from '@protobuf-ts/runtime';
import type { JsonReadOptions } from '@protobuf-ts/runtime';
import type { JsonWriteOptions } from '@protobuf-ts/runtime';
import { MessageType } from '@protobuf-ts/runtime';
export interface DoubleValue {
  value: number;
}
export interface FloatValue {
  value: number;
}
export interface Int64Value {
  value: bigint;
}
export interface UInt64Value {
  value: bigint;
}
export interface Int32Value {
  value: number;
}
export interface UInt32Value {
  value: number;
}
export interface BoolValue {
  value: boolean;
}
export interface StringValue {
  value: string;
}
export interface BytesValue {
  value: Uint8Array;
}
declare class DoubleValue$Type extends MessageType<DoubleValue> {
  constructor();
  internalJsonWrite(message: DoubleValue, options: JsonWriteOptions): JsonValue;
  internalJsonRead(
    json: JsonValue,
    options: JsonReadOptions,
    target?: DoubleValue,
  ): DoubleValue;
  create(value?: PartialMessage<DoubleValue>): DoubleValue;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: DoubleValue,
  ): DoubleValue;
  internalBinaryWrite(
    message: DoubleValue,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const DoubleValue: DoubleValue$Type;
declare class FloatValue$Type extends MessageType<FloatValue> {
  constructor();
  internalJsonWrite(message: FloatValue, options: JsonWriteOptions): JsonValue;
  internalJsonRead(
    json: JsonValue,
    options: JsonReadOptions,
    target?: FloatValue,
  ): FloatValue;
  create(value?: PartialMessage<FloatValue>): FloatValue;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: FloatValue,
  ): FloatValue;
  internalBinaryWrite(
    message: FloatValue,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const FloatValue: FloatValue$Type;
declare class Int64Value$Type extends MessageType<Int64Value> {
  constructor();
  internalJsonWrite(message: Int64Value, options: JsonWriteOptions): JsonValue;
  internalJsonRead(
    json: JsonValue,
    options: JsonReadOptions,
    target?: Int64Value,
  ): Int64Value;
  create(value?: PartialMessage<Int64Value>): Int64Value;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Int64Value,
  ): Int64Value;
  internalBinaryWrite(
    message: Int64Value,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const Int64Value: Int64Value$Type;
declare class UInt64Value$Type extends MessageType<UInt64Value> {
  constructor();
  internalJsonWrite(message: UInt64Value, options: JsonWriteOptions): JsonValue;
  internalJsonRead(
    json: JsonValue,
    options: JsonReadOptions,
    target?: UInt64Value,
  ): UInt64Value;
  create(value?: PartialMessage<UInt64Value>): UInt64Value;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: UInt64Value,
  ): UInt64Value;
  internalBinaryWrite(
    message: UInt64Value,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const UInt64Value: UInt64Value$Type;
declare class Int32Value$Type extends MessageType<Int32Value> {
  constructor();
  internalJsonWrite(message: Int32Value, options: JsonWriteOptions): JsonValue;
  internalJsonRead(
    json: JsonValue,
    options: JsonReadOptions,
    target?: Int32Value,
  ): Int32Value;
  create(value?: PartialMessage<Int32Value>): Int32Value;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Int32Value,
  ): Int32Value;
  internalBinaryWrite(
    message: Int32Value,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const Int32Value: Int32Value$Type;
declare class UInt32Value$Type extends MessageType<UInt32Value> {
  constructor();
  internalJsonWrite(message: UInt32Value, options: JsonWriteOptions): JsonValue;
  internalJsonRead(
    json: JsonValue,
    options: JsonReadOptions,
    target?: UInt32Value,
  ): UInt32Value;
  create(value?: PartialMessage<UInt32Value>): UInt32Value;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: UInt32Value,
  ): UInt32Value;
  internalBinaryWrite(
    message: UInt32Value,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const UInt32Value: UInt32Value$Type;
declare class BoolValue$Type extends MessageType<BoolValue> {
  constructor();
  internalJsonWrite(message: BoolValue, options: JsonWriteOptions): JsonValue;
  internalJsonRead(
    json: JsonValue,
    options: JsonReadOptions,
    target?: BoolValue,
  ): BoolValue;
  create(value?: PartialMessage<BoolValue>): BoolValue;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: BoolValue,
  ): BoolValue;
  internalBinaryWrite(
    message: BoolValue,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const BoolValue: BoolValue$Type;
declare class StringValue$Type extends MessageType<StringValue> {
  constructor();
  internalJsonWrite(message: StringValue, options: JsonWriteOptions): JsonValue;
  internalJsonRead(
    json: JsonValue,
    options: JsonReadOptions,
    target?: StringValue,
  ): StringValue;
  create(value?: PartialMessage<StringValue>): StringValue;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: StringValue,
  ): StringValue;
  internalBinaryWrite(
    message: StringValue,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const StringValue: StringValue$Type;
declare class BytesValue$Type extends MessageType<BytesValue> {
  constructor();
  internalJsonWrite(message: BytesValue, options: JsonWriteOptions): JsonValue;
  internalJsonRead(
    json: JsonValue,
    options: JsonReadOptions,
    target?: BytesValue,
  ): BytesValue;
  create(value?: PartialMessage<BytesValue>): BytesValue;
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: BytesValue,
  ): BytesValue;
  internalBinaryWrite(
    message: BytesValue,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter;
}
export declare const BytesValue: BytesValue$Type;
export {};
