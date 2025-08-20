import { Test, TestingModule } from '@nestjs/testing';
import { DocumentChunksService } from './document-chunks.service';

describe('DocumentChunksService', () => {
  let service: DocumentChunksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentChunksService],
    }).compile();

    service = module.get<DocumentChunksService>(DocumentChunksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
