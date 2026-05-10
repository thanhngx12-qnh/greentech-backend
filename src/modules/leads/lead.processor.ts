// File: src/modules/leads/lead.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('lead-notifications') // Lắng nghe cái hàng đợi có tên 'lead-notifications'
export class LeadProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    const { leadId, email, full_name } = job.data;

    console.log(
      `\n[⚙️ BACKGROUND JOB STARTED] Đang xử lý Lead ID: ${leadId}...`,
    );

    switch (job.name) {
      case 'send-admin-email':
        // Giả lập việc gửi Email mất 2 giây (Gọi tới SendGrid/AWS SES)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log(
          `[📧 EMAIL] Đã gửi thông báo cho Admin: "Có khách hàng mới: ${full_name}"`,
        );
        break;

      case 'send-customer-thankyou':
        // Giả lập việc gửi Email cảm ơn mất 2 giây
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log(`[📧 EMAIL] Đã gửi thư cảm ơn tới khách hàng: ${email}`);
        break;

      case 'send-zalo-webhook':
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`[💬 ZALO/TELEGRAM] Đã bắn tin nhắn vào group Sales!`);
        break;
    }

    console.log(`[✅ BACKGROUND JOB DONE] Hoàn tất công việc: ${job.name}\n`);
    return true;
  }
}
