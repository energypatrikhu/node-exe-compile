import ora from 'ora-classic';
import { secToTime } from '@energypatrikhu/node-utils';

function oraTime(time: number) {
	if (time < 1000) {
		return `${Math.round(time)}ms`;
	} else if (time < 60 * 1000) {
		return secToTime(time, '{SS}s');
	} else if (time < 60 * 60 * 1000) {
		return secToTime(time, '{MM}m {SS}s');
	} else if (time < 24 * 60 * 60 * 1000) {
		return secToTime(time, '{HH}h {MM}m {SS}s');
	}
	return secToTime(time, '{DD}d {HH}h {MM}m {SS}s');
}

export default function oraStatus(text: string) {
	const performanceNow = performance.now();
	const spinner = ora(text).start();

	return {
		succeed: (text: string) => {
			spinner.succeed(
				`${text} in ${oraTime(performance.now() - performanceNow)}`,
			);
		},
		fail: (text: string) => {
			spinner.fail(text);
		},
		info: (text: string) => {
			spinner.info(
				`${text} in ${oraTime(performance.now() - performanceNow)}`,
			);
		},
		warn: (text: string) => {
			spinner.warn(text);
		},
	};
}
