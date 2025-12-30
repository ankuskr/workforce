import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Otp, OtpType } from '../entities/otp.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOtp(email: string, type: OtpType): Promise<string> {
    // Invalidate any existing OTPs for this email and type
    await this.otpRepository.update(
      { email, type, isUsed: false },
      { isUsed: true },
    );

    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const otp = this.otpRepository.create({
      email,
      code,
      type,
      expiresAt,
    });

    await this.otpRepository.save(otp);
    return code;
  }

  async verifyOtp(email: string, code: string, type: OtpType): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: {
        email,
        code,
        type,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    otp.isUsed = true;
    await this.otpRepository.save(otp);

    return true;
  }
}
