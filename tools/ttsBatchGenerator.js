import { Client } from '@gradio/client';
import OSS from 'ali-oss';
import { sseMessageWrapper } from './sseMessageWrapper.js';
import { existsSync, writeFileSync } from 'fs';
import path from 'path';

const MAX_RETRY = 5;
const BASE_DIR = 'pjsc-tts';

async function uploadFile(ossConfig, filename, audioBuffer) {
  // const OSSClient = new OSS(ossConfig);

  // const OSSResult = await OSSClient.put(`${BASE_DIR}/${filename}`, audioBuffer);

  // if (OSSResult.res.status === 200) {
  //   return OSSResult.url;
  // } else {
  //   return;
  // }

  writeFileSync(
    path.join(
      'F:\\Github\\PJSC-tools-backend',
      'audio',
      filename,
    ),
    audioBuffer,
  );

  return `/api/audio/${filename}`;
}

async function checkAudioFileExisted(ossConfig, filename) {
  // const OSSClient = new OSS(ossConfig);

  // try {
  //   await OSSClient.head(`pjsc-tts/${filename}`);
  //   return true;
  // } catch (e) {
  //   return false;
  // }

  if (existsSync(path.join('F:\\Github\\PJSC-tools-backend', 'audio', filename))) {
    return true;
  } else {
    return false;
  }
}

function getAudioURL(ossConfig, filename) {
  // const { region, bucket } = ossConfig;

  // return `https://${bucket}.${region}.aliyuncs.com/${BASE_DIR}/${filename}`;
  return `/api/audio/${filename}`;
}

export async function ttsWavGenerate(config, exampleAudioBuffer, exampleText, targetText, res) {
  const { ossConfig, ttsConfig } = config;
  const { text, id, lang: targetLang } = targetText;

  const {
    baseURL,
    batchSize,
    sliceMethod,
    topK,
    topP,
    temperature,
    speed,
    samplingStep,
    pauseBetweenSentences,
  } = ttsConfig;

  let retryCount = 0;
  let batchCount = 0;

  while (retryCount < MAX_RETRY && batchCount < batchSize) {
    try {
      const app = await Client.connect(baseURL);

      while (batchCount < batchSize) {
        const filename = `${id}_v${batchCount + 1}.wav`;

        const isExisted = await checkAudioFileExisted(ossConfig, filename);

        if (isExisted) {
          res.write(sseMessageWrapper({
            code: 1,
            url: getAudioURL(ossConfig, filename),
          }));
        } else {
          const result = await app.predict(
            '/get_tts_wav',
            [
              exampleAudioBuffer,
              exampleText.text,
              exampleText.lang,
              text,
              targetLang,
              sliceMethod,
              topK,
              topP,
              temperature,
              false,
              speed,
              false,
              undefined,
              samplingStep,
              false,
              pauseBetweenSentences,
            ],
          );

          const audio = await fetch(result.data[0].url);
          const audioArrayBuffer = await audio.arrayBuffer();
          const audioBuffer = Buffer.from(audioArrayBuffer);

          const resultURL = await uploadFile(ossConfig, filename, audioBuffer);

          res.write(sseMessageWrapper({
            code: 1,
            url: resultURL,
          }));
        }

        batchCount++;
      }
    } catch (e) {
      console.log(e);
      res.write(sseMessageWrapper({
        code: -1,
      }));
      retryCount++;
    }
  }
}
