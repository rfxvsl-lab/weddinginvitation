import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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
    const body = (await req.json()) as AICopyRequest;
    const { type, tone = 'romantis', groomName = 'Mempelai Pria', brideName = 'Mempelai Wanita', notes = '' } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

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
    console.error('AI copywriter error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal menghasilkan teks AI',
      },
      { status: 500 }
    );
  }
}
