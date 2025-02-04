<template>
	<view class="container">
		<view class="voice-chat">
			<view class="status">
				<text>{{ status }}</text>
			</view>
			
			<view class="controls">
				<button 
					class="record-btn"
					:class="{ recording: isRecording }"
					@touchstart="startRecording"
					@touchend="stopRecording"
				>
					{{ isRecording ? '松开结束' : '按住说话' }}
				</button>
			</view>

			<view class="messages">
				<view 
					v-for="(msg, index) in messages" 
					:key="index"
					:class="['message', msg.role]"
				>
					<text>{{ msg.content }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { config } from '../../config.js';

// 状态变量
const isRecording = ref(false);
const status = ref('准备就绪');
const messages = ref([]);

// WebSocket 实例
let ws = null;

// 录音管理器
const recorderManager = uni.getRecorderManager();

// 初始化 WebSocket 连接
const initWebSocket = () => {
	const url = `wss://${config.API_BASE_URL.replace('https://', '')}/v1/realtime?model=${config.WHISPER_MODEL}`;
	
	ws = uni.connectSocket({
		url,
		header: {
			'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
			'OpenAI-Beta': 'realtime=v1'
		},
		success: () => {
			console.log('WebSocket连接成功');
		}
	});

	ws.onOpen(() => {
		status.value = '已连接';
		console.log('WebSocket连接已打开');
	});

	ws.onMessage((res) => {
		const data = JSON.parse(res.data);
		console.log('收到消息:', data);
		
		if (data.type === 'text') {
			messages.value.push({
				role: 'assistant',
				content: data.text
			});
		}
	});

	ws.onError((err) => {
		console.error('WebSocket错误:', err);
		status.value = '连接错误';
	});

	ws.onClose(() => {
		console.log('WebSocket已关闭');
		status.value = '连接已断开';
	});
};

// 发送音频数据
const sendAudioData = (audioData) => {
	if (!ws) return;
	
	const event = {
		type: 'audio',
		audio: {
			data: audioData,
			format: 'wav',
			sampleRate: 16000,
			channels: 1
		}
	};
	
	ws.send({
		data: JSON.stringify(event),
		success: () => {
			console.log('音频数据发送成功');
		},
		fail: (err) => {
			console.error('音频数据发送失败:', err);
		}
	});
};

// 初始化录音配置
onMounted(() => {
	initWebSocket();

	recorderManager.onStart(() => {
		console.log('开始录音');
		status.value = '正在录音...';
	});

	recorderManager.onStop(async (res) => {
		console.log('录音结束', res);
		status.value = '处理中...';
		
		try {
			// 读取音频文件数据
			const fileData = await uni.getFileSystemManager().readFileSync(res.tempFilePath);
			
			// 添加用户消息
			messages.value.push({
				role: 'user',
				content: '语音输入中...'
			});

			// 发送音频数据
			sendAudioData(fileData);
			
			status.value = '准备就绪';
		} catch (error) {
			console.error('处理音频错误:', error);
			status.value = '处理失败';
		}
	});

	recorderManager.onError((err) => {
		console.error('录音错误', err);
		status.value = '录音错误';
	});
});

// 开始录音
const startRecording = () => {
	isRecording.value = true;
	recorderManager.start({
		duration: 60000,
		sampleRate: 16000,
		numberOfChannels: 1,
		encodeBitRate: 96000,
		format: 'wav',
	});
};

// 结束录音
const stopRecording = () => {
	isRecording.value = false;
	recorderManager.stop();
};

// 组件卸载时清理
onUnmounted(() => {
	if (ws) {
		ws.close();
		ws = null;
	}
});
</script>

<style>
	.voice-chat {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.status {
		padding: 20rpx;
		text-align: center;
		background-color: #fff;
		border-bottom: 1px solid #eee;
	}

	.controls {
		padding: 30rpx;
		display: flex;
		justify-content: center;
	}

	.record-btn {
		width: 300rpx;
		height: 300rpx;
		border-radius: 50%;
		background-color: #007AFF;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		border: none;
	}

	.record-btn.recording {
		background-color: #FF3B30;
		transform: scale(0.95);
	}

	.messages {
		flex: 1;
		padding: 20rpx;
		overflow-y: auto;
	}

	.message {
		margin: 20rpx 0;
		padding: 20rpx;
		border-radius: 10rpx;
		max-width: 80%;
	}

	.message.user {
		background-color: #007AFF;
		color: #fff;
		align-self: flex-end;
		margin-left: auto;
	}

	.message.assistant {
		background-color: #E5E5EA;
		color: #000;
		align-self: flex-start;
	}
</style>
