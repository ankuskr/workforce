import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { OtpType } from '../entities/otp.entity';
import { OtpService } from '../services/otp.service';
import { EmailService } from '../services/email.service';
import {
  SignupDto,
  VerifyOtpDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordWithOtpDto,
} from './dto';

// Store pending signups temporarily (in production, use Redis)
const pendingSignups = new Map<string, { name: string; password: string; expiresAt: Date }>();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
  ) {}

  async initiateSignup(signupDto: SignupDto): Promise<{ message: string }> {
    const { email, name, password } = signupDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new ConflictException('User with this email already exists');
      }
      // User exists but not verified - allow re-signup
      await this.userRepository.delete({ id: existingUser.id });
    }

    // Hash password and store pending signup
    const hashedPassword = await bcrypt.hash(password, 10);
    pendingSignups.set(email, {
      name,
      password: hashedPassword,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Generate and send OTP
    const otp = await this.otpService.createOtp(email, OtpType.SIGNUP);
    await this.emailService.sendOtpEmail(email, otp, 'signup');

    return { message: 'OTP sent to your email. Please verify to complete signup.' };
  }

  async verifySignupOtp(verifyOtpDto: VerifyOtpDto): Promise<{ user: Partial<User>; token: string }> {
    const { email, code } = verifyOtpDto;

    // Verify OTP
    await this.otpService.verifyOtp(email, code, OtpType.SIGNUP);

    // Get pending signup data
    const pendingData = pendingSignups.get(email);
    if (!pendingData || pendingData.expiresAt < new Date()) {
      pendingSignups.delete(email);
      throw new BadRequestException('Signup session expired. Please start again.');
    }

    // Create user
    const user = this.userRepository.create({
      email,
      name: pendingData.name,
      password: pendingData.password,
      isEmailVerified: true,
    });

    await this.userRepository.save(user);
    pendingSignups.delete(email);

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async resendSignupOtp(email: string): Promise<{ message: string }> {
    const pendingData = pendingSignups.get(email);
    if (!pendingData) {
      throw new BadRequestException('No pending signup found. Please start signup again.');
    }

    // Extend the pending signup expiry
    pendingData.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Generate and send new OTP
    const otp = await this.otpService.createOtp(email, OtpType.SIGNUP);
    await this.emailService.sendOtpEmail(email, otp, 'signup');

    return { message: 'OTP resent successfully.' };
  }

  async login(loginDto: LoginDto): Promise<{ user: Partial<User>; token: string }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, you will receive a reset code.' };
    }

    // Generate and send OTP
    const otp = await this.otpService.createOtp(email, OtpType.FORGOT_PASSWORD);
    await this.emailService.sendOtpEmail(email, otp, 'reset');

    return { message: 'If the email exists, you will receive a reset code.' };
  }

  async resetPasswordWithOtp(resetDto: ResetPasswordWithOtpDto): Promise<{ message: string }> {
    const { email, code, newPassword } = resetDto;

    // Verify OTP
    await this.otpService.verifyOtp(email, code, OtpType.FORGOT_PASSWORD);

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password reset successfully. You can now login with your new password.' };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
