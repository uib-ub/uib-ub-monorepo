"use server"
import { xata } from '@/utils/xataClient';
import { nanoid } from 'nanoid';
import { revalidatePath } from "next/cache";
import QRCode from 'qrcode';
import { z } from 'zod';

const generateQR = async (text: string) => {
  try {
    return await QRCode.toString(text, { type: 'svg' })
  } catch (err) {
    console.error(err)
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

    try {
      if (!data.originalURL) {
        return "URL is required";
      }

      const domain = "ub-urls.vercel.app"
      const path = nanoid(8)
      const date = new Date()
      const qr = await generateQR(`https://${domain}/${path}`)

      await xata.db.links.create({
        originalURL: data.originalURL,
        title: data.title ?? null,
        domain,
        qr,
        path,
        created: date,
        modified: date,
      });

      revalidatePath("/link-shortener");
      return { message: `Created short link and QR` }
    } catch (err) {
      // If QR generation fails, generateQR will throw an error, preventing database write
      const errorMessage = err instanceof Error && err.message.includes('QR code generation')
        ? "Failed to generate QR code. Link not created."
        : "Failed to create short link!"
      return { message: errorMessage };
    }
  } catch (err) {
    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0]
      return { message: `Invalid input: ${firstError.message}` }
    }
    return { message: "Failed to create short link!" };
  }
}
