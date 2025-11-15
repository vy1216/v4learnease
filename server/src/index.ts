
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

app.post('/api/materials', authenticateToken, upload.single('file'), (req: any, res) => {
  const { name, description } = req.body;
  const file = req.file;
  if (!name || !file) return res.status(400).json({ error: 'Material name and file are required' });
  const fileUrl = `http://localhost:${port}/uploads/${file.filename}`;
  const newMaterial = {
    id: `mat_${Date.now()}`,
    name,
    description: description || '',
    file_url: fileUrl,
    uploader_id: req.user.userId,
    created_at: new Date().toISOString(),
  };
  materials.push(newMaterial);
  res.status(201).json(newMaterial);
});

// --- Chat Endpoints ---
app.get('/api/messages', (req, res) => res.json(messages));

app.post('/api/messages', async (req, res) => {
  const userMessage = req.body;
  try {
    const result = await model.generateContent(userMessage.user);
    const response = await result.response;
    const botResponse = response.text();
    const newMessage = { user: userMessage.user, text: botResponse };
    messages.push(newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

// --- Generic File Upload Endpoint ---
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
