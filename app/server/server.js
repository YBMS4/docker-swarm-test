import { createServer } from 'http';
import cors from 'cors';
import express from 'express';
import { hostname } from 'os';

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get("/process-id", (req, res) => {
    res.status(200).json({ 
      hostname: hostname(),
      processId: process.pid, 
    });
});

server.listen(3000, "0.0.0.0", () => {
  console.log('Server is running on http://0.0.0.0:3000 (Meaning all interfaces)');
});