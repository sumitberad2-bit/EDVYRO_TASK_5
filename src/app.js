import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { db } from './database.js';
import { logger } from './logger.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.use(express.static('public', { maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => logger.info('http_request', { method: req.method, path: req.path, status: res.statusCode, duration_ms: Date.now() - started }));
  next();
});
app.use('/api', rateLimit({ windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, limit: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many requests. Please try again shortly.' } }));

app.get('/api/health', (_req, res) => {
  try { db.prepare('SELECT 1').get(); res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() }); }
  catch { res.status(503).json({ status: 'error', database: 'unavailable' }); }
});
app.get('/api/internships', (req, res) => {
  const search = String(req.query.search || '').trim().slice(0, 80);
  const category = String(req.query.category || '').trim().slice(0, 40);
  const mode = String(req.query.mode || '').trim().slice(0, 20);
  let sql = 'SELECT * FROM internships WHERE 1=1';
  const params = {};
  if (search) { sql += ' AND (title LIKE @search OR company LIKE @search OR location LIKE @search OR skills LIKE @search)'; params.search = `%${search}%`; }
  if (category && category !== 'All') { sql += ' AND category = @category'; params.category = category; }
  if (mode && mode !== 'All') { sql += ' AND mode = @mode'; params.mode = mode; }
  sql += ' ORDER BY id';
  const rows = db.prepare(sql).all(params).map(row => ({ ...row, skills: row.skills.split(', ') }));
  res.json({ count: rows.length, internships: rows });
});
app.post('/api/applications', (req, res) => {
  const { fullName, email, phone, skills, coverNote = '', internshipId } = req.body || {};
  const name = typeof fullName === 'string' ? fullName.trim() : '';
  const mail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const phoneText = typeof phone === 'string' ? phone.trim() : '';
  const skillText = typeof skills === 'string' ? skills.trim() : '';
  const note = typeof coverNote === 'string' ? coverNote.trim() : '';
  const id = Number(internshipId);
  const errors = {};
  if (name.length < 2 || name.length > 80) errors.fullName = 'Enter a name between 2 and 80 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) || mail.length > 120) errors.email = 'Enter a valid email address.';
  if (!/^[+()\-\d\s]{7,20}$/.test(phoneText)) errors.phone = 'Enter a valid phone number.';
  if (skillText.length < 2 || skillText.length > 300) errors.skills = 'List your skills (2–300 characters).';
  if (note.length > 1000) errors.coverNote = 'Keep your note under 1,000 characters.';
  if (!Number.isInteger(id) || !db.prepare('SELECT id FROM internships WHERE id = ?').get(id)) errors.internshipId = 'Choose an available internship.';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please correct the highlighted fields.', fields: errors });
  try {
    const result = db.prepare(`INSERT INTO applications (full_name,email,phone,skills,cover_note,internship_id) VALUES (?,?,?,?,?,?)`).run(name, mail, phoneText, skillText, note, id);
    logger.info('application_created', { application_id: result.lastInsertRowid, internship_id: id });
    return res.status(201).json({ message: 'Application submitted successfully.', applicationId: result.lastInsertRowid });
  } catch (error) {
    logger.error('application_create_failed', { message: error.message });
    return res.status(500).json({ error: 'Unable to save your application right now.' });
  }
});
app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.get(/.*/, (_req, res) => res.sendFile('index.html', { root: 'public' }));
app.use((err, _req, res, _next) => { logger.error('unhandled_error', { message: err.message }); res.status(500).json({ error: 'An unexpected server error occurred.' }); });
