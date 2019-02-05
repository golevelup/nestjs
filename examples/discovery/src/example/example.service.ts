import { Injectable } from '@nestjs/common';
import { Custom } from './../custom.decorator';

@Custom()
@Injectable()
export class ExampleService {}
