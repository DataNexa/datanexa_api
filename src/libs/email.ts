import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import Config from '../util/config';

const conf = Config.instance().getData()

const transporter = nodemailer.createTransport({
    host: conf.smtp_user.endpoint, 
    port: 465,
    secure: true, 
    auth: conf.smtp_user,
});

async function sendConfirmationEmail(nome:string, to: string, code: string) {

    const templatePath = path.join(__dirname, '../templates_html/recover.html');
    let template = fs.readFileSync(templatePath, 'utf8');
    
    template = template.replace('{{code}}', code); 
    template = template.replace('{{nome}}', nome); 

    try {
        await transporter.sendMail({
            from: `"DataNexa Atendimento" <${conf.smtp_user.user}>`,
            to: to,
            subject: 'Código de Confirmação disponível',
            html: template,
        });
        console.log("enviado:", to, code);
        
        return true
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        return false
    }
}

export default sendConfirmationEmail

