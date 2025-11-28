import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { RAICHEL_SYSTEM_PROMPT } from '@/lib/raichelSystemPrompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ClientMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return NextResponse.json(
      { error: 'Configuration manquante pour OpenAI.' },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const message: string | undefined = body?.message;
  const history: unknown = body?.history;

  if (!message || typeof message !== 'string') {
    return NextResponse.json(
      { error: 'Le message utilisateur est requis.' },
      { status: 400 },
    );
  }

  const normalizedHistory: ClientMessage[] = Array.isArray(history)
    ? history
        .filter(
          (item): item is ClientMessage =>
            typeof item?.content === 'string' &&
            (item?.role === 'user' || item?.role === 'assistant'),
        )
        .map((item) => ({
          role: item.role,
          content: item.content,
        }))
    : [];

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.1',
      messages: [
        { role: 'system', content: RAICHEL_SYSTEM_PROMPT },
        ...normalizedHistory,
        { role: 'user', content: message.trim() },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      console.error('Raichel API returned an empty response');
      return NextResponse.json(
        { error: 'La réponse est vide.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error while calling OpenAI for Raichel:', error);
    return NextResponse.json(
      { error: "Raichel ne peut pas répondre pour le moment." },
      { status: 500 },
    );
  }
}
