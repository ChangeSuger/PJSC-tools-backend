import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

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

// test
app.post('/api/test', (req, res) => {

});

// tts
app.post('/api/tts', (req, res) => {

});

// cn2jp
app.post('/api/translate', (req, res) => {

});

// emotion labeling
app.post('/api/emotion', (req, res) => {

});

app.listen(PORT, () => {
  console.log(`PJSC Tools Backend listening on port ${PORT}`);
});
