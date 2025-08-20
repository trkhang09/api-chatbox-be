import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return { text: 'Prettier and lint-staged!' };
  }
}
