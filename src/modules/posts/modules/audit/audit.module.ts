import { RolesService } from '@/modules/roles/roles.service';
import { Module } from '@nestjs/common';

import { PostsAccessService } from '../../services/posts-access.service';
import { PostsService } from '../../services/posts.service';
import { HistoryModule } from '../history/history.module';
import { ModerationModule } from '../moderation/moderation.module';
import { VersionsModule } from '../versions/versions.module';
import { PostAuditController } from './controllers/post-audit.controller';
import { PostAuditService } from './services/post-audit.service';

@Module({
  controllers: [PostAuditController],
  imports: [VersionsModule, ModerationModule, HistoryModule],
  providers: [PostAuditService, PostsAccessService, RolesService, PostsService],
})
export class AuditModule {}
