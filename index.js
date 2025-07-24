import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { Client } from "@gradio/client";

import { ttsWavGenerate } from './tools/ttsBatchGenerator.js';
import { sseMessageWrapper } from './tools/sseMessageWrapper.js';

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
const upload = multer({ storage: multer.memoryStorage() });

app.use(bodyParser.json());

let ttsTemp = undefined;

// tts
app.post('/api/tts', upload.single('exampleAudio'), async (req, res) => {
  const {
    ttsConfig: ttsConfigString,
    ossConfig: ossConfigString,
    exampleText: exampleTextString,
    targetText: targetTextString,
  } = req.body;

  const ttsConfig = JSON.parse(ttsConfigString);
  const ossConfig = JSON.parse(ossConfigString);
  const exampleText = JSON.parse(exampleTextString);
  const targetText = JSON.parse(targetTextString);

  const exampleAudioBuffer = req.file.buffer;

  ttsTemp = {
    config: { ttsConfig, ossConfig },
    exampleAudioBuffer,
    exampleText,
    targetText,
  };

  res.status(200).json({ code: 200, message: 'Success' });
});

//tts sse
app.get('/api/tts-sse', async (req, res) => {
  if (!ttsTemp) {
    res.end();
    return;
  }

  const { config, exampleAudioBuffer, exampleText, targetText } = ttsTemp;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  res.write(sseMessageWrapper({
    code: 0,
  }));

  await ttsWavGenerate(
    config,
    exampleAudioBuffer,
    exampleText,
    targetText,
    res,
  );

  ttsTemp = undefined;

  res.write(sseMessageWrapper({
    code: 2,
  }));

  res.end();
});

app.post('/api/change_choices', async (req, res) => {
  const { url } = req.body;

  const app = await Client.connect(url);

  const result = await app.predict("/change_choices", []);

  res.status(200).json({
    code: 200,
    data: result.data,
  });
});

app.post('/api/change_model', async (req, res) => {
  const {
    url,
    sovitsModel,
    gptModel,
    originLang,
    targetLang,
  } = req.body;

  const app = await Client.connect(url);

  const result1 = await app.predict("/change_sovits_weights", [
    sovitsModel,
    originLang,
    targetLang,
  ]);

  const result2 = await app.predict("/change_gpt_weights", [
    gptModel,
    originLang,
    targetLang,
  ]);

  res.status(200).json({
    code: 200,
    data: [result1.data, result2.data],
  });
});

app.get('/api/audio/:audioName', async (req, res) => {
  const { audioName } = req.params;

  const fileBuffer = await fs.promises.readFile(path.join(
    __dirname,
    'audio',
    audioName,
  ));

  res.send(fileBuffer);
});

app.listen(PORT, () => {
  console.log(`PJSC Tools Backend listening on port ${PORT}`);
});
