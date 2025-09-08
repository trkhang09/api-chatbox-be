import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentsRepository } from './documents.repository';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @Inject('DOCUMENT_CHUNKS_SERVICE') private client: ClientProxy,
    @InjectRepository(Document) private documentRepository: DocumentsRepository,
  ) {}

  async createDocument(createDocumentDto: CreateDocumentDto) {
    // store document
    const documentStore = await this.documentRepository.save({
      description: createDocumentDto.description,
      filePath: createDocumentDto.filePath,
      title: createDocumentDto.title,
    });

    if (!documentStore) {
      throw new InternalServerErrorException('store fail,try again!!');
    }

    this.client.emit('document_chunks_created', {
      document_id: documentStore.id,
      file_path: documentStore.filePath,
    });

    return documentStore;
  }

  async getProgressDocument(documentId: string) {
    return this.documentRepository.findOne({
      where: {
        id: documentId,
      },
      select: {
        progress: true,
      },
    });
  }
}
