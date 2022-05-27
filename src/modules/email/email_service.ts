import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import constants from '../../constants';
import { StringHelper } from '../../util/helper';
import { EmailOptions } from './email_options';
import { EmailTemplate } from './email_template';

@Injectable()
export class EmailService {
  async sendMail(templateName: string, to: string, options: any) {
    
    let transporter = nodemailer.createTransport({
      host: constants.EMAIL_SMTP_HOST,
      port: constants.EMAIL_SMTP_PORT,
      auth: {
        user: constants.EMAIL_SMTP_USER,
        pass: constants.EMAIL_SMTP_PASSWORD,
      },
      secure: false,
      tls: { rejectUnauthorized: false },
      debug: true,
    });

    let template: EmailOptions | any = this.getTemplate(templateName);

    const sendResult = await transporter.sendMail({
      from: constants.EMAIL_SMTP_USER,
      to: to,
      subject: StringHelper.format(template.subject, options),
      html: StringHelper.format(template.template, options),
    });

    console.log(sendResult);
  }

  getTemplate(name) {
    let template: EmailOptions | undefined = undefined;
    Object.keys(EmailTemplate).some((key) => {
      if (key === name) {
        template = EmailTemplate[key];
        return true;
      }
      return false;
    });
    if (!template) throw new Error('template not found');
    return template;
  }
}
