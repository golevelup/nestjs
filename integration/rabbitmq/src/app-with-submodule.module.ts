import { Module } from '@nestjs/common';
import { NamedConnectionSubmoduleModule } from './named-connection-submodule/named-connection-submodule.module';

@Module({
  imports: [NamedConnectionSubmoduleModule],
  controllers: [],
  providers: [],
})
export class AppWithSubModuleModule {}
