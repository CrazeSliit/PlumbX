const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'chamudithakyt21@gmail.com',
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Verify transporter configuration
const verifyTransporter = async (transporter) => {
    try {
        await transporter.verify();
        console.log('Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('Error verifying email server:', error);
        return false;
    }
};

// Email Configuration
const emailConfig = {
    service: 'gmail',
    auth: {
        user: 'chamudithakyt21@gmail.com',
        pass: 'jscx etuv magi yfby'
    },
    from: '"HR Department" <chamudithakyt21@gmail.com>',
    subject: 'Your Employee Portal Credentials',
    loginUrl: 'http://localhost:3000/login'
};

// Email Template
const emailTemplate = (employee, user) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Welcome to the Employee Portal</h1>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p>Dear ${employee.fullName},</p>
            <p>Here are your login credentials for the Employee Portal:</p>
            <ul style="list-style: none; padding: 0;">
                <li style="margin: 10px 0;"><strong>Employee ID:</strong> ${employee.employeeId}</li>
                <li style="margin: 10px 0;"><strong>Email:</strong> ${employee.email}</li>
                <li style="margin: 10px 0;"><strong>Password:</strong> ${user.password}</li>
            </ul>
            <p style="margin-top: 20px;">Please login at: <a href="${emailConfig.loginUrl}" style="color: #007bff; text-decoration: none;">Employee Portal Login</a></p>
            <p style="color: #dc3545; margin-top: 20px;">For security reasons, please change your password after your first login.</p>
        </div>
        <p style="text-align: center; color: #666;">Best regards,<br>HR Department</p>
    </div>
`;

module.exports = {
    createTransporter,
    verifyTransporter,
    emailConfig,
    emailTemplate
}; 