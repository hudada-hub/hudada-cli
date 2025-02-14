import { exec } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import Table from 'cli-table3';
import { addHistory } from './history';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Translation {
    tranCn: string;
}

interface Synonym {
    pos: string;
    synonymWords: { word: string }[];
}

interface Phrase {
    content: string;
    contentCn: string;
}

interface Sentence {
    content: string;
    contentCn: string;
}

interface WordData {
    wordHead: string;
    ukPhone: string;
    usPhone: string;
    translations: Translation[];
    synonyms: Synonym[];
    phrases: Phrase[];
    sentences: Sentence[];
    ukSpeech: string;
    usSpeech: string;
}

export async function handleWordSearch(word: string, options: { play?: boolean; uk?: boolean }) {
    try {
        const response = await fetch(`http://localhost:8080/api/translation/word/search/${word}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'accept-language': 'zh-CN,zh;q=0.9',
                'cache-control': 'no-cache',
                'pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const wordData: WordData = data.data[0];

        // 添加到历史记录
        const translations = wordData.translations.map(t => t.tranCn);
        addHistory(wordData.wordHead, translations);

        // 先显示单词信息
        displayWordInfo(wordData);

        // 再播放发音
        await playPronunciation(wordData, options);

    } catch (error) {
        console.error(chalk.red('查询失败：'), error instanceof Error ? error.message : '未知错误');
    }
}

async function playPronunciation(wordData: WordData, options: { play?: boolean; uk?: boolean }) {
    // 修改判断逻辑：当有 play 选项或没有任何选项时，播放美音；当有 uk 选项时，播放英音
    if (!options.uk) {  // 默认播放美音
        const audioUrl = wordData.usSpeech;
        console.log(chalk.blue(`🔊 正在播放美式发音...`));
        
        try {
            const cmdmp3Path = join(__dirname, 'cmdmp3.exe');
            await new Promise((resolve, reject) => {
                exec(`"${cmdmp3Path}" "${audioUrl}"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(chalk.red('播放音频失败：'), error);
                        reject(error);
                    } else {
                        resolve(true);
                    }
                });
            });
            
        } catch (error) {
            console.error(chalk.red('播放失败：'), error);
        }
    } else if (options.uk) {  // 明确指定播放英音
        const audioUrl = wordData.ukSpeech;
        console.log(chalk.blue(`🔊 正在播放英式发音...`));
        
        try {
            const cmdmp3Path = join(__dirname, 'cmdmp3.exe');
            await new Promise((resolve, reject) => {
                exec(`"${cmdmp3Path}" "${audioUrl}"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(chalk.red('播放音频失败：'), error);
                        reject(error);
                    } else {
                        resolve(true);
                    }
                });
            });
            
        } catch (error) {
            console.error(chalk.red('播放失败：'), error);
        }
    }
}

function displayWordInfo(wordData: WordData) {
    // 创建主表格
    const table = new Table({
        chars: {
            'top': '━', 'top-mid': '┳', 'top-left': '┏', 'top-right': '┓',
            'bottom': '━', 'bottom-mid': '┻', 'bottom-left': '┗', 'bottom-right': '┛',
            'left': '┃', 'left-mid': '┣', 'right': '┃', 'right-mid': '┫',
            'mid': '━', 'mid-mid': '╋', 'middle': '┃'
        },
        style: {
            head: ['cyan'],
            border: ['gray']
        },
        wordWrap: true,
        wrapOnWordBoundary: true
    });

    // 添加单词信息
    table.push(
        [{ colSpan: 4, content: chalk.yellow(`📝 ${wordData.wordHead}`), hAlign: 'center' }],
        [
            chalk.blue('英音'),
            chalk.gray(`/${wordData.ukPhone}/`),
            chalk.blue('美音'),
            chalk.gray(`/${wordData.usPhone}/`)
        ]
    );

    // 准备基本释义和同义词
    const translations = wordData.translations.map(trans => 
        chalk.white(`• ${trans.tranCn}`)
    ).join('\n');

    const synonyms = wordData.synonyms?.length > 0 
        ? wordData.synonyms.map(syn => 
            chalk.white(`${syn.pos}: ${syn.synonymWords.map(s => s.word).join(', ')}`)
        ).join('\n')
        : '';

    // 添加释义和同义词（并排显示）
    table.push([
        chalk.blue('📚 基本释义'),
        translations,
        chalk.blue('🔄 同义词'),
        synonyms || chalk.gray('无')
    ]);

    // 准备短语和例句
    const phrases = wordData.phrases?.length > 0
        ? wordData.phrases.map(phrase => 
            `${chalk.white(phrase.content)}\n${chalk.gray(phrase.contentCn)}`
        ).join('\n')
        : '';

    const sentences = wordData.sentences?.length > 0
        ? wordData.sentences.map((sentence, index) => 
            `${chalk.white(`${index + 1}. ${sentence.content}`)}\n${chalk.gray(`   ${sentence.contentCn}`)}`
        ).join('\n')
        : '';

    // 添加短语和例句（并排显示）
    table.push([
        chalk.blue('💡 常用短语'),
        phrases || chalk.gray('无'),
        chalk.blue('📝 例句'),
        sentences || chalk.gray('无')
    ]);

    // 输出表格
    console.log(table.toString());

    
} 