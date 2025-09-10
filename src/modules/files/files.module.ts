import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './files.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
