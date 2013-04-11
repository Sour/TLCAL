var data = $('span.calMonthTitle').html();
var year = $('span.calyeartitle').html();
alert("The month is " + data + ' of ' + year);
console.log(data + ' ' + year);

var day = $('span.calendarDateNormal').html();
console.log(day);

var shift = $('span.calcelldata').html();
console.log(shift);

var array = [day, shift];
console.log(array);