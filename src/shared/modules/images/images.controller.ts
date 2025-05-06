import { Response } from 'express';

import { Image } from '@/generated/prisma';
import { ERROR_MESSAGES } from '@/shared/constants/error-message';
import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':filename')
  public async getImage(@Param('filename') filename: string, @Res() res: Response): Promise<void> {
    try {
      const { data, contentType } = await this.imagesService.getImage(filename);

      res.set('Content-Type', contentType);
      res.send(data);
    } catch (error) {
      res.status(404).send(ERROR_MESSAGES.IMAGE_NOT_FOUND);
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
    return this.imagesService.uploadImage(file);
  }

  @Delete(':filename')
  public async deleteImage(@Param('filename') filename: string): Promise<Image> {
    try {
      return this.imagesService.deleteImage(filename);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
