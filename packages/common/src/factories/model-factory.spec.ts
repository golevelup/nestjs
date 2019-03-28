import { IsString, IsPositive } from 'class-validator';
import { generate, PropertyNamesOf } from './model-factory';

class TestAnimal {
  @IsString()
  name!: string;
}

class TestPerson {
  @IsString()
  name!: string;

  @IsPositive()
  age!: number;

  doSomething() {}
}

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T];

type FunctionPropertyObject<T> = { [K in FunctionPropertyNames<T>]: T[K] };

type SomethingElse = FunctionPropertyNames<TestPerson>;

type PersonObject = FunctionPropertyObject<TestPerson>;

describe('Model Factories', () => {
  it('should generate a valid model', () => {
    const person = generate<TestPerson>(TestPerson);

    console.log(person);
    expect(person).toBeInstanceOf(TestPerson);
  });
});
