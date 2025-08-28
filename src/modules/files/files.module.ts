import { Module } from '@nestjs/common';
import { FileService } from './file.service';

@Module({
  imports: [],
  providers: [FileService],
  controllers: [],
})
export class FileModule {}
