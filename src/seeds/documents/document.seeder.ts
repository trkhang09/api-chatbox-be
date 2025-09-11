import { appDataSource } from 'src/data-source';
import { NotFoundException } from '@nestjs/common';
import seededDocs from './documents.seeder.json';
import { Document } from 'src/modules/documents/entities/document.entity';
import { DocumentStatus } from 'src/common/enums/document-status.enum';
import { FileService } from 'src/modules/files/file.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class DocumentSeeder {
  public async run(): Promise<void> {
    const repo = appDataSource.getRepository(Document);

    const documents = await Promise.all(
      seededDocs.map(async (doc) => {
        const status: DocumentStatus = Object.values(DocumentStatus).includes(
          doc.status,
        )
          ? doc.status
          : DocumentStatus.PENDING;

        let progress: number;
        switch (status) {
          case DocumentStatus.PENDING:
            progress = 0;
            break;
          case DocumentStatus.PROGRESSING:
            progress = Math.floor(Math.random() * 100);

            if (progress === 0) {
              progress = 1;
            }
            break;
          case DocumentStatus.DONE:
            progress = 100;
            break;
        }

        return {
          ...doc,
          ...(await this.getRandomFileInfo(repo)),
          status,
          progress,
        };
      }),
    );

    await repo.insert(documents);
  }

  private async getRandomFileInfo(docRepo: Repository<Document>): Promise<{
    filePath: string;
    size: number;
  }> {
    const fileService = new FileService(docRepo);
    const files = await fileService.getAllFiles();

    if (files.length === 0) {
      throw new NotFoundException('No files found in uploads');
    }

    const filePath = files[Math.floor(Math.random() * files.length)];
    const size = await fileService.readFileSize(filePath);

    return {
      filePath,
      size,
    };
  }
}

(async () => {
  try {
    const seeder = new DocumentSeeder();

    await appDataSource.initialize();
    await seeder.run();
    await appDataSource.destroy();
    process.exit(0);
  } catch (error) {
    throw new Error(`Error seeding documents: ${error.message}`);
  } finally {
    process.exit(1);
  }
})();
