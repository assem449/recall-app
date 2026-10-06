// Photo -> text. The vision model runs on YOUR server so no API key ships in the app.
// Set EXPO_PUBLIC_OCR_URL to an endpoint that accepts { imageBase64, mimeType } and returns { text }.
const OCR_URL = process.env.EXPO_PUBLIC_OCR_URL;

export const ocrConfigured = Boolean(OCR_URL);

export async function imageToText(imageBase64: string, mimeType = 'image/jpeg'): Promise<string> {
  if (!OCR_URL) {
    throw new Error('Photo scanning needs the OCR backend. Set EXPO_PUBLIC_OCR_URL (see README).');
  }
  const res = await fetch(OCR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  if (!res.ok) throw new Error(`Scan failed (${res.status}). Try again.`);
  const data = (await res.json()) as { text?: string };
  if (!data.text?.trim()) throw new Error('No text found in that image.');
  return data.text;
}
