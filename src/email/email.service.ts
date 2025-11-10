import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly sesClient: SESClient;

  private readonly apiUrl = process.env.API_BASE_URL!;
  private readonly websiteUrl = process.env.WEBSITE_BASE_URL!;
  private readonly fromEmail = process.env.EMAIL_FROM_ADRESS!;

  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.EMAIL_USER_ACCESS_KEY_ID!,
        secretAccessKey: process.env.EMAIL_USER_SECRET_ACCESS_KEY!,
      },
    });
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const verificationUrl = `${this.apiUrl}/auth/verify-email?token=${token}`;

    const subject = 'Confirme seu e-mail para se cadastrar no OnWay';
    const body = `
      Olá ${name},<br><br>
      Obrigado por se registrar. Por favor, clique no link abaixo para verificar seu e-mail:<br><br>
      <a href="${verificationUrl}">Verificar E-mail</a><br><br>
      Se você não se registrou, por favor ignore este e-mail.
    `;

    await this.sendEmailAndLog(to, subject, body);
  }

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const passwordResetUrl = `${this.websiteUrl}/reset-password?token=${token}`;

    const subject = `Redefinição de senha - OnWay`;
    const body = `
      Olá ${name},<br><br>
      Recebemos uma solicitação para redefinir a senha da sua conta. Use o link abaixo para criar uma nova senha. O link é válido por 10 minutos.<br><br>
      <a href="${passwordResetUrl}">Redefinir senha</a><br><br>
      Se você não solicitou essa ação, ignore esta mensagem.<br><br>
      Atenciosamente,<br>
      Equipe OnWay.
    `;

    await this.sendEmailAndLog(to, subject, body);
  }

  private async sendEmailAndLog(
    to: string,
    subject: string,
    contentHtml: string,
  ) {
    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: contentHtml },
        },
      },
    });

    await this.sesClient.send(command);
    this.logger.log(`E-mail enviado para ${to}`);
  }
}
