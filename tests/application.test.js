import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { db } from '../src/database.js';

describe('LaunchBoard API regression checks', () => {
  it('returns a healthy API and database status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', database: 'connected' });
  });
  it('returns seeded internships', async () => {
    const response = await request(app).get('/api/internships');
    expect(response.status).toBe(200);
    expect(response.body.count).toBeGreaterThanOrEqual(5);
    expect(response.body.internships[0].skills).toBeInstanceOf(Array);
  });
  it('filters internships using a search query', async () => {
    const response = await request(app).get('/api/internships?search=Frontend');
    expect(response.status).toBe(200);
    expect(response.body.internships.some(item => item.title.includes('Frontend'))).toBe(true);
  });
  it('filters by category and mode', async () => {
    const response = await request(app).get('/api/internships?category=Design&mode=Remote');
    expect(response.status).toBe(200);
    expect(response.body.internships.every(item => item.category === 'Design' && item.mode === 'Remote')).toBe(true);
  });
  it('rejects invalid application fields', async () => {
    const response = await request(app).post('/api/applications').send({ fullName: 'A', email: 'bad-email', phone: 'x', skills: '', internshipId: 999 });
    expect(response.status).toBe(400);
    expect(response.body.fields).toHaveProperty('email');
    expect(response.body.fields).toHaveProperty('internshipId');
  });
  it('stores a valid application', async () => {
    const response = await request(app).post('/api/applications').send({ fullName: 'Test Applicant', email: `test-${Date.now()}@example.com`, phone: '+91 98765 43210', skills: 'HTML, CSS, JavaScript', coverNote: 'Interested in learning and contributing.', internshipId: 1 });
    expect(response.status).toBe(201);
    expect(response.body.applicationId).toBeTypeOf('number');
  });
  it('returns a JSON 404 for unknown API routes', async () => {
    const response = await request(app).get('/api/not-a-route');
    expect(response.status).toBe(404);
    expect(response.body.error).toMatch(/not found/i);
  });
  it('sets security headers', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers).toHaveProperty('content-security-policy');
  });
});
