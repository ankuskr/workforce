import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../entities/user.entity';
import { Otp } from '../entities/otp.entity';
import { OtpService } from '../services/otp.service';
import { EmailService } from '../services/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Otp]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'workforce-jwt-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OtpService, EmailService],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
