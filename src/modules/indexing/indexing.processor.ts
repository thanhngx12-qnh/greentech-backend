// File: src/modules/indexing/indexing.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GoogleIndexingService } from '../google/google-indexing.service'; // Import service Google

@Processor('indexing-queue')
export class IndexingProcessor extends WorkerHost {
  constructor(
    private readonly googleIndexingService: GoogleIndexingService, // Inject service
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { urls } = job.data; // Lấy danh sách URL từ job data

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      console.warn('[INDEXING WORKER] Job không có URL để xử lý.');
      return;
    }

    // Giao toàn bộ việc cho GoogleIndexingService
    await this.googleIndexingService.requestIndexing(urls);
  }
}
