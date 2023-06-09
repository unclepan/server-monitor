/**
 * @description 将统计结果写入数据库
 */

import serviceEventData from '../../service/event-data';
import util from '../utils/util';
const { yesterdayDate } = util;
const { createEventsService } = serviceEventData;

/**
 * 将统计结果写入数据库
 */
async function writeDB(result: {
	[propName: string]: { pv?: number; uv?: number };
}) {
	// 格式化数据，符合 model/EventModel.js 中的 schema 规范
	const keys = Object.keys(result);
	const dataList = keys.map(key => {
		return {
			eventKey: key,
			eventData: result[key],
			eventDate: yesterdayDate() // 昨天，因为此时在计算昨天的日志
		};
	});

	// 写入数据库
	try {
		await createEventsService(dataList);
		console.log('日志分析入库成功');
	} catch (ex) {
		console.error('日志分析入库错误', ex);
	}
}

export default writeDB;
