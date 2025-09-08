import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Document } from './entities/document.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FileModule } from '../files/files.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    FileModule,
    ClientsModule.register([
      {
        name: 'DOCUMENT_CHUNKS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [String(process.env.RABBITMQ_URL)],
          queue: String(process.env.RABBITMQ_QUEUE),
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
