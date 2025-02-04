import OpenAI from "openai";
import chalk from 'chalk';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { getApiKey, setApiKey } from './config';
import path from 'path';
import fs from 'fs';
import { templates, Template, saveTemplates, loadTemplates } from './ai/templates';
import { createInterface } from 'readline';
import { select } from '@inquirer/prompts';
import { ChatHistory } from './ai/history';
import { loadHistory, saveHistory } from './ai/history';
import autocomplete from 'inquirer-autocomplete-standalone';

// 添加选项类型定义
interface TemplateChoice {
    name: string;
    value: (Template ) & { isLocal: boolean };
}

type Separator = { type: string; line: string };


// 创建一个全局的 readline 接口
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

// 异步读取用户输入
async function getUserInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
}

// 选择模板函数
async function selectTemplate(): Promise<Template | null> {
    console.clear();
    const choices = templates.map(template => ({
        name: `${template.act}`,
        value: { ...template, isLocal: true }
    }));

    try {
        const selected = await select({
            message: '请选择一个AI模板：',
            choices
        });

        return selected as Template;
    } catch (error) {
        console.log('已取消选择');
        return null;
    }
}

// 添加新模板
async function addTemplate(): Promise<void> {
    try {
        console.log(chalk.cyan('\n添加新的 AI 对话模板\n'));
        
        const act = await getUserInput('模板名称: ');
        if (!act.trim()) {
            console.error(chalk.red('模板名称不能为空'));
            return;
        }

        // 检查名称是否已存在
        const existingTemplate = templates.find(t => t.act === act);
        if (existingTemplate) {
            console.error(chalk.red('模板名称已存在'));
            return;
        }

        const prompt = await getUserInput('模板提示词: ');

        if (!prompt.trim()) {
            console.error(chalk.red('提示词不能为空'));
            return;
        }

        const newTemplate: Template = {
            act,
            prompt
        };

        // 添加新模板
        const allTemplates = loadTemplates();
        allTemplates.push(newTemplate);
        
        // 保存模板
        if (saveTemplates(allTemplates)) {
            console.log(chalk.green('\n模板添加成功！'));
        } else {
            console.error(chalk.red('\n模板保存失败'));
        }
    } catch (error) {
        console.error(chalk.red('添加模板失败:', error));
    }
}





// @ts-ignore
// 配置 marked
marked.use(markedTerminal({
    code: chalk.yellow,
    codespan: chalk.yellow,
    strong: chalk.bold,
    em: chalk.italic,
    heading: chalk.bold.green,
    listitem: chalk.cyan
}));

