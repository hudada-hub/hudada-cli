<template>
    <div class="voice-chat">
      <div class="controls">
        <button @click="startListening" :disabled="isListening">
          {{ isListening ? '正在聆听...' : '开始对话' }}
        </button>
        <button @click="stopListening" :disabled="!isListening">
          停止对话
        </button>
      </div>
  
      <div class="chat-history">
        <div v-for="(message, index) in chatHistory" :key="index" 
             :class="['message', message.role]">
          {{ message.content }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import OpenAI from 'openai'
  
  // 初始化 OpenAI
  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-5c3e1f38e48d46919f1bd8c95e21985c', // 替换成你的 API key
    dangerouslyAllowBrowser:true

  })
  
  const isListening = ref(false)
  const recognition = ref(null)
  const synthesis = window.speechSynthesis
  const chatHistory = ref([])
  
  // 添加消息历史记录数组
  const messages = ref([
    { role: "system", content: "你是一个友好的中文助手，请用中文回答所有问题。" }
  ]);
  
  // 初始化语音识别
  onMounted(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.value = new webkitSpeechRecognition()
      recognition.value.continuous = true
      recognition.value.interimResults = true
      recognition.value.lang = 'zh-CN'
  
      recognition.value.onresult = handleSpeechResult
      recognition.value.onerror = (event) => {
        console.error('语音识别错误:', event.error)
        isListening.value = false
      }
    } else {
      alert('您的浏览器不支持语音识别功能')
    }
  })
  
  // 开始监听
  const startListening = () => {
    if (recognition.value) {
      recognition.value.start()
      isListening.value = true
    }
  }
  
  // 停止监听
  const stopListening = () => {
    if (recognition.value) {
      recognition.value.stop()
      isListening.value = false
    }
  }
  
  // 处理语音识别结果
  const handleSpeechResult = async (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('')
  
    if (event.results[0].isFinal) {
      // 添加用户消息到历史记录
      chatHistory.value.push({
        role: 'user',
        content: transcript
      })
  
      // 添加用户消息到 messages
      messages.value.push({
        role: 'user',
        content: transcript
      })
  
      try {
        // 调用 OpenAI API，传入完整对话历史
        const completion = await openai.chat.completions.create({
          messages: messages.value,
          model: "deepseek-chat",
          max_tokens: 150
        })
  
        let response = completion.choices[0].message.content
        
        // 添加 AI 回复到历史记录
        chatHistory.value.push({
          role: 'assistant',
          content: response
        })
  
        // 添加 AI 回复到 messages
        messages.value.push({
          role: 'assistant',
          content: response
        })
        
  
        response=response.replaceAll(/\n\n/g,'\n')

        // 语音播放 AI 回复
        speakText(response)
      } catch (error) {
        console.error('OpenAI API 错误:', error)
      }
    }
  }
  
  // 文字转语音
  const speakText = (text) => {
    fetch("/tts", {
  "headers": {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
  },

  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": `text=${text}&prompt=%5Bbreak_6%5D&voice=seed_1080_emb-covert.pt&speed=3&temperature=0.5&top_p=0.701&top_k=20&refine_max_new_token=384&infer_max_new_token=2048&text_seed=42&skip_refine=1&is_stream=0&custom_voice=0`,
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
}).then(res=>res.json()).then(res=>{

    let url = res.url;
    console.log(url,'url');
    
    // 移除之前的音频元素（如果存在）
    const oldAudio = document.querySelector('.tts-audio');
    if (oldAudio) {
      oldAudio.remove();
    }
    
    // 创建新的音频元素
    const audioElement = document.createElement('audio');
    audioElement.src = url;
    audioElement.controls = true;
    audioElement.className = 'tts-audio'; // 添加类名以便后续查找
    document.body.appendChild(audioElement);

    // 尝试自动播放
    audioElement.play().catch(error => {
      console.error('自动播放失败:', error);
    });

    // 音频播放结束后自动移除元素
    audioElement.addEventListener('ended', () => {
      console.log('音频播放结束');
      audioElement.remove();
    });

    audioElement.addEventListener('error', (e) => {
      console.error('音频播放错误:', e);
      audioElement.remove();
    });

});
    // const utterance = new SpeechSynthesisUtterance(text)
    // utterance.lang = 'zh-CN'
    // synthesis.speak(utterance)
  }
  
  // 组件卸载时清理
  onUnmounted(() => {
    if (recognition.value) {
      recognition.value.stop()
    }
    if (synthesis.speaking) {
      synthesis.cancel()
    }
  })
  </script>
  
  <style scoped>
  .voice-chat {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .controls {
    margin-bottom: 20px;
  }
  
  button {
    margin-right: 10px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #4CAF50;
    color: white;
    cursor: pointer;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .chat-history {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    height: 400px;
    overflow-y: auto;
  }
  
  .message {
    margin: 10px 0;
    padding: 10px;
    border-radius: 5px;
  }
  
  .user {
    background-color: #e3f2fd;
    margin-left: 20%;
  }
  
  .assistant {
    background-color: #f5f5f5;
    margin-right: 20%;
  }
  </style>