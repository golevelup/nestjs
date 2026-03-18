import { Module } from '@nestjs/common';
import { SubmoduleController } from './submodule.controller';

@Module({
  providers: [SubmoduleController],
})
export class SubmoduleModule {}
