import { sendEmail } from "./sendEmail.js";

export async function sendPasswordResetEmail(email) {
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    // set the reset token and expiration
    await prisma.users.update({
      where: { user_id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiration: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day expiration
      },
    });

    // send the email with the reset link
    await sendEmail({
      to: email,
      subject: 'Password Reset',
      body: `
        <p>Hello!</p>
        <p>We heard that you lost your Word Wanderer password on your journey. Sorry about that!</p>
        <p>Don't worry! You can use the following link to reset your password:</p>
        <p><a href="${process.env.FRONTEND_URL}/reset-password/${token}">Reset password</a></p>
        <p>Thanks!</p>
        <p>The Word Wanderer Rescue Team</p>
      `,
    });
  } catch (error) {
    console.error('Send password reset email error:', error);
    throw error;
  }
}
