
var year = $('span.calyeartitle').text();
var work = $('td.calendarCellRegularPast:first').text();

var month = 0;
var DAY_LENGTH = 35;
var parse = null;
var parseArray = [];
var finalArray = [];
var daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var download = new BlobBuilder();

function Date(subject, startDate, startTime, endDate, endTime,allDayEvent,description,location,boolPrivate){
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

var toCSVFormat = function(){
	
	for(var i = 0; i < parseArray.length; i++){
	var tempDate = "0" + (month + 1) + "/" + parseArray[i].substring(0,2) + "/" + year;
	var tempStartTime = "0" + parseArray[i].substring(3,7) + ":00 " + parseArray[i].substring(7,9);
	var tempEndTime =  "0" + parseArray[i].substring(11,15) + ":00 " + parseArray[i].substring(15,17);
	
	download.append("Subject,Start Date,Start Time,End Date,End Time,All Day Event,Description,Location,Private ");
	download.append("Work," + tempDate + "," + tempStartTime + "," + tempDate + "," + tempEndTime + ",false" + ",Work" + ",BestBuy" + ",false");
	}
	saveAs(download.getBlob("text/plain;charset=iso-8859-15"),"export.csv");
}

var parseToString = function() {
	var parsePast = ($('td.calendarCellRegularPast').text()).replace(/\s+/g,"");
	var parseCurrent = ($('td.calendarCellRegularCurrent').text()).replace(/\s+/g,"");
	var parseFuture = ($('td.calendarCellRegularFuture').text()).replace(/\s+/g,"");
	
	if(parseCurrent.substring(2,5) === "OFF"){
		parse = parsePast + parseFuture;
	}else{
		parse = parsePast + parseCurrent + parseFuture;
	}
	
	for(var i = 0; i < (parse.length / DAY_LENGTH); i++){
		
		if(parse.substring((i * DAY_LENGTH) + 2, (i * DAY_LENGTH) + 3) === ":") {
			var tempParse = parse.slice(0, i * DAY_LENGTH) + parseArray[i-1].substring(0,2) + parse.slice(i * DAY_LENGTH, parse.length);   
			parse = tempParse;
			parseArray[i] = parse.substring((i * (DAY_LENGTH)), ((i * DAY_LENGTH) + DAY_LENGTH));
			console.log("spliced: " + parseArray[i]);
		}else{
			parseArray[i] = parse.substring((i * (DAY_LENGTH)), ((i * DAY_LENGTH) + DAY_LENGTH));
		}		
	}
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
			month = 0;
			break;
	};
}

getMonth();
parseToString();
toCSVFormat();