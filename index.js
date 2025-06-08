import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

import { cn2jp } from './tools/cn2jp.js';

const CONFIG_FILENAME = 'config.yaml';

const __indexFilePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__indexFilePath);

const config = yaml.load(
  fs.readFileSync(
    path.join(__dirname, CONFIG_FILENAME),
    'utf-8',
  )
);

const { port: PORT } = config;

const app = express();

app.use(bodyParser.json());

// test
app.post('/api/test', (req, res) => {
  console.log(req.body);

  res.status(200).json({ code: 200, message: 'success' });
});

// tts
app.post('/api/tts', (req, res) => {

});

// cn2jp
app.post('/api/translate', async (req, res) => {
  const { config, text } = req.body;

  const result = await cn2jp(config, text);

  res.status(200).json({ code: 200, data: result });
});

// emotion labeling
app.post('/api/emotion', (req, res) => {

});

app.listen(PORT, () => {
  console.log(`PJSC Tools Backend listening on port ${PORT}`);
});
