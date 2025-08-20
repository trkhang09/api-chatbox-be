import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LoginOauthService } from './login-oauth.service';
@Controller('login-oauth')
export class LoginOauthController {
  constructor(private readonly loginOauthService: LoginOauthService) {}

}
