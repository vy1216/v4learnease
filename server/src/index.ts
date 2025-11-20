
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const pdfParseAny: any = require('pdf-parse');

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

// Configure CORS properly
const allowedOrigins = new Set([
  process.env.PUBLIC_FRONTEND_URL || '',
  'http://localhost:5173',
  'https://v4learnease.vercel.app',
]);

import type { CorsOptions } from "cors";
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// In-memory storage
const users: any[] = [];
let messages: { user: string; text: string }[] = [];
const materials: any[] = [];
const uploadsIndex = new Map<string, { name: string; url: string; text: string }>();
const helpTickets: { id: string; name: string; email: string; message: string; created_at: string }[] = [];
type QuizQuestion = { id: string; type: 'mcq' | 'tf' | 'short'; question: string; options?: string[]; answer: string; topic: string; difficulty: 'easy' | 'medium' | 'hard' };
type Quiz = { id: string; topic: string; questions: QuizQuestion[]; created_at: string };
type QuizAnswer = { questionId: string; answer: string; timeMs: number };
type QuizResult = { id: string; quizId: string; topic: string; score: number; total: number; improvements: { topic: string; count: number }[]; avgTimeMs: number; details: { questionId: string; correct: boolean; timeMs: number; userAnswer: string; explanation: string }[]; created_at: string };
const quizStore = new Map<string, Quiz>();
const quizResults: QuizResult[] = [];

// --- Auth Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Root Endpoint ---
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running', version: '1.0.0' });
});

// --- Auth Endpoints ---
app.post('/api/register', async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) return res.status(400).json({ error: 'All fields are required' });
  if (users.find(user => user.email === email)) return res.status(400).json({ error: 'User already exists' });
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, username, email, password: hashedPassword };
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(user => user.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
});

