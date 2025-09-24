import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { ResponseDocumentDto } from './dtos/response-document.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';
import { GetPaginatedDocumentsDto } from './dtos/get-paginated-documents.dto';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { ResponseCreatedDocumentDto } from './dtos/response-created-document.dto';
import { User } from '../users/entities/user.entity';
import { UpdateDocumentDto } from './dtos/update-document.dto';
import { ResponseUpdatedDocumentDto } from './dtos/response-updated-document.dto';
import { ClientProxy } from '@nestjs/microservices';
import { FileService } from '../files/file.service';
import { ResponseDetailedDocumentDto } from './dtos/response-detailed-document.dto';
import { createDashboardRequestDto } from 'src/common/utils/create-dashboard-request-dto';
import { DocumentStatus } from 'src/common/enums/document-status.enum';
import { validateDashboardRequest } from 'src/common/utils/validate-dashboard-request';
import { isNumber } from 'class-validator';
import { ResponseQuantityDocumentDto } from './dtos/response-quantity-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @Inject('DOCUMENT_CHUNKS_SERVICE') private client: ClientProxy,
    @InjectRepository(Document)
    private readonly docRepo: Repository<Document>,
    private readonly fileService: FileService,
  ) {}

  /**
   * get list quantities of latest documents in latest 12 months
   * @param query
   * @returns Promise<Array<ResponseDocumentDto>>
   * @throws BadRequestException
   * @throws InternalServerErrorException
   */
  async getQuantitiesLatestDocuments(): Promise<ResponseQuantityDocumentDto[]> {
    try {
      const docs = await this.docRepo.find({
        select: { createdAt: true, status: true },
      });

      const recentMonth = new Date().getMonth();
      const months = Array.from({ length: 12 }).map((_, month) => month);

      while (months[11] !== recentMonth) {
        const removedMonth = months.pop();
        removedMonth && months.unshift(removedMonth);
      }

      const response = months.map(
        (month) => new ResponseQuantityDocumentDto(month),
      );

      docs.forEach((doc) => {
        const createdMonth = doc.createdAt.getMonth();
        const createdMonthIndex = months.indexOf(createdMonth);

        switch (doc.status) {
          case DocumentStatus.PENDING:
            response[createdMonthIndex].pending++;
            break;
          case DocumentStatus.PROGRESSING:
            response[createdMonthIndex].progressing++;
            break;
          case DocumentStatus.DONE:
            response[createdMonthIndex].done++;
            break;
        }
      });

      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        'Cannot get quantities of latest documents',
      );
    }
  }

  /**
   * get paginated list of documents
   * @param query
   * @returns Promise<ResponsePaginateDto<ResponseDocumentDto>>
   * @throws InternalServerErrorException
   */
  async getPaginatedDocuments(
    query: GetPaginatedDocumentsDto,
  ): Promise<ResponsePaginateDto<ResponseDocumentDto>> {
    const whereCondititon: FindOptionsWhere<Document> = {
      title: Like(`%${query.searchTitleKeyword}%`),
    };

    if (query.status !== undefined) {
      whereCondititon.status = query.status;
    }

    try {
      const [docs, total] = await this.docRepo.findAndCount({
        where: whereCondititon,
        take: query.size,
        skip: (query.page - 1) * query.size,
        order: {
          updatedAt: { direction: 'DESC', nulls: 'FIRST' },
        },
      });

      const data: ResponseDocumentDto[] = [];
      for (const doc of docs) {
        const dto = new ResponseDocumentDto();
        Object.keys(dto).forEach((k) => {
          dto[k] = doc[k];
        });

        data.push(dto);
      }

      return new ResponsePaginateDto<ResponseDocumentDto>({
        page: query.page,
        size: query.size,
        data,
        total,
        totalInPage: docs.length,
        totalPage: Math.ceil(total / query.size),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Cannot get paginated list of documents: ' + error.message,
      );
    }
  }

  /**
   * get a specific document by its id
   * @param id
   * @returns Promise<ResponseDetailedDocumentDto>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async getDocument(id: string): Promise<ResponseDetailedDocumentDto> {
    const foundDoc = await this.findDocumentById(id);

    const dto = new ResponseDetailedDocumentDto();
    Object.keys(dto).forEach((k) => {
      dto[k] = foundDoc[k];
    });

    return dto;
  }

  /**
   * upload new document
   * @param document
   * @param body
   * @param user
   * @returns Promise<ResponseCreatedDocumentDto>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async createDocument(
    body: CreateDocumentDto,
    user: User,
  ): Promise<ResponseCreatedDocumentDto> {
    const size = await this.fileService.readFileSize(body.filePath);

    try {
      const savedDoc = await this.docRepo.save({
        ...body,
        description: body.description ?? '',
        size,
        createdByUserId: user.id,
      });

      this.client.emit('document_chunks_created', {
        document_id: savedDoc.id,
        file_path: savedDoc.filePath,
      });

      const dto = new ResponseCreatedDocumentDto();
      Object.keys(dto).forEach((k) => {
        dto[k] = savedDoc[k];
      });

      return dto;
    } catch (error) {
      throw new InternalServerErrorException(
        'Cannot create new document: ' + error.message,
      );
    }
  }

  /**
   * update a document and its reference file
   * @param id
   * @param body
   * @param user
   * @returns Promise<ResponseUpdatedDocumentDto>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async updateDocument(
    id: string,
    body: UpdateDocumentDto,
    user: User,
  ): Promise<ResponseUpdatedDocumentDto> {
    const foundDoc = await this.findDocumentById(id);

    foundDoc.title = body.title;
    foundDoc.description = body.description ?? '';
    foundDoc.updatedByUserId = user.id;

    try {
      const savedDoc = await this.docRepo.save(foundDoc);

      const dto = new ResponseUpdatedDocumentDto();
      Object.keys(dto).forEach((k) => {
        dto[k] = savedDoc[k];
      });

      return dto;
    } catch (error) {
      throw new InternalServerErrorException(
        'Cannot update document: ' + error.message,
      );
    }
  }

  /**
   * softly delete a document
   * @param id
   * @param user
   * @returns Promise<boolean>
   * @throws InternalServerErrorExceptionx
   */
  async removeDocument(id: string): Promise<boolean> {
    try {
      await this.docRepo.softDelete(id);

      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        'Cannot remove document: ' + error.message,
      );
    }
  }

  /**
   * find a document by its id
   * @param id
   * @returns Promise<Document>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  private async findDocumentById(id: string): Promise<Document> {
    let foundDoc: Document | null;

    try {
      foundDoc = await this.docRepo.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Cannot find document: ' + error.message,
      );
    }

    if (!foundDoc) {
      throw new NotFoundException('Document not found');
    }

    return foundDoc;
  }
}
