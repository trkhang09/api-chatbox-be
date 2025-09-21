import { appDataSource } from 'src/data-source';
import { NotFoundException } from '@nestjs/common';
import { Document } from 'src/modules/documents/entities/document.entity';
import { DocumentStatus } from 'src/common/enums/document-status.enum';
import { FileService } from 'src/modules/files/file.service';
import { In, Repository } from 'typeorm';
import seededDocs from './documents.factory.json';

export class DocumentFactory {
  public async run(): Promise<void> {
    const repo = appDataSource.getRepository(Document);

    const foundDocs = await repo.find({
      where: { title: In(seededDocs.map((d) => d.title)) },
    });

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

        const existDoc = foundDocs.find((d) => d.title === doc.title) ?? {};

        return {
          ...existDoc,
          ...doc,
          ...(await this.getRandomFileInfo(repo)),
          status,
          progress,
        };
      }),
    );

    await repo.save(documents);
  }

  public async truncate(): Promise<void> {
    await appDataSource.query(
      `TRUNCATE TABLE "document_chunks" RESTART IDENTITY CASCADE;`,
    );

    await appDataSource.query(
      `TRUNCATE TABLE "documents" RESTART IDENTITY CASCADE;`,
    );
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
  const seeder = new DocumentFactory();
  const args = process.argv.slice(2);
  const hasTruncate = args.includes('-c');

  try {
    await appDataSource.initialize();

    if (hasTruncate) {
      await seeder.truncate();
    } else {
      await seeder.run();
    }

    await appDataSource.destroy();
    process.exit(0);
  } catch (error) {
    throw new Error(
      `Error ${hasTruncate ? 'truncate' : 'create'} documents: ${error.message}`,
    );
  } finally {
    process.exit(1);
  }
})();
