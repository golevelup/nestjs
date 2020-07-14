import { HasuraActionHandler } from '../../hasura.decorators';
import { Injectable } from '@nestjs/common';

interface SomeKindOfInput {
  val1: number;
  val2: string;
}

@Injectable()
export class ExampleService {
  @HasuraActionHandler()
  performAction(input: SomeKindOfInput) {
    console.log('whut');
  }

  nonActionThing() {
    console.log('whut');
  }
}

export const exampleServiceText = `
import { HasuraActionHandler } from '../../hasura.decorators';
import { Injectable } from '@nestjs/common';

interface SomeKindOfInput {
  val1: number;
  val2: string;
}

@Injectable()
export class ExampleService {
  @HasuraActionHandler()
  performAction(input: SomeKindOfInput) {
    console.log('whut');
  }

  nonActionThing() {
    console.log('whut');
  }
}
`;
