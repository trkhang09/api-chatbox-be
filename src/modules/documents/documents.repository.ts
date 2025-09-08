import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsRepository extends Repository<Document> {}
