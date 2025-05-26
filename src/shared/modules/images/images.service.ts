import { promises as fs } from 'fs';
import { join } from 'path';

import { Image } from '@/generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImagesService {
  constructor(
    private prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  public async getImage(filename: string): Promise<{ data: Buffer; contentType: string }> {
    const img = await this.ensureImageExists(filename);
    const filePath = join(process.cwd(), 'uploads', filename);
    try {
      const fileData = await fs.readFile(filePath);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { data: fileData, contentType: img.contentType };
    } catch (error) {
      throw new NotFoundException(ERROR_MESSAGES.IMAGE_NOT_FOUND);
    }
  }

  public async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    const img = await this.prisma.image.findFirst({
      where: { filename: file.originalname },
    });

    if (img) {
      return { url: `${this.config.getOrThrow('BACKEND_URL')}/images/${img.filename}` };
    }

    const filename = file.originalname.replace(/\s+/g, '');
    const filePath = join(process.cwd(), 'uploads', filename);

    await fs.writeFile(filePath, file.buffer);

    const url = `${this.config.getOrThrow('BACKEND_URL')}/images/${filename}`;

    await this.prisma.image.create({
      data: {
        filename,
        size: file.size,
        contentType: file.mimetype,
        url,
      },
    });

    return { url };
  }

  public async deleteImage(filename: string): Promise<Image> {
    const image = await this.ensureImageExists(filename);
    const filePath = join(process.cwd(), 'uploads', filename);

    try {
      await fs.unlink(filePath);

      return this.prisma.image.delete({
        where: { id: image.id },
      });
    } catch (error) {
      throw new NotFoundException(ERROR_MESSAGES.IMAGE_DELETE_FAILED);
    }
  }

  private async ensureImageExists(filename: string): Promise<Image> {
    const hasImage = await this.hasImage(filename);
    if (!hasImage) {
      throw new NotFoundException(ERROR_MESSAGES.IMAGE_NOT_FOUND);
    }

    return hasImage;
  }

  private async hasImage(filename: string): Promise<Image | null> {
    const result = await this.prisma.image.findFirst({ where: { filename } });
    return result;
  }
}
