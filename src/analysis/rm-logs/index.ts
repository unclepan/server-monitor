/**
 * @description 删除过期的日志文件
 */

import path from 'path';
import fse from 'fs-extra';
import config from '../../config';
import util from '../utils/util';
const { distFolderName: DIST_FOLDER_NAME } = config;
const { formatNow } = util;

function rmLogs(accessLogPath: string) {
	console.log('----------- 删除过期日志文件 开始 -----------');
	console.log('当前的时间', formatNow());

	// 日志存放的目录
	const distFolder = path.join(accessLogPath, DIST_FOLDER_NAME);
	fse.ensureDirSync(distFolder);
	console.log('目标文件夹', distFolder);

	// 读取日志文件
	const fileNames = fse.readdirSync(distFolder);
	fileNames.forEach(fileName => {
		console.log('当前日志文件', fileName);
		try {
			// fileName 格式 '2020-09-02.log'
			const dateStr = fileName.split('.')[0];
			const d = new Date(dateStr);
			const t = Date.now() - d.getTime(); // 获取日志日期，和当前的时间间隔，单位 ms
			if (t / 1000 / 60 / 60 / 24 > 90) {
				// 时间间隔，大于 90 天，则删除日志文件
				const filePath = path.join(distFolder, fileName);
				fse.removeSync(filePath);
				console.log('已删除日志文件', fileName);
			}
		} catch (ex) {
			console.error(`日志文件格式错误 ${fileName}`, ex);
		}
	});

	console.log('----------- 删除过期日志文件 结束 -----------');
}

export default rmLogs;
