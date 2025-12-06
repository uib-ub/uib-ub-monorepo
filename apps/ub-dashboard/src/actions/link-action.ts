"use server"
import { prisma } from '@/db/client';
import { nanoid } from 'nanoid';
import { revalidatePath } from "next/cache";
import QRCode from 'qrcode';
import { z } from 'zod';

const generateQR = async (text: string, retries = 3): Promise<string> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await QRCode.toString(text, { type: 'svg' })
    } catch (err) {
      console.error(`QR generation attempt ${attempt}/${retries} failed:`, err)
      if (attempt === retries) {
        // After all retries failed, throw error to prevent link creation
        throw new Error('QR code generation failed after all retries')
      }
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 100 * attempt))
    }
  }
  // This is unreachable but needed for TypeScript type checking
  // The loop always exits via return (success) or throw (all retries failed)
  throw new Error('QR code generation failed')
}

type CreateShortLinkState = { message?: string } | string | null;

export async function createShortLink(prevState: CreateShortLinkState, formData: FormData) {
  "use server";

  try {
    const schema = z.object({
      title: z.string().min(1, 'Title is required'),
      originalURL: z.string().url().min(1, 'URL is required').max(2048, 'URL is too long'),
    })
    const data = schema.parse({
      title: formData.get("title"),
      originalURL: formData.get("originalURL"),
    })

    if (!data.originalURL) {
      return "URL is required";
    }

    const domain = "ub-urls.vercel.app"
    const path = nanoid(8)
    const date = new Date()

    // Generate QR code - if this fails, the entire operation fails
    const qr = await generateQR(`https://${domain}/${path}`)

    await prisma.link.create({
      data: {
        originalURL: data.originalURL,
        title: data.title ?? null,
        domain,
        qr,
        path,
        created: date,
        modified: date,
      }
    });

    revalidatePath("/link-shortener");
    return { message: `Created short link and QR` }
  } catch (err) {
    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0]
      return { message: `Invalid input: ${firstError.message}` }
    }

    // If QR generation fails, generateQR will throw an error, preventing database write
    const errorMessage = err instanceof Error && err.message.includes('QR code generation')
      ? "Failed to generate QR code. Link not created."
      : "Failed to create short link!"
    return { message: errorMessage };
  }
}
