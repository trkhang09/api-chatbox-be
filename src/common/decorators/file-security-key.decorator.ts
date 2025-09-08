import { SetMetadata } from '@nestjs/common';

export const IS_FILE_SECURITY_KEY = 'isFileSecurityKey';
export const FileSecurityKey = () => SetMetadata(IS_FILE_SECURITY_KEY, true);
