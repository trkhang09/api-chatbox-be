import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentChunks } from './entities/document-chunks.entity';
import { Repository } from 'typeorm';
import { ResponseChunkDto } from './dtos/response-chunk.dto';
import { ChunkConstants } from 'src/common/constants/chunk.constants';
import { substringAtNearestSpace } from 'src/common/utils/substring-at-nearest-space';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';

@Injectable()
export class DocumentChunksService {
  constructor(
    @InjectRepository(DocumentChunks)
    private readonly docChunkRepo: Repository<DocumentChunks>,
  ) {}

  /**
   * get list of chunks of a specific document
   * @param docId
   * @returns Promise<ResponseChunkDto[]>
   * @throws InternalServerErrorException
   */
  async getListChunksOfDocument(
    docId: string,
    query: PaginateDto,
  ): Promise<ResponsePaginateDto<ResponseChunkDto>> {
    try {
      const [foundChunks, total] = await this.docChunkRepo.findAndCount({
        where: { document: { id: docId } },
        order: { createdAt: { direction: 'ASC' } },
        skip: (query.page - 1) * query.size,
        take: query.size,
      });

      const data: ResponseChunkDto[] = [];

      foundChunks.forEach((chunk) => {
        const dto = new ResponseChunkDto();

        Object.keys(dto).forEach((k) => {
          dto[k] = chunk[k];
        });

        const cutContent = substringAtNearestSpace(
          chunk.content,
          ChunkConstants.MAX_CHAR_CONTENT,
        );
        dto.content = cutContent;

        data.push(dto);
      });

      const dto = new ResponsePaginateDto<ResponseChunkDto>({
        ...query,
        data,
        total,
        totalInPage: data.length,
        totalPage: Math.ceil(total / query.size),
      });

      return dto;
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot get list chunks of document with id = \`${docId}\`, ${error.message}`,
      );
    }
  }

  /**
   * get content of a specific chunk
   * @param docId
   * @returns Promise<ResponseChunkDto[]>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async getChunkContent(id: string): Promise<string> {
    let foundChunk: DocumentChunks | undefined;
    try {
      foundChunk = (await this.docChunkRepo
        .createQueryBuilder('chunk')
        .select('chunk.content', 'content')
        .where('chunk.id = :id', { id })
        .getRawOne<{ content: string }>()) as DocumentChunks;
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot get content of chunk with id = \`${id}\`, ${error.message}`,
      );
    }

    if (!foundChunk) {
      throw new NotFoundException('Chunk Not Found');
    }

    return foundChunk.content;
  }
}
