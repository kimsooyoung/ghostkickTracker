const fs = require('fs');
const csv = require('fast-csv');
const puppeteer = require("puppeteer");
const schedule  = require('node-schedule');
const moment = require('moment');

// 사용시 인위적인 딜레이를 주기위한 함수
function delay( timeout ) {
  return new Promise(( resolve ) => {
    setTimeout( resolve, timeout );
  });
}

async function ghostKickTracker(){
	const browser = await puppeteer.launch({
		headless : true,	// 헤드리스모드의 사용여부를 묻는다.
		devtools : true	// 개발자 모드의 사용여부를 묻는다.
	});
	const page = await browser.newPage();
	await page.goto( "https://ghostkick.net/live", { waitUntil : "networkidle2" } );
	await page.waitFor(500);

	async function getHTML( company ){
		let htmlComp = await page.waitFor( `body > app-root > main > app-live > app-scooter-state > table > tbody > tr > td.dot${company}` );
		let data = await page.evaluate( htmlComp => htmlComp.textContent, htmlComp);
		return data;
	}
	
	const kickNow = await getHTML('Kickgoing');
	const xingNow = await getHTML('Xingxing');
	const gogoNow = await getHTML('Gogossing');
	const timeNow = moment().format('YYYY-MM-DD-HH:mm:ss');
	
	console.log("Kickgoing : ", kickNow);
	console.log("Xingxing : ", xingNow);
	console.log("Gogossing : ", gogoNow);
	console.log(timeNow);

	browser.close();
};

const job = schedule.scheduleJob(`*/5 * * * * *`, () => {
    ghostKickTracker();
});