// 添加延迟函数
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 检测文本是否包含 Markdown 语法
function isMarkdown(text: string): boolean {
    // 常见的 Markdown 语法模式
    const markdownPatterns = [
        /^#{1,6}\s/, // 标题
        /\*\*.+?\*\*/, // 粗体
        /\*.+?\*/, // 斜体
        /`{1,3}[^`]+`{1,3}/, // 代码块
        /\[.+?\]\(.+?\)/, // 链接
        /!\[.+?\]\(.+?\)/, // 图片
        /^\s*[-*+]\s/, // 无序列表
        /^\s*\d+\.\s/, // 有序列表
        /^\s*>\s/, // 引用
        /\|.+\|.+\|/, // 表格
        /^-{3,}$/, // 分隔线
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
}

// 平滑输出文本
async function smoothOutput(text: string, isMarkdownText: boolean = false) {
    // 如果是 Markdown 格式，使用 marked 渲染
    const outputText = isMarkdownText ? await marked(text) : text;
    for (const char of outputText) {
        process.stdout.write(char);
        await delay(25);
    }
}




async function displayTemplates(): Promise<Template> {
    const localTemplateChoices = templates.map((template) => ({
        name: `${template.act}`,
        value: template,
        description: template.prompt.slice(0,300) // 显示提示词的前50个字符
    }));

    try {
        const selected = await autocomplete({
            message: '请选择或搜索模板:',
            source: async (input) => {
              

                let filtered = localTemplateChoices.filter(item=>item.name.includes(input as string))
                if(!input){
                    filtered = localTemplateChoices;
                }
                return filtered.map(country => {
                  return {
                    value: country.name,
                    description: `${country.description}`
                  }
                })
              },
        });


        return localTemplateChoices.filter(item=>item.name.includes(selected))[0].value as Template;
    } catch (error) {
        console.log('已取消选择',error);
       
    }
}
export async function handleAi(args: string[], options?: { save?: string }) {
    try {
        // 检查是否需要保存输出
        let saveToFile = false;
        let saveFilePath = '';
        
        if(options?.save) {
            saveToFile = true;
            saveFilePath = options.save;
        }

        // 处理 key 设置
        if (args[0] === 'key') {
            if (!args[1]) {
                console.error(chalk.yellow('格式为:my ai key <your-api-key>'));
                process.exit(0);
                return;
            }
            setApiKey(args[1]);
            console.log(chalk.green('API key 已设置'));
            return;
        }

        // 处理清除历史记录
        if (args[0] === 'clear') {
            saveHistory({ messages: [] });
            console.log(chalk.green('聊天历史已清除'));
            return;
        }

        // 处理列出模板
        if (args[0] === 'list') {
            const selectedTemplate = await displayTemplates();
          
            
            if (selectedTemplate) {
                 
          
              
                 console.log(chalk.green(`已选择模板: ${selectedTemplate.act}`));
                 const history: ChatHistory = {
                    messages: [{
                        role: "system",
                        content: selectedTemplate.prompt
                    }]
                };
                saveHistory(history);
                console.log(chalk.gray('现在可以开始对话了！'));
            }
            return;
        }

        
        
     

        // 处理添加模板命令
        if (args[0] === 'add') {
            await addTemplate();
            process.exit(0);
            return;
        }

        // 处理读取文件命令
        if (args[0] === 'read') {
            if (!args[1]) {
                console.error(chalk.yellow('请提供文件路径'));
                return;
            }
            const filePath = path.resolve(process.cwd(), args[1]);
            if (!fs.existsSync(filePath)) {
                console.error(chalk.red(`文件不存在: ${filePath}`));
                return;
            }

            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const fileExt = path.extname(filePath).toLowerCase();
                
                // 构建提示信息
                const filePrompt = `这是一个${fileExt}文件的内容，如果读取文件完毕,请回复 "已读取文件完毕"`;
                args = [filePrompt, content]; // 替换参数为文件内容
            } catch (error) {
                console.error(chalk.red(`读取文件失败: ${(error as Error).message}`));
                return;
            }
        }

        
        

        // 开始持续对话
        const history = loadHistory();
      
        let currentMessage = '';
        if(args[1]){
            currentMessage=args[0];
        }else{
            currentMessage = args.join(' ');
        }
      

        
        while (true) {
         
            // 如果是空消息则继续等待输入
            if (!currentMessage.trim()) {
                currentMessage = await getUserInput(chalk.cyan('你: '));
                if (currentMessage.toLowerCase() === 'exit') {
                    console.log(chalk.yellow('退出对话'));
                    rl.close();
                    break;
                }
                continue;
            }

            // 检查是否与上一次输入相同
            if (history.messages.length > 1 && 
                history.messages[history.messages.length - 1].role === 'user' &&
                history.messages[history.messages.length - 1].content === currentMessage) {
                console.log(chalk.yellow('检测到重复输入，已忽略'));
                return;
            }

            // 添加用户消息到历史记录
            history.messages.push({
                role: 'user',
                content: currentMessage
            });

            // 获取 AI 回复
            const apiKey = getApiKey();
            const config = {
                baseURL: 'https://api.deepseek.com/',
                apiKey: apiKey.trim()
            };
            const openai = new OpenAI(config);

            const stream = await openai.chat.completions.create({
                messages: history.messages,
                model: "deepseek-chat",
                stream: true,
            });

            process.stdout.write(chalk.green('AI: \n'));

            let buffer = '';
            let codeBlock = false;
            let currentMarkdown = '';
            let fullResponse = '';

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                fullResponse += content;

                // 检测是否进入或离开代码块
                if (content.includes('```')) {
                    codeBlock = !codeBlock;
                    if (codeBlock) {
                        // 如果进入代码块，先输出之前的内容
                        if (currentMarkdown) {
                            await smoothOutput(currentMarkdown, isMarkdown(currentMarkdown));
                            currentMarkdown = '';
                        }
                    } else {
                        // 如果离开代码块，输出整个代码块
                        buffer += content;
                        await smoothOutput(buffer, true); // 代码块一定使用 marked
                        buffer = '';
                        continue;
                    }
                }

                // 在代码块内，累积内容
                if (codeBlock) {
                    buffer += content;
                    continue;
                }

                // 累积普通内容
                currentMarkdown += content;

                // 如果遇到换行符或句号，输出当前内容
                if (content.includes('\n') || content.includes('.')) {
                    if (currentMarkdown) {
                        await smoothOutput(currentMarkdown, isMarkdown(currentMarkdown));
                        currentMarkdown = '';
                    }
                }
            }

            // 输出剩余的内容
            if (buffer || currentMarkdown) {
                const remainingText = buffer + currentMarkdown;
                await smoothOutput(remainingText, isMarkdown(remainingText));
            }

            // 如果需要保存到文件
            if (saveToFile) {
                try {
                    fs.appendFileSync(saveFilePath,'\n'+ fullResponse, 'utf-8');
                    console.log(chalk.green(`\n内容已保存到文件: ${saveFilePath}`));
                } catch (error) {
                    console.error(chalk.red(`保存到文件失败: ${(error as Error).message}`));
                }
            }

            // 保存 AI 的回复到历史记录
            history.messages.push({
                role: "assistant",
                content: fullResponse
            });

            // 保存更新后的历史记录
            saveHistory(history);

            process.stdout.write('\n');

            // 等待下一次输入
            currentMessage = await getUserInput(chalk.cyan('你: '));
            if (currentMessage.toLowerCase() === 'exit') {
                console.log(chalk.yellow('退出对话'));
                rl.close();
                break;
            }
        }
    } catch (error: any) {
        console.error(chalk.red(`AI 响应失败: ${error.message}`));
        rl.close();
    }
}


