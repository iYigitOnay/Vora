import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!apiKey || apiKey === 'missing_key') {
      console.error('❌ ERROR: RESEND_API_KEY is not defined in environment variables!');
      this.resend = new Resend('dummy_key_to_prevent_crash');
    } else {
      console.log('✅ MailService: Resend API Key loaded.');
      this.resend = new Resend(apiKey);
    }
  }

  private getBaseTemplate(
    title: string,
    subtitle: string,
    content: string,
    footerNote: string,
  ) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 60px 10px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #000000; border: 1px solid #262626; border-radius: 48px; overflow: hidden;">
                
                <!-- Hero Header -->
                <tr>
                  <td align="center" style="padding: 70px 40px 40px;">
                    <div style="margin-bottom: 40px;">
                      <h1 style="margin: 0; font-size: 36px; font-weight: 200; letter-spacing: 18px; color: #C38C5D; text-indent: 18px; text-transform: uppercase;">Vora</h1>
                      <div style="height: 1px; width: 60px; background: #C38C5D; margin: 25px auto; opacity: 0.3;"></div>
                      <p style="margin: 0; font-size: 10px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 6px;">${subtitle}</p>
                    </div>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 0 50px 70px;">
                    <div style="text-align: center; margin-bottom: 45px;">
                      <h2 style="margin: 0; font-size: 24px; font-weight: 500; color: #E5E5E5; letter-spacing: -0.02em;">${title}</h2>
                    </div>
                    
                    <div style="color: #A1A1A1; font-size: 15px; line-height: 1.8; text-align: center; margin-bottom: 50px; font-weight: 300;">
                      ${content}
                    </div>

                    <!-- Security Signature -->
                    <div style="border-top: 1px solid #171717; margin-top: 60px; padding-top: 40px; text-align: center;">
                      <p style="margin: 0; font-size: 11px; color: #525252; line-height: 1.8; letter-spacing: 0.05em;">
                        ${footerNote}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Global Footer -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; margin-top: 40px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 9px; font-weight: 600; color: #404040; text-transform: uppercase; letter-spacing: 8px;">Encryption: AES-256-GCM // VORA REHAB</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async sendVerificationEmail(email: string, code: string) {
    const content = `
      Sisteme erişiminizi onaylamak ve biyometrik verilerinizi şifrelemek için gereken tek kullanımlık güvenlik anahtarınız aşağıda tanımlanmıştır.
      
      <div style="margin-top: 45px; background-color: #000000; border: 1px solid #C38C5D; border-radius: 28px; padding: 50px 20px; text-align: center; box-shadow: 0 0 40px rgba(195, 140, 93, 0.05);">
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 52px; font-weight: 700; letter-spacing: 20px; color: #C38C5D; text-indent: 20px; margin-bottom: 12px;">${code}</div>
        <div style="font-size: 9px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 5px;">IDENTITY KEY</div>
      </div>
    `;

    const { data, error } = await this.resend.emails.send({
      from: 'Vora <onboarding@resend.dev>',
      to: [email],
      subject: 'Vora Identity',
      html: this.getBaseTemplate(
        'Erişim Doğrulaması',
        'SECURE ACCESS PROTOCOL',
        content,
        'Bu e-posta Vora Rehabilitasyon Sistemi tarafından kimlik doğrulama amacıyla oluşturulmuştur.',
      ),
    });

    if (error) {
      console.error(
        'RESEND ERROR (Verification):',
        JSON.stringify(error, null, 2),
      );
      throw new Error(error.message);
    }
    return data;
  }

  async sendPasswordResetEmail(email: string, code: string) {
    const content = `
      Hesap kurtarma talebiniz işleme alınmıştır. Yeni kimlik bilgilerinizi tanımlamak için aşağıdaki geçici kurtarma anahtarını kullanın.
      
      <div style="margin-top: 45px; background-color: #000000; border: 1px solid #C38C5D; border-radius: 28px; padding: 50px 20px; text-align: center; box-shadow: 0 0 40px rgba(195, 140, 93, 0.05);">
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 52px; font-weight: 700; letter-spacing: 20px; color: #C38C5D; text-indent: 20px; margin-bottom: 12px;">${code}</div>
        <div style="font-size: 9px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 5px;">RECOVERY KEY</div>
      </div>
    `;

    const { data, error } = await this.resend.emails.send({
      from: 'Vora <onboarding@resend.dev>',
      to: [email],
      subject: 'Vora Identity',
      html: this.getBaseTemplate(
        'Şifre Sıfırlama',
        'ACCOUNT RECOVERY PROTOCOL',
        content,
        'Güvenliğiniz için bu anahtar tek kullanımlıktır ve 15 dakika sonra geçerliliğini yitirir.',
      ),
    });

    if (error) {
      console.error('RESEND ERROR (Reset):', JSON.stringify(error, null, 2));
      throw new Error(error.message);
    }
    return data;
  }
}
