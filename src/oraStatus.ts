import ora from 'ora-classic';

export default function oraStatus(text: string) {
	const performanceNow = performance.now();
	const spinner = ora(text).start();

	return {
		succeed: (text: string) => {
			spinner.succeed(
				`${text} in ${Math.round(
					performance.now() - performanceNow,
				)}ms`,
			);
		},
		fail: (text: string) => {
			spinner.fail(
				`${text} in ${Math.round(
					performance.now() - performanceNow,
				)}ms`,
			);
		},
		info: (text: string) => {
			spinner.info(
				`${text} in ${Math.round(
					performance.now() - performanceNow,
				)}ms`,
			);
		},
		warn: (text: string) => {
			spinner.warn(
				`${text} in ${Math.round(
					performance.now() - performanceNow,
				)}ms`,
			);
		},
	};
}
