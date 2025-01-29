import { EMAIL_SUBJECT } from '@/shared/constants/subjects';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { getChangePasswordLayout } from './utils/change-password';
import { getWelcomeLayout } from './utils/welcome';

interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

@Injectable()
export class EmailService {
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private async sendEmail({ to, subject, html, text }: EmailData): Promise<void> {
    await this.mailService.sendMail({
      from: this.configService.getOrThrow<string>('EMAIL_USER'),
      to,
      subject,
      html,
      text,
    });
  }

  public async sendWelcomeEmail(email: string, password: string): Promise<void> {
    const htmlContent = getWelcomeLayout(password);
    await this.sendEmail({
      to: email,
      subject: EMAIL_SUBJECT.WELCOME,
      html: htmlContent,
    });
  }

  public async sendPasswordChangeInstructions(email: string, token: string): Promise<void> {
    const changeLink = `${this.configService.getOrThrow('FRONTEND_URL')}/reset-password?token=${token}`;
    const htmlContent = getChangePasswordLayout(changeLink);
    await this.sendEmail({
      to: email,
      subject: EMAIL_SUBJECT.CHANGE_PASSWORD,
      html: htmlContent,
    });
  }
}
