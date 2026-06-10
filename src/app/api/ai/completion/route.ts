import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt, type } = await req.json();

    let systemPrompt = "You are a helpful AI assistant in a note-taking app.";
    
    if (type === "summarize") {
      systemPrompt = "You are a highly skilled editor. Summarize the following text concisely. Only output the summary.";
    } else if (type === "continue") {
      systemPrompt = "You are an AI co-writer. Continue the following text seamlessly, matching its tone and style.";
    } else if (type === "fix") {
      systemPrompt = "You are an expert copyeditor. Fix any spelling or grammar mistakes in the following text. Only output the corrected text.";
    }

    const result = await streamText({
      model: google('gemini-3.5-flash'), // Using latest flash model
      system: systemPrompt,
      prompt,
    });

    return new Response(result.textStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: error.message || error.toString(), stack: error.stack }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
