import fs from 'fs';
import path from 'path';

import { client } from '@gradio/client';
import OSS from 'ali-oss';

async function uploadFile(config, filename) {
  const { region, accessKeyId, accessKeySecrt, bucket } = config;

  const OSSClient = new OSS({
      region: region,
      accessKeyId: accessKeyId,
      accessKeySecret: accessKeySecrt,
      bucket: bucket,
  });

  const OSSResult = await OSSClient.put(`pjsc-tts/${filename}`, audio_buffer);

  if (OSSResult.res.status === 200) {
    return OSSResult.url;
  } else {
    return;
  }
}

export async function ttsWavGenerate(config, originText) {
  const { OSSConfig, TTSConfig } = config;

  
}
