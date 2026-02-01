import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
    try {
        const host = process.env.EMAIL_SERVER_HOST;
        const port = process.env.EMAIL_SERVER_PORT;
        const user = process.env.EMAIL_SERVER_USER;
        const pass = process.env.EMAIL_SERVER_PASSWORD;
        const from = process.env.EMAIL_FROM;

        console.log('Testing email with logs:', {
            host,
            port,
            user: user ? '***' : 'missing',
            pass: pass ? '***' : 'missing',
            from
        });

        if (!host || !port || !user || !pass || !from) {
            return NextResponse.json({
                error: 'Missing environment variables',
                details: {
                    host: !!host,
                    port: !!port,
                    user: !!user,
                    pass: !!pass,
                    from: !!from
                }
            }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            host,
            port: Number(port),
            secure: Number(port) === 465, // true for 465, false for other ports
            auth: {
                user,
                pass,
            },
            debug: true, // show debug output
            logger: true // log to console
        });

        const verifyResult = await transporter.verify();
        console.log('Transporter verification success:', verifyResult);

        // Optional: actually send an email to the sender itself
        const info = await transporter.sendMail({
            from,
            to: from, // send to self
            subject: 'Vercel Email Test',
            text: 'If you receive this, email sending is working!',
            html: '<p>If you receive this, <b>email sending is working!</b></p>',
        });

        return NextResponse.json({ success: true, messageId: info.messageId, verifyResult });
    } catch (error: any) {
        console.error('Email sending failed:', error);
        return NextResponse.json({
            error: 'Failed to send email',
            message: error.message,
            stack: error.stack,
            code: error.code,
            command: error.command
        }, { status: 500 });
    }
}
