import ora from 'ora-classic';
import { secToTime } from '@energypatrikhu/node-utils';

function oraTime(time: number) {
	if (time < 1000) {
		return `${time}ms`;
	} else if (time < 60 * 1000) {
		return secToTime(time, '{ss}s');
	} else if (time < 60 * 60 * 1000) {
		return secToTime(time, '{mm}m {ss}s');
	}
	return secToTime(time, '{HH}h {mm}m {ss}s');
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
			spinner.fail(
				`${text} in ${oraTime(performance.now() - performanceNow)}`,
			);
		},
		info: (text: string) => {
			spinner.info(
				`${text} in ${oraTime(performance.now() - performanceNow)}`,
			);
		},
		warn: (text: string) => {
			spinner.warn(
				`${text} in ${oraTime(performance.now() - performanceNow)}`,
			);
		},
	};
}
