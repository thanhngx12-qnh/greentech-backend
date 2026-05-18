// File: src/modules/google/indexing.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GoogleIndexingService } from './google-indexing.service';

@Processor('indexing-queue') // Lắng nghe hàng đợi có tên 'indexing-queue'
export class IndexingProcessor extends WorkerHost {
  constructor(private readonly googleIndexingService: GoogleIndexingService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { urls } = job.data;

    console.log(
      `\n[⚙️ GOOGLE QUEUE] Bắt đầu xử lý Job Indexing cho URL:`,
      urls,
    );

    if (job.name === 'request-indexing' && urls && urls.length > 0) {
      await this.googleIndexingService.requestIndexing(urls);
    }

    console.log(`[✅ GOOGLE QUEUE] Đã xử lý xong!\n`);
    return true;
  }
}
