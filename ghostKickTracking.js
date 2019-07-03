const fs = require('fs');
const puppeteer = require("puppeteer");
const schedule  = require('node-schedule');
const moment = require('moment');

const csvWriter = require('csv-write-stream');
const csvFilename = 'test.csv';

let kickNow = null;
let xingNow = null;
let gogoNow = null;
let timeNow = null;

function writeCsv( time, kick, xing, gogo){
	if (!fs.existsSync(csvFilename)) {
		writer = csvWriter({sendHeaders: false});
		writer.pipe(fs.createWriteStream(csvFilename));
		writer.write({
			header1: 'Moment',
			header2: 'Kickgoing',
			header3: 'XingXing',
			header4: 'Gogossing'
		});
		writer.end();
	}
	if(time){
		writer = csvWriter({sendHeaders: false});
		writer.pipe(fs.createWriteStream(csvFilename, {flags: 'a'}));
		writer.write({
			header1: time,
			header2: kick,
			header3: xing,
			header4: gogo
		});
		writer.end();
	}
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
	
	kickNow = await getHTML('Kickgoing');
	xingNow = await getHTML('Xingxing');
	gogoNow = await getHTML('Gogossing');
	timeNow = moment().format('YYYY-MM-DD-HH:mm:ss');
	
	// console.log("Kickgoing : ", kickNow);
	// console.log("Xingxing : ", xingNow);
	// console.log("Gogossing : ", gogoNow);
	// console.log(timeNow);
	await writeCsv( timeNow, kickNow, xingNow, gogoNow );
	browser.close();
};

const job = schedule.scheduleJob(`*/10 * * * *`, () => {
	ghostKickTracker();
	console.log("Kickgoing : ", kickNow);
	console.log("Xingxing : ", xingNow);
	console.log("Gogossing : ", gogoNow);
	console.log(timeNow);
});