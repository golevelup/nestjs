"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BytesValue = exports.StringValue = exports.BoolValue = exports.UInt32Value = exports.Int32Value = exports.UInt64Value = exports.Int64Value = exports.FloatValue = exports.DoubleValue = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
const runtime_5 = require("@protobuf-ts/runtime");
const runtime_6 = require("@protobuf-ts/runtime");
class DoubleValue$Type extends runtime_6.MessageType {
    constructor() {
        super('google.protobuf.DoubleValue', [
            { no: 1, name: 'value', kind: 'scalar', T: 1 },
        ]);
    }
    internalJsonWrite(message, options) {
        return this.refJsonWriter.scalar(2, message.value, 'value', false, true);
    }
    internalJsonRead(json, options, target) {
        if (!target)
            target = this.create();
        target.value = this.refJsonReader.scalar(json, 1, undefined, 'value');
        return target;
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.value = 0;
        if (value !== undefined)
            (0, runtime_5.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            const [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.value = reader.double();
                    break;
                default:
                    const u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    const d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_4.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.value !== 0)
            writer.tag(1, runtime_3.WireType.Bit64).double(message.value);
        const u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_4.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.DoubleValue = new DoubleValue$Type();
class FloatValue$Type extends runtime_6.MessageType {
    constructor() {
        super('google.protobuf.FloatValue', [
            { no: 1, name: 'value', kind: 'scalar', T: 2 },
        ]);
    }
    internalJsonWrite(message, options) {
        return this.refJsonWriter.scalar(1, message.value, 'value', false, true);
    }
    internalJsonRead(json, options, target) {
        if (!target)
            target = this.create();
        target.value = this.refJsonReader.scalar(json, 1, undefined, 'value');
        return target;
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.value = 0;
        if (value !== undefined)
            (0, runtime_5.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            const [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.value = reader.float();
                    break;
                default:
                    const u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    const d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_4.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.value !== 0)
            writer.tag(1, runtime_3.WireType.Bit32).float(message.value);
        const u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_4.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.FloatValue = new FloatValue$Type();
class Int64Value$Type extends runtime_6.MessageType {
    constructor() {
        super('google.protobuf.Int64Value', [
            {
                no: 1,
                name: 'value',
                kind: 'scalar',
                T: 3,
                L: 0,
            },
        ]);
    }
    internalJsonWrite(message, options) {
        return this.refJsonWriter.scalar(runtime_1.ScalarType.INT64, message.value, 'value', false, true);
    }
    internalJsonRead(json, options, target) {
        if (!target)
            target = this.create();
        target.value = this.refJsonReader.scalar(json, runtime_1.ScalarType.INT64, runtime_2.LongType.BIGINT, 'value');
        return target;
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.value = 0n;
        if (value !== undefined)
            (0, runtime_5.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            const [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.value = reader.int64().toBigInt();
                    break;
                default:
                    const u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    const d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_4.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.value !== 0n)
            writer.tag(1, runtime_3.WireType.Varint).int64(message.value);
        const u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_4.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.Int64Value = new Int64Value$Type();
class UInt64Value$Type extends runtime_6.MessageType {
    constructor() {
        super('google.protobuf.UInt64Value', [
            {
                no: 1,
                name: 'value',
                kind: 'scalar',
                T: 4,
                L: 0,
            },
        ]);
    }
    internalJsonWrite(message, options) {
        return this.refJsonWriter.scalar(runtime_1.ScalarType.UINT64, message.value, 'value', false, true);
    }
    internalJsonRead(json, options, target) {
        if (!target)
            target = this.create();
        target.value = this.refJsonReader.scalar(json, runtime_1.ScalarType.UINT64, runtime_2.LongType.BIGINT, 'value');
        return target;
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.value = 0n;
        if (value !== undefined)
            (0, runtime_5.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            const [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.value = reader.uint64().toBigInt();
                    break;
                default:
                    const u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    const d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_4.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.value !== 0n)
            writer.tag(1, runtime_3.WireType.Varint).uint64(message.value);
        const u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_4.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.UInt64Value = new UInt64Value$Type();
class Int32Value$Type extends runtime_6.MessageType {
    constructor() {
        super('google.protobuf.Int32Value', [
            { no: 1, name: 'value', kind: 'scalar', T: 5 },
        ]);
    }
    internalJsonWrite(message, options) {
        return this.refJsonWriter.scalar(5, message.value, 'value', false, true);
    }
    internalJsonRead(json, options, target) {
        if (!target)
            target = this.create();
        target.value = this.refJsonReader.scalar(json, 5, undefined, 'value');
        return target;
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.value = 0;
        if (value !== undefined)
            (0, runtime_5.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            const [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.value = reader.int32();
                    break;
                default:
                    const u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    const d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_4.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.value !== 0)
            writer.tag(1, runtime_3.WireType.Varint).int32(message.value);
        const u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_4.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.Int32Value = new Int32Value$Type();
class UInt32Value$Type extends runtime_6.MessageType {
    constructor() {
        super('google.protobuf.UInt32Value', [
            { no: 1, name: 'value', kind: 'scalar', T: 13 },
        ]);
    }
    internalJsonWrite(message, options) {
        return this.refJsonWriter.scalar(13, message.value, 'value', false, true);
    }
    internalJsonRead(json, options, target) {
        if (!target)
            target = this.create();
        target.value = this.refJsonReader.scalar(json, 13, undefined, 'value');
        return target;
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.value = 0;
        if (value !== undefined)
            (0, runtime_5.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            const [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.value = reader.uint32();
                    break;
                default:
                    const u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    const d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_4.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.value !== 0)
            writer.tag(1, runtime_3.WireType.Varint).uint32(message.value);
        const u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_4.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.UInt32Value = new UInt32Value$Type();
class BoolValue$Type extends runtime_6.MessageType {
    constructor() {
        super('google.protobuf.BoolValue', [
            { no: 1, name: 'value', kind: 'scalar', T: 8 },
        ]);
    }
    internalJsonWrite(message, options) {
        return message.value;
    }
    internalJsonRead(json, options, target) {
        if (!target)
            target = this.create();
        target.value = this.refJsonReader.scalar(json, 8, undefined, 'value');
        return target;
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.value = false;
        if (value !== undefined)
            (0, runtime_5.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            const [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.value = reader.bool();
                    break;
                default:
                    const u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    const d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_4.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.value !== false)
            writer.tag(1, runtime_3.WireType.Varint).bool(message.value);
        const u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_4.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.BoolValue = new BoolValue$Type();
class StringValue$Type extends runtime_6.MessageType {
    constructor() {
        super('google.protobuf.StringValue', [
            { no: 1, name: 'value', kind: 'scalar', T: 9 },
        ]);
    }
    internalJsonWrite(message, options) {
        return message.value;
    }
    internalJsonRead(json, options, target) {
        if (!target)
            target = this.create();
        target.value = this.refJsonReader.scalar(json, 9, undefined, 'value');
        return target;
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.value = '';
        if (value !== undefined)
            (0, runtime_5.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            const [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.value = reader.string();
                    break;
                default:
                    const u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    const d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_4.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.value !== '')
            writer.tag(1, runtime_3.WireType.LengthDelimited).string(message.value);
        const u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_4.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.StringValue = new StringValue$Type();
class BytesValue$Type extends runtime_6.MessageType {
    constructor() {
        super('google.protobuf.BytesValue', [
            { no: 1, name: 'value', kind: 'scalar', T: 12 },
        ]);
    }
    internalJsonWrite(message, options) {
        return this.refJsonWriter.scalar(12, message.value, 'value', false, true);
    }
    internalJsonRead(json, options, target) {
        if (!target)
            target = this.create();
        target.value = this.refJsonReader.scalar(json, 12, undefined, 'value');
        return target;
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.value = new Uint8Array(0);
        if (value !== undefined)
            (0, runtime_5.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            const [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.value = reader.bytes();
                    break;
                default:
                    const u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    const d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_4.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.value.length)
            writer.tag(1, runtime_3.WireType.LengthDelimited).bytes(message.value);
        const u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_4.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.BytesValue = new BytesValue$Type();
//# sourceMappingURL=wrappers.js.map