"use server"
import { ES_INDEX, getEsClient } from '@/utils/es';
import { linkSchema } from '@/utils/link-schema';
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
  throw new Error('QR code generation failed')
}

type CreateShortLinkState = { message?: string } | string | null;

export async function createShortLink(prevState: CreateShortLinkState, formData: FormData) {
  "use server";

  try {
    const inputSchema = z.object({
      title: z.string().min(1, 'Title is required'),
      originalURL: z.string().url().min(1, 'URL is required').max(2048, 'URL is too long'),
    })
    const data = inputSchema.parse({
      title: formData.get("title"),
      originalURL: formData.get("originalURL"),
    })

    try {
      if (!data.originalURL) {
        return "URL is required";
      }

      const domain = "ub-urls.vercel.app"
      const path = nanoid(8)
      const now = new Date().toISOString()
      const qr = await generateQR(`https://${domain}/${path}`)

      const document = linkSchema.parse({
        path,
        originalURL: data.originalURL,
        qr,
        domain,
        views: 0,
        redirectType: 302,
        created: now,
        modified: now,
        title: data.title ?? null,
      })

      const client = getEsClient()
      await client.index({
        index: ES_INDEX,
        id: path,
        document,
        op_type: 'create',
        refresh: 'wait_for',
      })

      revalidatePath("/link-shortener");
      return { message: `Created short link and QR` }
    } catch (err) {
      const errorMessage = err instanceof Error && err.message.includes('QR code generation')
        ? "Failed to generate QR code. Link not created."
        : "Failed to create short link!"
      return { message: errorMessage };
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0]
      return { message: `Invalid input: ${firstError.message}` }
    }
    return { message: "Failed to create short link!" };
  }
}
