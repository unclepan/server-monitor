/**
 * @description 分析日志
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import querystring from 'querystring';
import _ from 'lodash';
import fse from 'fs-extra';
import EventData from './EventData';
import config from '../../config';
import util from '../utils/util';
const { distFolderName: DIST_FOLDER_NAME } = config;
const { genYesterdayLogFileName, formatNow } = util;

// 统计结果
const eventData = new EventData();

/**
 * 从一行日志中找到 query
 */
function getQueryFromLogLine(line = '') {
	// 获取 url 格式是 `/event.png?xxx` 的 query 部分，即 xxx
	const reg = /GET\s\/event.png\?(.+?)\s/;
	const matchResult = line.match(reg);
	if (matchResult == null) return {}; // url 格式不符合

	const queryStr = matchResult[1];
	if (typeof queryStr !== 'string') return {}; // 找不到 query

	const query = querystring.parse(queryStr);
	return query;
}

/**
 * 分析日志文件，结果入库
 */
function analysisLogs(accessLogPath: string) {
	return new Promise<{ [propName: string]: { pv?: number; uv?: number } }>(
		resolve => {
			console.log('----------- 分析日志 开始 -----------');
			console.log('当前的时间', formatNow());

			// 日志文件
			const logFile = path.join(
				accessLogPath,
				DIST_FOLDER_NAME,
				genYesterdayLogFileName()
			);
			fse.ensureFileSync(logFile); // 如果该文件没有，则创建一个空的，以免程序运行报错
			console.log('1.日志文件', logFile);

			// 逐行读取日志文件。注意，必须使用 stream readline 逐行读取，不得直接一次性 readFile ！！！
			const readStream = fs.createReadStream(logFile);
			const rl = readline.createInterface({
				input: readStream
			});
			console.log('2.开始逐行读取');
			rl.on('line', line => {
				if (!line) return;

				// 获取 url query
				const query = getQueryFromLogLine(line);
				if (_.isEmpty(query)) return;

				// 累加 pv
				eventData.addPV(query);
			});
			rl.on('close', async () => {
				// 逐行读取结束，存入数据库
				const result = eventData.getResult();
				console.log('3.分析结果', JSON.stringify(result));
				resolve(result);
				console.log('----------- 分析日志并入库 结束 -----------');
			});
		}
	);
}

export default analysisLogs;
