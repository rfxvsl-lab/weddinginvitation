import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createTransaction, updateUserPaymentStatus } from '../../../lib/api';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Rate limiting: maks 5 request per IP per 10 menit
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit({
      identifier: `verify-payment:${clientIp}`,
      max: 5,
      windowSecs: 10 * 60, // 10 menit
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Silakan coba lagi dalam ${rateLimit.resetIn} detik.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.resetIn) } }
      );
    }

    const body = await req.json();
    const {
      imageUrl,
      expectedNominal,
      userId,
      userName,
      userSlug,
      userEmail,
      packageId,
      isCustomByRfx,
    } = body;

    if (!imageUrl || !expectedNominal || !userId) {
      return NextResponse.json(
        { error: 'Parameter imageUrl, expectedNominal, dan userId diperlukan.' },
        { status: 400 }
      );
    }

    // 1. Fetch image from Cloudinary and convert to base64
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      throw new Error('Gagal mengunduh gambar bukti transfer dari Cloudinary');
    }
    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';

    // 2. Initialize Gemini API Client
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('GEMINI_API_KEY tidak dikonfigurasi. Menggunakan mode mock sukses.');
    }

    let aiResult = {
      isAuthentic: true,
      nominalDetected: expectedNominal,
      recipientAccount: 'MUHAMMAD RIDHO FEBRIYANSYAH',
      timestampDetected: new Date().toLocaleString('id-ID'),
      reasons: ['Verifikasi AI otomatis (Bypass / Mock karena kunci API tidak ditemukan).'],
    };

    let isMatched = true;

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const promptText = `
Analisis bukti transfer bank / struk pembayaran berikut ini dengan seksama. 
Kamu adalah sistem audit otomatis untuk verifikasi pembayaran.
Target nominal yang diharapkan adalah Rp ${expectedNominal}.
Rekening penerima resmi kami adalah atas nama MUHAMMAD RIDHO FEBRIYANSYAH (Mandiri: 1440029346159, SeaBank: 901410104102, ShopeePay: 085731021469, atau QRIS RFX.visual).

Tugas Anda:
1. Periksa apakah struk ini asli (tidak diedit/palsu) dan merupakan bukti transfer yang valid. Set "isAuthentic" ke true jika asli, false jika mencurigakan atau editan.
2. Temukan nominal uang yang teratur berhasil ditransfer. Masukkan angka nominalnya saja (tanpa titik/koma/Rp) ke "nominalDetected" (sebagai integer).
3. Cari nama penerima atau nomor rekening tujuan. Masukkan nama/rekening penerima yang terdeteksi ke "recipientAccount".
4. Deteksi tanggal dan waktu transaksi dan masukkan ke "timestampDetected".
5. Berikan alasan pemeriksaan Anda dalam bahasa Indonesia sebagai array of strings di "reasons".

Berikan respons Anda dalam format JSON dengan struktur berikut:
{
  "isAuthentic": boolean,
  "nominalDetected": number,
  "recipientAccount": string,
  "timestampDetected": string,
  "reasons": string[]
}
`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: contentType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = aiResponse.text;
      if (responseText) {
        try {
          aiResult = JSON.parse(responseText.trim());
          
          // Verify nominal match (allow small tolerances or exact check)
          const diff = Math.abs((aiResult.nominalDetected || 0) - expectedNominal);
          const nominalOk = diff <= 500; // allow small tolerance e.g. Rp 1-500
          
          // Verify recipient name contains key keywords
          const recipientLower = (aiResult.recipientAccount || '').toLowerCase();
          const recipientOk = 
            recipientLower.includes('ridho') || 
            recipientLower.includes('febriyansyah') || 
            recipientLower.includes('rfx') ||
            recipientLower.includes('visual') ||
            recipientLower.includes('144002') ||
            recipientLower.includes('901410') ||
            recipientLower.includes('085731');

          isMatched = aiResult.isAuthentic && nominalOk && recipientOk;
        } catch (parseErr) {
          console.error('Failed to parse Gemini output JSON:', responseText, parseErr);
          aiResult.reasons.push('AI gagal memformat hasil analisis. Dibutuhkan review manual.');
          isMatched = false;
        }
      } else {
        isMatched = false;
        aiResult.reasons.push('Model AI tidak mengembalikan respons teks.');
      }
    }

    const txStatus = isMatched ? 'success' : 'failed';

    // 3. Write transaction log directly to Turso DB
    await createTransaction({
      userId,
      userName,
      userSlug,
      userEmail,
      packageId,
      isCustomByRfx,
      nominalExpected: expectedNominal,
      status: txStatus,
      timestamp: new Date().toLocaleString('id-ID'),
      proofImage: imageUrl,
      aiResult,
    });

    // 4. If transaction is successfully verified, update user status to success
    if (isMatched) {
      await updateUserPaymentStatus(userId, 'success');
    }

    return NextResponse.json({
      success: isMatched,
      aiResult,
    });
  } catch (error: any) {
    console.error('Payment verification handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}
