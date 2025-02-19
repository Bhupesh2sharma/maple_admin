import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // This is an example. Use your actual SMTP server.
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendBookingConfirmation(booking: any, adminEmail: string) {
  try {
    await transporter.sendMail({
      from: `"Maple Tours" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      cc: adminEmail,
      subject: "Booking Confirmation - Maple Tours",
      text: `Thank you for booking the ${booking.packageName} package. Your booking ID is ${booking.id}.`,
      html: `
        <h1>Booking Confirmation</h1>
        <p>Thank you for booking with Maple Tours!</p>
        <p>Package: <strong>${booking.packageName}</strong></p>
        <p>Booking ID: <strong>${booking.id}</strong></p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      `,
    })
    console.log("Booking confirmation email sent successfully")
  } catch (error) {
    console.error("Error sending booking confirmation email:", error)
    throw new Error("Failed to send booking confirmation email")
  }
}

export async function sendContactFormNotification(formData: any, adminEmail: string) {
  try {
    await transporter.sendMail({
      from: `"Maple Tours" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: "New Contact Form Submission",
      text: `New contact form submission from ${formData.name} (${formData.email}): ${formData.message}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Message:</strong> ${formData.message}</p>
      `,
    })
    console.log("Contact form notification email sent successfully")
  } catch (error) {
    console.error("Error sending contact form notification email:", error)
    throw new Error("Failed to send contact form notification email")
  }
}

