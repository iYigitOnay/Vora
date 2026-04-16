import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Persona } from '@prisma/client';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey || apiKey === 'missing_key') {
      this.resend = new Resend('dummy_key_to_prevent_crash');
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  private getThemeColors(persona: Persona, isWarning = false) {
    if (isWarning) {
      return {
        accent: '#EF4444', // Warning Red
        glow: 'rgba(239, 68, 68, 0.15)',
        bgPastel: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.08) 0%, transparent 70%)',
      };
    }

    switch (persona) {
      case 'NEURAL_DARK':
        return {
          accent: '#00C9A7', // Teal
          glow: 'rgba(0, 201, 167, 0.15)',
          bgPastel: 'radial-gradient(circle at 50% 50%, rgba(0, 201, 167, 0.08) 0%, transparent 70%)',
        };
      case 'FORGE_MODE':
        return {
          accent: '#F59E0B', // Amber
          glow: 'rgba(245, 158, 11, 0.15)',
          bgPastel: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
        };
      case 'AURA_LIGHT':
        return {
          accent: '#7C3AED', // Purple
          glow: 'rgba(124, 58, 237, 0.15)',
          bgPastel: 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
        };
      case 'EMBER_MOSS':
      default:
        return {
          accent: '#C38C5D', // Bronze
          glow: 'rgba(195, 140, 93, 0.15)',
          bgPastel: 'radial-gradient(circle at 50% 50%, rgba(195, 140, 93, 0.08) 0%, transparent 70%)',
        };
    }
  }

  private getBaseTemplate(
    title: string,
    subtitle: string,
    content: string,
    footerNote: string,
    persona: Persona = 'EMBER_MOSS',
    isWarning = false,
  ) {
    const colors = this.getThemeColors(persona, isWarning);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; background-image: ${colors.bgPastel}; padding: 60px 10px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #000000; border: 1px solid ${isWarning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; border-radius: 48px; overflow: hidden; box-shadow: 0 40px 120px rgba(0,0,0,0.8);">
                
                <!-- Hero Header -->
                <tr>
                  <td align="center" style="padding: 70px 40px 40px;">
                    <div style="margin-bottom: 40px;">
                      <h1 style="margin: 0; font-size: 36px; font-weight: 200; letter-spacing: 18px; color: ${colors.accent}; text-indent: 18px; text-transform: uppercase;">Vora</h1>
                      <div style="height: 1px; width: 60px; background: ${colors.accent}; margin: 25px auto; opacity: 0.3;"></div>
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
                    <p style="margin: 0; font-size: 9px; font-weight: 600; color: #404040; text-transform: uppercase; letter-spacing: 8px;">Encryption: AES-256-GCM // VORA SYSTEM</p>
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

  async sendVerificationEmail(email: string, code: string, persona: Persona = 'EMBER_MOSS') {
    const colors = this.getThemeColors(persona);
    const content = `
      Sisteme erişiminizi onaylamak ve biyometrik verilerinizi şifrelemek için gereken tek kullanımlık güvenlik anahtarınız aşağıda tanımlanmıştır.
      
      <div style="margin-top: 45px; background-color: #000000; border: 1px solid ${colors.accent}; border-radius: 28px; padding: 50px 20px; text-align: center; box-shadow: 0 0 40px ${colors.glow};">
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 52px; font-weight: 700; letter-spacing: 20px; color: ${colors.accent}; text-indent: 20px; margin-bottom: 12px;">${code}</div>
        <div style="font-size: 9px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 5px;">IDENTITY KEY</div>
      </div>
    `;

    return this.resend.emails.send({
      from: 'Vora <onboarding@resend.dev>',
      to: [email],
      subject: 'Vora Identity',
      html: this.getBaseTemplate(
        'Erişim Doğrulaması',
        'SECURE ACCESS PROTOCOL',
        content,
        'Bu e-posta Vora Rehabilitasyon Sistemi tarafından kimlik doğrulama amacıyla oluşturulmuştur.',
        persona,
      ),
    });
  }

  async sendPasswordResetEmail(email: string, code: string, persona: Persona = 'EMBER_MOSS') {
    const colors = this.getThemeColors(persona, true); // Warning mode
    const content = `
      Hesap kurtarma talebiniz işleme alınmıştır. Yeni kimlik bilgilerinizi tanımlamak için aşağıdaki geçici kurtarma anahtarını kullanın.
      
      <div style="margin-top: 45px; background-color: #000000; border: 1px solid ${colors.accent}; border-radius: 28px; padding: 50px 20px; text-align: center; box-shadow: 0 0 40px ${colors.glow};">
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 52px; font-weight: 700; letter-spacing: 20px; color: ${colors.accent}; text-indent: 20px; margin-bottom: 12px;">${code}</div>
        <div style="font-size: 9px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 5px;">RECOVERY KEY</div>
      </div>
    `;

    return this.resend.emails.send({
      from: 'Vora <onboarding@resend.dev>',
      to: [email],
      subject: 'Vora Identity',
      html: this.getBaseTemplate(
        'Şifre Sıfırlama',
        'ACCOUNT RECOVERY PROTOCOL',
        content,
        'Güvenliğiniz için bu anahtar tek kullanımlıktır ve 15 dakika sonra geçerliliğini yitirir.',
        persona,
        true,
      ),
    });
  }
}
