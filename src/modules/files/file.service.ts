import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR_NAME = 'uploads';

enum AllowedFileTypes {
  pdf = 'application/pdf',
  docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

@Injectable()
export class FileService {
  private readonly uploadDir = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    UPLOAD_DIR_NAME,
  );

  constructor() {
    fs.promises.mkdir(this.uploadDir, { recursive: true });
  }

  /**
   * Upload file (only supports docx and pdf)
   * @param file
   * @param fileName
   * Promise<string>
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
   * check a valid file name
   * @param fileName
   * @returns boolean
   */
  private isValidFileName(fileName: string): boolean {
    if (fileName.includes('/') || fileName.includes('\\')) {
      return false;
    }

    if (/\s/.test(fileName)) {
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
    extension = extension.replace('.', '');

    if (!Object.keys(AllowedFileTypes).includes(extension)) {
      throw new BadRequestException(
        'Only PDF and DOCX files are allowed for upload',
      );
    }

    fileName = `${fileName}-${new Date().toISOString()}.${extension}`;

    return fileName;
  }
}
