import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { API_NAME } from "../constants.js";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let transporter: Transporter | undefined;
const getTransporter = () =>
  (transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
  }));

// Wrapped in an object so tests can spy on mailer.send
export const mailer = {
  async send(message: MailMessage): Promise<void> {
    if (!env.SMTP_HOST) {
      // dev fallback (production requires SMTP_HOST, enforced in env.ts)
      if (env.NODE_ENV === "development") {
        console.info(
          `\n[mail] to=${message.to} subject="${message.subject}"\n${message.text}\n`
        );
      }
      return;
    }
    await getTransporter().sendMail({ from: env.MAIL_FROM, ...message });
  },
};

// user-controlled values (e.g. name) must never be injected into HTML unescaped
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
) {
  const safeName = escapeHtml(name);
  return mailer.send({
    to,
    subject: "Reset your password",
    text: `Hi ${name},\n\nUse the link below to reset your password. It expires in 15 minutes.\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>Hi ${safeName},</p><p>Use the button below to reset your password. It expires in 15 minutes.</p><p><a href="${escapeHtml(resetUrl)}">Reset password</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}

export function sendPasswordChangedEmail(to: string, name: string) {
  const safeName = escapeHtml(name);
  return mailer.send({
    to,
    subject: "Your password was changed",
    text: `Hi ${name},\n\nThe password for your ${API_NAME} account was just changed and all sessions were signed out. If this wasn't you, reset your password immediately.`,
    html: `<p>Hi ${safeName},</p><p>The password for your account was just changed and all sessions were signed out. If this wasn't you, reset your password immediately.</p>`,
  });
}
