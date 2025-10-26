import React from "react";

import LetsTalk from "./LetsTalk";

interface ContactInfo {
  phone: string;
  email: string;
}

async function getContactInfo(): Promise<ContactInfo> {
  // Get contact information from environment variables with fallbacks
  const phone =
    process.env.CONTACT_PHONE ||
    process.env.NEXT_PUBLIC_CONTACT_PHONE ||
    "+1 (555) 123-4567";
  const email =
    process.env.CONTACT_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    "hello@payalscookbook.com";

  // Log warning if using fallback values (only in development)
  if (process.env.NODE_ENV === "development") {
    if (!process.env.CONTACT_PHONE && !process.env.NEXT_PUBLIC_CONTACT_PHONE) {
      console.warn(
        "CONTACT_PHONE not set in environment variables. Using fallback value."
      );
    }
    if (!process.env.CONTACT_EMAIL && !process.env.NEXT_PUBLIC_CONTACT_EMAIL) {
      console.warn(
        "CONTACT_EMAIL not set in environment variables. Using fallback value."
      );
    }
  }

  return {
    phone,
    email,
  };
}

export default async function LetsTalkServer() {
  const contactInfo = await getContactInfo();

  return <LetsTalk phone={contactInfo.phone} email={contactInfo.email} />;
}
