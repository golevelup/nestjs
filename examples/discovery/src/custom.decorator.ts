import { ReflectMetadata } from '@nestjs/common';

export const CustomSymbol = Symbol('customSymbol');

export class Identifier {}

export const Custom = () => ReflectMetadata(CustomSymbol, new Identifier());
