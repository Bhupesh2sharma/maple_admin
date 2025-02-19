import { NextResponse } from "next/server"
import { sendContactFormNotification } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    // TODO: Save contact form submission to database
    // const savedSubmission = await saveContactFormToDatabase(formData)

    // Fetch admin email from settings (you should implement this)
    const adminEmail = "admin@mapletours.com" // Replace with actual admin email

    // Send notification email
    await sendContactFormNotification(formData, adminEmail)

    return NextResponse.json({ message: "Contact form submitted successfully" })
  } catch (error) {
    console.error("Error submitting contact form:", error)
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 })
  }
}

