import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = process.env.DATABASE_PATH ? path.resolve(root, process.env.DATABASE_PATH) : path.join(root, 'data', 'applications.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY, title TEXT NOT NULL, company TEXT NOT NULL,
    location TEXT NOT NULL, mode TEXT NOT NULL, category TEXT NOT NULL,
    duration TEXT NOT NULL, stipend TEXT NOT NULL, description TEXT NOT NULL,
    skills TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL,
    email TEXT NOT NULL, phone TEXT NOT NULL, skills TEXT NOT NULL,
    cover_note TEXT NOT NULL, internship_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(internship_id) REFERENCES internships(id)
  );
`);
const count = db.prepare('SELECT COUNT(*) AS count FROM internships').get().count;
if (count === 0) {
  const insert = db.prepare(`INSERT INTO internships
    (id,title,company,location,mode,category,duration,stipend,description,skills)
    VALUES (@id,@title,@company,@location,@mode,@category,@duration,@stipend,@description,@skills)`);
  const seed = [
    {id:1,title:'Frontend Developer Intern',company:'PixelCraft Labs',location:'Remote · India',mode:'Remote',category:'Engineering',duration:'3 months',stipend:'₹8,000 / month',description:'Build accessible, responsive product interfaces and collaborate with designers and API engineers.',skills:'HTML, CSS, JavaScript, React'},
    {id:2,title:'Backend Engineering Intern',company:'CloudNest Technologies',location:'Pune, Maharashtra',mode:'Hybrid',category:'Engineering',duration:'4 months',stipend:'₹10,000 / month',description:'Develop REST APIs, improve data models, and write reliable automated tests.',skills:'Node.js, Express, SQL, Git'},
    {id:3,title:'UI/UX Design Intern',company:'Northstar Studio',location:'Remote · India',mode:'Remote',category:'Design',duration:'2 months',stipend:'Performance based',description:'Turn user research into clear flows, wireframes, and polished interface systems.',skills:'Figma, Prototyping, Research'},
    {id:4,title:'Data Analyst Intern',company:'MetricSpring',location:'Mumbai, Maharashtra',mode:'On-site',category:'Data',duration:'3 months',stipend:'₹7,000 / month',description:'Explore business datasets, create dashboards, and communicate useful insights.',skills:'Excel, SQL, Python, Power BI'},
    {id:5,title:'Full Stack Developer Intern',company:'Launchpad Digital',location:'Remote · India',mode:'Remote',category:'Engineering',duration:'6 months',stipend:'₹12,000 / month',description:'Ship end-to-end features across frontend, backend, and relational data storage.',skills:'JavaScript, Node.js, React, SQL'}
  ];
  const tx = db.transaction(rows => rows.forEach(row => insert.run(row)));
  tx(seed);
}
