import { Test, TestingModule } from '@nestjs/testing';
import { DocumentChunksController } from './document-chunks.controller';

describe('DocumentChunksController', () => {
  let controller: DocumentChunksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentChunksController],
    }).compile();

    controller = module.get<DocumentChunksController>(DocumentChunksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
