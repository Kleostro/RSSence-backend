import { Module } from '@nestjs/common';

import { PostService } from '../../services/post.service';
import { HistoryModule } from '../history/history.module';
import { VersionsModule } from '../versions/versions.module';
import { PostModerationController } from './controllers/post-moderation.controller';
import { PostModerationService } from './services/post-moderation.service';

@Module({
  imports: [VersionsModule, HistoryModule],
  controllers: [PostModerationController],
  providers: [PostModerationService, PostService],
  exports: [PostModerationService],
})
export class ModerationModule {}
