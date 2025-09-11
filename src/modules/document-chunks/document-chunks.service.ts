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
  async getListChunksOfDocument(docId: string): Promise<ResponseChunkDto[]> {
    try {
      const foundChunks = await this.docChunkRepo.find({
        where: { document: { id: docId } },
        order: { createdAt: { direction: 'ASC' } },
      });

      const responseChunks: ResponseChunkDto[] = [];

      foundChunks.forEach((chunk) => {
        const dto = new ResponseChunkDto();

        Object.keys(dto).forEach((k) => {
          dto[k] = chunk[k];
        });

        const cutConetnt = substringAtNearestSpace(
          chunk.content,
          ChunkConstants.MAX_CHAR_CONTENT,
        );
        dto.content = cutConetnt;

        responseChunks.push(dto);
      });

      return responseChunks;
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
