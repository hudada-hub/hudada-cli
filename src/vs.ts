import open, { openApp, apps } from 'open';
import chalk from 'chalk';
import { join, resolve } from 'path';

// 检查是否安装了指定的编辑器
async function checkEditor(command: string): Promise<boolean> {
    try {
        console.log('正在检查编辑器:', command);
        // 尝试打开编辑器（不带参数）
        await openApp(command, { wait: false });
        console.log(`${command} 已安装`);
        return true;
    } catch (error) {
        console.log('编辑器检查失败:', error instanceof Error ? error.message : error);
        return false;
    } finally {
        console.log(`${command} 检查完成`);
    }
}

export async function handleVSCode(args: string[]) {
    try {
        // 获取要打开的路径
        let targetPath: string;

        if (args.length > 0) {
            if (args[0] === '.') {
                targetPath = process.cwd();
            } else if (isAbsolutePath(args[0])) {
                targetPath = args[0];
            } else {
                targetPath = join(process.cwd(), args[0]);
            }
        } else {
            targetPath = process.cwd();
        }

        const fullPath = resolve(targetPath);
        console.log('目标路径:', fullPath);

        try {
            // 直接尝试用 VSCode 打开
            await openApp('code', {
                arguments: [fullPath]
            });
            console.log(chalk.green(`已在 VS Code 中打开: ${fullPath}`));
        } catch (error) {
            try {
                // VSCode 失败后尝试用 Cursor 打开
                await openApp('cursor', {
                    arguments: [fullPath]
                });
                console.log(chalk.green(`已在 Cursor 中打开: ${fullPath}`));
            } catch (cursorError) {
                // 都失败了，显示安装提示
                console.log(chalk.yellow('未检测到 VS Code 或 Cursor，请安装以下编辑器之一：'));
                console.log(chalk.blue('\nVS Code 安装方法：'));
                console.log(chalk.gray('1. 访问: https://code.visualstudio.com'));
                console.log(chalk.gray('2. 下载并安装 VS Code'));
                console.log(chalk.gray('3. 确保 "code" 命令已添加到系统环境变量'));
                
                console.log(chalk.blue('\nCursor 安装方法：'));
                console.log(chalk.gray('1. 访问: https://cursor.sh'));
                console.log(chalk.gray('2. 下载并安装 Cursor'));
                console.log(chalk.gray('3. 确保 "cursor" 命令已添加到系统环境变量'));
                
                console.log(chalk.yellow('\n安装完成后重试命令'));
            }
        }
    } catch (error) {
        console.error(chalk.red('打开编辑器失败：'), error instanceof Error ? error.message : '未知错误');
    }
}

// 判断是否为绝对路径
function isAbsolutePath(path: string): boolean {
    return /^[A-Za-z]:\\/.test(path) || path.startsWith('/');
}