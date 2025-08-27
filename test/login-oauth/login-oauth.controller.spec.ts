import { Test, TestingModule } from '@nestjs/testing';
import { LoginOauthController } from '../../src/modules/login-oauth/login-oauth.controller';
import { LoginOauthService } from '../../src/modules/login-oauth/login-oauth.service';

describe('LoginOauthController', () => {
  let controller: LoginOauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginOauthController],
      providers: [LoginOauthService],
    }).compile();

    controller = module.get<LoginOauthController>(LoginOauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
