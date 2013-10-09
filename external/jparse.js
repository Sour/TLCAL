
var year = $('span.calyeartitle').text();
var work = $('td.calendarCellRegularPast:first').text();

var month = 0;
var DAY_LENGTH = 35;
var parse = null;
var parseArray = [];
var finalArray = [];
var daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var download = new BlobBuilder();

// var injectHTML(){
	// document.body.insertBefore(iframe, document.body.firstChild);
	
	// var button = document.getElementById("mybutton");
// button.person_name = "Roberto";
// button.addEventListener("click", function() {
  // alert(greeting + button.person_name + ".");
// }, false);


// }

var toCSVFormat = function(){
	
	for(var i = 0; i < parseArray.length; i++){
	var tempDate = month + "/" + parseArray[i].substring(0,2) + "/" + year.substring(2,4);
	var tempStartTime = parseArray[i].substring(2,7) + ":00 " + parseArray[i].substring(7,9);
	var tempEndTime =  parseArray[i].substring(10,15) + ":00 " + parseArray[i].substring(15,17);
	
	download.append("Subject,Start Date,Start Time,End Date,End Time,All Day Event,Description,Location,Private\n");
	download.append("Work," + tempDate + "," + tempStartTime + "," + tempDate + "," + tempEndTime + ",false" + ",Work" + ",BestBuy" + ",false\n");
	}
	saveAs(download.getBlob("text/plain;charset=iso-8859-15"),tempDate + " schedule.csv");
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
			month = 01;
			break;
		case "February":
			month = 02;
			break;
		case "March":
			month = 03;
			break;
		case "April":
			month = 04;
			break;
		case "May":
			month = 05;
			break;
		case "June":
			month = 06;
			break;
		case "July":
			month = 07;
			break;
		case "August":
			month = 08;
			break;
		case "September":
			month = 09;
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
			month = 0;
			break;
	};
}

// injectHTML();
getMonth();
parseToString();
toCSVFormat();
