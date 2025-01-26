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

  public async sendPasswordChangePasswordInstructions(email: string, changeLink: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: EMAIL_SUBJECT.CHANGE_PASSWORD,
      html: getChangePasswordLayout(changeLink),
    });
  }
}
