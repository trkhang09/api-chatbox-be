import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './jwt/jwt-constants';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './jwt/jwt-auth.guard';
import { Otp } from '../otp/entities/otp.entity';
import { OtpModule } from '../otp/otp.module';
import { EmailModule } from '../email/email.module';
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Otp]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
    OtpModule,
    EmailModule,
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
