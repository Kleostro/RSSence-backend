import { Module } from '@nestjs/common';

import { HistoryModule } from '../history/history.module';
import { ModerationModule } from '../moderation/moderation.module';
import { VersionsModule } from '../versions/versions.module';
import { PostAuditController } from './controllers/post-audit.controller';
import { PostAuditService } from './services/post-audit.service';

@Module({
  imports: [VersionsModule, ModerationModule, HistoryModule],
  controllers: [PostAuditController],
  providers: [PostAuditService],
})
export class AuditModule {}
