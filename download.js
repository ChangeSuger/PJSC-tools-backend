import path from 'path';

import {
    promises as fs,
    readFileSync,
    writeFileSync,
    existsSync,
    mkdirSync,
} from 'fs';

import { fileURLToPath } from 'url';
// import OSS from 'ali-oss';

const senarioName = 'temps';
const scriptName = 'temps.tts.checked.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const story = JSON.parse(
  readFileSync(
    path.join(
      __dirname,
      'temps',
      scriptName,
    ),
    'utf-8',
  )
);

// for (const item of story) {
//   if (item.type === 'line' && item.cnAudioURLs.length > 0) {

//     const result_filename = `K-2_${item.id}_cn.wav`;

//     const result = await client.get(`pjsc-tts/K-2:${item.id}_cn_v1.wav`, path.join(__dirname, 'temps', 'K-2', result_filename));
//   }
// }


for (const item of story) {
  if (item.type === 'line') {
    if (item.cnAudioURL) {
      const fileBuffer = await fs.readFile(path.join(
        __dirname,
        'audio',
        item.cnAudioURL.split('/').pop(),
      ));

      writeFileSync(
        path.join(
          __dirname,
          'temps',
          senarioName,
          'CN',
          `${senarioName}_${item.id}_cn.wav`
        ),
        fileBuffer,
      );
    }

    if (item.jpAudioURL) {
      const fileBuffer = await fs.readFile(path.join(
        __dirname,
        'audio',
        item.jpAudioURL.split('/').pop(),
      ));

      writeFileSync(
        path.join(
          __dirname,
          'temps',
          senarioName,
          'JP',
          `${senarioName}_${item.id}_jp.wav`
        ),
        fileBuffer,
      );
    }
  }
}