export const getWelcomeLayout = (password: string): string => `
         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <h1 style="color: #333;">Welcome to RSSence!</h1>
        <p>Dear User,</p>
        <p>We are excited to inform you that your account has been created successfully.</p>
        <p>Your password is: <strong>${password}</strong></p>
        <p>Thank you for joining us! We hope you enjoy our service.</p>
        <p>Best Regards,<br>RSSence</p>
      </div>
      `;
