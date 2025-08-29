import { Module } from '@nestjs/common';
import { OpenaiController } from './openai.controller';
import { OpenaiService } from './openai.service';

@Module({
  providers: [OpenaiService],
  controllers: [OpenaiController],
  exports: [OpenaiService],
})
export class OpenaiModule {}
