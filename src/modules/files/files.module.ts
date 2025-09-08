import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './files.controller';

@Module({
  imports: [],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
