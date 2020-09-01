import { HasuraActionHandler } from '../../hasura.decorators';
import { Injectable } from '@nestjs/common';

interface InnerThing {
  some: boolean;
  thing: string;
}

interface SomeKindOfInput {
  val1: number;
  val2: string;
  someDate: Date;
  anotherThing: number | undefined;
  innerThing: InnerThing;
}

type SomeType = {
  in1: number;
  in2?: string;
};

@Injectable()
export class ExampleService {
  @HasuraActionHandler()
  performAction(input: SomeKindOfInput) {
    console.log('whut');
  }

  @HasuraActionHandler()
  nonActionThing(input: SomeType) {
    console.log('whut');
  }
}

export const exampleServiceText = `
import { HasuraActionHandler } from '../../hasura.decorators';
import { Injectable } from '@nestjs/common';

interface InnerThing {
  some: boolean;
  thing: string;
}

interface SomeKindOfInput {
  val1: number;
  val2: string;
  someDate: Date;
  anotherThing: number | undefined;
  innerThing: InnerThing;
}

type SomeType = {
  in1: number;
  in2?: string;
};

@Injectable()
export class ExampleService {
  @HasuraActionHandler()
  performAction(input: SomeKindOfInput) {
    console.log('whut');
  }

  @HasuraActionHandler()
  nonActionThing(input: SomeType) {
    console.log('whut');
  }
}
`;

export const basicInterfaceWithScalars = `
interface BasicInterfaceWithScalars {
  val1: number;
  val2?: string;
}
`;

export const basicInterfaceWithScalarsArrays = `
interface BasicInterfaceWithScalarArrays {
  val1: number[];
  val2?: string[];
}
`;
