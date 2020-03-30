import DailyIframe from '@daily-co/daily-js';

export default class CallFrame {
	constructor() {
		this._callFrame = DailyIframe.createCallObject({
			dailyConfig: {
				experimentalChromeVideoMuteLightOff: true
			}
		});
	}
}
