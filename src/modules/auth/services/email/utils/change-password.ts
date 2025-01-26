export const getChangePasswordLayout = (changeLink: string): string => `
         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <h1 style="color: #333;">Password Change Request</h1>
        <p>Dear User,</p>
        <p>We received a request to change your password.</p>
        <p>You can change your password by clicking the link below:</p>
        <p><a href="${changeLink}" style="color: #007bff;">Change Password</a></p>
        <p>If you did not request a password change, please ignore this email.</p>
        <p>Thank you,<br>RSSence</p>
      </div>
      `;
