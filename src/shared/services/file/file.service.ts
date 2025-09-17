import sharp from 'sharp';

import { ImageOptimizeOptions } from '@/shared/types/image-optimize';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
  public async processImage(file: Express.Multer.File, options: ImageOptimizeOptions): Promise<string> {
    if (file.mimetype === 'image/svg+xml') {
      return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    const buffer = await this.optimize(file.buffer, options);

    return `data:${file.mimetype};base64,${buffer.toString('base64')}`;
  }

  private async optimize(buffer: Buffer, options: ImageOptimizeOptions): Promise<Buffer> {
    const { width, height, quality, format, effort } = options;
    const bufferAfterResize = await this.resize(buffer, width, height);
    return sharp(bufferAfterResize).webp({ effort }).toFormat(format, { quality }).toBuffer();
  }

  private async resize(buffer: Buffer<ArrayBufferLike>, width: number, height: number): Promise<Buffer> {
    return sharp(buffer).resize(width, height).toBuffer();
  }
}
