"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer = exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer = exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer = exports.Level5ProtocolBuffer = void 0;
const runtime_1 = require("@protobuf-ts/runtime");
const runtime_2 = require("@protobuf-ts/runtime");
const runtime_3 = require("@protobuf-ts/runtime");
const runtime_4 = require("@protobuf-ts/runtime");
class Level5ProtocolBuffer$Type extends runtime_4.MessageType {
    constructor() {
        super('example.level5.Level5ProtocolBuffer', [
            { no: 1, name: 'field1', kind: 'scalar', T: 9 },
            { no: 2, name: 'field2', kind: 'scalar', T: 5 },
            { no: 3, name: 'field3', kind: 'scalar', T: 8 },
            { no: 4, name: 'field4', kind: 'scalar', T: 1 },
            { no: 5, name: 'field5', kind: 'scalar', T: 12 },
            {
                no: 6,
                name: 'field6',
                kind: 'scalar',
                repeat: 2,
                T: 9,
            },
            { no: 7, name: 'field7', kind: 'scalar', T: 2 },
            {
                no: 8,
                name: 'field8',
                kind: 'scalar',
                T: 3,
                L: 0,
            },
            {
                no: 9,
                name: 'nested1',
                kind: 'message',
                T: () => exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer,
            },
        ]);
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.field1 = '';
        message.field2 = 0;
        message.field3 = false;
        message.field4 = 0;
        message.field5 = new Uint8Array(0);
        message.field6 = [];
        message.field7 = 0;
        message.field8 = 0n;
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.field1 = reader.string();
                    break;
                case 2:
                    message.field2 = reader.int32();
                    break;
                case 3:
                    message.field3 = reader.bool();
                    break;
                case 4:
                    message.field4 = reader.double();
                    break;
                case 5:
                    message.field5 = reader.bytes();
                    break;
                case 6:
                    message.field6.push(reader.string());
                    break;
                case 7:
                    message.field7 = reader.float();
                    break;
                case 8:
                    message.field8 = reader.int64().toBigInt();
                    break;
                case 9:
                    message.nested1 =
                        exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer.internalBinaryRead(reader, reader.uint32(), options, message.nested1);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.field1 !== '')
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.field1);
        if (message.field2 !== 0)
            writer.tag(2, runtime_1.WireType.Varint).int32(message.field2);
        if (message.field3 !== false)
            writer.tag(3, runtime_1.WireType.Varint).bool(message.field3);
        if (message.field4 !== 0)
            writer.tag(4, runtime_1.WireType.Bit64).double(message.field4);
        if (message.field5.length)
            writer.tag(5, runtime_1.WireType.LengthDelimited).bytes(message.field5);
        for (let i = 0; i < message.field6.length; i++)
            writer.tag(6, runtime_1.WireType.LengthDelimited).string(message.field6[i]);
        if (message.field7 !== 0)
            writer.tag(7, runtime_1.WireType.Bit32).float(message.field7);
        if (message.field8 !== 0n)
            writer.tag(8, runtime_1.WireType.Varint).int64(message.field8);
        if (message.nested1)
            exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer.internalBinaryWrite(message.nested1, writer.tag(9, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.Level5ProtocolBuffer = new Level5ProtocolBuffer$Type();
class Level5ProtocolBuffer_Nested1L5ProtocolBuffer$Type extends runtime_4.MessageType {
    constructor() {
        super('example.level5.Level5ProtocolBuffer.Nested1L5ProtocolBuffer', [
            {
                no: 1,
                name: 'nestedField1',
                kind: 'scalar',
                T: 9,
            },
            {
                no: 2,
                name: 'nested2',
                kind: 'message',
                T: () => exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer,
            },
        ]);
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.nestedField1 = '';
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.nestedField1 = reader.string();
                    break;
                case 2:
                    message.nested2 =
                        exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer.internalBinaryRead(reader, reader.uint32(), options, message.nested2);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.nestedField1 !== '')
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.nestedField1);
        if (message.nested2)
            exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer.internalBinaryWrite(message.nested2, writer.tag(2, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer = new Level5ProtocolBuffer_Nested1L5ProtocolBuffer$Type();
class Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer$Type extends runtime_4.MessageType {
    constructor() {
        super('example.level5.Level5ProtocolBuffer.Nested1L5ProtocolBuffer.Nested2L5ProtocolBuffer', [
            {
                no: 1,
                name: 'nestedField2',
                kind: 'scalar',
                T: 5,
            },
            {
                no: 2,
                name: 'nested3',
                kind: 'message',
                T: () => exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer,
            },
        ]);
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.nestedField2 = 0;
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.nestedField2 = reader.int32();
                    break;
                case 2:
                    message.nested3 =
                        exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer.internalBinaryRead(reader, reader.uint32(), options, message.nested3);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.nestedField2 !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.nestedField2);
        if (message.nested3)
            exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer.internalBinaryWrite(message.nested3, writer.tag(2, runtime_1.WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer = new Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer$Type();
class Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer$Type extends runtime_4.MessageType {
    constructor() {
        super('example.level5.Level5ProtocolBuffer.Nested1L5ProtocolBuffer.Nested2L5ProtocolBuffer.Nested3L5ProtocolBuffer', [
            {
                no: 1,
                name: 'nestedField3',
                kind: 'scalar',
                T: 8,
            },
        ]);
    }
    create(value) {
        const message = globalThis.Object.create(this.messagePrototype);
        message.nestedField3 = false;
        if (value !== undefined)
            (0, runtime_3.reflectionMergePartial)(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case 1:
                    message.nestedField3 = reader.bool();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === 'throw')
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        if (message.nestedField3 !== false)
            writer.tag(1, runtime_1.WireType.Varint).bool(message.nestedField3);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
exports.Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer = new Level5ProtocolBuffer_Nested1L5ProtocolBuffer_Nested2L5ProtocolBuffer_Nested3L5ProtocolBuffer$Type();
//# sourceMappingURL=level5.js.map