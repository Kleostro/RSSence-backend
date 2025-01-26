import * as bcrypt from 'bcrypt';
import passfather from 'passfather';

import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  private readonly HASH_SALT = 10;
  private readonly PASSWORD_LENGTH = 32;

  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.HASH_SALT);
  }

  public async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public generatePassword(): string {
    return passfather({
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: false,
      length: this.PASSWORD_LENGTH,
    });
  }
}
