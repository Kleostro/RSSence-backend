import * as bcrypt from 'bcrypt';

import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  private readonly HASH_SALT = 10;

  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.HASH_SALT);
  }

  public async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
