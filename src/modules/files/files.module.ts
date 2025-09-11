import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './files.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [PermissionsModule, TypeOrmModule.forFeature([Document])],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