app.post('/api/validate-token', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ valid: false });
    try {
        jwt.verify(token, JWT_SECRET);
        res.json({ valid: true });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

// --- Materials Endpoints ---
app.get('/api/materials', (req, res) => {
  res.json(materials);
});

app.post('/api/materials', authenticateToken, upload.single('file'), async (req: any, res) => {
  const { name, description } = req.body;
  const file = req.file;
  if (!name || !file) return res.status(400).json({ error: 'Material name and file are required' });
  const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const fileUrl = `${baseUrl}/uploads/${file.filename}`;
  const newMaterial = {
    id: `mat_${Date.now()}`,
    name,
    description: description || '',
    file_url: fileUrl,
    uploader_id: req.user.userId,
    created_at: new Date().toISOString(),
  };
  materials.push(newMaterial);
  try {
    const filePath = path.join(uploadsDir, file.filename);
    let text = '';
    const mime = file.mimetype || '';
    if (mime.includes('pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await (require('pdf-parse'))(dataBuffer);
      text = parsed.text || '';
    } else if (mime.startsWith('text/')) {
      text = fs.readFileSync(filePath, 'utf-8');
    }
    if (text.length > 20000) {
      text = text.slice(0, 20000);
    }
    uploadsIndex.set(newMaterial.id, { name: file.originalname, url: fileUrl, text });
  } catch (e) {
    console.error('Failed to index material for AI context:', e);
  }
  res.status(201).json(newMaterial);
});

// --- Chat Endpoints ---
app.get('/api/messages', (req, res) => res.json(messages));

app.post('/api/messages', async (req, res) => {
  const userMessage = req.body;
  console.log('Received message:', userMessage);
  
  if (!userMessage.user) {
    return res.status(400).json({ error: 'Message text is required' });
  }
  
  try {
    console.log('Calling Groq API with:', userMessage.user);
    let contextText = '';
    if (Array.isArray(userMessage.fileIds)) {
      for (const id of userMessage.fileIds) {
        const item = uploadsIndex.get(id);
        if (item && item.text) {
          contextText += `

[${item.name}]
${item.text}`;
        }
      }
      if (contextText.length > 20000) {
        contextText = contextText.slice(0, 20000);
      }
    }
    if (!process.env.GROQ_API_KEY) {
      const text = buildContextAnswer(userMessage.user, contextText);
      const newMessage = { user: userMessage.user, text };
      messages.push(newMessage);
      return res.status(201).json(newMessage);
    }
    const messagesPayload: { role: 'system' | 'user'; content: string }[] = [];
    messagesPayload.push({ role: 'system', content: 'Format responses for easy scanning: use short headers when helpful, concise bullet points, numbered steps for procedures, and avoid fluff. Keep answers precise and structured.' });
    if (contextText) {
      messagesPayload.push({ role: 'system', content: 'Use the following document excerpts as context. If the user asks to reference or read their materials, answer using the provided context only when relevant.' });
      messagesPayload.push({ role: 'user', content: contextText });
    }
    messagesPayload.push({ role: 'user', content: userMessage.user });
    const completion = await groq.chat.completions.create({
      messages: messagesPayload,
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    console.log('Groq response received:', JSON.stringify(completion, null, 2));
    const botResponse = completion.choices[0]?.message?.content || 'No response';
    console.log('Bot response:', botResponse);
    
    const newMessage = { user: userMessage.user, text: botResponse };
    messages.push(newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('ERROR calling Groq API - Full Error Object:', error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && 'status' in error) {
      console.error('HTTP Status:', (error as any).status);
      console.error('Error details:', (error as any).error || (error as any).response);
    }
    const contextText = Array.isArray(userMessage.fileIds)
      ? userMessage.fileIds.map((id: string) => uploadsIndex.get(id)?.text || '').join('\n')
      : '';
    const offline = buildContextAnswer(userMessage.user, contextText);
    const text = offline || generateHelpfulReply(userMessage.user);
    const newMessage = { user: userMessage.user, text };
    messages.push(newMessage);
    res.status(201).json(newMessage);
  }
});

app.post('/api/help', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
  const id = `help_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const item = { id, name, email, message, created_at: new Date().toISOString() };
  helpTickets.push(item);
  res.status(201).json({ id });
});

function pickTopicFromMessages(history: { user: string; text: string }[]): string {
  const lastUser = [...history].reverse().find(m => m.user);
  const src = [lastUser?.user || '', lastUser?.text || ''].join(' ').trim();
  return src || 'general knowledge';
}

function buildQuiz(topic: string): Quiz {
  const id = `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const base = topic.trim() || 'general knowledge';
  const makeId = (n: number) => `${id}_q${n}`;
  const q: QuizQuestion[] = [];
  const stems = [
    `Which statement about ${base} is most accurate?`,
    `Choose the best example of ${base}.`,
    `Which concept is fundamental to ${base}?`,
    `Identify a misconception about ${base}.`,
    `Select the correct property related to ${base}.`
  ];
  for (let i = 1; i <= 10; i++) {
    const diff = i <= 4 ? 'easy' : i <= 8 ? 'medium' : 'hard';
    if (i % 3 === 1) {
      const correct = `Key principle of ${base}`;
      const options = [correct, `Irrelevant detail about ${base}`, `Common misconception in ${base}`, `Statement not true for ${base}`];
      q.push({ id: makeId(i), type: 'mcq', question: stems[i % stems.length], options, answer: correct, topic: base, difficulty: diff });
    } else if (i % 3 === 2) {
      const answer = i % 2 === 0 ? 'True' : 'False';
      q.push({ id: makeId(i), type: 'tf', question: `The statement about ${base} is correct.`, options: ['True', 'False'], answer, topic: base, difficulty: diff });
    } else {
      q.push({ id: makeId(i), type: 'short', question: `Briefly explain ${base} or list a core element.`, answer: `Core element of ${base}`, topic: base, difficulty: diff });
    }
  }
  const quiz: Quiz = { id, topic: base, questions: q, created_at: new Date().toISOString() };
  quizStore.set(id, quiz);
  return quiz;
}

async function generateQuizWithGroq(topic: string): Promise<Quiz | null> {
  try {
    const id = `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const messagesPayload: { role: 'system' | 'user'; content: string }[] = [];
    messagesPayload.push({ role: 'system', content: 'You generate quizzes. Return strict JSON only.' });
    messagesPayload.push({ role: 'user', content: `Create a 10-question quiz for topic: ${topic}. Use types: mcq|tf|short. Include fields: type, question, options (for mcq/tf), answer, topic, difficulty (easy|medium|hard). Return JSON: {"questions":[...]}. Do not include explanations.` });
    const completion = await groq.chat.completions.create({ messages: messagesPayload, model: GROQ_MODEL, temperature: 0.2, max_tokens: 2048 });
    const content = completion.choices[0]?.message?.content || '';
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    const jsonText = start >= 0 && end >= 0 ? content.slice(start, end + 1) : content;
    const parsed = JSON.parse(jsonText);
    const list = Array.isArray(parsed?.questions) ? parsed.questions : [];
    const questions: QuizQuestion[] = list.slice(0, 10).map((q: any, idx: number) => ({
      id: `${id}_q${idx + 1}`,
      type: String(q.type) as any,
      question: String(q.question),
      options: Array.isArray(q.options) ? q.options.map((x: any) => String(x)) : undefined,
      answer: String(q.answer),
      topic: String(q.topic || topic),
      difficulty: (q.difficulty === 'easy' || q.difficulty === 'medium' || q.difficulty === 'hard') ? q.difficulty : (idx < 4 ? 'easy' : idx < 8 ? 'medium' : 'hard'),
    }));
    if (questions.length < 10) return null;
    const quiz: Quiz = { id, topic: String(topic), questions, created_at: new Date().toISOString() };
    quizStore.set(id, quiz);
    return quiz;
  } catch {
    return null;
  }
}

app.post('/api/quiz/generate', async (req, res) => {
  try {
    const { topic, history } = req.body || {};
    const base = (topic && String(topic)) || pickTopicFromMessages(Array.isArray(history) ? history : messages);
    let quiz: Quiz | null = null;
    if (process.env.GROQ_API_KEY) {
      quiz = await generateQuizWithGroq(base);
    }
    if (!quiz) {
      quiz = buildQuiz(base);
    }
    res.status(201).json({ id: quiz.id });
  } catch {
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

app.get('/api/quiz/:id', (req, res) => {
  const quiz = quizStore.get(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json(quiz);
});

app.get('/api/quizzes', (req, res) => {
  res.json(Array.from(quizStore.values()).slice(-20));
});

app.post('/api/quiz/submit', (req, res) => {
  const { quizId, answers } = req.body || {};
  const quiz = quizStore.get(String(quizId));
  if (!quiz || !Array.isArray(answers)) return res.status(400).json({ error: 'Invalid payload' });
  let score = 0;
  const details: { questionId: string; correct: boolean; timeMs: number; userAnswer: string; explanation: string }[] = [];
  const wrongTopics: Record<string, number> = {};
  let totalTime = 0;
  for (const a of answers as QuizAnswer[]) {
    const q = quiz.questions.find(x => x.id === a.questionId);
    if (!q) continue;
    const correct = String(a.answer).trim() === String(q.answer).trim();
    if (correct) score += 1; else wrongTopics[q.topic] = (wrongTopics[q.topic] || 0) + 1;
    totalTime += Number(a.timeMs) || 0;
    const explanation = buildExplanation(q, correct, String(a.answer));
    details.push({ questionId: q.id, correct, timeMs: Number(a.timeMs) || 0, userAnswer: String(a.answer), explanation });
  }
  const improvements = Object.entries(wrongTopics).map(([topic, count]) => ({ topic, count }));
  const avgTimeMs = details.length ? Math.round(totalTime / details.length) : 0;
  const id = `qr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const result: QuizResult = { id, quizId: quiz.id, topic: quiz.topic, score, total: quiz.questions.length, improvements, avgTimeMs, details, created_at: new Date().toISOString() };
  quizResults.push(result);
  res.status(201).json(result);
});

app.get('/api/quiz-results', (req, res) => {
  res.json(quizResults.slice(-20));
});

function buildExplanation(q: QuizQuestion, correct: boolean, userAnswer: string): string {
  const t = q.topic;
  const base = q.type === 'mcq'
    ? `The correct choice reflects a core idea in ${t}.`
    : q.type === 'tf'
    ? `This is ${q.answer.toLowerCase()} based on ${t} principles.`
    : `A concise definition for ${t} is expected here.`;
  const why = correct
    ? `It aligns with ${t} fundamentals and typical examples.`
    : `Your answer (${userAnswer}) misses the ${t} principle captured by the correct answer.`;
  return `${base} ${why}`;
}

app.get('/api/quiz-report/:resultId', (req, res) => {
  const rid = req.params.resultId;
  const result = quizResults.find(r => r.id === rid);
  if (!result) return res.status(404).json({ error: 'Result not found' });
  const quiz = quizStore.get(result.quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const joined = result.details.map(d => {
    const q = quiz.questions.find(x => x.id === d.questionId);
    return {
      id: d.questionId,
      type: q?.type || 'mcq',
      question: q?.question || '',
      options: q?.options || [],
      correctAnswer: q?.answer || '',
      userAnswer: d.userAnswer,
      correct: d.correct,
      difficulty: q?.difficulty || 'easy',
      timeMs: d.timeMs,
      explanation: d.explanation,
      topic: q?.topic || result.topic,
    };
  });
  const weakTopics = result.improvements.map(i => i.topic);
  const advice = weakTopics.length === 0 ? [] : weakTopics.map(t => {
    if (/thermodynamics/i.test(t)) return 'Review energy, entropy, and state variables; solve problems on first/second law applications and cycles.';
    if (/integrals?/i.test(t)) return 'Practice definite/indefinite integrals, substitution, and parts; focus on interpreting area and accumulation.';
    if (/photosynthesis/i.test(t)) return 'Revisit steps (light reactions, Calvin cycle) and limiting factors; connect to chlorophyll role and energy conversion.';
    return `Strengthen core concepts in ${t} with targeted exercises and examples.`;
  });
  res.json({ quizId: quiz.id, topic: quiz.topic, score: result.score, total: result.total, avgTimeMs: result.avgTimeMs, items: joined, advice });
});

function buildContextAnswer(query: string, context: string): string {
  const q = (query || '').toLowerCase();
  const words = q.split(/[^a-z0-9]+/).filter(w => w.length >= 3);
  const sentences = (context || '').split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const scored = sentences.map(s => {
    const ls = s.toLowerCase();
    const score = words.reduce((acc, w) => acc + (ls.includes(w) ? 1 : 0), 0);
    return { s, score };
  }).sort((a, b) => b.score - a.score);
  const picks = (scored[0]?.score ? scored.filter(x => x.score > 0) : scored).slice(0, 5).map(x => x.s.trim());
  if (picks.length === 0) return '';
  return `Based on your materials, here are relevant excerpts:\n\n - ${picks.join('\n - ')}`;
}

function generateHelpfulReply(query: string): string {
  const q = (query || '').trim();
  if (!q) {
    return 'Please ask a question or upload materials so I can help.';
  }
  if (/photosynthesis/i.test(q)) {
    return 'Photosynthesis converts light energy to chemical energy in plants, producing glucose and oxygen.';
  }
  if (/recursion/i.test(q)) {
    return 'Recursion is defining a function in terms of itself, with a base case to stop.';
  }
  if (/big\s*o/i.test(q)) {
    return 'Big O describes time/space growth with input size; common orders: O(1), O(log n), O(n), O(n log n), O(n^2).';
  }
  return 'I can help. Please upload materials or ask a more specific question for a concise explanation.';
}

// --- Generic File Upload Endpoint ---
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const filePath = path.join(uploadsDir, req.file.filename);
    let text = '';
    const mime = req.file.mimetype || '';
    if (mime.includes('pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfParseAny(dataBuffer);
      text = parsed.text || '';
    } else if (mime.startsWith('text/')) {
      text = fs.readFileSync(filePath, 'utf-8');
    }
    if (text.length > 20000) {
      text = text.slice(0, 20000);
    }
    const id = `up_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    uploadsIndex.set(id, { name: req.file.originalname, url: fileUrl, text });
    res.json({ id, url: fileUrl, name: req.file.originalname });
  } catch (e) {
    res.status(500).json({ error: 'Failed to process uploaded file' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});









