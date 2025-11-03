import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly sesClient: SESClient;

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
    const fromEmail = process.env.EMAIL_FROM_ADRESS!;
    const frontendUrl = process.env.API_BASE_URL!;

    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

    const subject = 'Confirme seu e-mail para se cadastrar no OnWay';
    const body = `
      Olá ${name},<br><br>
      Obrigado por se registrar. Por favor, clique no link abaixo para verificar seu e-mail:<br><br>
      <a href="${verificationUrl}">Verificar E-mail</a><br><br>
      Se você não se registrou, por favor ignore este e-mail.
    `;

    const command = new SendEmailCommand({
      Source: fromEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: body },
        },
      },
    });

    await this.sesClient.send(command);
    this.logger.log(`E-mail de verificação enviado para ${to}`);
  }
}
