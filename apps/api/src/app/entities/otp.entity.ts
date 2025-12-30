import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum OtpType {
  SIGNUP = 'signup',
  FORGOT_PASSWORD = 'forgot_password',
}

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ length: 6 })
  code: string;

  @Column({ type: 'varchar', length: 20 })
  type: OtpType;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
