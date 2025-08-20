import { Test, TestingModule } from '@nestjs/testing';
import { LoginOauthService } from './login-oauth.service';

describe('LoginOauthService', () => {
  let service: LoginOauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginOauthService],
    }).compile();

    service = module.get<LoginOauthService>(LoginOauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
