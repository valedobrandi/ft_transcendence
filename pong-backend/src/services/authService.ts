import { error } from "console";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

class AuthService {

    private resend = new Resend(RESEND_API_KEY);

    static generate2FACode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendEmail(destination: string, subject: string, html: string): Promise<{data: any, error: any}> {
       const { data, error } = await this.resend.emails.send({
        from: "onboarding@resend.dev",
        to: destination,
        subject: subject,
        html: html
       });
       return {data, error};
    }

}

export { AuthService };