import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { AuthError, requireUser } from '@/server/session';
import { rateLimit } from '@/server/rateLimit';
import { clampText } from '@/server/validate';

export const dynamic = 'force-dynamic';

interface AICopyRequest {
  type: 'quote' | 'about_groom' | 'about_bride' | 'love_story' | 'invitation_closing';
  tone?: 'islami' | 'romantis' | 'modern' | 'puisi' | 'elegan';
  groomName?: string;
  brideName?: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Fitur editor: hanya untuk user yang login, dan dibatasi supaya kuota AI tidak bisa dihabiskan orang luar.
    const user = await requireUser();
    const limited = await rateLimit({ identifier: `ai-copy:${user.id}`, max: 20, windowSecs: 10 * 60 });
    if (!limited.success) {
      return NextResponse.json(
        { success: false, error: `Terlalu banyak permintaan. Coba lagi dalam ${limited.resetIn} detik.` },
        { status: 429, headers: { 'Retry-After': String(limited.resetIn) } }
      );
    }

    const body = (await req.json()) as AICopyRequest;
    const TYPES = ['quote', 'about_groom', 'about_bride', 'love_story', 'invitation_closing'];
    const TONES = ['islami', 'romantis', 'modern', 'puisi', 'elegan'];
    const type = TYPES.includes(body?.type) ? body.type : 'quote';
    const tone = TONES.includes(body?.tone as string) ? body.tone : 'romantis';
    const groomName = clampText(body?.groomName, 60) || 'Mempelai Pria';
    const brideName = clampText(body?.brideName, 60) || 'Mempelai Wanita';
    const notes = clampText(body?.notes, 500);

    // Kunci API hanya dari variabel server; varian NEXT_PUBLIC_ akan ikut terkirim ke browser.
    const apiKey = process.env.GEMINI_API_KEY || '';

    // Fallback template jika belum ada API key
    if (!apiKey) {
      const fallbacks: Record<string, string> = {
        quote:
          'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
        about_groom: `${groomName} adalah sosok yang berdedikasi dan penuh kehangatan. Memulai babak baru kehidupannya bersama wanita impian hatinya.`,
        about_bride: `${brideName} adalah pribadi yang lembut, penyayang, dan senantiasa membawa keceriaan dalam setiap langkah kebersamaan mereka.`,
        love_story:
          'Berawal dari pertemuan tak terduga yang sederhana, perlahan rasa percaya dan kasih bertumbuh hingga kami yakin melangkah menuju ikatan suci pernikahan.',
        invitation_closing:
          'Merupakan kehormatan dan kebahagiaan bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu bagi kami berdua.',
      };

      return NextResponse.json({
        success: true,
        text: fallbacks[type] || fallbacks.quote,
        source: type === 'quote' ? 'QS. Ar-Rum: 21' : undefined,
        mock: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompts: Record<string, string> = {
      quote: `Buat kutipan suci / kata mutiara pernikahan bernuansa ${tone} untuk pasangan ${groomName} & ${brideName}. Jika bernuansa Islami, sertakan ayat Al-Qur'an / Hadits beserta artinya. Catatan tambahan: ${notes}. Keluarkan format JSON: {"quote": "...", "source": "..."}`,
      about_groom: `Tulis biografi singkat profil mempelai pria bernama ${groomName} (1-2 paragraf) untuk undangan pernikahan dengan gaya bahasa ${tone}. Catatan: ${notes}. Keluarkan format JSON: {"text": "..."}`,
      about_bride: `Tulis biografi singkat profil mempelai wanita bernama ${brideName} (1-2 paragraf) untuk undangan pernikahan dengan gaya bahasa ${tone}. Catatan: ${notes}. Keluarkan format JSON: {"text": "..."}`,
      love_story: `Tuliskan paragraf cerita cinta singkat untuk linimasa undangan pernikahan ${groomName} & ${brideName} bernuansa ${tone}. Catatan: ${notes}. Keluarkan format JSON: {"title": "...", "story": "..."}`,
      invitation_closing: `Buat kalimat penutup dan ucapan terima kasih undangan pernikahan ${groomName} & ${brideName} yang sopan, hangat, dan ${tone}. Catatan: ${notes}. Keluarkan format JSON: {"text": "..."}`,
    };

    const promptText = prompts[type] || prompts.quote;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(aiResponse.text || '{}');

    return NextResponse.json({
      success: true,
      ...parsed,
      mock: false,
    });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }
    console.error('AI copywriter error:', err);
    return NextResponse.json({ success: false, error: 'Gagal menghasilkan teks AI' }, { status: 500 });
  }
}
