import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const FORMAT_PROMPTS: Record<string, string> = {
  prose: `Rewrite the following as clear, professional British English prose. Fix structure, grammar, vocabulary and flow while preserving the original meaning entirely. Remove all vagueness, waffle and clumsy phrasing. Return polished, well-constructed paragraphs.`,

  document: `Rewrite the following as a polished section of a professional business document. Use formal British English. Structure it with clear paragraphs; add a short heading if one would help. Be precise, authoritative and free of filler.`,

  linkedin: `Rewrite the following as a professional LinkedIn post in British English. Make it engaging and direct with a clear point of view. 150 to 250 words. No cringe-worthy motivational language. End with at most 3 relevant hashtags if they genuinely add value, otherwise omit them.`,

  slack: `Rewrite the following as a clear, professional Slack or Microsoft Teams message in British English. Keep it concise and direct. Use short paragraphs. Professional but conversational — not a formal letter. Get to the point immediately.`,

  meeting: `Rewrite the following as structured meeting notes in British English. Format as three sections: Key discussion points, Decisions made, and Action items (with owners and deadlines where mentioned). Use bullet points. Clear and scannable.`,

  letter: `Rewrite the following as a formal business letter in British English. Use correct letter structure: salutation, body paragraphs, and a professional sign-off. Formal, clear and precise tone throughout.`,
}

const FORMAT_LABELS: Record<string, string> = {
  prose: 'polished prose',
  document: 'business document section',
  linkedin: 'LinkedIn post',
  slack: 'Slack / Teams message',
  meeting: 'meeting notes',
  letter: 'formal business letter',
}

export async function POST(req: NextRequest) {
  const { text, format } = await req.json()

  if (!text?.trim()) {
    return NextResponse.json({ error: 'Please paste some text to despunk.' }, { status: 400 })
  }

  if (!FORMAT_PROMPTS[format]) {
    return NextResponse.json({ error: 'Invalid format selected.' }, { status: 400 })
  }

  const prompt = `${FORMAT_PROMPTS[format]}

Apply these writing rules strictly:
- British English spelling and vocabulary only (organise, colour, programme, etc.)
- No emojis
- No dashes used as sentence punctuation (no em dashes or hyphens inserted mid-sentence as a pause or parenthetical). Dashes are only acceptable in number ranges (e.g. 9–5) and compound words (e.g. follow-up, well-known)
- No Oxford comma
- Collective nouns treated as plural
- Active voice preferred
- No banned phrases: "reach out", "going forward", "touch base", "leverage", "synergy", "transformative", "cutting edge", "game changing", "it is important to note", "needless to say"
- No vague quantifiers without support
- Sentence case for any headings
- One to nine written in words; numerals from 10 upwards

Original text:
${text}

Return ONLY valid JSON with exactly these fields:
{
  "output": "the fully rewritten ${FORMAT_LABELS[format]}",
  "changes": "one sentence describing the main improvements made"
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected response from AI' }, { status: 500 })
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }
}
