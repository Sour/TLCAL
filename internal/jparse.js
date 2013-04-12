
var year = $('span.calyeartitle').text();
var work = $('td.calendarCellRegularPast:first').text();

var firstDate = 00;	
var month = 0;
var parse = null;
var parseArray = [];
var daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

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

var getShiftStart = function(parseDay){
	console.log(parseDay.substring(3,17));
	return parseDay.substring(3,17);
}

var formatDates = function(){
	/* This is something i will not be able to do without the website being up
	the plan will be to grab things peice by piece and sort them into objects.
	will want to create the object via day date for now( may cause problems when
	we get splitting to second month.*/
}

var splitDays = function (){
	// (0111:00AM-07:00PML-000359-DEPT50700)
	console.log("Length of parse: " + parse.length + " number of work days: " + (parse.length / 35));
	
	try{
		for(var i = 0; i < (parse.length / 35); i++){
			parseArray[i] = parse.substring((i * 35), ((i * 35) + 35));
			console.log("split: " + (i * 35)+ ", "+ ((i * 35) + 35) + " with a result of: " + parse.substring((i * 35), ((i * 35) + 35)));
		}
	}catch(err){console.log("Error in creating array, please check for accuracy");}
	
	
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
			month = 0;
			break;
		case "February":
			month = 1;
			break;
		case "March":
			month = 2;
			break;
		case "April":
			month = 3;
			break;
		case "May":
			month = 4;
			break;
		case "June":
			month = 5;
			break;
		case "July":
			month = 6;
			break;
		case "August":
			month = 7;
			break;
		case "September":
			month = 8;
			break;
		case "October":
			month = 9;
			break;
		case "November":
			month = 10;
			break;
		case "December":
			month = 11;
			break;
		default:
			break;
	};
}

getMonth();
initDates();
splitDays();
getShiftStart(parseArray[0]);