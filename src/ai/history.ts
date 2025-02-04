import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
// 历史记录文件路径
const HISTORY_FILE = path.join(process.cwd(), 'ai_history.json');

// 历史记录接口
export interface ChatHistory {
    messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
    }>;
}


// 保存历史记录
export function saveHistory(history: ChatHistory) {
    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error(chalk.yellow('保存历史记录失败'));
    }
}

// 清除历史记录
export  function clearHistory() {
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            fs.unlinkSync(HISTORY_FILE);
        }
        console.log(chalk.green('历史记录已清除'));
    } catch (error) {
        console.error(chalk.red('清除历史记录失败'));
    }
}

// 读取历史记录
export  function loadHistory(): ChatHistory {
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            const data = fs.readFileSync(HISTORY_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(chalk.yellow('读取历史记录失败，将创建新的历史记录'));
    }
    return { messages: [] };
}