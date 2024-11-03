import nodemailer from 'nodemailer';

export async function sendEmail(options) {
	const transporter = nodemailer.createTransport({
		host: 'your-smtp-host',
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: 'spencerj921@gmail.com', // replace with your email
			pass: 'your-password', // replace with your password
		},
	});

	const mailOptions = {
		from: 'your-email@example.com', // replace with your email
		to: options.to,
		subject: options.subject,
		html: options.body,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('Email sent successfully');
	} catch (error) {
		console.error('Error sending email:', error);
		throw error;
	}
};
