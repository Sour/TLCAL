
var year = $('span.calyeartitle').text();
var work = $('td.calendarCellRegularPast:first').text();
console.log($('td.calendarCellRegularPast').text());
console.log($('td.calendarCellRegularPast').nextAll().text());
console.log($('td.calendarCellRegularFuture').text());
console.log($('td.calendarCellRegularFuture').nextAll().text());
	
var month = 0;

var getMonth = function(){
	switch($('span.calMonthTitle').text()){
		case January:
			month = 1;
			break;
		case February:
			month = 2;
			break;
		case March:
			month = 3;
			break;
		case April:
			month = 4;
			break;
		case May:
			month = 5;
			break;
		case June:
			month = 6;
			break;
		case July:
			month = 7;
			break;
		case August:
			month = 8;
			break;
		case September:
			month = 9;
			break;
		case October:
			month = 10;
			break;
		case November:
			month = 11;
			break;
		case December:
			month = 12;
			break;
		default:
			break;
	}
}
