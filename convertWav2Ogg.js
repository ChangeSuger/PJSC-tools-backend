import { exec } from 'child_process';
import { relative, parse, join, dirname } from 'path';
import { glob } from 'glob';
import { existsSync, mkdirSync } from 'fs';

// --- 配置参数 ---
const fileName = 'X-3';
const inputFolder = `./temps/${fileName}`; // 存放原始 WAV 文件的文件夹
const outputFolder = `./temps/${fileName}-ogg`; // 存放转换后 OGG 文件的文件夹
const audioQuality = 5; // OGG 音频质量 (0-10, 5 是一个不错的平衡点)
// --- End 配置参数 ---

async function convertWavToOgg() {
    console.log('开始批量 WAV 到 OGG 转换...');
    console.log(`输入文件夹: ${inputFolder}`);
    console.log(`输出文件夹: ${outputFolder}`);
    console.log(`音频质量: -q:a ${audioQuality}\n`);

    // 确保输出文件夹存在，如果不存在则创建
    if (!existsSync(outputFolder)) {
        mkdirSync(outputFolder, { recursive: true });
        console.log(`已创建输出文件夹: ${outputFolder}`);
    }

    try {
        // 查找所有 WAV 文件
        const wavFiles = await glob(`${inputFolder}/**/*.wav`);

        if (wavFiles.length === 0) {
            console.log(`在 "${inputFolder}" 中未找到任何 WAV 文件。请检查路径或确保文件夹中有 WAV 文件。`);
            return;
        }

        console.log(`找到 ${wavFiles.length} 个 WAV 文件进行转换。\n`);

        for (const wavFile of wavFiles) {
            const relativePath = relative(inputFolder, wavFile);
            const outputBaseName = parse(relativePath).name;
            const outputDir = join(outputFolder, dirname(relativePath));
            const outputFile = join(outputDir, `${outputBaseName}.ogg`);

            // 确保目标输出目录存在
            if (!existsSync(outputDir)) {
                mkdirSync(outputDir, { recursive: true });
            }

            // 构建 FFmpeg 命令
            const command = `ffmpeg -i "${wavFile}" -q:a ${audioQuality} "${outputFile}"`;

            console.log(`正在转换: "${wavFile}"`);
            console.log(`目标文件: "${outputFile}"`);

            try {
                // 执行 FFmpeg 命令
                await new Promise((resolve, reject) => {
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`转换失败: ${wavFile}`);
                            console.error(`FFmpeg 错误: ${error.message}`);
                            reject(error);
                            return;
                        }
                        // FFmpeg 的非致命警告信息通常在 stderr 中
                        if (stderr) {
                            console.warn(`FFmpeg 警告/信息 (stderr): \n${stderr}`);
                        }
                        console.log(`转换成功: "${wavFile}" -> "${outputFile}"\n`);
                        resolve();
                    });
                });
            } catch (ffmpegError) {
                console.error(`跳过文件由于错误: ${wavFile}\n`);
                // 继续处理下一个文件，而不是停止整个脚本
            }
        }

        console.log('所有文件转换完成！');
    } catch (err) {
        console.error('查找文件时发生错误:', err);
    }
}

// 执行转换函数
convertWavToOgg();