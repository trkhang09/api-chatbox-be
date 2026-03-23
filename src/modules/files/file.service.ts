import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { AllowedFileTypes } from 'src/common/enums/allowed-file-type.enum';
import { Document } from '../documents/entities/document.entity';
import { Repository } from 'typeorm';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';

const UPLOAD_DIR_NAME = 'uploads';
const INVLAID_FILE_NAME_REGEX = /[\/\\:*?<>]/;

@Injectable()
export class FileService {
  private readonly uploadDir = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    UPLOAD_DIR_NAME,
  );

  constructor(
    @InjectRepository(Document)
    private readonly docRepo: Repository<Document>,
  ) {
    fs.promises.mkdir(this.uploadDir, { recursive: true });
  }
}
