import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  /** 🧪 Gửi mail test */
  async testSend(email: string) {
    await this.mailer.sendMail({
      to: email,
      subject: '🎉 Test gửi email từ LATN',
      html: `
        <h2 style="color:#0a1929">LATN Store</h2>
        <p>Đây là email test gửi từ Gmail SMTP App Password.</p>
        <p>✅ Thành công rồi!</p>
      `,
    });
  }
async sendRegisterConfirm(email: string, confirmUrl: string) {
  const uniqueId = Date.now() + "-" + Math.random().toString(36).substring(2, 8);
  await this.mailer.sendMail({
    to: email,
    subject: `🎉 Xác nhận đăng ký tài khoản LATN (${new Date().toLocaleTimeString()})`,
    headers: { 'Message-ID': `<register-${uniqueId}@latn-store>` },
    html: `
      <div style="font-family:Arial,sans-serif;color:#333;line-height:1.5">
        <h2>Chào mừng bạn đến với LATN Store!</h2>
        <p>Nhấn vào liên kết sau để xác nhận tài khoản của bạn:</p>
        <p>
          <a href="${confirmUrl}"
             style="background:#007bff;color:#fff;padding:10px 14px;
                    border-radius:6px;text-decoration:none;font-weight:bold;">
            Xác nhận đăng ký
          </a>
        </p>
        <p>Liên kết này có hiệu lực trong 1 giờ.</p>
        <hr />
        <small>LATN - Email tự động, vui lòng không trả lời.</small>
      </div>
    `,
  });
}

  /** 📩 Gửi mail đặt lại mật khẩu */
async sendPasswordReset(email: string, resetLink: string) {
  // 🔹 Tạo ID duy nhất mỗi lần gửi (để Gmail không gộp thư)
  const uniqueId = Date.now() + "-" + Math.random().toString(36).substring(2, 8);

  await this.mailer.sendMail({
    to: email,
    subject: `🔑 Đặt lại mật khẩu - LATN (${new Date().toLocaleTimeString()})`, // ✅ mỗi lần khác nhau
    headers: {
      'Message-ID': `<reset-${uniqueId}@latn-store>`, // ✅ Gmail nhận dạng là thư mới
    },
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.4;color:#222">
        <h2>Đặt lại mật khẩu</h2>
        <p>Nhấn vào liên kết sau để đặt lại mật khẩu (hết hạn sau 15 phút):</p>
        <p>
          <a href="${resetLink}"
             style="display:inline-block;
                    background:#0a1929;
                    color:#fff;
                    padding:10px 16px;
                    border-radius:6px;
                    text-decoration:none;
                    font-weight:700;">
            Đặt lại mật khẩu
          </a>
        </p>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        <hr />
        <small>LATN Store - Email tự động, vui lòng không trả lời.</small>
      </div>
    `,
  });
}

async sendEmailChange(email: string, confirmUrl: string) {
  // Tạo messageId duy nhất mỗi lần gửi
  const uniqueId = Date.now() + "-" + Math.random().toString(36).substring(2, 8);

  await this.mailer.sendMail({
    to: email,
    subject: `📧 Xác nhận thay đổi email - LATN (${new Date().toLocaleTimeString()})`, // ✅ khác nhau mỗi lần
    headers: {
      'Message-ID': `<${uniqueId}@latn-store>`, // ✅ Gmail sẽ xem đây là mail riêng
    },
    html: `
      <h2>Xin chào!</h2>
      <p>Bạn vừa yêu cầu thay đổi địa chỉ email cho tài khoản LATN.</p>
      <p>Nhấn vào liên kết sau để xác nhận email mới:</p>
      <p>
        <a href="${confirmUrl}"
           style="background:#007bff;color:#fff;padding:10px 14px;
                  border-radius:5px;text-decoration:none;">Xác nhận Email</a>
      </p>
      <p>Liên kết này có hiệu lực trong 30 phút.</p>
    `,
  });
}

}
