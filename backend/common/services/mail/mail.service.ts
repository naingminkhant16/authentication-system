import {Injectable, InternalServerErrorException} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import nodemailerExpressHandlebars from 'nodemailer-express-handlebars';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });
    }

    async sendVerifyMail(
        to: string,
        name: string,
        callbackURL: string,
    ): Promise<void> {
        const mailOptions = {
            from: process.env.MAIL_FROM,
            to,
            subject: 'Please verify your email',
            text: `Warmly welcome ${name}, please verify your email.`,
            html: `<a href="${callbackURL}">Click Here To Verify Email</a>`,
        };

        try {
            this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending verification email:', error);
        }
    }

    async sendResetPasswordCode(email: string, code: string): Promise<void> {
        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Password Reset Code',
            text: `This is the reset password code for ${email}`,
            html: `<b>${code}</b>`,
        };

        try {
            this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending reset password email:', error);
            throw new InternalServerErrorException(
                'Error sending reset password email',
            );
        }
    }
}
