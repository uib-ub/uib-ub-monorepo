"use server"
import { revalidatePath } from "next/cache";
import { getXataClient } from "@/utils/xata";
import { z } from 'zod'
import QRCode from 'qrcode'
import { nanoid } from 'nanoid'

const generateQR = async (text: string) => {
  try {
    return await QRCode.toString(text, { type: 'svg' })
  } catch (err) {
    console.error(err)
  }
}

const xata = getXataClient();

export async function createShortLink(prevState: any, formData: FormData) {
  "use server";

  const schema = z.object({
    title: z.string().optional(),
    originalURL: z.string().url().min(1).max(2048),
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
  } catch (error) {
    return { message: "Failed to create short link!" };
  }
}
