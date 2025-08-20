import { Module } from '@nestjs/common';
import { LoginOauthService } from './login-oauth.service';
import { LoginOauthController } from './login-oauth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginOauth } from './entities/login-oauth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoginOauth])],
  controllers: [LoginOauthController],
  providers: [LoginOauthService],
})
export class LoginOauthModule {}
