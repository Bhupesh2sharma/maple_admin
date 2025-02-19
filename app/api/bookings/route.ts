import { NextResponse } from "next/server"
import { sendBookingConfirmation } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const booking = await request.json()
    // TODO: Save booking to database
    // const savedBooking = await saveBookingToDatabase(booking)

    // For now, we'll use a mock saved booking
    const savedBooking = { ...booking, id: "B" + Math.floor(Math.random() * 1000) }

    // Fetch admin email from settings (you should implement this)
    const adminEmail = "admin@mapletours.com" // Replace with actual admin email

    // Send confirmation email
    await sendBookingConfirmation(savedBooking, adminEmail)

    return NextResponse.json({ message: "Booking created successfully", booking: savedBooking })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

