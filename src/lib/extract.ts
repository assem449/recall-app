// Local, offline extraction of flashcard candidates from plain note text.
// Handles: "Term: definition", "Term - definition", "Term — definition",
// "Term is/are/refers to/means ...", and "**Term** ..." style highlights.
export interface CardDraft {
  front: string;
  back: string;
}

const MAX_TERM_WORDS = 6;
const MIN_DEF_CHARS = 8;

function clean(s: string): string {
  return s
    .replace(/[*_`#>]+/g, '')
    .replace(/^\s*(?:[-•●▪‣]|\d+[.)])\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function validTerm(t: string): boolean {
  const words = t.split(' ').filter(Boolean);
  return words.length > 0 && words.length <= MAX_TERM_WORDS && !/[.?!]$/.test(t);
}

function ensurePeriod(s: string): string {
  return /[.!?)]$/.test(s) ? s : s + '.';
}

const SEPARATORS = [/^(.{2,60}?)\s*[:：]\s+(.+)$/, /^(.{2,60}?)\s+[-–—]\s+(.+)$/];
const VERB = /^(.{2,60}?)\s+(is defined as|is called|refers to|means|is an?|is the|are the|are)\s+(.+)$/i;

function fromLine(raw: string): CardDraft | null {
  const line = clean(raw);
  if (line.length < 12) return null;

  for (const re of SEPARATORS) {
    const m = line.match(re);
    if (m && validTerm(m[1]) && m[2].length >= MIN_DEF_CHARS) {
      return { front: `What is ${m[1]}?`, back: ensurePeriod(m[2]) };
    }
  }

  const v = line.match(VERB);
  if (v && validTerm(v[1]) && v[3].length >= MIN_DEF_CHARS) {
    const verb = v[2].toLowerCase();
    const body = /^is an?$|^is the$|^are the$|^are$/.test(verb) ? `${v[2]} ${v[3]}` : `${verb} ${v[3]}`;
    return { front: `What is ${v[1]}?`, back: ensurePeriod(`${v[1]} ${body}`) };
  }
  return null;
}

export function extractCards(text: string): CardDraft[] {
  const seen = new Set<string>();
  const out: CardDraft[] = [];
  const lines = text.split(/\r?\n|(?<=[.!?])\s+(?=[A-Z])/);
  for (const l of lines) {
    const card = fromLine(l);
    if (!card) continue;
    const key = card.front.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(card);
  }
  return out;
}
