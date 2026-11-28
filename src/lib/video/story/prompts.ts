/**
 * Prompt gambar Video Cerita. Disusun di server dari isian terstruktur (bukan prompt bebas),
 * agar gaya konsisten dan karakter tetap sama di semua adegan.
 */

export type StoryStyle = 'warm-digital' | 'watercolor' | 'soft-anime';

const STYLE: Record<StoryStyle, string> = {
  'warm-digital':
    'Hand-painted digital illustration in the style of a modern illustrated storybook: soft semi-realistic faces, warm cinematic lighting, gentle painterly textures, rich but soft colors, clean readable shapes.',
  watercolor:
    'Delicate watercolor illustration on textured paper: soft washes, pastel palette, light ink outlines, airy and romantic.',
  'soft-anime':
    'Soft anime film illustration: clean line art, bright natural colors, expressive but realistic proportions, cinematic background painting.',
};

const NO_TEXT = 'Do not draw any text, letters, logos, watermarks, signatures or UI.';

export interface CastBrief {
  label: string; // "the groom" / "the bride"
  look?: string;
}

export function characterSheetPrompt(style: StoryStyle, groom: CastBrief, bride: CastBrief) {
  return [
    STYLE[style],
    `Create a character reference sheet of the two people shown in the reference photos: ${groom.label} (first photos) and ${bride.label} (later photos).`,
    groom.look ? `${groom.label} appearance notes: ${groom.look}.` : '',
    bride.look ? `${bride.label} appearance notes: ${bride.look}.` : '',
    'Keep their real facial features, skin tone, hair and body type recognisable, adapted into the illustration style. Modest everyday clothing.',
    'Show both people standing side by side, full body, front view, neutral friendly expression, evenly lit, on a plain solid pure green background (#00FF00), no shadows on the background.',
    NO_TEXT,
  ]
    .filter(Boolean)
    .join(' ');
}

export function backgroundPrompt(style: StoryStyle, place: string, action: string) {
  return [
    STYLE[style],
    `Vertical 9:16 establishing background for a scene: ${place}.`,
    `Context of the moment (for mood and props only): ${action}.`,
    'Leave the lower-middle area open where people will stand. Absolutely NO people or characters in the image.',
    'Depth: clear foreground, middle ground and background layers, soft atmospheric perspective.',
    NO_TEXT,
  ].join(' ');
}

export function charactersPrompt(style: StoryStyle, who: 'groom' | 'bride' | 'both', place: string, action: string, groom: CastBrief, bride: CastBrief) {
  const subject =
    who === 'both' ? `${groom.label} and ${bride.label} together` : who === 'groom' ? `only ${groom.label}` : `only ${bride.label}`;
  return [
    STYLE[style],
    `Draw ${subject} exactly as they appear in the character reference sheet (same faces, hair, skin tone, proportions).`,
    `They are in this moment: ${action} (setting: ${place}). Show a natural pose and expression for that moment, with any small handheld props it needs.`,
    'Knees-up or full body, centered, facing slightly toward the viewer.',
    'Place them on a plain solid pure green background (#00FF00) with nothing else: no floor, no furniture, no scenery, no cast shadow on the background.',
    NO_TEXT,
  ].join(' ');
}

export function finaleBackgroundPrompt(style: StoryStyle, venue: string) {
  return [
    STYLE[style],
    `Vertical 9:16 background of a beautifully decorated wedding venue: ${venue || 'an elegant wedding hall with flowers and warm lights'}.`,
    'Aisle or stage in the lower-middle area left open for the couple. Absolutely NO people.',
    NO_TEXT,
  ].join(' ');
}

export function finaleCharactersPrompt(style: StoryStyle, groom: CastBrief, bride: CastBrief) {
  return [
    STYLE[style],
    `Draw ${groom.label} and ${bride.label} exactly as in the character reference sheet, now in elegant wedding attire, standing close together and smiling at the viewer, holding a bouquet.`,
    groom.look ? `${groom.label}: ${groom.look}.` : '',
    bride.look ? `${bride.label}: ${bride.look}.` : '',
    'Full body, centered, on a plain solid pure green background (#00FF00) with nothing else.',
    NO_TEXT,
  ]
    .filter(Boolean)
    .join(' ');
}
