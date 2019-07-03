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
	async function getHTML( company ){
		let htmlComp = await page.waitFor( `body > app-root > main > app-live > app-scooter-state > table > tbody > tr > td.dot${company}` );
		let data = await page.evaluate( htmlComp => htmlComp.textContent, htmlComp);
		return data;
	}
	
	const kickNow = await getHTML('Kickgoing');
	const xingNow = await getHTML('Xingxing');

	const gogoHTML = await page.waitFor( "body > app-root > main > app-live > app-scooter-state > table > tbody > tr > td.dotGogossing" );
	const gogoNow = await page.evaluate( gogoHTML => gogoHTML.textContent, gogoHTML);
	
	console.log("Kickgoing : ", kickNow);
	console.log("Xingxing : ", xingNow);
	console.log("Gogossing : ", gogoNow);
	console.log(moment().format('YYYY/MM/DD/HH:mm:ss'));
	// const emYesterDay = await page.waitFor( "div.box_blog > dl.count_visitor:nth-child(2) > dd" );
	// const txtYesterDay = await page.evaluate( emYesterDay => emYesterDay.textContent, emYesterDay );
	// console.log("-. 어제 방문자 수", txtYesterDay);
	// const emCumulativ = await page.waitFor( "div.box_blog > dl.count_visitor:nth-child(3) > dd" );
	// const txtCumulativ = await page.evaluate( emCumulativ => emCumulativ.textContent, emCumulativ );
	// console.log("-. 누적 방문자 수", txtCumulativ);
	browser.close();


	// puppeteer.launch({
	// 	headless : true,	// 헤드리스모드의 사용여부를 묻는다.
	// 	devtools : true	// 개발자 모드의 사용여부를 묻는다.
	// }).then(async browser => {
	// 	const page = await browser.newPage();
	// 	const time = new Date();
	// 	await page.goto( "https://ghostkick.net/live", { waitUntil : "networkidle2" } );
	
	// 	async function getHTML( company ){
	// 		let htmlComp = await page.waitFor( `body > app-root > main > app-live > app-scooter-state > table > tbody > tr > td.dot${company}` );
	// 		let data = await page.evaluate( htmlComp => htmlComp.textContent, htmlComp);
	// 		return data;
	// 	}
		
	// 	const kickNow = await getHTML('Kickgoing');
	// 	const xingNow = await getHTML('Xingxing');
	
	// 	const gogoHTML = await page.waitFor( "body > app-root > main > app-live > app-scooter-state > table > tbody > tr > td.dotGogossing" );
	// 	const gogoNow = await page.evaluate( gogoHTML => gogoHTML.textContent, gogoHTML);
		
	// 	console.log("Kickgoing : ", kickNow);
	// 	console.log("Xingxing : ", xingNow);
	// 	console.log("Gogossing : ", gogoNow);
	// 	console.log(time.getDate());
	// 	// const emYesterDay = await page.waitFor( "div.box_blog > dl.count_visitor:nth-child(2) > dd" );
	// 	// const txtYesterDay = await page.evaluate( emYesterDay => emYesterDay.textContent, emYesterDay );
	// 	// console.log("-. 어제 방문자 수", txtYesterDay);
	// 	// const emCumulativ = await page.waitFor( "div.box_blog > dl.count_visitor:nth-child(3) > dd" );
	// 	// const txtCumulativ = await page.evaluate( emCumulativ => emCumulativ.textContent, emCumulativ );
	// 	// console.log("-. 누적 방문자 수", txtCumulativ);
	// 	browser.close();
	// });
};

const job = schedule.scheduleJob(`*/10 * * * * *`, () => {
    ghostKickTracker();
});