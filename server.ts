import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface SearchContext {
  dailyCalorieTarget?: number;
  goalMode?: string;
  todayCaloriesIn?: number;
  todayCaloriesBurned?: number;
}

app.post('/api/search', async (req, res) => {
  try {
    const rawQuery = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    if (!rawQuery) {
      res.status(400).json({ error: 'Please enter a search query.' });
      return;
    }
    if (rawQuery.length > 1000) {
      res.status(400).json({ error: 'Query is too long. Please keep it under 1000 characters.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in environment secrets.',
      });
      return;
    }

    const ctx = (req.body?.context ?? {}) as SearchContext;
    const contextLines: string[] = [];
    if (ctx.goalMode) contextLines.push(`User goal mode: ${ctx.goalMode}`);
    if (typeof ctx.dailyCalorieTarget === 'number') {
      contextLines.push(`Daily calorie target: ${ctx.dailyCalorieTarget} kcal`);
    }
    if (typeof ctx.todayCaloriesIn === 'number') {
      contextLines.push(`Calories logged today: ${ctx.todayCaloriesIn} kcal`);
    }
    if (typeof ctx.todayCaloriesBurned === 'number') {
      contextLines.push(`Calories burned today: ${ctx.todayCaloriesBurned} kcal`);
    }

    const systemInstruction = [
      'You are the universal search and knowledge engine inside the KayaForge fitness app.',
      'Answer any question the user asks accurately, clearly, and concisely.',
      'Match the user language naturally: if they ask in Hinglish or Hindi, reply clearly in Hinglish/Hindi; if in English, reply in English.',
      'If the question is about food, diet, nutrition, calories, or workouts, include practical numbers (calories, protein/carbs/fats per serving, sets/reps, or duration).',
      'If the question is about any general topic outside fitness, still answer it directly and helpfully.',
      contextLines.length > 0 ? `Optional user context (use only when relevant): ${contextLines.join('; ')}.` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const modelsToTry = [
      'gemini-4-hydrogen',
      'gemini-3.1-flash-lite',
      'gemini-4-hydrogen',
      'gemini-3.1-flash-lite',
    ] as const;
    let answer = '';
    let lastError: unknown = null;

    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      try {
        const response = await ai.models.generateContent({
          model,
          contents: rawQuery,
          config: {
            systemInstruction,
          },
        });
        answer = (response.text ?? '').trim();
        if (answer) break;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isTransient =
          msg.includes('429') ||
          msg.includes('503') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('RESOURCE_EXHAUSTED');
        if (!isTransient) {
          throw err;
        }
        if (i < modelsToTry.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 600 * (i + 1)));
        }
      }
    }

    if (!answer && lastError) {
      throw lastError;
    }

    res.json({
      answer: answer || 'No answer could be generated for this query. Try rephrasing your question.',
      sources: [],
    });
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : 'Failed to process search request.';
    console.error('Search API error:', rawMsg);
    const isQuota = rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED');
    const isBusy = rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE');
    res.status(isQuota ? 429 : isBusy ? 503 : 500).json({
      error: isQuota
        ? 'Gemini API quota limit reached for your current key. Please check your API key plan or quota in Settings > Secrets.'
        : isBusy
          ? 'Search service is experiencing temporary high demand. Please retry in a few seconds.'
          : rawMsg,
    });
  }
});

async function startServer() {
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`KayaForge server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
