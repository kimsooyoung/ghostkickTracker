const csvWriter = require('csv-write-stream');
const schedule  = require('node-schedule');
const puppeteer = require("puppeteer");
const moment = require('moment');
const fs = require('fs');

let prevDate = null;

// let kickNow = null;
// let xingNow = null;
// let gogoNow = null;
// let timeNow = null;

function isDateSame(date){
    if(prev_time === date){
        return true;
    }else{
        console.log('Another Date!!');
		prev_time = date;
		return false;
    }
}

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
    let fullTimeString = moment().format('YYYY-MM-DD-HH:mm:ss');
    let dateNow = fullTimeString.substring(0, 10);
    let timeNow = fullTimeString.substring(11, 16);

    console.log(dateNow, timeNow);

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
	
	let kickNow = await getHTML('Kickgoing');
	let xingNow = await getHTML('Xingxing');
	let gogoNow = await getHTML('Gogossing');

    let csvFilename = `${dateNow}.csv`;
    
    if(prevDate === dateNow){ // Same Date
        writer = csvWriter({sendHeaders: false});
        writer.pipe(fs.createWriteStream(csvFilename, {flags: 'a'}));
        writer.write({
            header1: timeNow,
            header2: kickNow,
            header3: xingNow,
            header4: gogoNow
        });
        writer.end();
    }else{ // Another Date
		writer = csvWriter({sendHeaders: false});
		writer.pipe(fs.createWriteStream(csvFilename));
		writer.write({
			header1: 'Moment',
			header2: 'Kickgoing',
			header3: 'XingXing',
			header4: 'Gogossing'
        });
        writer.write({
            header1: timeNow,
            header2: kickNow,
            header3: xingNow,
            header4: gogoNow
        })
        writer.end();
        prevDate = dateNow;
    }
};

const job = schedule.scheduleJob(`*/10 * * * * *`, () => {
	ghostKickTracker();
});