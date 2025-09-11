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

  /**
   * Upload file (only supports docx and pdf)
   * @param file
   * @param fileName
   * Promise<string>
   * @throws BadRequestException
   * @throws InternalServerErrorException
   */
  async upload(file: Express.Multer.File, fileName: string): Promise<string> {
    const extension = Object.keys(AllowedFileTypes).find(
      (k) => AllowedFileTypes[k] === file.mimetype,
    );

    if (!extension) {
      throw new BadRequestException(
        'Only PDF and DOCX files are allowed for upload',
      );
    }

    fileName = this.createFileName(fileName, extension);

    if (!this.isValidFileName(fileName)) {
      throw new BadRequestException('Invalid file name');
    }

    const targetPath = path.join(this.uploadDir, fileName);
    await fs.promises.writeFile(targetPath, file.buffer);

    return fileName;
  }

  /**
   * Remove a file
   * @returns Promise<boolean>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async remove(fileName: string): Promise<boolean> {
    try {
      if (await this.docRepo.exists({ where: { filePath: fileName } })) {
        throw new InternalServerErrorException('File is already used');
      }

      const targetPath = path.join(this.uploadDir, fileName);

      await fs.promises.unlink(targetPath);
      return true;
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new NotFoundException('File not found');
      }

      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * Get file buffer (to serve or process)
   * @return Promise<Buffer>
   * @throws NotFoundException
   */
  async getFileBuffer(fileName: string): Promise<Buffer> {
    try {
      const targetPath = path.join(this.uploadDir, fileName);

      return await fs.promises.readFile(targetPath);
    } catch (err) {
      throw new NotFoundException('File not found');
    }
  }

  /**
   * Get all files in the uploads folder
   * @returns Promise<string[]>
   * @throws InternalServerErrorException
   */
  async getAllFiles(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        await fs.promises.mkdir(this.uploadDir, { recursive: true });
      }

      const files = fs.readdirSync(this.uploadDir);

      return files;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error reading upload folder: ' + error.message,
      );
    }
  }

  /**
   * Rename a file name
   * @param oldFileName
   * @param newFileName
   * @returns Promise<string>
   */
  async rename(oldFileName: string, newFileName: string): Promise<string> {
    try {
      if (await this.docRepo.exists({ where: { filePath: oldFileName } })) {
        throw new InternalServerErrorException('File is already used');
      }

      const targetPath = path.join(this.uploadDir, oldFileName);
      const ext = path.extname(oldFileName);

      newFileName = this.createFileName(newFileName, ext);
      const newPath = path.join(this.uploadDir, newFileName);

      fs.renameSync(targetPath, newPath);

      return newFileName;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException('File not found');
      }

      throw new InternalServerErrorException(
        'Cannot rename file: ' + error.message,
      );
    }
  }

  /**
   * Read file's size
   * @param fileName
   * @returns Promise<number>
   * @throws NotFoundException
   * @throws InternalServerErrorException
   */
  async readFileSize(fileName: string): Promise<number> {
    try {
      const targetPath = path.join(this.uploadDir, fileName);

      const stats = fs.statSync(targetPath);

      return stats.size;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException('File not found');
      }

      throw new InternalServerErrorException(
        "Cannot read file's size: " + error.message,
      );
    }
  }

  /**
   * check a valid file name
   * @param fileName
   * @returns boolean
   */
  private isValidFileName(fileName: string): boolean {
    if (INVLAID_FILE_NAME_REGEX.test(fileName)) {
      return false;
    }

    const parts = fileName.split('.');
    if (parts.length < 2) {
      return false;
    }

    const extension = parts.pop()?.toLowerCase();

    if (!extension || !Object.keys(AllowedFileTypes).includes(extension)) {
      return false;
    }

    const baseName = parts.join('.');
    if (!baseName || baseName.trim().length === 0) {
      return false;
    }

    return true;
  }

  /**
   *create a file name which is ready for storing
   * @param fileName
   * @param extension
   * @returns
   */
  private createFileName(fileName: string, extension: string): string {
    const allowedExtensions = Object.keys(AllowedFileTypes);

    extension = extension.replaceAll('.', '');
    allowedExtensions.forEach((ext) => {
      fileName = fileName.replaceAll(ext, '');
    });
    fileName.replaceAll(' ', '_');

    if (!allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        'Only PDF and DOCX files are allowed for upload',
      );
    }

    const timestampt = new Date().toISOString().replaceAll(':', '-');
    fileName = `${fileName}-${timestampt}.${extension}`;

    return fileName;
  }
}
