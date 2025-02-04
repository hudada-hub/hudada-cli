import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: 'sk-lRcfRuVzKMuvzay60vOdWwsyDGuWfXOvedG8Y5ncvDD7KHdh', 
  baseURL: 'https://xiaohumini.site/v1'
});



async function transcribeAudio() {
  try {
    // const response = await openai.audio.speech.create({
    //   model: 'tts-1',
    //   input: 'Hello, world!',
    //   voice: 'alloy'
    // });
    const response = await openai.beta.realtime.sessions.create({
      model: 'gpt-4o-realtime-preview-2024-10-01',
      audio: fs.createReadStream('1.wav')
    });
    console.log(response);
    // 将音频流保存为文件
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync('output.mp3', buffer);
    
    console.log('音频文件已保存为 output.mp3');
    // console.log('转录结果：', transcription.text);
  } catch (error) {
    console.error('转录出错：', error);
  }
}

transcribeAudio();