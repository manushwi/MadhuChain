import bwipjs from 'bwip-js';
import PDFDocument from 'pdfkit';
import { config } from '../config.js';

export interface BarcodePayload {
  lot_id: string;
  weight_kg: number;
  harvest_date: string; // YYYY-MM-DD
}

/**
 * Generate a code-128 barcode image (PNG buffer) encoding the given text.
 */
export function renderBarcodePng(text: string, width = 300, height = 120): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      bwipjs.toBuffer(
        {
          bcid: 'code128',
          text,
          scale: 3,
          height: 12,
          includetext: true,
          textxalign: 'center',
          paddingwidth: 6,
          paddingheight: 6,
        },
        (err, png) => {
          if (err) reject(err);
          else resolve(png as Buffer);
        },
      );
    } catch (err) {
      reject(err as Error);
    }
  });
}

/**
 * Generate a QR-code image (PNG buffer) encoding the given text. Used for the
 * per-jar verification stickers: scanning the QR opens the consumer history page.
 */
export function renderQrPng(text: string, size = 480): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      bwipjs.toBuffer(
        {
          bcid: 'qrcode',
          text,
          scale: 8,
          width: Math.round(size / 8),
          height: Math.round(size / 8),
          padding: 8,
        },
        (err, png) => {
          if (err) reject(err);
          else resolve(png as Buffer);
        },
      );
    } catch (err) {
      reject(err as Error);
    }
  });
}

/**
 * Build a printable PDF label sheet containing the Code-128 barcode plus the
 * lot_id, weight and harvest date fields. This is the label pasted on raw-honey
 * boxes before shipping to the factory.
 */
export async function buildLabelPdf(payload: BarcodePayload): Promise<Buffer> {
  const barcodeText = `${payload.lot_id}|${payload.weight_kg}|${payload.harvest_date}`;
  const barcodePng = await renderBarcodePng(barcodeText, 480, 140);

  const buffer: Buffer[] = [];
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [504, 216], margin: 12 });
    doc.on('data', (chunk: Buffer) => buffer.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffer)));
    doc.on('error', reject);

    doc
      .fontSize(20)
      .text('MadhuChain — Raw Material', { align: 'center' });
    doc.moveDown(0.4);
    doc
      .fontSize(12)
      .text(`Lot: ${payload.lot_id}`, { align: 'left' })
      .moveDown(0.2)
      .text(`Weight: ${payload.weight_kg} kg`, { align: 'left' })
      .moveDown(0.2)
      .text(`Harvest date: ${payload.harvest_date}`, { align: 'left' })
      .moveDown(0.5);

    doc.image(barcodePng, { fit: [460, 120], align: 'center' });

    doc.end();
  });
}
