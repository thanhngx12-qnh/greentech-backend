// File: src/modules/job-applications/job-application.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('job-applications-queue')
export class JobApplicationProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    const { applicationId, candidateName, email, jobTitle } = job.data;

    console.log(`\n[⚙️ HR QUEUE] Bắt đầu xử lý hồ sơ ID: ${applicationId}`);

    if (job.name === 'process-new-cv') {
      // 1. Giả lập gửi Email cho HR
      await new Promise((res) => setTimeout(res, 1000));
      console.log(
        `[📧 EMAIL HR] Thông báo có CV mới từ: ${candidateName} cho vị trí ${jobTitle}`,
      );

      // 2. Giả lập gửi Email xác nhận cho Ứng viên
      await new Promise((res) => setTimeout(res, 1000));
      console.log(
        `[📧 EMAIL CANDIDATE] Gửi email xác nhận nộp CV thành công tới: ${email}`,
      );
    }

    console.log(`[✅ HR QUEUE] Đã xử lý xong!\n`);
    return true;
  }
}
