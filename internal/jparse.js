
var year = $('span.calyeartitle').text();
var work = $('td.calendarCellRegularPast:first').text();

var firstDate = 00;	
var month = 0;
var parse = null;
var parseArray = [];
var daysPerMonth = [00, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function Date(subject,startDate, startTime, endDate, endTime,allDayEvent,description,location,boolPrivate){
	this.subject = subject;
	this.startDate = startDate;
	this.startTime = startTime;
	this.endDate = endDate;
	this.endTime = endTime;
	this.allDayEvent = allDayEvent;
	this.description = description;
	this.location = location;
	this.boolPrivate = boolPrivate;
}

var formatDates = function(){
	/* This is something i will not be able to do without the website being up
	the plan will be to grab things peice by peice and sort them into objects.
	will want to create the object via day date for now( may cause problems when
	we get splitting to second month.*/
}

var toArray = function (){
	try{
		for(var i = 0; i < (parse.length / 35); i++){
		// (0111:00AM-07:00PML-000359-DEPT50700)
			parseArray[i] = parse.substring((i * 35), 35);
			console.log("debug - creating array");
		}
	}catch(err){
		console.log("Error in creating array, please check for accuracy");
	}
}

var initDates = function(){
	var parsePast = ($('td.calendarCellRegularPast').text()).replace(/\s+/g,"");
	var parseCurrent = ($('td.calendarCellRegularCurrent').text()).replace(/\s+/g,"");
	var parseFuture = ($('td.calendarCellRegularFuture').text()).replace(/\s+/g,"");
	
	if(firstDate === 00 && parsePast.length > 0){
		firstDate = Number(parsePast.substring(0,2));
		if(daysPerMonth[month] < (firstDate + 13)){
			console.log("Next month needs to be loaded");
		}
		parse = parsePast + parseCurrent + parseFuture;
	}else{
		firstDate = Number(parseCurrent.substring(0,2));		
		if(daysPerMonth[month] < (firstDate + 13)){
			console.log("Next month needs to be loaded");
		}
		parse = parseCurrent + parseFuture;
	};
}

var getMonth = function(){
	switch($('span.calMonthTitle').text()){
		case "January":
			month = 1;
			break;
		case "February":
			month = 2;
			break;
		case "March":
			month = 3;
			break;
		case "April":
			month = 4;
			break;
		case "May":
			month = 5;
			break;
		case "June":
			month = 6;
			break;
		case "July":
			month = 7;
			break;
		case "August":
			month = 8;
			break;
		case "September":
			month = 9;
			break;
		case "October":
			month = 10;
			break;
		case "November":
			month = 11;
			break;
		case "December":
			month = 12;
			break;
		default:
			break;
	};
}

getMonth();
initDates();
toArray();