import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import Table from 'cli-table3';
import chalk from 'chalk';

// 获取历史记录文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const historyDir = join(__dirname, '../data');
const historyFile = join(historyDir, 'word-history.json');

interface WordHistory {
    word: string;
    timestamp: string;
    translations: string[];
}

// 确保目录存在
function ensureDirectoryExists() {
    if (!existsSync(historyDir)) {
        mkdirSync(historyDir, { recursive: true });
    }
}

// 读取历史记录
export function readHistory(): WordHistory[] {
    ensureDirectoryExists();
    if (!existsSync(historyFile)) {
        writeFileSync(historyFile, '[]', 'utf8');
        return [];
    }
    try {
        const data = readFileSync(historyFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取历史记录失败:', error);
        return [];
    }
}

// 添加历史记录
export function addHistory(word: string, translations: string[]) {
    try {
        const history = readHistory();
        // 检查是否已存在相同单词
        const exists = history.some(item => item.word === word);
        if (!exists) {
            history.push({
                word,
                timestamp: new Date().toLocaleString(),
                translations
            });
            writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');
        }
    } catch (error) {
        console.error('保存历史记录失败:', error);
    }
}

// 清除历史记录
export function clearHistory() {
    try {
        writeFileSync(historyFile, '[]', 'utf8');
        console.log(chalk.green('历史记录已清除'));
    } catch (error) {
        console.error('清除历史记录失败:', error);
    }
}

// 显示历史记录
export function displayHistory() {
    const history = readHistory();
    if (history.length === 0) {
        console.log(chalk.yellow('暂无查询历史'));
        return;
    }

    const table = new Table({
        head: [
            chalk.blue('序号'),
            chalk.blue('单词'),
            chalk.blue('释义'),
            chalk.blue('查询时间')
        ],
        chars: {
            'top': '━', 'top-mid': '┳', 'top-left': '┏', 'top-right': '┓',
            'bottom': '━', 'bottom-mid': '┻', 'bottom-left': '┗', 'bottom-right': '┛',
            'left': '┃', 'left-mid': '┣', 'right': '┃', 'right-mid': '┫',
            'mid': '━', 'mid-mid': '╋', 'middle': '┃'
        },
        style: {
            head: ['cyan'],
            border: ['gray']
        }
    });

    history.forEach((item, index) => {
        table.push([
            chalk.gray(String(index + 1)),
            chalk.white(item.word),
            chalk.gray(item.translations.join(', ')),
            chalk.gray(item.timestamp)
        ]);
    });

    console.log(table.toString());
} 