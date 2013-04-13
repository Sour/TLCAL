
var year = $('span.calyeartitle').text();
var work = $('td.calendarCellRegularPast:first').text();

var firstDate = 00;	
var month = 0;
var parse = null;
var parseArray = [];
var finalArray = [];
var daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function Date(subject, startDate, startTime, endDate, endTime,allDayEvent,description,location,boolPrivate){

/*
Subject,Start Date,Start Time,End Date,End Time,All Day Event,Description,Location,Private

Final Exam,05/12/20,07:10:00 PM,05/12/07,10:00:00 PM,False,Two essay questions that will cover topics covered throughout the semester,"Columbia, Schermerhorn 614",True
*/

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
	
	
	for(var i = 0;i < parseArray.length; i++){
	var tempDate = "0" + (month + 1) + "/" + parseArray[i].substring(0,2) + "/" + year;
	var tempStartTime = "0" + parseArray[i].substring(3,7) + ":00 " + parseArray[i].substring(7,9);
	var tempEndTime =  "0" + parseArray[i].substring(11,15) + ":00 " + parseArray[i].substring(15,17);
	
	console.log(tempDate + " " + tempStartTime + " " + tempEndTime);
	
		// finalArray[i] = date("Work", (month + 1), tempDate, tempStartTime, tempDate, tempEndTime, false, "Work", "BestBuy", false);
		// console.log("Day created. " +  "Work" + (month + 1) + tempDate + tempStartTime + tempDate + tempEndTime);
	}
	
}

var splitDays = function (){
	// (01 11:00AM - 07:00PM L-000359-DEPT50700)
	try{
		for(var i = 0; i < (parse.length / 35); i++){
			parseArray[i] = parse.substring((i * 35), ((i * 35) + 35));
		}
	}catch(err){console.log("Error in creating array, please check for accuracy");}
	
	
}

var initParse = function(){
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
initParse();
splitDays();
formatDates();