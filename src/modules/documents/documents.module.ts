import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Document } from './entities/document.entity';
import { FileModule } from '../files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), FileModule],
  providers: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
