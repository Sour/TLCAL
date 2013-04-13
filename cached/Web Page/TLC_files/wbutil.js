var posX = 0;
var posY = 0;

//capturing the MouseDown event for Netscape in order to display pop-ups properly
if(navigator.appName=="Netscape") {
    document.captureEvents(Event.MOUSEDOWN);
}
document.onmousedown = getPosition

function getPosition(evt) {
    if(navigator.appName=="Netscape") {
        posX = evt.screenX;
        posY = evt.screenY;
    }
}

// Helper functions
String.prototype.trimLeft = function f(){
    return this.replace(/^\s+/,'');
}

String.prototype.trimRight = function f(){
   return this.replace(/\s+$/,'');
}

String.prototype.trimBothSides = function f(){
   return this.trimLeft().trimRight();
}

String.prototype.padLeft = function f(len,pad){
   var result = this;
   while(result.length<len){
       result = pad + result;
   }
   if(result.length>len) result = result.substring(result.length-len,result.length);
   return result;
}

String.prototype.isInt = function f(){
    var s = this.trimBothSides();
    for(var i = 0, c; i != s.length; i++){
        c = s.substring(i,i+1);
        if((i>0 || c!='-') && (c < '0' || c > '9')) return false;
    }
    return true;
}

String.prototype.toInt=function f(){
    var s  = this.trimBothSides();
    return s.isInt() ?  parseFloat(s) : 0;
}

String.prototype.isNumber = function f(){
    var s = this.trimBothSides();
    return new Number(s).toString() == s;
}

String.prototype.toNumber=function f(){
    return new Number(this.trimBothSides());
}

function isDigit(string){
  if (string.length!=1) return false;
  return string >= '0' && string <= '9';
}

String.prototype.isDigit=function f(){
  return isDigit(this);
}

function isEmpty(string){
    if(typeof string == "string"){
        return string.trimBothSides().length==0;
    } else if (typeof string == "object"){
        return new String(string).trimBothSides().length==0;
    } else if (typeof string == "undefined"){
        return true;
    }
    return false;
}

String.prototype.isEmpty=function f(){
    return isEmpty(this);
}

String.prototype.emptyDefault=function f(defaultValue){
    return this.isEmpty() ? defaultValue : this;
}

String.prototype.searchReplace=function f(findText,replaceText){
    var result = this;
    var i = result.lastIndexOf(findText);
    while(i>=0){
        result = result.substring(0,i)+ replaceText +
                 result.substring(i+findText.length,result.length);
        i = result.substring(0,i).lastIndexOf(findText,i);
    }
    return result;
}

var DIGITS = "0123456789"
var UPPERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
var LOWERS = "abcdefghijklmnopqrstuvwxyz"

String.prototype.fits=function f(picture){
    picture = ""+picture;
    var options = ""
    var pChar = ""
    var repeat = false;
    for (var i=0, j=0; i<this.length && j<picture.length; i++) {
        pChar=picture.substring(j,j+1);
        if (pChar == '[') {
            options = "";
            for (j++;j<picture.length;j++){
                if(picture.substring(j,j+1) == ']') break;
                options += picture.substring(j,j+1)
            }
        } else if (pChar =="@") {
            j++;
            continue;
        } else if (pChar == "?") {
            options = UPPERS + LOWERS;
        } else if (pChar == "#") {
            options = DIGITS;
        } else if(pChar =="$") {
            options = DIGITS + "." + "-" + "+";
        } else if(pChar == "*") {
            repeat = true;
            j++;
            i--;
            continue;
        } else {
            options = pChar;
        }
        if(options.indexOf(this.substring(i,i+1)) == -1) return false;
        if(!repeat) j++;
    }
    return !(j < picture.length || i < this.length);
}

String.prototype.project=function f(picture,projection){
    picture = new String(picture);
    result = "";
    var to, from = picture.indexOf(projection);
    while(from>=0){
        to =  from+projection.length;
        if(to>this.length) break;
        result = result+ this.substring(from,to);
        from = picture.indexOf(projection,to);
    }
    return result;
}

String.prototype.transform=function f(picture) {
    result = "";
    picture = ""+picture;
    var options = ""
    var pChar = ""
    var repeat = false;
    var literal = false;
    var i = 0;

    if (this.fits(picture)) return this;

    for (j=0; i<this.length && j<picture.length; j++) {
        pChar=picture.substring(j,j+1);
        if (pChar == '[') {
            for (j++;j<picture.length;j++){
                if(picture.substring(j,j+1) == ']') break;
                options += picture.substring(j,j+1)
            }
            result = result + this.substring(i,i+1);
            i++;
        } else if (pChar =="@" || pChar == "?" || pChar == "#" || pChar =="$") {
            result = result + this.substring(i,i+1);
            i++;
        } else {
            result = result + pChar;
            if (this.substring(i,i+1)==pChar) i++;
        }
    }
    if (result.fits(picture)) return result;
    else return "";
}

String.prototype.isDate=function f(mask){
    var picture = mask.searchReplace('y','#').searchReplace('M','#').searchReplace('d','#');
    picture     = picture.searchReplace('H','#').searchReplace('h','#').searchReplace('m','#');
    picture     = picture.searchReplace('s','#').searchReplace('S','#');

    picture     = picture.searchReplace('D','#');
    picture     = picture.searchReplace('G','?').searchReplace('E', '?');
    picture     = picture.searchReplace('z','?');

    if(!this.fits(picture)) return false;

    var year = this.project(mask,"y").emptyDefault("0");
    var mon  = this.project(mask,"M");
        mon  = ""+(mon.isEmpty() ? "0" : ""+mon.toInt()-1);
    var day  = ""+this.project(mask,"d").emptyDefault(1);
    var hour = ""+this.project(mask,"H").emptyDefault(0);
    var min  = ""+this.project(mask,"m").emptyDefault(0);
    var sec  = ""+this.project(mask,"s").emptyDefault(0);

    var d = new Date( year,mon,day,hour,min,sec);

    return d.getMonth()   == mon.toInt()
        && d.getDate()    == day.toInt()
        && d.getHours()   == hour.toInt()
        && d.getMinutes() == min.toInt()
        && d.getSeconds() == sec.toInt();
}

String.prototype.toDate=function f(mask){
    return new Date(
        this.project(mask,"y").emptyDefault("0"),
        this.project(mask,"M").isEmpty()
            ? "0"
            : ""+(this.project(mask,"M").toInt()-1),
        this.project(mask,"d").emptyDefault(1),
        this.project(mask,"H").emptyDefault(0),
        this.project(mask,"m").emptyDefault(0),
        this.project(mask,"s").emptyDefault(0)
    );
}

// ****************************************************************************
Date.prototype.toDatetimeString=function f(){
    var date =  new String(this.getFullYear());
        date = date +
           new String(this.getMonth()+1).padLeft(2,"0")+
           new String(this.getDate()).padLeft(2,"0");

    var h = this.getHours();
    var m = this.getMinutes();
    var s = this.getSeconds();
    return date + " " +
           (h==0?'00':new String(h).padLeft(2,"0"))+
           (m==0?'00':new String(m).padLeft(2,"0"))+
           (s==0?'00':new String(s).padLeft(2,"0"));
}


/* -----------------  Custom class   ------------------- */
// Hashtable class
function Hashtable() {
   this.keys           = new Array();
   this.values         = new Array();
   this.put            = HashtableMethod_put;
   this.get            = HashtableMethod_get;
   this.contains       = HashtableMethod_contains;
   this.remove         = HashtableMethod_remove;
   this.size           = HashtableMethod_size;
   this.getKey         = HashtableMethod_getKey;
   this.keyString      = HashtableMethod_keyString;
   this.valueString    = HashtableMethod_valueString;
}

    function HashtableMethod_get(key){
        for(i=0;i<this.keys.length;i++)
            if(this.keys[i] == key) return this.values[i];
        return null;
    }

    function HashtableMethod_put(key, value) {
        for(i=0;i<this.keys.length;i++){
            if(this.keys[i] == key){
                this.values[i] = value;
                return;
            }
        }
        this.keys[this.keys.length] = key;
        this.values[this.values.length] = value;
    }

    function HashtableMethod_size(){
        return this.keys.length;
    }

    function HashtableMethod_contains(key){
        return this.get(key) != null;
    }

    function HashtableMethod_remove(key){
        k = new Array(this.keys.length-1);
        v = new Array(this.keys.length-1);
        for(i=0,j=0;i<this.keys.length;i++){
            if(this.keys[i] != key){
                 k[j] = this.keys[i];
                 v[j] = this.values[i];
                 j++;
            }
        }
        this.keys = k;
        this.values = v;
    }

    function HashtableMethod_getKey(index){
        return this.keys[index];
    }


    function HashtableMethod_keyString(delimiter){
        return this.keys.join(delimiter);
    }

    function HashtableMethod_valueString(delimiter){
        return this.values.join(delimiter);
    }

/* -----------------  End custom class   ------------------- */

// ****************************************************************************
//             DatePicker section
// ****************************************************************************
// Older browser version - generates a pop-up DatePicker window
// call: DatePicker_popup

function DatePicker_popup(field_item, field_item_hidden, mask) {

  var newWindowOptions;
  var newWindowTop;
  var openWindow;
  var winWidth, winHeight;

  winWidth = 200
  winHeight = 200

  if (document.all) {
      posX = event.screenX;
      posY = event.screenY;
  }
  eleX = posX;
  eleY = posY;

  posX = posX + 20;
  posY = posY - (winHeight/2);

  if ((posX + winWidth) > window.screen.width)
     posX = eleX - winWidth - 100;

  if ((posY + winHeight) > window.screen.height)
     posY = posY - (posY + winHeight - window.screen.height)-32;

  if (posX < 0) posX = 0;

  if (posY < 0) posY = 0;

  openWindow= contextPath + "/system/ui/DatePicker.jsp?field="+field_item+
                                       "&fieldHidden="+field_item_hidden+
                                        "&format="+mask+
                                      "&year="+getInitYear(field_item_hidden)+
                                      "&month="+(getInitMonth(field_item_hidden)+1)+
                                      "&day="+getInitDay(field_item_hidden) +
                                      "&hiddenVal="+document.forms[0].elements[field_item_hidden].value;


  openWindow = openWindow.replace(" ","+");

  newWindowOptions = "width=" + winWidth + ",height=" + winHeight + ",innerWidth=" + winWidth + ",innerHeight=" + winHeight + ",alwaysRaised=1,resizable=YES,screenX="+posX+",screenY="+posY+",left="+posX+",top="+posY+",scrollbars=0";
  window.open(openWindow,"dateWindow",newWindowOptions ).focus();
}

// ****************************************************************************
// IE4+/NS4+ version - uses DIV tag to generate a JavaScript
// picker within the existing page
// call: DatePicker_v4plus
  function DaysPerMonth(AYear, AMonth) {
  var Result;
  DaysInMonth=new Array(31,28,31,30,31,30,31,31,30,31,30,31);
    Result=DaysInMonth[AMonth];
    if ((AMonth==2) && (IsLeapYear(AYear))) Result++;
    return Result;
  }

  function GetDayName(ADay) {
  var DayNames=new Array('Sun','Mon','Tue','Wed','Thu','Fri','Sat');
  var Result;
  Result=DayNames[ADay];
  return Result;
  }

  function GetMonthName(AMonth) {
  var MonthNames=new Array('January','February','March','April','May','June','July',
                           'August','September','October','November','December');
  var Result;
  Result=MonthNames[AMonth];
  return Result;
  }

  function IsLeapYear(AYear) {
  var Result;
    Result= ((AYear%4==0) && ((AYear % 100 != 0) || (AYear % 400==0)));
    return Result;
  }

  function GetCellText(AYear,AMonth,ACol,ARow) {
  var DayNum,MonthOffSet;
  var CalDate=new Date(AYear,AMonth,1);
  var Day=CalDate.getDay();
  var Result=0;
  MonthOffset=1-(Day+7) % 7; //Day of week for first day
  if (Day+1==7)
    Result=MonthOffset + ACol + (ARow-2)*7
  else
    Result=MonthOffset + ACol + (ARow - 1 ) * 7;
  if ((Result<1) || (Result>DaysPerMonth(AYear,AMonth))) Result=0;

  return Result;
  }

  function BuildCalendar(id,idHidden,mask,AYear,AMonth) {
  var x,y;
  var CellValue;
  var Result;
  var PrevMonth,PrevYear,NextMonth,NextYear;
  var tempDate;
  var tempStr;
  var dropdownid = id + '_pnl';
  var initDay  = (getInitYear(idHidden)!=AYear?0
                      :(getInitMonth(idHidden)!=AMonth?0
                        :getInitDay(idHidden)));

  PrevYear=AYear;
  if (AMonth>0)
    PrevMonth=AMonth-1
  else {
    PrevMonth=11;
    PrevYear=PrevYear-1;
    }

  NextYear=AYear;
  if (AMonth<11)
    NextMonth=AMonth+1
  else {
    NextMonth=0;
    NextYear=NextYear+1;
    }

  Result='<table class=contentTable cellspacing=0 cellpadding=0><tr><td>';
  <!-- Build month cell at top of calendar -->
  Result=Result+'<table class=contentTable cellspacing=0 cellpadding=0 width="100%"><tr>';
  //Left button
  Result=Result+'<td align=left><a href="#" OnClick="javascript:DrawCalendar(\''+id+'\',\''+ idHidden + '\',\''+mask+'\','+PrevYear+','+PrevMonth+'); "><button type=button class=buttonSmall >&lt;</button></td>';
  //Center month
  Result=Result+'<td align=center>'+GetMonthName(AMonth)+' '+AYear+'</td>';
  //Right button
  Result=Result+'<td align=right><a href="#" OnClick="javascript:DrawCalendar(\''+id+'\',\''+ idHidden + '\',\''+mask+'\','+NextYear+','+NextMonth+'); "><button type=button class=buttonSmall >&gt;</button></td></tr></table>';
  Result=Result+'</td></tr><tr><td>'
  // Build actual calendar
  Result=Result+'<table width="100%" cellspacing=0 cellpadding=0 border="0">';
  for (y=1;y<8;y++) {
    Result=Result+'<tr align=center>';
    for (x=1;x<8;x++) {
      if (y==1) Result=Result+'<th>'+GetDayName(x-1)+'</th>';
      else {
        CellValue=GetCellText(AYear,AMonth,x-1,y-1);

        if (CellValue==0) Result+='<td></td>';
        else {
            Result+='<td><a href="#" class=' + (initDay == CellValue ?'textAlert ':'linkDark ') +
            ' onClick ="'+
                '(' + idHidden + ' ' +
                '? ' + idHidden + '.value = \'' +
                    formatDateHidden(CellValue.toString(), (AMonth+1).toString(), AYear.toString()) + '\'' +
                ': \'\' );' +
            id + '.value = \'' + formatDate(CellValue.toString(),(AMonth+1).toString(),AYear.toString(),mask) +
            '\'; DatePicker_v4plus(\'' + id + '\',\''+ idHidden + '\',\'' + mask + '\');' +
            'if (' + id + '.onchange) ' + id + '.onchange();return false;"> ' +
            CellValue +'</button> </td>';

            } //else
        }
      }
    Result+='</tr>';
    }
  Result+='</table></td>';
  Result+='</tr>';
  Result+="<tr><td align=center><button class=buttonSmall onClick=\"DatePicker_v4plus(\'" + id + "\',\'"+ idHidden + "\',\'" + mask + "\');return false;\">CLOSE</button></td></tr>";
  Result+='</table>';
  return Result;
  }

  //creates date in a format YYYYMMDD TTTTTT
  function formatDateHidden(day, month, year) {
    return year + padDDMM(month,'0') + padDDMM(day,'0') + ' 000000';
  }

  //creates date matching the mask
  function formatDate(day, month, year, mask) {

      dayNum = monthNum = yearNum = 0;
      dayInd = monthInd = yearInd = 0;
    result = "";

      //analyze mask
    for (i=0; i < mask.length; i++) {
        switch (mask.charAt(i)) {
            case "d":
                dayNum++; break;
            case "M":
                monthNum++; break;
            case "y":
                yearNum++; break;
            default: break;
        }
    }

    //prepare data
    if (    ((dayNum>0) & (dayNum<5)) &
            ((monthNum>0) & (monthNum<3)) &
            ((yearNum==2) | (yearNum==4))) {

        if (dayNum>1) day = padDDMM(day,'0');
        if (monthNum ==2) month = padDDMM(month,'0');
        if (yearNum == 2) year = year.substring(2,3);

      //form output
        for (i=0; i < mask.length; i++)
            switch (mask.charAt(i)) {
                case "d":
                    result += day.charAt(dayInd++);
                    break;
                case "M":
                    result += month.charAt(monthInd++);
                    break;
                case "y":
                    result += year.charAt(yearInd++);
                    break;
                default:
                    result += mask.charAt(i);
                    break;
        }

        return(result);
    }
    else    //mask is not supported

        return "";

  }
  // primitive LPAD
  function padDDMM(arg,symbol) {
    return (arg.length == 1)?symbol+arg:arg;
  }

  function DrawCalendar(id,idHidden,mask,AYear,AMonth, onChange) {
  var dropdownid = id + "_pnl";
    if (document.all)
      document.all[dropdownid].innerHTML=BuildCalendar(id,idHidden,mask,AYear,AMonth, onChange)
    else if (document.layers)
      document.layers[dropdownid].innerHTML=BuildCalendar(id,idHidden,mask,AYear,AMonth, onChange);
  }

  function getInitDay(idHidden) {

    if (document.forms[0].elements[idHidden].value != null &&
        document.forms[0].elements[idHidden].value != "")

        return parseFloat(document.forms[0].elements[idHidden].value.substring(6,8));

    else {
        var date = new Date();
        return date.getDate();
    }
  }

  function getInitMonth(idHidden) {

    if (document.forms[0].elements[idHidden].value != null &&
        document.forms[0].elements[idHidden].value != "")

        return parseFloat(document.forms[0].elements[idHidden].value.substring(4,6))-1;

    else {
        var date = new Date();
        return date.getMonth();
    }
  }

  function getInitYear(idHidden) {

    if (document.forms[0].elements[idHidden].value != null &&
        document.forms[0].elements[idHidden].value != "")

        return parseFloat(document.forms[0].elements[idHidden].value.substring(0,4));

    else {
        return( (new Date()).getFullYear() );        
    }
  }


  function DatePicker_v4plus(id, idHidden, mask, onChange) {

    var dropdownid = id + "_pnl";

  // IE4+
    if (document.all) {
      if (document.all[dropdownid].style.visibility=='hidden')
             DrawCalendar(id,idHidden,mask,getInitYear(idHidden),getInitMonth(idHidden), onChange);
      document.all[dropdownid].style.visibility=(document.all[dropdownid].style.visibility=="hidden")?"":"hidden";
      }
  // NS4+
    else if (document.layers) {
      if (document.layers[dropdownid].visibility=='hide')
            DrawCalendar(id,idHidden,mask,getInitYear(idHidden),getInitMonth(idHidden), onChange);
      document.layers[dropdownid].visibility=(document.layers[dropdownid].visibility=="hide")?"show":"hide";
      }

  }

// ****************************************************************************
//             DBLookup section
//
// ****************************************************************************


var lookupOpened = false;

//    !!!!!!!!!!!    never call this procedure directly from your page !!!!!!!!!!!!!

      function DBLookup_popup(   fieldHidden,
                                  fieldVisible,
                                  key,
                                  label,
                                  fields,
                                       nullable,
                                  multiple,
                                  pageSize,
                                  pageTitle,
                                  dataSourceType,
                                  dataSourceSpec,
                                  dataSourceParams,
                                  where,
                                  pageType,
                                  filtersDuplicatesBySQL){
        var newWindowOptions;
        var newWindowTop;
        var openWindow;
        var winWidth, winHeight;
        var theForm;
        //var posX, posY;

        if (lookupOpened) {
            handle = window.open('','Lookup');
            if (handle)
                //handle mac platform DOM window object behavior, #7300
                if (!(handle.navigator && handle.navigator.platform && handle.navigator.platform.toUpperCase() == 'MACPPC'))
                    handle.close();
        } else 
		    lookupOpened = true;

        winWidth = 350;
        winHeight = 350;


        if (document.all) { // ****** Internet Explorer ****
            posX = event.screenX;
            posY = event.screenY;
            theForm = document.forms[0];
        } else { // ****** Netscape ***********
            theForm = findFormForName(document, fieldHidden+'_Form');
            if(theForm == null) {
                theForm = document.forms[0];
            }
            if(navigator.vendorSub) { // Netscape 7
                winWidth = 350;
                winHeight = 350;
            } else {
                winWidth = 525;
                winHeight = (multiple=="multiple") ? 610 : 450;
            }
        }
        eleX = posX;
        eleY = posY;

        if(theForm == null) {
           wbAlert(getLocalizedMessage_NO_FORM());
           return;
        }

        // If the lookup is currently resolving, wait until complete.
        if (theForm.elements[fieldVisible].getAttribute('isResolving') == true) {
            theForm.elements[fieldVisible].setAttribute('isLookupPending', true);
            return;
        }

        posX = posX + 20;
        posY = posY - (winHeight/2);

        if ((posX + winWidth) > window.screen.width)
           posX = eleX - winWidth - 100;

        if ((posY + winHeight) > window.screen.height)
           posY = posY - (posY + winHeight - window.screen.height)-32;

        if (posX < 0) posX = 0;
        if (posY < 0) posY = 0;
        
    // this string may exceed 2k.  read this paramter directly from form by the opened window instead of passign it through.
    var initialBlank = ( theForm.elements[fieldHidden].getAttribute('initialBlank') ? theForm.elements[fieldHidden].getAttribute('initialBlank') : '');
    var resultSelected = ( (multiple != 'multiple' && theForm.elements[fieldHidden].getAttribute('resultSelected')) ? theForm.elements[fieldHidden].getAttribute('resultSelected') : '');
    var itemsCount = (theForm.elements[fieldHidden].getAttribute('itemsCount')?theForm.elements[fieldHidden].getAttribute('itemsCount'):'');
    var addwhere = (theForm.elements[fieldHidden].getAttribute('addwhere')?theForm.elements[fieldHidden].getAttribute('addwhere'):'');
    
        openWindow= contextPath + "/system/ui/DBLookupUI_" + multiple + ".jsp" +
                                         "?fieldHidden=" + fieldHidden +
                                         "&fieldVisible=" + fieldVisible +
                                         "&key=" + key +
                                         "&label=" + label +
                                         "&fields=" + fields +
                                          "&nullable=" + nullable +
                                         "&pageSize=" + pageSize +
                                         "&pageTitle=" + pageTitle +
                                         "&posX=" + posX +
                                         "&posY=" + posY +
                                         "&dataSourceType=" + dataSourceType +
                                         "&dataSourceSpec=" +escape(dataSourceSpec) +
                                         (resultSelected == '' ? '':"&resultSelected=" + resultSelected) +
                                         (initialBlank == '' ? '':"&initialBlank=" + initialBlank) +
                                         (itemsCount == ''? '':"&itemsCount=" + itemsCount) +
                                                                                  (where == ''? '':"&where=" + escape(where)) +
                                                                                 (addwhere == ''? '':"&addwhere=" + escape(addwhere)) +
                                         (pageType == '' ? '': "&pageType=" + pageType) +
                                         "&filtersDuplicatesBySQL=" + filtersDuplicatesBySQL +
                                         "&dataSourceParams=" + escape(dataSourceParams);

        newWindowOptions = "width=" + winWidth + ",height=" + winHeight + ",innerWidth=" + winWidth + ",innerHeight=" + winHeight + ",alwaysRaised=1,resizable=YES,screenX="+posX+",screenY="+posY+",left="+posX+",top="+posY+",scrollbars=1";
        window.open(openWindow,"Lookup",newWindowOptions ).focus();
      }


         // a wrapper for customized calls
    function performDBLookup( fieldHidden,
                                  fieldVisible,
                                  key,
                                          label,
                                  fields,
                                           multiple,
                                  pageSize,
                                  pageTitle,
                                  dataSourceType,
                                  dataSourceSpec){

                DBLookup_popup(   fieldHidden,
                          fieldVisible,
                          key,
                            label,
                          fields,
                                  true,
                          multiple,
                          (pageSize==0?12:pageSize),
                          pageTitle,
                          dataSourceType,
                          dataSourceSpec,
                          "",
                             "",
                          "",
                          "false");
        }


    resolveWindowsCount = 0;

        function DBLookup_resolveLabels(fieldHidden,
                                    fieldVisible,
                                    key,
                                    label,
                                    selectedLabels,
                                    dataSourceType,
                                    dataSourceSpec,
                                    dataSourceParams,
                                    where,
                                    multiple,
                                    filtersDuplicatesBySQL) {

                    resolveLabels(fieldHidden,
                                    fieldVisible,
                                    key,
                                    label,
                                    selectedLabels,
                                    dataSourceType,
                                    dataSourceSpec,
                                    dataSourceParams,
                                    where,
                                    multiple,
                                    'DB',
                                    filtersDuplicatesBySQL);

    }

        function MessagingLookup_resolveLabels(fieldHidden,
                                           fieldVisible,
                                           key,
                                           label,
                                           selectedLabels,
                                           dataSourceType,
                                           dataSourceSpec,
                                           where) {

                    resolveLabels(fieldHidden,
                                  fieldVisible,
                                  key,
                                  label,
                                  selectedLabels,
                                  dataSourceType,
                                  dataSourceSpec,
                                  "",
                                  where,
                                  'true',
                                  'Messaging',
                                  false);

    }

        function resolveLabels(fieldHidden,
                           fieldVisible,
                           key,
                           label,
                           selectedLabels,
                           dataSourceType,
                           dataSourceSpec,
                           dataSourceParams,
                           where,
                           multiple,
                           ui,
                           filtersDuplicatesBySQL) {


            var newWindowOptions;
            var newWindowTop;
            var openWindow;
            var winWidth, winHeight;

            winWidth = 50;
            winHeight = 10;

            // **** Had to remove event.screenX
            // **** Because we switched to <iframe> for Internet Explorer
            // **** akaspersky ****

            posX = 200;
            posY = 200;

      if (document.all) { // ****** Internet Explorer ****
                theForm = document.forms[0];
        } else { // ****** Netscape ***********
                theForm = findFormForName(document, fieldHidden+'_Form');
                if(theForm == null) {
                    theForm = document.forms[0];
                }
            }

            if(theForm == null) {
              wbAlert(getLocalizedMessage_NO_FORM());
               return;
            }
            var addwhere = (theForm.elements[fieldHidden].getAttribute('addwhere')?theForm.elements[fieldHidden].getAttribute('addwhere'):'');

            openWindow= contextPath + "/system/ui/" + ui + "LookupUIResolve.jsp?" +
                        "&fieldHidden=" + fieldHidden +
                        "&fieldVisible=" + fieldVisible +
                        "&key=" + key +
                        "&label=" + label +
                        "&selectedLabels=" + escape(selectedLabels) +
                        "&dataSourceType=" + dataSourceType +
                        "&dataSourceSpec=" + escape(dataSourceSpec) +
                                                (where == ''? '':"&where=" + (ui=='DB' ? escape(where) : where)) +
                                                (addwhere == ''? '':"&addwhere=" + escape(addwhere)) +
                        "&multiple=" + multiple +
                        "&filtersDuplicatesBySQL=" + filtersDuplicatesBySQL +
                        "&dataSourceParams=" + escape(dataSourceParams);

            newWindowOptions =     "width=" + winWidth +
                                ",height=" + winHeight +
                                ",screenX="+posX+
                                ",screenY="+posY+
                                ",left="+posX+
                                ",top="+posY+
                                ",innerWidth=" + winWidth +
                                ",innerHeight=" + winHeight +
                                ",alwaysRaised=1,locationbar=0,statusbar=0,resizable=NO";

            if(document.all) { // **** For IE we are using iFrame
                            var frameName='if' + fieldHidden;
                            document.all[frameName].src=openWindow;
            }  else {  // *** For Netscape Window is Fine
                            window.open(openWindow,"resolveWindow_" + (resolveWindowsCount++) ,newWindowOptions ).focus();
            }

        }

var wbAlertWindow;  // stores alert window parameters for NN

        function wbAlert(message) {


            var newWindowOptions;
            var newWindowTop;
            var openWindow;
            var winWidth, winHeight;

            winWidth = 200;
            winHeight = 10;

            var posX = 200;
            var posY = 200;

            openWindow= message;

            newWindowOptions =     "width=" + winWidth +
                                ",height=" + winHeight +
                                ",innerWidth=" + winWidth +
                                ",innerHeight=" + winHeight +
                                ",alwaysRaised=0,locationbar=0,statusbar=0,resizable=NO";

            if(document.all) { // **** For IE we are using iFrame
               window.alert(message);
            }  else {  // *** For Netscape Window is Fine
               window.alert(message);   // alert("...") is supported as of netscape 2
            }
        }


// *** Sets the values in a DBLookup based on the default values provided ****
function setDBLookup(controlName, defaultID, defaultName)  {
    var form1, form2;
    form1 = getFormForName(controlName+"_Form");
    form2 = getFormForName(controlName+"_Hidden_Form");
    if (form1 == null || form2 == null) {
       alert(getLocalizedMessage_NO_FORM());
       return;
    }
    setElementValue(form1.name, controlName, defaultID);
    setElementValue(form1.name, controlName+"_label", defaultName);
    setElementValue(form2.name, controlName+"_ID", defaultID);
    setElementValue(form2.name, controlName+"_NAME", defaultName);
}

// *** Sets the values in a DBDropdown based on the default values provided ****
function setDBDropdown(controlName, defaultID, defaultName)  {
    var form1, form2, theDropdown, theValue;
    form1 = getFormForName(controlName+"_Form");
    form2 = getFormForName(controlName+"_Hidden_Form");
    if (form1 == null || form2 == null) {
       wbAlert(getLocalizedMessage_NO_FORM());
       return;
    }
    setElementValue(form2.name, controlName+"_ID", defaultID);
    setElementValue(form2.name, controlName+"_NAME", defaultName);
    theDropdown = findElementForName(form1.name, controlName);
    theValue = defaultID+"!*!"+defaultName;
    if(theDropdown!=null && theDropdown.type.indexOf('select')==0) {
       for (i=0;i<theDropdown.options.length;i++) {
           if (theDropdown.options[i].value == theValue) {
                theDropdown.options[i].selected = true;
                return;
           }
       }
       theDropdown.options[theDropdown.options.length] = new Option(defaultName, theValue);
       theDropdown.options[theDropdown.options.length-1].selected = true;
    }
}

function getDocument() {
    return document;
}

function getFormForName(formName) {
     if (document.all) { // ****** Internet Explorer ****
        theForm = document.forms[0];
     } else { // ****** Netscape ***********
        theForm = findFormForName(document, formName);
        if (theForm == null) {
           theForm = document.forms[0];
        }
     }
     return theForm;
}


// ****************************************************************************
//             MessagingNamesLookup section
// ****************************************************************************

function MessagingNamesLookup_popup(fieldHidden ,
                                    fieldVisible ,
                                    multiple,
                                    pageSize){

  var newWindowOptions;
  var newWindowTop;
  var openWindow;
  var winWidth, winHeight;

  winWidth = 350;
  winHeight = 350;

    if (lookupOpened) {
        handle = window.open('','Lookup');
       if (!(handle.navigator && handle.navigator.platform && handle.navigator.platform.toUpperCase() == 'MACPPC'))
                    handle.close();
    } else
        lookupOpened = true;

  if (document.all) {
      posX = event.screenX;
      posY = event.screenY;
  }
  eleX = posX;
  eleY = posY;

  posX = posX + 20;
  posY = posY - (winHeight/2);

  if ((posX + winWidth) > window.screen.width)
     posX = eleX - winWidth - 100;

  if ((posY + winHeight) > window.screen.height)
     posY = posY - (posY + winHeight - window.screen.height)-32;

  if (posX < 0) posX = 0;
  if (posY < 0) posY = 0;
  var resultSelected = document.forms[0].elements[fieldHidden].resultSelected;
  var itemsCount = document.forms[0].elements[fieldHidden].itemsCount;

  openWindow= contextPath + "/system/ui/MessagingNamesLookupUI_" + multiple + ".jsp" +
                                   "?fieldHidden=" + fieldHidden +
                                   "&fieldVisible=" + fieldVisible +
                                 "&pageSize=" + pageSize +
                                 (resultSelected == ''?'':"&resultSelected=" + resultSelected) +
                                 (itemsCount == null? '' :  "&itemsCount=" + itemsCount);

//  openWindow = openWindow.replace(" ","+");

  newWindowOptions =     "width=" + winWidth +
                          ",height=" + winHeight +
                        ",innerWidth=" + winWidth +
                        ",innerHeight=" + winHeight +
                        ",alwaysRaised=1,scrollbars=1,resizable=YES,screenX="+posX+
                        ",screenY="+posY+
                        ",left="+posX+
                        ",top="+posY;
  window.open(openWindow,"Lookup",newWindowOptions ).focus();
}

//
function wbValidateForm() {
    return true;
}

//---------------- Simple <-> Override conversion ----------------

function overrideToSimple(input) {
    return     input.substring(6,9) +
            input.substring(0,1) +
            input.substring(3,4) +
            input.substring(10,16)
}

function simpleToOverride(input) {
    return     input.substring(4,5) + "/" +
            input.substring(6,7) + "/" +
            input.substring(0,3) +
            input.substring(8,14)
}


// ****************************************************************************
//             Formbuilder functions
// ****************************************************************************
function getControlValue(control) {
     if (control.value.isNumber()) return control.value.toNumber();
     else if (control.value.indexOf(":")>=0) return GetMinsFromHHMM(controlArray[x].value);
     else return 0;
}

function sum(controlArray) {
  result = 0;
  for (x in controlArray) {
     result = result + getControlValue(controlArray[x]);
  }
  return result;
}

function avg(controlArray) {
  result = 0;
  for (x in controlArray) {
     result = result + getControlValue(controlArray[x]);
  }
  return result/controlArray.length;
}

function maximum(controlArray) {
  result = 0;
  for (x in controlArray) {
    if (getControlValue(controlArray[x])>result) result = getControlValue(controlArray[x]);
  }
  return result;
}

function minimum(controlArray) {
  result = 0;
  for (x in controlArray) {
    if (result == 0) result = getControlValue(controlArray[x]);
    else if (getControlValue(controlArray[x])<result) result = getControlValue(controlArray[x]);
  }
  return result;
}

function isObjectSetForRequired(object) {
    // check for a select element first because a select element's object.value will return
    // the selected option's value, but for select elements, we are concerned with the text not values when determining
    // if the object was set
    if( typeof( object.options ) != "undefined" ) {
        // was a labelled option selected
        return( !object.options[ object.selectedIndex ].text.isEmpty() );
    } else if( typeof(object.value) != 'undefined' ) {
        return !object.value.isEmpty();
    } else { // radio button(s)
        if (typeof(object.checked) == 'undefined') { // array of radio buttons
            for (var i = 0; i < object.length; i++) {
                if (object[i].checked) return true;
            }
            return false;
        } else { // single radio button
            return object.checked;
        }
    }
    return false;
}

// ********** Cross-Platform Section NN-IE *******
// this function is being referenced for Netscape 4.* only
function copyAll(theDocument, targetForm) {
   var i, anObject;
   if(theDocument.forms) {
     for (i=0; i<theDocument.forms.length; i++) {
       anObject = theDocument.forms[i];
       if(anObject.name!=targetForm.name) {
         copyElements(anObject, targetForm);
         if(anObject.forms) {
           copyAll(anObject, targetForm);
         }
         if(anObject.layers) {
           copyAll(anObject.document, targetForm);
         }
       }
     }
   }
   if(theDocument.layers) {
     for (i=0; i<theDocument.layers.length; i++) {
       anObject = theDocument.layers[i];
       copyElements(anObject, targetForm);
       if(anObject.forms) {
         copyAll(anObject, targetForm);
       }
       if(anObject.layers) {
         copyAll(anObject.document, targetForm);
       }
     }
   }
}

function copyElements(aForm, targetForm) {
   var i,j,anObject;
   if(aForm.elements && targetForm.elements) {
     for (i=0; i<aForm.elements.length; i++) {
       anObject = aForm.elements[i];
       for (j=0; j<targetForm.elements.length; j++) {
         if(targetForm.elements[j].name==anObject.name) {
           if(anObject.value==null && anObject.options) { // *** For Selectable Controls *******
             targetForm.elements[j].value=anObject.options[anObject.selectedIndex].value;
           } else { // *** Radio Buttons ***
             if(anObject.type=='radio') {
               if (anObject.checked) {
                 targetForm.elements[j].value=anObject.value;
               }
             } else { // *** All Other Controls ***
               targetForm.elements[j].value=anObject.value;
             }
           }
         }
       }
     }
   }
}
// ** getElement *********
function getElement(elementName) {
    var elementToReturn;
    
    // leave the document.all syntax in for now
    if( document.all ) { // ** IE ** 
        elementToReturn = document.all[elementName];
    } else if( navigator.appName == "Netscape" && navigator.userAgent.charAt(8) >= 5 ) { 
        // Netscape whose version is greater than 4.*
        elementToReturn = document.forms[ 0 ].elements[ elementName ]; 
        
        // The above won't return non-form elements (ex. DIV for labels).
        if(elementToReturn == null){
            elementToReturn = document.getElementsByName(elementName)[0];
        }
    } else {        
        elementToReturn = getElementInternal(document, elementName, 'page_form');                    
    }    
    if( elementToReturn != null ) {
        return elementToReturn;
    }
}
function getElementInternal(theDocument, elementName, excludedFormName) {
   var i, j, aForm, aLayer, anElement;
   if(theDocument.forms) {
      for (i=0; i<theDocument.forms.length; i++) {
         aForm = theDocument.forms[i];
         if(aForm.name != excludedFormName) {
            if (aForm.elements) {
               if (aForm.elements[elementName]!=null) {
                  return aForm.elements[elementName];
               }
            }
         }
         if(aForm.forms) {
            anElement = getElementInternal(aForm, elementName, excludedFormName);
            if (anElement!=null) {
               return anElement;
            }
         }
         if(aForm.layers) {
            anElement = getElementInternal(aForm.document, elementName, excludedFormName);
            if (anElement!=null) {
               return anElement;
            }
         }
      }
   }
   if(theDocument.layers) {
      for (i=0; i<theDocument.layers.length; i++) {
         aLayer = theDocument.layers[i];
         if(aLayer.elements) {
            if (aLayer.elements[elementName]!=null) {
               return aLayer.elements[elementName];
            }
         }
         if(aLayer.forms) {
            anElement = getElementInternal(aLayer, elementName, excludedFormName);
            if (anElement != null) {
               return anElement;
            }
         }
         if(aLayer.layers) {
            anElement = getElementInternal(aLayer.document, elementName, excludedFormName);
            if (anElement != null) {
               return anElement;
            }
         }
      }
   }
}
// ** End of GetElement ***
function findElementForName(targetFormName, targetElementName) {
   var i, targetForm;
   targetForm = findFormForName(document, targetFormName);
   if(targetForm!=null && targetForm.name == targetFormName && targetForm.elements) {
      for (i=0; i<targetForm.elements.length; i++) {
         if(targetForm.elements[i].name==targetElementName) {
            return targetForm.elements[i];
         }
      }
   }
}

function getElementValue(targetFormName, targetElementName) {
   var i, targetElement;
   targetElement = findElementForName(targetFormName, targetElementName);
   if(targetElement!=null && targetElement.name == targetElementName) {
      return targetElement.value && targetElement.value != ''
                  ?    targetElement.value
                :     '';
   } else {
      return '';
   }
}

function setElementValue(targetFormName, targetElementName, theValue) {
    var i, bn, targetForm;
    targetForm = findFormForName(document, targetFormName);
    if(targetForm.name == targetFormName && targetForm.elements) {
      bn=0;
      for (i=0; i<targetForm.elements.length; i++) {
        if(targetForm.elements[i].name==targetElementName) {
           if(targetForm.elements[i].type == 'radio') { // *** RadioButtons ***
              if(bn == theValue) {
                 targetForm.elements[i].checked=true;
              } else {
                   targetForm.elements[i].checked=false;
              }
              bn++;
           } else { // *** All Other Controls ***
              targetForm.elements[i].value=theValue;
           }
        }
      }
    }
}

function getStartDayOfWeek(today, startDayOfWeek, weekOffset){
    startDay = today.getDate() - today.getDay();
    if(startDayOfWeek > today.getDay()){
        startDay -= 7;
    }
    startDay += startDayOfWeek + (weekOffset * 7);
    return startDay;
}

function setDateRangeDatePickers(value, startName, endName, startMask, endMask, startDayOfWeek) {
    //startDayOfTheWeek - 1=Sunday, 2=Monday, ..., 7=Saturday
    var sValue = value.substr(0,value.indexOf('~!~'));
    var today = new Date() ;
    var startPicker = getElement(startName);
    var startPickerDummy = getElement(startName+'_dummy');
    var endPicker = getElement(endName);
    var endPickerDummy = getElement(endName+'_dummy');

    if (!startPicker || !startPickerDummy || !endPicker || !endPickerDummy) return;

    var NSYear = document.all ? 0 : 1900;

    var today = new Date() ;
    var startDate;
    var endDate;
    var NSYear = document.all ? 0 : 1900;
    var DAY_MILLIS = 24*60*60*1000;

    //IE is perfectly happy with having negative values for month or date. i.e:
    //startDate = new Date(today.getYear(), today.getMonth(), today.getDate()-today.getDay());
    //Netscape doesn't like the idea so we have to do some calculations...
    //Netscape as well behaves kind of wierd(!?) in it's year calculations...
    //I love Netscape, it protects my grey cells from total extinction ;-)

    if (sValue == 'TODAY') {
        startDate = new Date(today.getYear(), today.getMonth(), today.getDate());
        endDate = startDate;
    } else if (sValue == 'THISWEEK') {
        startDate = new Date(today.getYear(), today.getMonth(), getStartDayOfWeek(today, startDayOfWeek - 1,0), 12, 0, 0 );
        endDate = new Date(startDate.getTime()+DAY_MILLIS*6);
    } else if (sValue == 'THISMONTH') {
        startDate = new Date(today.getYear(), today.getMonth(), 1);
        endDate = new Date(today.getYear(), today.getMonth()+1, 1);
        endDate = new Date(endDate.getTime()-DAY_MILLIS);
    } else if (sValue == 'THISYEAR') {
        startDate = new Date(today.getYear(), 0, 1);
        endDate = new Date(today.getYear()+1, 0, 1);
        endDate = new Date(endDate.getTime()-DAY_MILLIS);
    } else if (sValue == 'YESTERDAY') {
        startDate = new Date(today.getYear(), today.getMonth(), today.getDate());
        startDate = new Date(startDate.getTime()-DAY_MILLIS);
        //startDate = new Date(today.getTime()-DAY_MILLIS);
        endDate = startDate;
    } else if (sValue == 'LASTWEEK') {
        startDate = new Date(today.getYear(), today.getMonth(), getStartDayOfWeek(today, startDayOfWeek - 1, -1), 12, 0, 0 );
        endDate = new Date(startDate.getTime()+DAY_MILLIS*6);
    } else if (sValue == 'LASTMONTH') {
        endDate = new Date(today.getYear(), today.getMonth(), 1);
        endDate = new Date(endDate.getTime()-DAY_MILLIS);
        startDate = new Date(endDate.getTime());
        startDate.setDate(1);
    } else if (sValue == 'LASTYEAR') {
        startDate = new Date(today.getYear()-1, 0, 1);
        endDate = new Date(today.getYear(), 0, 1);
        endDate = new Date(endDate.getTime()-DAY_MILLIS);
    } else if (sValue == 'TOMORROW') {
        startDate = new Date(today.getYear(), today.getMonth(), today.getDate()+1);
        endDate = startDate;
    } else if (sValue == 'NEXTWEEK') {
        startDate = new Date(today.getYear(), today.getMonth(), getStartDayOfWeek(today, startDayOfWeek - 1,1) );
        endDate = new Date(startDate.getTime()+DAY_MILLIS*6);
    } else if (sValue == 'NEXTMONTH') {
        startDate = new Date(today.getYear(), today.getMonth()+1, 1);
        endDate = new Date(today.getYear(), today.getMonth()+2, 1);
        endDate = new Date(endDate.getTime()-DAY_MILLIS);
    } else if (sValue == 'NEXTYEAR') {
        startDate = new Date(today.getYear()+1, 0, 1);
        endDate = new Date(today.getYear()+2, 0, 1);
        endDate = new Date(endDate.getTime()-DAY_MILLIS);
    } else if (sValue == 'LAST3DAYS') {
        endDate = new Date(today.getYear(), today.getMonth(), today.getDate());
        endDate = new Date(endDate.getTime()-DAY_MILLIS);
        startDate = new Date(endDate.getTime()-DAY_MILLIS*2);
    } else if (sValue == 'LAST7DAYS') {
        endDate = new Date(today.getYear(), today.getMonth(), today.getDate());
        endDate = new Date(endDate.getTime()-DAY_MILLIS);
        startDate = new Date(endDate.getTime()-DAY_MILLIS*6);
    } else if (sValue == 'LAST30DAYS') {
        endDate = new Date(today.getYear(), today.getMonth(), today.getDate());
        endDate = new Date(endDate.getTime()-DAY_MILLIS);
        startDate = new Date(endDate.getTime()-DAY_MILLIS*29);
    } else {
        //do nothing
        return;
    }

    var startYear = '' + (startDate.getYear()+2*NSYear);
    var startMonth = '' + (startDate.getMonth()+1);
    var startDay = '' + startDate.getDate();
    var endYear = '' + (endDate.getYear()+2*NSYear);
    var endMonth = '' + (endDate.getMonth()+1);
    var endDay = '' + endDate.getDate();

    //set values
    if (startPicker)
        startPicker.value = formatDateHidden(startDay, startMonth, startYear);
    if (startPickerDummy)
        startPickerDummy.value = formatDate(startDay, startMonth, startYear, startMask);
    if (endPicker)
        endPicker.value = formatDateHidden(endDay, endMonth, endYear);
    if (endPickerDummy)
        endPickerDummy.value = formatDate(endDay, endMonth, endYear, endMask);
}


// ***** For the DBLookup AddWhere ******
function getElementAddWhere(targetFormName, targetElementName) {
   var i, targetElement;
   targetElement = findElementForName(targetFormName, targetElementName);
   if(targetElement!=null && targetElement.name == targetElementName) {
      return targetElement.getAttribute('addwhere') && targetElement.getAttribute('addwhere') != ''
                  ? targetElement.getAttribute('addwhere')
                : '';
   } else {
      return '';
   }
}

function setElementAddWhere(targetFormName, targetElementName, theValue) {
    var i, bn, targetForm;
    targetForm = findFormForName(document, targetFormName);
    if(targetForm.name == targetFormName && targetForm.elements) {
      bn=0;
      for (i=0; i<targetForm.elements.length; i++) {
        if(targetForm.elements[i].name==targetElementName) {
              targetForm.elements[i].setAttribute('addwhere',theValue);
        }
      }
    }
}

function findFormForName(theDocument, targetFormName) {
   var i, anObject, foundObject;
   if(theDocument.forms) {
     for (i=0; i<theDocument.forms.length; i++) {
        anObject = theDocument.forms[i];
        if(anObject.name == targetFormName) {
           return anObject;
        } else {
           if(anObject.forms) {
              foundObject = findFormForName(anObject, targetFormName);
              if(foundObject!= null && foundObject.name == targetFormName) {
                return foundObject;
              }
           }
           if(anObject.layers) {
              foundObject = findFormForName(anObject.document, targetFormName);
              if(foundObject!= null && foundObject.name == targetFormName) {
                 return foundObject;
              }
           }
        }
     }
   }
   if(theDocument.layers) {
     for (i=0; i<theDocument.layers.length; i++) {
       anObject = theDocument.layers[i];
       if(anObject.forms) {
         foundObject = findFormForName(anObject, targetFormName);
         if(foundObject!= null && foundObject.name == targetFormName) {
           return foundObject;
         }
       }
       if(anObject.layers) {
         foundObject = findFormForName(anObject.document, targetFormName);
         if(foundObject!= null && foundObject.name == targetFormName) {
            return foundObject;
         }
       }
     }
   }
}

//to format minutes into hh:mm for display
function format_hhmm(mins){
var hh;
var mm;
  hh=Math.floor(mins/60);
  if (hh<10) {
    hh="0"+hh;
  }
  mm=Math.round((mins/60-hh)*60);
  if (mm<10) {
    mm="0"+mm;
  }
  return(hh + ":" + mm);
}

//to format minutes into hh.dd for display (to 2 decimal places)
function format_hhdd(mins) {
var dec_hours;
var int_hours;
  dec_hours=mins/60;
  int_hours=Math.floor(dec_hours*100);
  hh_dd=int_hours/100;
  return hh_dd
}

//convert hh:mm manual entry to minutes value for database updates
function GetMinsFromHHMM(value) {
var shh;
var smm;
var iColon;
var minutes;
  if (value=="") return 0;
  if ((value.indexOf("am") > 0) || (value.indexOf("pm") > 0)) {
      value = convert24Hour(value);
  }
  shh=value.substr(0,2);
  smm=value.substr(2,4);
  minutes=parseInt(shh,10)*60+parseInt(smm,10);
  return minutes;
}

//convert hh.dd manual entry to minutes value for database updates
function GetMinsFromHHDD(value) {
var minutes;
  if (value=="") return 0;
  minutes=parseInt(parseFloat(value)*60,10);
  return minutes;
}

function GetTimeDifference(value1,value2) {
  if (value1>value2) {
    return value2+(1440-value1);
  } else {
    return value2-value1;
  }
}

//verify that times entered are valid - associated with INTEB display type for start and end times, and for HHMM display type (INHMM)
function ValidateHHMM(value) {
var iColon;
var valid=true;
var hours;
var minutes;
  if (isNaN(value)) {
    iColon=value.indexOf(":");
    if (iColon==-1) {
      valid=false;
    }
    hours=parseInt(value.substr(0,iColon),10);
    minutes=parseInt(value.substr(iColon+1),10);
    if ((hours<0) || (hours>23) || (minutes<0) || (minutes>59)) {  //if invalid, return message to user
      valid=false;
    }
  } else {
    hours=parseInt(value);
    if (hours>23) {
      valid=false;
    }
  }
  return valid;
}

function ValidateHHMMampm(value) {
var iColon, iAM, iPM, upperValue, strTemp, iColon2;
var valid=true;
var hours, minutes, modifiedValue;
  if (isNaN(value)) {
    upperValue = value.toUpperCase();
    iColon=value.indexOf(":");
    iAM = upperValue.indexOf("A");
    iPM = upperValue.indexOf("P");
    if ((iColon==-1) && (iAM == -1) && (iPM == -1)) {
      return "BAD";
    } else {
      strTemp = StringReplace(upperValue, "A", "");
      strTemp = StringReplace(strTemp, "P", "");
      strTemp = StringReplace(strTemp, "M", "");
      if (isNaN(strTemp)) {
        iColon2 = strTemp.indexOf(":");
        if (iColon2 == -1) {
          return "BAD";
        } else {
          hours = parseInt(value.substr(0, iColon2),10);
          minutes = parseInt(value.substr(iColon2 + 1),10);
          if ((hours < 0) || (hours > 23) || (minutes < 0) || (minutes > 59) || (isNaN(hours)) || (isNaN(minutes))) {
            return "BAD";
          } else {
            if (iPM > -1) {
              modifiedValue = convertHoursToAMPM(hours, minutes, iAM, iPM);
            } else {
              modifiedValue = convertHoursToAMPM(hours, minutes, iAM, iPM);
            }
          }
        }
      } else {
        strTemp = StringReplace(strTemp, " ", "");
        if (strTemp == "") {
          modifiedValue = "BAD";
        } else {
          hours = parseInt(strTemp);
          modifiedValue = convertStringToAMPM(hours, iAM, iPM);
        }
      }
    }
  } else {
    if (value == "") {
      modifiedValue = "12:00 am";
    } else {
      hours=parseInt(value);
      modifiedValue = convertStringToAMPM(hours, iAM, iPM);
    }
  }
  return modifiedValue;
}

function convertHoursToAMPM(hours, minutes, iAM, iPM) {
var strTemp;
  if (hours > 23) {
    strTemp = "BAD";
  } else {
    if (hours >= 12) {
      if (hours > 12) {
        hours = hours - 12
      }
      if (iAM > -1) {
        strTemp = "" + ZeroPad(hours, 2) + ":" + ZeroPad(minutes, 2) + " am";
      } else {
        strTemp = "" + ZeroPad(hours, 2) + ":" + ZeroPad(minutes, 2) + " pm";
      }
    } else {
      if (hours == 0) {
        strTemp = "12:" + minutes + " am";
      } else {
        if (iPM > -1) {
          strTemp = "" + ZeroPad(hours, 2) + ":" + ZeroPad(minutes, 2) + " pm";
        } else {
          strTemp = "" + ZeroPad(hours, 2) + ":" + ZeroPad(minutes, 2) + " am";
        }
      }
    }
  }
  return strTemp;
}

function convertStringToAMPM(strValue, iAM, iPM) {
var shh, smm, strTemp;

  strTemp = "" + strValue;
  if (strTemp.length > 4) {
    return "BAD";
  }
  if (strTemp.length <= 2) {
    return convertHoursToAMPM(strTemp, "00", iAM, iPM);
  } else {
    smm = strTemp.substr(strTemp.length - 2, 2);
    shh = strTemp.substr(0, strTemp.length - 2);
    return convertHoursToAMPM(shh, smm, iAM, iPM);
  }
}

//-----------------------------------------------------------------------

    function getByName(objName, isPositioned) {
        if (document.layers && isPositioned)
            return findElementForName(objName + '_Form', objName);
        else
            return document.forms[0].elements[objName];
    }

    function normalize12HourTimeString( timeString, hour, minute, am_pm, divider ) {

      if( hour == undefined ) {
        var ts = timeString.toLowerCase();
          var matches = ts.match( /^(\d{1,2})(?:[:|\.](\d{2}))? ?(a|p)m?$/ );
        if( matches == null )
           return timeString;
      
        var hour = parseInt(matches[1],10);
        var minute = matches[2] == '' ? 0 : parseInt(matches[2],10);
        var am_pm = matches[3];
      }

      if( hour > 12 ) {
        hour -= 12;
        am_pm = getPMString();
      }

      if( hour == 0 && am_pm == getAMString() ){
        hour = 12;
      }

      var result = 
          hour.toString() + 
          divider +
          (minute < 10 ? '0' : '') + minute.toString() + 
          am_pm
          ;
      
      return result;
    }

    function normalize24HourTimeString( timeString, hour, minute, divider ) {
      var result = 
          hour.toString() + 
          divider +
          (minute < 10 ? '0' : '') + minute.toString()
          ;
      
      return result;
    }

    function normalizeTimeString( timeString, decimalMinutes ) {
      var ts = timeString.toLowerCase();
      var hour;
      var minute;
      var am_pm;
      var matches;
      
      if( matches = ts.match( /^(\d{1,2})(?:[:|\.](\d{2}))? ?(?:(a|p)m?)?$/ ) ) {
        hour = parseInt(matches[1],10);
        minute = (matches[2] == null || matches[2] == '') ? 0 : parseInt(matches[2],10);
        am_pm = matches[3];
      } else if( matches = ts.match( /^(\d{1,4})\s?(?:(a|p)m?)?$/ ) ) {
        var hhmm = matches[1];
        if( hhmm.length <= 2) {
          hour = parseInt(hhmm,10);
          minute = 0;
        } else {
          hour = parseInt(hhmm.substr(0,hhmm.length-2),10);
          minute = parseInt(hhmm.substr(hhmm.length-2,2),10);
        }
        am_pm = matches[2];
      } else
        return timeString;
      
      var divider = (decimalMinutes == 'true' ? '.' : ':');
      if( am_pm )
        return normalize12HourTimeString( timeString, hour, minute, am_pm, divider );
      else
        return normalize24HourTimeString( timeString, hour, minute, divider );
    }

    function tBl(objName,
                    decimalMinutes,
                    decimalPlaces,
                    nullable,
                    type,
                    look,
                    timeStandard,
                    date,
                    minHour,
                    maxHour,
                    minMinutes,
                    maxMinutes,
                    isPositioned,
                    padHours,
                    startTimePair,
                    endTimePair,
                    showLongSpanMessage) {

         var object = getByName(objName, isPositioned);
         var objHours = getByName(objName + '_hours', isPositioned);
         var objMinutes = getByName(objName + '_minutes', isPositioned);
         var objTime = getByName(objName + '_time', isPositioned);
         var objDate = getByName(objName + '_date', isPositioned);
         var objDateDummy = getByName(objName + '_date_dummy', isPositioned);
         var objStartPair = getByName(startTimePair, false);
         var objEndPair = getByName(endTimePair, false);
         var objAMPM = getByName(objName + '_AMPM', isPositioned);
     
         
         if( objTime )
           objTime.value = normalizeTimeString( objTime.value, decimalMinutes );
         
        return web_data_iu_TimeEditUI_onBlur(
                object,
                objHours,
                objMinutes,
                objTime,
                objAMPM,
                objDate,
                objDateDummy,
                decimalMinutes,
                decimalPlaces,
                nullable,
                type,
                look,
                timeStandard,
                date,
                minHour,
                maxHour,
                minMinutes,
                maxMinutes,
                padHours,
                startTimePair,
                endTimePair,
                showLongSpanMessage);

    }


//    - = new vesion of the function, supporting NN and IE = -

// TimeEdit updating procedure
 function web_data_iu_TimeEditUI_onBlur(    object,
                                            objHours,
                                            objMinutes,
                                            objTime,
                                            objAMPM,
                                            objDate,
                                            objDateDummy,
                                            decimalMinutes,
                                            decimalPlaces,
                                            nullable,
                                            type,
                                            look,
                                            timeStandard,
                                            date,
                                            minHour,
                                            maxHour,
                                            minMinutes,
                                            maxMinutes,
                                            padHours,
                                            objStartPair,
                                            objEndPair,
                                            showLongSpanMessage) {

    
  var pairType = '';                                            
  // handle start/end pair boxes
  if (type == 'time' && look == 'box' && timeStandard=='12' && 
      date == 'none' && (objStartPair || objEndPair) && objTime.value) {
     if (objTime.value.indexOf(getAMString()) < 0 && objTime.value.indexOf(getPMString()) < 0  ) {
        if (objStartPair && !objStartPair.value.isEmpty()) {
           pairType = 'start';
        } else if (objEndPair && !objEndPair.value.isEmpty()) {
           pairType = 'end';
        } else {} //do nothing
     } else {
        if ( (objStartPair && !objStartPair.value.isEmpty()) ||
             (objEndPair && !objEndPair.value.isEmpty()) ) {
           pairType = 'check_interval';
        }
     }
  }
  //clean up hidden field
  object.value = '';
  if (objTime) setFieldValue(objTime,StringReplace(objTime.value,' ',''));
  if (objHours) setFieldValue(objHours,StringReplace(objHours.value,' ',''));
  if (objMinutes) setFieldValue(objMinutes,StringReplace(objMinutes.value,' ',''));

  //process specific case where date is visible and time is not filled in
        //date is visible and the field present
  if (date != 'invisible' &&
        (objDate && objDate.value!=null) &&
            // time box is present and blank
           ((objTime && objTime.value == '') ||
            // no time box and hours/minutes are blank
            (!objTime && objHours.value == '' && objMinutes.value == ''))) {

     object.value = objDate.value;
     return;
  }

  //AM/PM box has changed
  if ((objTime && objTime.value == '') ||
        (!objTime &&
       getFieldValue(objHours) == '' &&
       getFieldValue(objMinutes) == ''))
            return false;

  var ampmchar = '';
  if (objTime) {
        setFieldValue(objHours,'');
        setFieldValue(objMinutes,'');
        if (objTime.value.indexOf(decimalMinutes == 'true' ? ':' : '.')!=-1) {
            wbAlert(getLocalizedMessage_INVALID_SEPARATOR());
            objTime.wbValid = false;
            return false;
        }
        if (decimalMinutes == 'true') {
           var tempVal = new String(Math.round( objTime.value * Math.pow (10, decimalPlaces)) / Math.pow( 10, decimalPlaces));
           if (isNaN(tempVal)) {
               wbAlert(getLocalizedMessage_INVALID_TIME());
                objTime.wbValid = false;
                return false;
           }
           var decimal = tempVal.indexOf('.');
           var numOfZerosNeeded = 0;
           if (decimal == -1) {
               numOfZerosNeeded = decimalPlaces;
               tempVal += '.';
           } else {
               numOfZerosNeeded = decimalPlaces - tempVal.substring(decimal + 1, tempVal.length).length;
               if (numOfZerosNeeded < 0) numOfZerosNeeded = 0;
           }
           for (var i = 0; i < numOfZerosNeeded; i++) {
               tempVal += '0';
           }
           objTime.value = tempVal;
        }

        var ampmtemp = objTime.value;
        var x = ampmtemp;
        if (ampmtemp.indexOf(getAMString()) > -1 || ampmtemp.indexOf(getPMString()) > -1) {
            ampmchar = ampmtemp.substring(ampmtemp.length - getAMString().length);
            x = ampmtemp.substring(0, ampmtemp.length - getAMString().length);
        } else if (look == 'combo' && objAMPM != null && objAMPM != 'undefined') {
            ampmchar = objAMPM.value;
        } else {
            ampmchar = getAMString();
        }

        var divider = (decimalMinutes == 'true' ? '.' : ':');
        var oldLength = x.length;
        x = x.replace(/^0+/,'');
        var newLength = x.length;
        var noHours = (oldLength >= (newLength + 2));
        if (x.indexOf(divider) == 0) x = '0'+ x;
        var dividerPos = x.indexOf(divider);
        if (dividerPos!=-1) x= x.substring(0,dividerPos) +  x.substring(dividerPos+1);

        // if x is not a number OR has another divider OR has no number at all
        if (isNaN(x) || (x.indexOf(divider) != -1) || oldLength < 1) {
            wbAlert(getLocalizedMessage_INVALID_TIME());
            objTime.wbValid = false;
            return false;
        }

        x += (x.length - dividerPos  == 1
                        ? '0'
                        : x.length - dividerPos   == 0
                            ? '00'
                            :'');
        var y;
        if(noHours) {
            y = x + (decimalMinutes=='true' && dividerPos < 0?'00': '');
            y = (y.length == 1) ? '0' + y : y;
            setFieldValue(objHours, y.length <=2 ? '00' : y.substring(0,(dividerPos > 0
                                                                    ? dividerPos
                                                                    : y.length-2)));
        } else {
            y = x + (decimalMinutes=='true' && dividerPos < 0?'00':
                        x.length==1
                            ? '00'
                            : x.length==2
                                   ? (parseFloat(x)<24?'00':'0')
                                                                : '');
            setFieldValue(objHours, y.substring(0,(dividerPos > 0
                                                    ? dividerPos
                                                    : y.length-2)));
        }
    }
    
    if (timeStandard == '12') {
        if (getFieldValue(objHours)==0 && objAMPM!=null && objAMPM.value==getPMString() ) {
            ampmchar = getPMString();
            setFieldValue(objHours,12);
        }else  if (getFieldValue(objHours)==0 && objAMPM!=null && objAMPM.value==getAMString() ) {
            ampmchar = getAMString();
            //setFieldValue(objHours,12);
        }else if (getFieldValue(objHours) == 12 &&
            objTime && objTime.value.indexOf(getAMString()) < 0) {
            ampmchar = getPMString();
        }
        if (getFieldValue(objHours) > 12 &&
            getFieldValue(objHours) < 24 ) {
            ampmchar = getPMString();
            setFieldValue(objHours,getFieldValue(objHours)-12);
        }
        if (getFieldValue(objHours) == 24) {
            ampmchar = getAMString();
            setFieldValue(objHours,12);
        }
    } else {
        if (ampmchar == getPMString() && getFieldValue(objHours) < 12) {
            setFieldValue(objHours,parseInt(getFieldValue(objHours)) + 12);
        }
    }

    if (objTime) {    
        var tMin = '0.' + y.substring((dividerPos > 0
                                    ? dividerPos
                                    : y.length-2),y.length);

        if (decimalMinutes == 'true') {
            tMin = Math.round(tMin * Math.pow (10, decimalPlaces));
            setFieldValue(objMinutes, new String(tMin));
        } else {
            tMin = Math.round (tMin * 100);
            setFieldValue(objMinutes,(tMin < 10
                                    ? '0'
                                    : '') + new String(tMin));
        }

        if (decimalMinutes != 'true') {
            objTime.value=( getFieldValue(objHours).length==1 && type=='time' && (timeStandard == '24' || padHours == 'true')
                            ? '0'
                            :'') +    getFieldValue(objHours) +
                        (getFieldValue(objHours) == '' && getFieldValue(objMinutes) == ''
                            ? ''
                            : divider ) + getFieldValue(objMinutes) + (timeStandard == '24' ? '' : ampmchar);
        }
    }
    if (getFieldValue(objHours) == '' && getFieldValue(objMinutes) == '' &&
            (ampmchar == '') &&
            (objDateDummy? objDateDummy.value == '' : true)) {

        if (nullable=='true') return;
    } else {
        if (ampmchar == '' && y != '') {
            if (y >= '12' && y <= '13') {
                ampmchar = getPMString();
            } else {
                if ('combo' == look && objAMPM != null && objAMPM != 'undefined') {
                    ampmchar = objAMPM.value;
                } else {
                    ampmchar = getAMString();
                }
            }
        }

        // tt 74276 - TimeEdit control in form builder does not allow reset to blank

        // The user should be allowed to go back to blank values ones a value has been
        // chosen in the drop down combo but the below code sets them to max/min values
        // accordingly when the user tries to select the blank.

       // if (objHours && getFieldValue(objHours) == '')
       //       setFieldValue(objHours,(timeStandard == '12' ?'12':'00'));
       // if (objMinutes && getFieldValue(objMinutes) == '')
       //       setFieldValue(objMinutes,'00');
    }

    if ( objDate && objDate.value == '')
            return false;

    if ( isNaN(getFieldValue(objHours))||
            (type=='time' && parseFloat(getFieldValue(objHours)) >=24)) {
              wbAlert(getLocalizedMessage_INVALID_HOURS());
              if (objTime) objTime.wbValid = false;
                  else objHours.wbValid = false;
              return false;
    }
    if ( isNaN(getFieldValue(objMinutes))||
         (decimalMinutes!='true'&& parseFloat(getFieldValue(objMinutes))>=60)) {
        wbAlert(getLocalizedMessage_INVALID_MINUTES());
        if (objTime) objTime.wbValid = false;
            else objMinutes.wbValid = false;
        return false;
    }

    var hours = parseFloat(getFieldValue(objHours));
    var minutes = parseFloat(getFieldValue(objMinutes));

    if (look=='text' && type=='time' && timeStandard=='12' && !isNaN(hours)) {
        if (hours>12) ampmchar = getPMString();
        while (hours > 12) hours = hours - 12;
        setFieldValue(objHours,(''+hours).padLeft(2,'0',2)); 
    }

    var ampm = (type=='time' && timeStandard=='12' ? ampmchar : '');
    if ( ampm == '' && getFieldValue(objHours) && getFieldValue(objHours).substring(0,1) == '-' )
        minutes *= -1;

    if (ampm==getAMString()) {
       if (hours==12) hours=0;
    } else
       if (ampm==getPMString() && hours!=12) hours=hours+12;

    var sHours = '' + hours;
    var testValue = parseFloat(hours * 100) + parseFloat(minutes);
    if (look=='box' && testValue <   (parseFloat(minHour * 100) + parseFloat(minMinutes))) {
        wbAlert(getLocalizedMessage_TIME_LESS());
        if (objTime) objTime.wbValid = false;
              else objHours.wbValid = false;
        return false;
    }
    if (look=='box' && testValue >   (parseFloat(maxHour * 100) + parseFloat(maxMinutes))) {
        wbAlert(getLocalizedMessage_TIME_GREATER());
        if (objTime) objTime.wbValid = false;
              else objHours.wbValid = false;
        return false;
    }

    if (decimalMinutes == 'true') minutes = Math.round((minutes / Math.pow(10,decimalPlaces)) * 60);

    var sMinutes = '' + minutes;
    object.value =
      (type == 'interval'
          ? parseInt(hours*60) + parseInt(minutes)
          : (date != 'none'
              ? objDate.value.substring(0,8) + ' '
              : '') +
      (sHours.length<2?'0':'') + sHours + (sMinutes.length<2?'0':'') + sMinutes +
      (date != 'none' ? '00' : ''));

   if ( object.value.indexOf('NaN') >= 0) {
        object.value = '';
        return false;
   }
   
   

   //reset initially unsigned value to minimal interval ( < 12 hours)
   var diff = 0;
   switch(pairType) {
     case 'start': 
        diff = 0 + (object.value - objStartPair.value);
        //fall thru
     case 'end':
        if (pairType == 'end') {
            diff = 0 + (objEndPair.value - object.value);
        }
        if ((diff < 0 && diff > -1200) || diff > 1200) {
           if (parseInt(object.value, 10) < 1200) { 
              objTime.value = objTime.value.searchReplace('a','p');
              object.value = ('' + (parseInt(object.value, 10) + 1200)).padLeft(4,'0');
           } else {
              (pairType = 'check_interval') 
           }
//           //alternative else, other then checking interval          
//           else {   
//              alert('lowering ' + (pairType == 'start' ? 'end' : 'start') + ' time by 12'); 
//              objTime.value = objTime.value.searchReplace('p','a');
//              object.value = ('' + (parseInt(object.value, 10) - 1200)).padLeft(4,'0');
//           }
        }
        if (pairType != 'check_interval') {
           break;
        }
     case 'check_interval':
        diff = 0 + ( (objEndPair.value ? objEndPair.value : object.value) - 
                     (objStartPair.value ? objStartPair.value : object.value) );
        if ((diff < 0 && diff > -1200) || diff > 1200) {
           if (showLongSpanMessage) {
              wbAlert(getLocalizedMessage_LONG_TIME_SPAN());
           }   
        }       
        break;
   }
  }

//----------------------------------------------------------------

// DatePickerUI updating procedure, #22622
function dBl(object,mask) {
  web_data_iu_DatePickerUI_onBlur(object,mask);
}

function web_data_iu_DatePickerUI_onBlur(object,mask) {
  var value = "";
  if (object.value) value = object.value;
  else return;

  var maskTokens = new Array();
  var mtIndex = 0;

  var pChar = '';
  var token = '';

  //mask tokens
  for (i=0; i<mask.length; i++) {
      pChar=mask.substring(i,i+1);
      token = pChar;
      for (i++;i<mask.length;i++){
          if(mask.substring(i,i+1) != pChar) {
              i--;
              break;
          }
          token += mask.substring(i,i+1)
      }
      maskTokens[mtIndex] = token;
      mtIndex++;
      token = '';
  }

  var digit = false;
  var pcDigit= false;
  var inputTokens = new Array();
  var itIndex = 0;

  //value tokens
  for (i=0; i<value.length; i++) {
      pChar=value.substring(i,i+1);
      token = pChar;
      digit = isDigit(pChar);
      for (i++;i<value.length;i++){
          pChar = value.substring(i,i+1);
          pcDigit = isDigit(pChar);
          if ( (digit && !pcDigit) || (!digit && pcDigit) ) {
              i--;
              break
          }
          token += value.substring(i,i+1)
      }
      inputTokens[itIndex] = token;
      itIndex++;
      token = '';
  }

  var nMaskValueChars = 0;
  var nMaskSeparators = 0;
  for (i=0; i<maskTokens.length; i++) {
      pChar = maskTokens[i].substring(0,1);
      if (pChar == 'M' || pChar == 'd' || pChar == 'y') {
          nMaskValueChars += maskTokens[i].length;
      } else {
          nMaskSeparators++;
      }
  }

  var nInputValueChars = 0;
  var nInputSeparators = 0;
  for (i=0; i<inputTokens.length; i++) {
      pChar = inputTokens[i].substring(0,1);
      if (isDigit(pChar)) {
          nInputValueChars += inputTokens[i].length;
      } else {
          nInputSeparators++;
      }
  }

  if (maskTokens.length == inputTokens.length) {
      //'0' padLeft value tokens to mask width, if needed
      for (i=0; i<maskTokens.length; i++) {
          pChar = inputTokens[i].substring(0,1);
          if (isDigit(pChar)) {
              if (inputTokens[i].length > maskTokens[i].length) 
                  return; 
              if (maskTokens[i].substring(0,1) == 'y') { //TT33930
                  if (inputTokens[i].length < maskTokens[i].length) 
                      return;
              }
              else 
                  inputTokens[i] = inputTokens[i].padLeft(maskTokens[i].length,'0');
          }
      }
  } else if (inputTokens.length = 1 && nInputValueChars > 0 && nInputValueChars == nMaskValueChars) {
      //add separator tokens to input tokens
      var newInputTokens = new Array();
      var nStartIndex = 0;
      for (i=0; i<maskTokens.length; i++) {
          pChar = maskTokens[i].substring(0,1);
          if (pChar == 'M' || pChar == 'd' || pChar == 'y') {
              newInputTokens[i] = inputTokens[0].substring(nStartIndex, nStartIndex + maskTokens[i].length);
              nStartIndex += maskTokens[i].length;
          } else {
              newInputTokens[i] = maskTokens[i];
          }
      }
      inputTokens = newInputTokens;
  }

  var newValue = '';
  for (i=0; i<inputTokens.length; i++) {
      newValue += inputTokens[i];
  }

  if (newValue.isDate(mask)) object.value = newValue;
}
//----------------------------------------------------------------

// function for temporarily storing field value
function cNumTempStore(inputObj) {
   cNumTempStorage = inputObj.value;
}

// function for revert field value to previously stored value
function cNumTempRevert(inputObj) {
   inputObj.value = cNumTempStorage;
}

// function for retrieve field value to previously stored value
function cNumTempRetrieve(inputObj) {
   if (inputObj != null) {
      return cNumTempStorage;
   }
   return "";
}

// CurrencyUI updating procedure
function getCurrencySign() {
    return '$';
}

function getCurrencySignPosition() {
    return 'left';
}

function getDecimalsSeparator() {
    return '.';
}

function getThousandsSeparator() {
    return ',';
}

function useBracketsForNegativeCurrency() {
    return false;
}

function getMinusSignPosition() {
    return 'left';
}

function getWholeDigitsForPositiveNumber(input, scale, localizedMsgMaxScale) {
    input = Trim(input);
    //parsing whole part
    var result = getDecimalsSeparator()!='' && input.indexOf(getDecimalsSeparator())>=0
                ? input.substring(0,input.indexOf(getDecimalsSeparator()))
                : input;
    if (getDecimalsSeparator()!='' && input.indexOf(getDecimalsSeparator())==0) {
        result = '0';
    }
    //parsing out thousands separator
    if (getThousandsSeparator() !='') {
        while (result.indexOf(getThousandsSeparator()) >=0) {
            result = result.replace(getThousandsSeparator(),'');
        }
        //parsing out the whitespace(0x20) 
        //when the thousands separator is no-break space(0xa0), 
        //the browser sometimes converts the thousands separator 
        //  from no-break space into whitespace.
        if ('\xa0' == getThousandsSeparator().charAt(0) 
                && result.indexOf('\x20') >= 0) {
            while (result.indexOf('\x20')>=0) {
                result = result.replace('\x20','');
            }
        }
    }

    if (result.charAt(0)=='-' || !isInteger(result)) {
        wbAlert(getLocalizedMessage_INVALID_NUMBER());
        return null;
    }

    //validate the scale which is the length of whole
    if (result.length > scale) {
        wbAlert(localizedMsgMaxScale);
        return null;
    }

    //format
    return String(parseFloat(result));
}

function getFractionDigitsForPositiveNumber(input, precision, localizedMsgMaxPrecision) {
    input = Trim(input);
    //parsing fraction part
    var result = getDecimalsSeparator()!='' && input.indexOf(getDecimalsSeparator())>=0
                ? input.substring(input.indexOf(getDecimalsSeparator())+1,input.length)
                : '';
    if (getDecimalsSeparator()!='' && !isInteger(result)) {
        wbAlert(getLocalizedMessage_INVALID_NUMBER());
        return null;
    }

    //validate the precision which is the length of decimal digits
    if (result.length > precision) {
        wbAlert(localizedMsgMaxPrecision);
        return null;
    }

    if (getDecimalsSeparator()!='' && precision > result.length) {
        for (i = result.length; i < precision; i++) {
            result = result + '0';
        }
    }
    return result;
}
    

//------------------------------------------------------------------
function formatCurrency(obj,minValue,maxValue, scale, precision,
        localizedMsgMaxScale, localizedMsgMaxPrecision) {
    if(scale==null || scale=="undefined" || scale=="unassigned") {
        scale = 37;
    }
    if(precision==null || precision=="undefined" || precision=="unassigned") {
        precision = 0;
    }
    if(localizedMsgMaxScale==null || localizedMsgMaxScale=="undefined" 
            || localizedMsgMaxScale=="unassigned") {
        localizedMsgMaxScale = 'Maximum number of whole digits:' + scale;
    }
    if(localizedMsgMaxPrecision==null || localizedMsgMaxPrecision=="undefined" 
            || localizedMsgMaxPrecision=="unassigned") {
        localizedMsgMaxPrecision = 'Maximum number of decimal places is:' + precision;
    }

    var input = Trim(obj.value);
    var fieldId = obj.getAttribute('id');
    var hiddenField = fieldId.substring(0, fieldId.lastIndexOf('_dummy'));

    var useBracketsForNegative = useBracketsForNegativeCurrency();
    var negativeValue = false;
    if (useBracketsForNegative) {
        if (input.indexOf('(') == 0 && input.indexOf(')') == input.length - 1) {
            negativeValue = true;
            input = input.substring(1, input.length - 1);
        }
    }
    //parsing out currency sign and minus sign
    if (getCurrencySign() != '' && input.indexOf(getCurrencySign()) >= 0) {
        //has currency sign
        if (getCurrencySignPosition() == 'left') {
            // currency sign is at left
            if (getMinusSignPosition() == 'left') {
                // minus sign is at left
                if (input.charAt(0) == '-') {
                    negativeValue = true;
                }
                input = input.substring(input.indexOf(getCurrencySign()) 
                                + getCurrencySign().length,input.length);
            } else if (getMinusSignPosition() == 'right') {
                // minus sign is at right
                if (input.charAt(input.length - 1) == '-') {
                    negativeValue = true;
                    input = input.substring(0,input.length - 1);
                }
                input = input.substring(input.indexOf(getCurrencySign()) 
                                + getCurrencySign().length,input.length);
            } else {
                // minus sign is at middle
                input = input.substring(input.indexOf(getCurrencySign()) 
                                + getCurrencySign().length,input.length);
                if (input.charAt(0) == '-') {
                    negativeValue = true;
                    input = input.substring(1,input.length);
                }
            }
        } else {
            // currency sign is at right
            if (getMinusSignPosition() == 'left') {
                // minus sign is at left
                if (input.charAt(0) == '-') {
                    negativeValue = true;
                    input = input.substring(1,input.length);
                }
                input = input.substring(0,input.indexOf(getCurrencySign()));
            } else if (getMinusSignPosition() == 'right') {
                // minus sign is at right
                if (input.charAt(input.length - 1) == '-') {
                    negativeValue = true;
                }
                input = input.substring(0,input.indexOf(getCurrencySign()));
            } else {
                // minus sign is at middle
                input = input.substring(0,input.indexOf(getCurrencySign()));
                if (input.charAt(input.length - 1) == '-') {
                    negativeValue = true;
                    input = input.substring(0,input.length - 1);
                }
            }
        }
    } else {
        // no currency sign
        if (getMinusSignPosition() == 'left') {
            // minus sign is at left
            if (input.charAt(0) == '-') {
                negativeValue = true;
                input = input.substring(1,input.length);
            }
        } else {
            if (input.charAt(input.length - 1) == '-') {
                negativeValue = true;
                input = input.substring(0,input.length - 1);
            }
        }
    }

    var whole = getWholeDigitsForPositiveNumber(input, scale, 
                    localizedMsgMaxScale);
    if (whole == null) {
        cNumTempRevert(obj);
        return false;
    }

    var fraction = getFractionDigitsForPositiveNumber(input, precision, 
                        localizedMsgMaxPrecision);
    if (fraction == null) {
        cNumTempRevert(obj);
        return false;
    }

    // assemble
    var output = '';
    //whole
    if (getThousandsSeparator() !='') {
        for (i=0;i<whole.length;i++) {
            output += ((whole.length-i)%3 == 0 &&
                        i!=0 ? getThousandsSeparator() : '') + whole.charAt(i);
        }
    }
    //fraction
    if (getDecimalsSeparator()!='' && precision > 0) {
        output += getDecimalsSeparator() + fraction;
    }

    if (getCurrencySign() != '') {
        //currency
        if (getCurrencySignPosition() == 'left') {
            if (negativeValue) {
                if (!useBracketsForNegative) {
                    if (getMinusSignPosition() == 'left') {
                        output = '-' + getCurrencySign() + output;
                    } else if (getMinusSignPosition() == 'right') {
                        output = getCurrencySign() + output + '-'; 
                    } else {
                        output = getCurrencySign() + '-' + output; 
                    }
                } else {
                    output = '(' + getCurrencySign() + output + ')';
                }
            } else {
                output = getCurrencySign() + output;
            }
        } else {
            if (negativeValue) {
                if (!useBracketsForNegative) {
                    if (getMinusSignPosition() == 'left') {
                        output = '-' + output + getCurrencySign();
                    } else if (getMinusSignPosition() == 'right') {
                        output = output + getCurrencySign() + '-'; 
                    } else {
                        output = output + '-' + getCurrencySign(); 
                    }
                } else {
                    output = '(' + output + getCurrencySign() + ')';
                }
            } else {
                output = output + getCurrencySign();
            }
        }
    } else {
        if (negativeValue) {
            if (getMinusSignPosition() == 'left') {
                output = '-' + output;
            } else {
                output = output + '-';
            }
        }
    }

    hiddenOutput = (negativeValue ? '-' : '') + whole 
                + (precision>0 && getDecimalsSeparator()!='' ? '.' + fraction : '');

    var fieldValue = parseFloat(hiddenOutput);

    if (fieldValue < minValue || fieldValue > maxValue) {
        wbAlert(getLocalizedMessage_VALUE_OUT_OF_RANGE());
        cNumTempRevert(obj);
        return false;

    }

    if (output.indexOf('NaN') >= 0) {
        wbAlert(getLocalizedMessage_INVALID_VALUE());
        cNumTempRevert(obj);
        return false;
    }

    document.forms[0].elements[hiddenField].value = hiddenOutput;

    obj.value = output;
    return true;
}

//------------------------------------------------------------------
function formatDecimal(obj,minValue,maxValue, scale, precision,
        localizedMsgMaxScale, localizedMsgMaxPrecision) {
    if(scale==null || scale=="undefined" || scale=="unassigned") {
        scale = 37;
    }
    if(precision==null || precision=="undefined" || precision=="unassigned") {
        precision = 0;
    }
    if(localizedMsgMaxScale==null || localizedMsgMaxScale=="undefined" 
            || localizedMsgMaxScale=="unassigned") {
        localizedMsgMaxScale = 'Maximum number of whole digits:' + scale;
    }
    if(localizedMsgMaxPrecision==null || localizedMsgMaxPrecision=="undefined" 
            || localizedMsgMaxPrecision=="unassigned") {
        localizedMsgMaxPrecision = 'Maximum number of decimal places is:' + precision;
    }

    var input = Trim(obj.value);
    var fieldId = obj.getAttribute('id');
    var hiddenField = fieldId.substring(0, fieldId.lastIndexOf('_dummy'));

    var negativeValue = false;
    //parsing minus sign
    if (getMinusSignPosition() == 'left') {
        if (input.charAt(0) == '-') {
            negativeValue = true;
            input = input.substring(1,input.length);
        }
    } else {
        if (input.charAt(input.length - 1) == '-') {
            negativeValue = true;
            input = input.substring(0,input.length - 1);
        }
    }

    var whole = getWholeDigitsForPositiveNumber(input, scale, 
                    localizedMsgMaxScale);
    if (whole == null) {
        cNumTempRevert(obj);
        return false;
    }

    var fraction = getFractionDigitsForPositiveNumber(input, precision, 
                        localizedMsgMaxPrecision);
    if (fraction == null) {
        cNumTempRevert(obj);
        return false;
    }

    // assemble
    var output = '';
    //whole
    if (getThousandsSeparator() !='') {
        for (i=0;i<whole.length;i++) {
            output += ((whole.length-i)%3 == 0 &&
                        i!=0 ? getThousandsSeparator() : '') + whole.charAt(i);
        }
    }
    //fraction
    if (getDecimalsSeparator()!='' && precision > 0) {
        output += getDecimalsSeparator() + fraction;
    }

    if (negativeValue) {
        if (getMinusSignPosition() == 'left') {
            output = '-' + output;
        } else {
            output = output + '-';
        }
    }

    hiddenOutput = (negativeValue ? '-' : '') + whole 
                + (precision>0 && getDecimalsSeparator()!='' ? '.' + fraction : '');

    var fieldValue = parseFloat(hiddenOutput);

    if (fieldValue < minValue || fieldValue > maxValue) {
        wbAlert(getLocalizedMessage_VALUE_OUT_OF_RANGE());
        cNumTempRevert(obj);
        return false;

    }

    if (output.indexOf('NaN') >= 0) {
        wbAlert(getLocalizedMessage_INVALID_VALUE());
        cNumTempRevert(obj);
        return false;
    }

    document.forms[0].elements[hiddenField].value = hiddenOutput;

    obj.value = output;
    return true;
}

//------------------------------------------------------------------
function formatPercent(obj,minValue,maxValue, scale, precision,
        localizedMsgMaxScale, localizedMsgMaxPrecision) {
    if(scale==null || scale=="undefined" || scale=="unassigned") {
        scale = 30;
    }
    if(precision==null || precision=="undefined" || precision=="unassigned") {
        precision = 2;
    }
    if(localizedMsgMaxScale==null || localizedMsgMaxScale=="undefined" 
            || localizedMsgMaxScale=="unassigned") {
        localizedMsgMaxScale = 'Maximum number of whole digits:' + scale;
    }
    if(localizedMsgMaxPrecision==null || localizedMsgMaxPrecision=="undefined" 
            || localizedMsgMaxPrecision=="unassigned") {
        localizedMsgMaxPrecision = 'Maximum number of decimal places is:' + precision;
    }

    var input = Trim(obj.value);
    var fieldId = obj.getAttribute('id');
    var hiddenField = fieldId.substring(0, fieldId.lastIndexOf('_dummy'));

    var negativeValue = false;
    //parsing minus sign
    if (getMinusSignPosition() == 'left') {
        if (input.charAt(0) == '-') {
            negativeValue = true;
            input = input.substring(1,input.length);
        }
    } else {
        if (input.charAt(input.length - 1) == '-') {
            negativeValue = true;
            input = input.substring(0,input.length - 1);
        }
    }
    //parsing out percent sign
    if (input.length > 0 && input.charAt(input.length - 1) == '%') {
        input = input.substring(0, input.length - 1);
    }

    var whole = getWholeDigitsForPositiveNumber(input, scale, 
                    localizedMsgMaxScale);
    if (whole == null) {
        cNumTempRevert(obj);
        return false;
    }

    var fraction = getFractionDigitsForPositiveNumber(input, precision, 
                        localizedMsgMaxPrecision);
    if (fraction == null) {
        cNumTempRevert(obj);
        return false;
    }

    // assemble
    var output = '';
    //whole
    if (getThousandsSeparator() !='') {
        for (i=0;i<whole.length;i++) {
            output += ((whole.length-i)%3 == 0 &&
                        i!=0 ? getThousandsSeparator() : '') + whole.charAt(i);
        }
    }
    //fraction
    if (getDecimalsSeparator()!='' && precision > 0) {
        output += getDecimalsSeparator() + fraction;
    }

    if (negativeValue) {
        if (getMinusSignPosition() == 'left') {
            output = '-' + output;
        } else {
            output = output + '-';
        }
    }

    output = output + '%';

    hiddenOutput = (negativeValue ? '-' : '') + whole 
                + (precision>0 && getDecimalsSeparator()!='' ? '.' + fraction : '');

    if (output.indexOf('NaN') >= 0) {
        wbAlert(getLocalizedMessage_INVALID_VALUE());
        cNumTempRevert(obj);
        return false;
    }

    document.forms[0].elements[hiddenField].value = hiddenOutput;

    obj.value = output;
    return true;
}

function getFieldValue (object) {
    return object.type.indexOf('select')==0
                ?    object.options[object.selectedIndex].value
                :    object.value;
}

function setFieldValue(object,value){
    if (object.type.indexOf('select')==0) {
        for (i=0;i<object.length;i++)
            if (object.options[i].value == value) {
                object.options[i].selected = true;
                return;
            }
    } else
        object.value = value;
}

function _alert(object) {
                if (document.forms[0].object)
                    object();
                else
                    wbAlert("Message is not found");
}

//------------ Form Validation ---------------

function wbValidateFields(theDocument,field) {
    var i, anObject, valid;

    if (theDocument.elements) {
        valid = checkFields(theDocument,field);      
    }

    if( theDocument.forms ) {
        var formSize = theDocument.forms.length;
        for( i = 0 ; i < formSize ; i++ ) {
            anObject = theDocument.forms[ i ];
            if (anObject.elements) {
                valid = checkFields(anObject,field);
                if(!valid) {
                    return false;
                }                    
            }
            if(anObject.forms) {
                valid = wbValidateFields(anObject,field);
                if(!valid) {
                    return false;
                }                    
            }
            // layers is only valid in Netscape 4
            // leave this here as it is legacy code
            if(anObject.layers) {
                valid = wbValidateFields(anObject.document,field);
                if(!valid) {
                    return false;
                }
            }
        }
    }
    // document.layers is only valid in Netscape 4
    // leave this here as it is legacy code
    if(theDocument.layers) {         
        for (i=0; i<theDocument.layers.length; i++) {
            anObject = theDocument.layers[i];
            if (anObject.elements) {
                valid = checkFields(anObject,field);
                if(!valid) {
                    return false;
                }                    
            }
            if(anObject.forms) {
                valid = wbValidateFields(anObject,field);
                if(!valid) {
                    return false;
                }
            }
            if(anObject.layers) {
                valid = wbValidateFields(anObject.document,field);
                if(!valid) {
                    return false;
                }
            }
        }
    }

    return customOnSubmit(field);
}

function customOnSubmit(field) {
  return true;
}


function checkFields(aForm,field) {
    var i;

       if(aForm.elements) {
        for (i=0; i<aForm.elements.length; i++) {

            if (field == 'isResolving') {
                if(aForm.elements[i].isResolving!=null && aForm.elements[i].isResolving == true) {
                    return false;
                }
            } else if (field == 'wbValid') {
                if(aForm.elements[i].wbValid!=null && aForm.elements[i].wbValid == false) {
                    if (aForm.elements[i].focus) aForm.elements[i].focus();
                    return false;
                }
            } else if (field == 'isValidating') {
                if(aForm.elements[i].isValidating!=null && aForm.elements[i].isValidating == true) {
                    return false;
                }
            } else if (field == 'validNumber') {
                if(aForm.elements[i].validNumber!=null && aForm.elements[i].validNumber == false) {
                    if (aForm.elements[i].focus) aForm.elements[i].focus();
                    return false;
                }
            }
        }
    }
    return true;
}



var gButton;


function validateFormFields(execute) {
    if (!wbValidateFields(document,'isResolving')) {
        /* wait..... */
        setTimeout('validateFormFields("' + execute + '")', 1000);
        return;
    }

    /* done waiting */

    if (!wbValidateFields(document,'wbValid')) {
        alert(getLocalizedMessage_INCORRECT_VALUE());
        if( gButton ) {
            gButton.disabled=false;
        }
        return false;
    } else {
        if(execute != null && execute != 'undefined' && execute != 'unassigned' && execute != '') {
            setTimeout(execute,500);
        }
        return true;
    }
}

function validateNumberField(execute) {
    if (!wbValidateFields(document,'isValidating')) {
        /* wait..... */
        setTimeout('validateNumberField("' + execute + '")', 1000);
        return;
    }

    /* done waiting */

    if (!wbValidateFields(document,'validNumber')) {
        alert(getLocalizedMessage_INCORRECT_VALUE());
        return false;
    } else {
        if(execute != null && execute != 'undefined' && execute != 'unassigned' && execute != '') {
            setTimeout(execute,500);
        }
        return true;
    }
}


function performSubmit() {
    /* Only perform submit after security validation has completed */
    if (document.getElementsByName("bigH")[0] == null) {
        /* wait..... */
        setTimeout('performSubmit()', 1000);
        return;
    }
    /* done waiting */
	document.forms[0].submit();
	return true;
}

function validateFormFieldsWithButtonsDisabled(button, execute) {
    gButton = button;
    if( gButton ) gButton.disabled=true;
    return validateFormFields(execute);
}

// Trimming functions

function Trim(orgString){
  return LTrim(RTrim(orgString))
}

function LTrim(orgString){
  return orgString.replace(/^\s+/,'')
}

function RTrim(orgString){
  return orgString.replace(/\s+$/,'')
}

// **** Zooming Fonts For Select Controls ****
function zoomSelectFontsBy(delta) {
   var i, j, iOldSize, sOldSize, ntx;
   for(i=0; i<document.forms.length; i++) {
      if(document.forms[i].elements) {
         for(j=0; j<document.forms[i].elements.length; j++) {
            if(document.forms[i].elements[j].type.indexOf('select')==0 && document.forms[i].elements[j].style.fontSize) {
               sOldSize = document.forms[i].elements[j].style.fontSize;
               ntx = sOldSize.indexOf('px');
               if(ntx >= 0) {
                  sOldSize = sOldSize.substring(0,ntx);
                  if (isNaN(sOldSize)) {
                        iOldSize = 12 + parseInt(delta);
                  } else {
                     iOldSize = parseInt(sOldSize) + delta;
                  }
                  document.forms[i].elements[j].style.fontSize = iOldSize + 'px';
               }
            }
         }
      }
   }
}

// ------------------------------------------------------------------------
// decides whether or not scrollbars should be added to a popup window
function areScrollbarsAdded(){
    var scrollbars = 0;
    // Always show scrollbars for netscape
    if(document.layers) scrollbars = 1;
    // In IE show scrollbars if screen resolution is less <= 800x600
    else if(screen.width <= 800) scrollbars = 1;
    return scrollbars;
}

//--------------------
// replaces the long 'getElementAddWhere thing

function geAW( fieldName ) {
    return escape(getElementAddWhere((document.all
                                ? document.forms[0].name
                                : fieldName + '_Form') , fieldName )) ;
}

function seAW( fieldName, value ) {
    return setElementAddWhere((document.all
                                ? document.forms[0].name
                                : fieldName + '_Form') , fieldName, value ) ;
}

//---------------
// outsources onClick function in timesheet
function tsOCl(colName, recCnt, object) {
    document.forms[0].elements['CHECKBOX_' + colName + '_' + recCnt].value = (object.checked ? 'Y' : 'N');
}
//
function cbYN(object) {
    object.value =(object.checked?'Y':'N');
}
//
function cbaYN(name,object) {
    document.forms[0].elements[name].value =(object.checked?'Y':'N');
}

function StringReplace(sInput, sFind, sReplace) {

  if (sInput == '') return '';
  var sTemp = sInput;
  while (sTemp.indexOf(sFind) != -1) {
    sTemp = sTemp.replace(sFind, sReplace);
  }
  return sTemp;
}

function enableParentSubmit() {
    elements = window.opener.document.forms[0].elements;
    oldLabel = window.opener.document.all.Submit_Label.value;

    if (elements.length > 0) {
        for (i = 0 ; i < elements.length ; i ++) {
            elements[i].disabled=false;
            if (elements[i].value=='Processing..') {
                elements[i].value=oldLabel;
            }
        }
    }
    window.opener._is_transaction_in_progress_=false;
}

// Display the status message on the top of the page
// the value is extracted from the hidden object:
//     window.document." + WebConstants.WEB_PAGE_FORM_NAME + ".STATUS_MESSAGE_HIDDEN;"
// and is called by onLoad event for each page (used in PageTag.java)

function printPageActionStatus(obj, type) {
    if(obj!=null && obj!="undefined" && obj!="unassigned") {
        if(obj.value!=null && obj.value!="" && obj.value!="unassigned") {
            document.getElementById("statusLeft").innerHTML=obj.value;
            if (type == "error") {
	            document.getElementById("statusLeft").className = "statusLeftError";
	            document.getElementById("statusRight").className = "statusRightError";
	        } else if (type == "warn") {
	            document.getElementById("statusLeft").className = "statusLeftWarn";
	            document.getElementById("statusRight").className = "statusRightWarn";
	        }
            document.getElementById("pageStatusBox").style.display ="block";
        }
    }
}

function printUIPath(obj) {
    if(obj!=null && obj!="undefined" && obj!="unassigned") {
        if(obj.value!=null && obj.value!="" && obj.value!="unassigned") {
            var breadcrumb = document.getElementById("breadcrumb");
            breadcrumb.innerHTML=obj.value;
            breadcrumb.style.display = '';
            obj.value = '';
        }
    }
}

function moveUIPathBox() {
    var topOffset = 0;
    var Dif = parseInt((document.body.scrollTop+topOffset-document.all.uiPathBoxSpan.offsetTop)*.25,10)
    // Work-around wierd Netscape NaN bug when Dif is 0
    if (isNaN(Dif)) Dif=0
    document.all.uiPathBoxSpan.style.pixelTop+=Dif;
}

function uiPathOnTop() {
    //window.setInterval("moveUIPathBox()",10);
}

// Following is used for maintaining the scroll position between page re-posts
function setScrollPosition(){
    var scrollLeft = 0;
    var scrollTop = 0;
    if (document.documentElement &&
            (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
        scrollLeft = document.documentElement.scrollLeft;
        scrollTop = document.documentElement.scrollTop;
    } else if (document.body &&
            (document.body.scrollLeft || document.body.scrollTop)) {
        scrollLeft = document.body.scrollLeft;
        scrollTop = document.body.scrollTop;
    }
    document.getElementById("wbXpos").value = scrollLeft;
    document.getElementById("wbYpos").value = scrollTop;
}
function jumpToSavedScrollPosition(){
    var scrollLeft = document.getElementById("wbXpos").value;
    var scrollTop = document.getElementById("wbYpos").value;
    if (document.documentElement) {
        document.documentElement.scrollLeft = scrollLeft;
        document.documentElement.scrollTop = scrollTop;
    } 
    // in mozilla 1.3 scroll must be set on the <BODY>, not the <HTML> element
    if (document.body) {
        document.body.scrollLeft = scrollLeft;
        document.body.scrollTop = scrollTop;
    }
    document.getElementById("wbXpos").value = 0;
    document.getElementById("wbYpos").value = 0;
}
function jumpToLastScrollPos() {
    if (null == document.getElementById("wbXpos") || null == document.getElementById("wbYpos")) return;
    try {
        var lastPage = document.referrer;
        var thisPage = document.URL;
        lastPage = lastPage.indexOf("?") > 0 ? lastPage.substring(0,lastPage.indexOf("?")) : lastPage;// remove URL parameters
        thisPage = thisPage.indexOf("?") > 0 ? thisPage.substring(0,thisPage.indexOf("?")) : thisPage;
        //only jump to the last scroll position if this is a repost to the same page
        if (thisPage == lastPage) {
            setTimeout("jumpToSavedScrollPosition()",0);
        }
        // populate the hidden input at the end of page_form 
        // that is broken by other forms.
        if (document.forms.length>1) {
            var destination = document.forms[0];
            var source = document.forms[document.forms.length-1].elements;
            for (var i = 0; i < source.length; i++) {
                var input = document.createElement('INPUT');
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', source[i].name);
                input.setAttribute('value', source[i].value);
                destination.appendChild(input);
            }
        }
    } catch (e) {
        alert("Error: jumpToLastScrollPos\n\n" + e.description);
    }
}
// Following is used for 'floating' page elements and keeping them in view as page is scrolled
var floaters  = new Array(3);
floaters[0] = new Array();
floaters[1] = new Array();
floaters[2] = new Array();

Array.prototype.find = function(value, start, partial) {
    start = start || 0;
    for (var i=start; i<this.length; i++)
        if (partial) {
            if (this[i].indexOf(value) > -1) return i;
        } else {
            if (this[i]==value) return i;
        }
    return -1;
}
Array.prototype.has = function(value, partial) {
    return this.find(value,0, partial)!==-1;
}
function getElem(elem) {
    if (document.getElementById) {
        if (typeof elem == "string") {
            elem = document.getElementById(elem);
            if (elem===null) throw 'cannot get element: element does not exist';
        } else if (typeof elem != "object") {
            throw 'cannot get element: invalid datatype';
        }
    } else throw 'cannot get element: unsupported DOM';
    return elem;
}
function hasClass(elem, className) {
    return getElem(elem).className.split(' ').has(className, false);
}
function hasClassContaining(elem, className) {
    return getElem(elem).className.split(' ').has(className, true);
}
function getClassContaining(elem, className) {
    var el = getElem(elem);
    var clsNum = el.className.split(' ').find(className, 0, true);
    if (clsNum > -1) {
        return el.className.split(' ')[clsNum];
    } else {
        return "";
    }
}
function addFloaterById(floaterId,clsName){
    addFloater(document.getElementById(floaterId),clsName);
}


function addFloater(floater, clsName){
    var pos = elPosition(floater);
    if (clsName == "xfloater")  floaters[0][floaters[0].length] = {el:floater, x:pos.x, y:pos.y};
    if (clsName == "yfloater")  floaters[1][floaters[1].length] = {el:floater, x:pos.x, y:pos.y};
    if (clsName == "xyfloater") floaters[2][floaters[2].length] = {el:floater, x:pos.x, y:pos.y};
}
function elPosition(element){
    var x=0, y=0;
    while (element!=null){
        x += element.offsetLeft-element.scrollLeft;
        y += element.offsetTop-element.scrollTop;
        element = element.offsetParent;
    }
    return {x:x, y:y};
}
function repositionFloaters() {
    for (var j = 0; j < floaters.length; j++) {        
        for (var i = 0; i < floaters[j].length; i++) {
            scrLeft = document.body.scrollLeft;
            scrTop  = document.body.scrollTop;
            floater = floaters[j][i];
            
            //window.status = floater.x + " , " + floater.y + "  :  " + floater.el.style.left + " , " + floater.el.style.top + "  :  " + scrLeft + " , " + scrTop;
            if ((j == 0 || j == 2)) {
                if (scrLeft > floater.x) {
                    floater.el.style.left = document.body.scrollLeft - floater.x;
                } else {
                    floater.el.style.left = "0px";
                }
            }
            if ((j == 1 || j == 2)) {
                if (scrTop > floater.y) {
                    floater.el.style.top  = document.body.scrollTop - floater.y;
                } else {
                    floater.el.style.top = "0px";
                }
            }
        }
    }    
}
function addFloatersByTag(tagList){
    tags = tagList.split(",");
    for (var t = 0; t < tags.length; t++) {
        elements = document.getElementsByTagName(tags[t]);
        for (var i=0; i<elements.length; i++) {
            try {
                if (hasClassContaining(elements[i],"floater")) {                    
                    clsName = getClassContaining(elements[i],"floater");                    
                    addFloater(elements[i], clsName);
                }
            } catch (e) {
                alert("ERROR addFloatersByTag " + e.description);
                return;
            }
        }
    }
}

// Following is used to display context senstive Robohelp
function popupContextSensitiveHelp(topicId, languageId){
//    var msg = "Context Sensitive RoboHelp for topic ID " + topicId + "  , language ID " + languageId;
//        msg+= " will be displayed here.\n";
//        msg+= "Waiting for Topic IDs to be implemented in a new RoboHelp build.";
//    alert(msg);
    RH_ShowHelp(0, contextPath + "/help/" + languageId + "/Workbrain_Help.htm", 15, topicId); return false;
    
}

// --------------------- copied content of RoboHelp_CHS.js --------------------- //
// This is likely temporary addition, for getting online help stuff ready for QA
//
// eHelp? Corporation
// Copyright? 1998-2002 eHelp? Corporation.All rights reserved.
// RoboHelp_CSH.js
// The Helper function for WebHelp Context Sensitive Help

//     Syntax:
//     function RH_ShowHelp(hParent, a_pszHelpFile, uCommand, dwData)
//
//     hParent
//          Reserved - Use 0
//   
//     pszHelpFile
//          WebHelp: 
//               Path to help system start page ("http://www.myurl.com/help/help.htm" or "/help/help.htm")
//               For custom windows (defined in Help project), add ">" followed by the window name ("/help/help.htm>mywin")
//
//          WebHelp Enterprise: 
//               Path to RoboEngine server ("http://RoboEngine/roboapi.asp")
//               If automatic merging is turned off in RoboEngine Configuration Manager, specify the project name in the URL ("http://RoboEngine/roboapi.asp?project=myproject")
//               For custom windows (defined in Help project), add ">" followed by the window name ("http://RoboEngine/roboapi.asp>mywindow")
//
//     uCommand
//          Command to display help. One of the following:
//                    HH_HELP_CONTEXT     // Displays the topic associated with the Map ID sent in dwData
//                                            if 0, then default topic is displayed.                
//               The following display the default topic and the Search, Index, or TOC pane. 
//               Note: The pane displayed in WebHelp Enterprise will always be the window's default pane.
//                    HH_DISPLAY_SEARCH 
//                    HH_DISPLAY_INDEX
//                    HH_DISPLAY_TOC
//
//     dwData
//          Map ID associated with the topic to open (if using HH_HELP_CONTEXT), otherwise 0
//
//     Examples:
//     <p>Click for <A HREF='javascript:RH_ShowHelp(0, "help/help.htm", 0, 10)'>Help</A> (map number 10)</p>
//     <p>Click for <A HREF='javascript:RH_ShowHelp(0, "help/help.htm>mywindow", 0, 100)'>Help in custom window (map number 100)</A></p>


var gbNav6=false;
var gbNav61=false;
var gbNav4=false;
var gbIE4=false;
var gbIE=false;
var gbIE5=false;
var gbIE55=false;

var gAgent=navigator.userAgent.toLowerCase();
var gbMac=(gAgent.indexOf("mac")!=-1);
var gbSunOS=(gAgent.indexOf("sunos")!=-1);
var gbOpera=(gAgent.indexOf("opera")!=-1);

var HH_DISPLAY_TOPIC = 0;
var HH_DISPLAY_TOC = 1;
var HH_DISPLAY_INDEX = 2;
var HH_DISPLAY_SEARCH = 3;
var HH_HELP_CONTEXT = 15;

var gVersion=navigator.appVersion.toLowerCase();

var gnVerMajor=parseInt(gVersion);
var gnVerMinor=parseFloat(gVersion);

gbIE=(navigator.appName.indexOf("Microsoft")!=-1);
if(gnVerMajor>=4)
{
    if(navigator.appName=="Netscape")
    {
        gbNav4=true;
        if(gnVerMajor>=5)
            gbNav6=true;
    }
    gbIE4=(navigator.appName.indexOf("Microsoft")!=-1);
}
if(gbNav6)
{
    document.gnPageWidth=innerWidth;
    document.gnPageHeight=innerHeight;
    var nPos=gAgent.indexOf("netscape");
    if(nPos!=-1)
    {
        var nVersion=parseFloat(gAgent.substring(nPos+10));
        if(nVersion>=6.1)
            gbNav61=true;
    }
}else if(gbIE4)
{
    var nPos=gAgent.indexOf("msie");
    if(nPos!=-1)
    {
        var nVersion=parseFloat(gAgent.substring(nPos+5));
        if(nVersion>=5)
            gbIE5=true;
        if(nVersion>=5.5)
            gbIE55=true;
    }
}

function RH_ShowHelp(hParent, a_pszHelpFile, uCommand, dwData)
{
    // this function only support WebHelp
    var strHelpPath = a_pszHelpFile;
    var strWnd = "";
    var nPos = a_pszHelpFile.indexOf(">");
    if (nPos != -1)
    {
        strHelpPath = a_pszHelpFile.substring(0, nPos);
        strWnd = a_pszHelpFile.substring(nPos+1); 
    }
    if (isServerBased(strHelpPath))
        RH_ShowWebHelp_Server(hParent, strHelpPath, strWnd, uCommand, dwData);
    else
        RH_ShowWebHelp(hParent, strHelpPath, strWnd, uCommand, dwData);
}

function RH_ShowWebHelp_Server(hParent, strHelpPath, strWnd, uCommand, dwData)
{
    // hParent never used.
    ShowWebHelp_Server(strHelpPath, strWnd, uCommand, dwData);
}

function RH_ShowWebHelp(hParent, strHelpPath, strWnd, uCommand, dwData)
{
    // hParent never used.
    ShowWebHelp(strHelpPath, strWnd, uCommand, dwData);
}


function ShowWebHelp_Server(strHelpPath, strWnd, uCommand, nMapId)
{
    var a_pszHelpFile = "";
    if (uCommand == HH_HELP_CONTEXT)
    {
        if (strHelpPath.indexOf("?") == -1)
            a_pszHelpFile = strHelpPath + "?ctxid=" + nMapId;
        else
            a_pszHelpFile = strHelpPath + "&ctxid=" + nMapId;
    }
    else
    {
        if (strHelpPath.indexOf("?") == -1)
            a_pszHelpFile = strHelpPath + "?ctxid=0";
        else
            a_pszHelpFile = strHelpPath + "&ctxid=0";
    }

    if (strWnd)
        a_pszHelpFile += ">" + strWnd;

    if (gbIE4)
    {
        a_pszHelpFile += "&cmd=newwnd&rtype=iefrm";
        loadData(a_pszHelpFile);
    }
    else if (gbNav4)
    {
        a_pszHelpFile += "&cmd=newwnd&rtype=nswnd";
        var sParam = "left="+screen.width+",top="+screen.height+",width=100,height=100";
        window.open(a_pszHelpFile, "__webCshStub", sParam);
    }
    else
    {
        var sParam = "left="+screen.width+",top="+screen.height+",width=100,height=100";
        if (gbIE5)
            window.open("about:blank", "__webCshStub", sParam);
        window.open(a_pszHelpFile, "__webCshStub");
    }
}


function ShowWebHelp(strHelpPath, strWnd, uCommand, nMapId)
{
    var a_pszHelpFile = "";
    if (uCommand == HH_DISPLAY_TOPIC)
    {
        a_pszHelpFile = strHelpPath + "#<id=0";
    }
    if (uCommand == HH_HELP_CONTEXT)
    {
        a_pszHelpFile = strHelpPath + "#<id=" + nMapId;
    }
    else if (uCommand == HH_DISPLAY_INDEX)
    {
        a_pszHelpFile = strHelpPath + "#<cmd=idx";
    }
    else if (uCommand == HH_DISPLAY_SEARCH)
    {
        a_pszHelpFile = strHelpPath + "#<cmd=fts";
    }
    else if (uCommand == HH_DISPLAY_TOC)
    {
        a_pszHelpFile = strHelpPath + "#<cmd=toc";
    }
    if (strWnd)
        a_pszHelpFile += ">>wnd=" + strWnd;

    if (a_pszHelpFile)
    {
        if (gbIE4)
            loadData(a_pszHelpFile);
        else if (gbNav4)
        {
            var sParam = "left="+screen.width+",top="+screen.height+",width=100,height=100";
            window.open(a_pszHelpFile, "__webCshStub", sParam);
        }
        else
        {
            var sParam = "left="+screen.width+",top="+screen.height+",width=100,height=100";
            if (gbIE5)
                window.open("about:blank", "__webCshStub", sParam);
            window.open(a_pszHelpFile, "__webCshStub");
        }
    }
}

function isServerBased(a_pszHelpFile)
{
    if (a_pszHelpFile.length > 0)
    {
        var nPos = a_pszHelpFile.lastIndexOf('.');
        if (nPos != -1 && a_pszHelpFile.length >= nPos + 4)
        {
            var sExt = a_pszHelpFile.substring(nPos, nPos + 4);
            if (sExt.toLowerCase() == ".htm")
            {
                return false;
            }
        }
    }
    return true;
}

function getElementFromId(sID)
{
    if(document.getElementById)
        return document.getElementById(sID);
    else if(document.all)
        return document.all(sID);
    return null;
}

function loadData(sFileName)
{
    if(!getElementFromId("dataDiv"))
    {
        if(!insertDataDiv())
        {
            gsFileName=sFileName;
            return;
        }
    }
    var sHTML="";
    if(gbMac)
        sHTML+="<iframe name=\"__WebHelpCshStub\" src=\""+sFileName+"\"></iframe>";
    else
        sHTML+="<iframe name=\"__WebHelpCshStub\" style=\"visibility:hidden;width:0;height:0\" src=\""+sFileName+"\"></iframe>";
    
    var oDivCon=getElementFromId("dataDiv");
    if(oDivCon)
    {
        if(gbNav6)
        {
            if(oDivCon.getElementsByTagName&&oDivCon.getElementsByTagName("iFrame").length>0)
            {
                oDivCon.getElementsByTagName("iFrame")[0].src=sFileName;
            }
            else
                oDivCon.innerHTML=sHTML;
        }
        else
            oDivCon.innerHTML=sHTML;
    }
}

function insertDataDiv()
{
    var sHTML="";
    if(gbMac)
        sHTML+="<div id=dataDiv style=\"display:none;\"></div>";
    else
        sHTML+="<div id=dataDiv style=\"visibility:hidden\"></div>";

    document.body.insertAdjacentHTML("beforeEnd",sHTML);
    return true;
}

function disableAllButtons()
{
    if ( document && document.page_form && document.page_form.elements )
    {
        for ( var i=0; i<document.page_form.elements.length; i++ )
        {
            var element = document.page_form.elements[i];
            if ( element && element.type && (element.type == "button" 
                    || element.type == "submit") )
            {
                element.disabled = true;
            }
        }
    }
}

/* --- iframe utils --- */
function closeIframePopup(iframeId){
    if (typeof(iframeId)=="string") theIframe = document.getElementById(iframeId);
    else theIframe = iframeId;
    if (theIframe != null){
        theIframe.style.visibility = "hidden";
        try{frames[theIframe.name].targetInput.focus()} catch(e){};
    }
    return false;
}

function frameSizeToContent(theIframe){
    theIframe.width = frames[theIframe.name].document.getElementById("positionDIV").offsetWidth;
    theIframe.height = frames[theIframe.name].document.getElementById("positionDIV").offsetHeight;
}

/* --- dom utils --- */
function getActualLeft(theNode){
    var actualLeft = 0;
    while (theNode.offsetParent){
        actualLeft += theNode.offsetLeft;
        theNode = theNode.offsetParent;
    }
    return actualLeft;
}
    
function getActualTop(theNode){
    var actualTop = 0;
    while (theNode.offsetParent){
        actualTop += theNode.offsetTop;            
        theNode = theNode.offsetParent;
    }
    return actualTop;
}

/*--dates functions--*/
var default_locale = {
 month:["January","February","March","April","May","June","July","August",
        "September","October","November","December"],
 shortMonth:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep",
             "Oct","Nov","Dec"],
 day:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
 shortDay:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
 eras:["BC","AD"],
 AmPm:["AM","PM"],
 usesAmPm:true,
 firstDayOfWeek:0,
 toOrdinal:function(number) {
   var numStr = String(number);
   var suffix;
   switch(numStr.substring(numStr.length-1)) {
     case "1": suffix = "st";break;
     case "2": suffix = "nd";break;
     case "3": suffix = "rd";break;
     default: suffix = "th";break;
   }
   return numStr + suffix;
 }
};

function DateFormatter(format) {
  this.formatString = format;
}
DateFormatter.prototype.locale = default_locale;
DateFormatter.prototype.setLocale = function (locale) {
  this.locale = locale;
}
DateFormatter.prototype.formatNumber =   
  function formatNumber(number,digits,padChar,ordinal) {
    var numStr = String(number);
    while(numStr.length < digits) {
        numStr = padChar + numStr;
    }
    return ordinal?this.locale.toOrdinal(numStr):numStr;
  };

DateFormatter.prototype.parse = function parse (strDate) {
  var re = /([^a-z\\]*)((([a-z])\4*)(\.?)|\\([a-z]*\b||\.))/gi,
        lastIndex = 0,
      match;
  re.lastIndex=0;
  var strDateLastIndex = 0;
  //var now=new Date();
  //var year=now.getYear();
  //var month=now.getMonth()+1;
  var date=1;
  //var hh=now.getHours();
  //var mm=now.getMinutes();
  //var ss=now.getSeconds();
  var year=0;
  var month=1;
  var hh=0;
  var mm=0;
  var ss=0;
  var ampm="";
  
  while((match = re.exec(this.formatString))) {  
    //resultStr+=match[1];
    var delimiterLength = match[1]?match[1].length:0; // the length of delimiter between pattern character
    var pattern = match[2];
    var patternChar = match[4];
    var patternLength = match[3]?match[3].length:0;
    var contentLength = patternLength; //the length of matched sub-string in "strDate"
    //var ordinal = match[5]=="."; //TO BE IMPLEMENTED
    
    switch (patternChar) {
      case undefined: 
        break;
      case "y": // year
        if (patternLength == 2) {
          year=getInt(strDate,strDateLastIndex+delimiterLength,2,2);
        } else {
          year=getInt(strDate,strDateLastIndex+delimiterLength,4,4);
        }
        if (year==null) { return 0; }
            contentLength=year.length;
        if (year.length==2) { //the year is limited from 1971 to 2070
              if (year > 70) { year=1900+(year-0); }//71'-99' => 1971-1999
              else { year=2000+(year-0); }//00'-70' => 2000-2070
        }
        break;
      case "M": // month
        if (patternLength<=2) {
          month=getInt(strDate,strDateLastIndex+delimiterLength,1,2);
            //more restrictive:
          //month=getInt(strDate,strDateLastIndex+delimiterLength,2,2);
          if(month==null||(month<1)||(month>12)){return 0;}
          contentLength = month.length;
        } 
        else if (patternLength == 3) {
              month=0;
              for (var i=0; i<this.locale.shortMonth.length; i++) {
                var month_name=this.locale.shortMonth[i];
                if (strDate.substring(strDateLastIndex+delimiterLength,strDateLastIndex+delimiterLength+month_name.length).toLowerCase()==month_name.toLowerCase()) {
                    month=i+1;
                    if ((month < 1)||(month>12)){return 0;}
                    contentLength = month_name.length;
                    break;
                }
              }
              if ((month < 1)||(month>12)){return 0;}
        }
        else {
              month=0;
              for (var i=0; i<this.locale.month.length; i++) {
                var month_name=this.locale.month[i];
                if (strDate.substring(strDateLastIndex+delimiterLength,strDateLastIndex+delimiterLength+month_name.length).toLowerCase()==month_name.toLowerCase()) {
                    month=i+1;
                    if ((month < 1)||(month>12)){return 0;}
                    contentLength = month_name.length;
                    break;
                }
              }
              if ((month < 1)||(month>12)){return 0;}
        }
        break;
      case "d": // day of month in digits
        date=getInt(strDate,strDateLastIndex+delimiterLength,1,2);
        //more restrictive:
        //date=getInt(strDate,strDateLastIndex+delimiterLength,2,2);
        if(date==null||(date<1)||(date>31)){return 0;}
        contentLength = date.length
        break;
      case "E": // day of week
        if (patternLength<=2) {
              var day_of_week=getInt(strDate,strDateLastIndex+delimiterLength,1,2);
              if (day_of_week==null || day_of_week<=0 || day_of_week>7) {return 0;}
              contentLength = day_of_week.length;
        } 
        else if (patternLength == 3) {
              var day_of_week = 0;
              for (var i=0; i<this.locale.shortDay.length; i++) {
                var short_day_name=this.locale.shortDay[i];
                if (strDate.substring(strDateLastIndex+delimiterLength,strDateLastIndex+delimiterLength+short_day_name.length).toLowerCase()==short_day_name.toLowerCase()) {
                    day_of_week =i+1;
                    if ((day_of_week<=0) || (day_of_week>7)) {return 0}
                    contentLength = short_day_name.length;
                    break;
                }
              }
            if ((day_of_week<=0) || (day_of_week>7)) {return 0}
        }
           else {
              var day_of_week = 0;
              for (var i=0; i<this.locale.day.length; i++) {
                var day_name=this.locale.day[i];
                if (strDate.substring(strDateLastIndex+delimiterLength,strDateLastIndex+delimiterLength+day_name.length).toLowerCase()==day_name.toLowerCase()) {
                    day_of_week =i+1;
                    if ((day_of_week<=0) || (day_of_week>7)) {return 0}
                    contentLength = day_name.length;
                    break;
                }
              }
              if ((day_of_week<=0) || (day_of_week>7)) {return 0}
        }
        break;
      case "h": // 12 hours AM/PM 
        hh=getInt(strDate,strDateLastIndex+delimiterLength,2,2);
        if(hh==null||(hh<1)||(hh>12)){return 0;}
        contentLength = hh.length;
        break;
      case "H": // 24 hours 
        hh=getInt(strDate,strDateLastIndex+delimiterLength,2,2);
        if(hh==null||(hh<0)||(hh>23)){return 0;}
        contentLength = hh.length;
        break;
      case "m": // minutes
        mm=getInt(strDate,strDateLastIndex+delimiterLength,2,2);
        if(mm==null||(mm<0)||(mm>59)){return 0;}
        contentLength = mm.length;
        break;
      case "s": // seconds
        ss=getInt(strDate,strDateLastIndex+delimiterLength,2,2);
        if(ss==null||(ss<0)||(ss>59)){return 0;}
        contentLength = ss.length;
        break;
      case "a":
        if (strDate.substring(strDateLastIndex+delimiterLength,strDateLastIndex+delimiterLength+this.locale.AmPm[0].length).toLowerCase()==this.locale.AmPm[0].toLowerCase()) {
            ampm="AM";
            contentLength =this.locale.AmPm[0].length;
        }
        else if (strDate.substring(strDateLastIndex+delimiterLength,strDateLastIndex+delimiterLength+this.locale.AmPm[1].length).toLowerCase()==this.locale.AmPm[1].toLowerCase()) {
            ampm="PM";
            contentLength =this.locale.AmPm[1].length;
        }
        else {return 0;}
        break;
      default: //invalid pattern
        return 0;
    }
    strDateLastIndex += delimiterLength + contentLength;
  }
  if (month==2) {
    // Check for leap year
      if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
        if (date > 29){ return 0; }
    }
    else { if (date > 28) { return 0; } }
  }
  if ((month==4)||(month==6)||(month==9)||(month==11)) {
     if (date > 30) { return 0; }
  }
  // Correct hours value
  if (hh<12 && ampm=="PM") { hh=hh-0+12; }
  else if (hh>11 && ampm=="AM") { hh-=12; }
  var newdate=new Date(year,month-1,date,hh,mm,ss);
  return newdate;
}

DateFormatter.prototype.format = function format(date) {
  var re = /([^a-z\\]*)((([a-z])\4*)(\.?)|\\([a-z]*\b||\.))/gi,
      resultStr = "", 
      locale = this.locale,
      pad = this.formatNumber,
      lastIndex = 0,
      match;
  while((match = re.exec(this.formatString))) { 
    resultStr+=match[1];
    var pattern = match[2];
    var patternChar = match[4];
    var patternLength = match[3]?match[3].length:0;
    var ordinal = match[5]==".";
    switch (patternChar) {
      case undefined: // string is "\word"
        resultStr += pattern.substring(1); // skip backslash
        break;
      case "G": // era
        if (date.getFullYear() < 0) {
          resultStr += this.locale.eras[0];
        } else {
          resultStr += this.locale.eras[1];
        }
        break;
      case "y": // year
        if (patternLength == 2) {
          resultStr += pad(date.getFullYear()%100,2,"0",ordinal);
        } else {
          resultStr += pad(date.getFullYear(),patternLength,"0",ordinal);
        }
        break;
      case "M": // month
        if (patternLength<=2) {
          resultStr += pad(date.getMonth()+1,patternLength,"0",ordinal);
        } else if (patternLength == 3) {
          resultStr += this.locale.shortMonth[date.getMonth()];
        } else {
          resultStr += this.locale.month[date.getMonth()];
        }
        break;
      case "d": // day of month
        resultStr += pad(date.getDate(),patternLength,"0",ordinal);
        break;
      case "D": // day in year
        var firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        var dayInYear = Math.round((date.getTime()-firstDayOfYear.getTime())/(24*60*60*1000));
        resultStr += dayInYear;
        break;
      case "E": // day of week
        if (patternLength <= 2) {
          resultStr += pad((date.getDay()-locale.firstDayOfWeek + 7)%7+1,
                           patternLength,"0",ordinal);
        } else if (patternLength == 3) {
          resultStr += locale.shortDay[date.getDay()];
        } else { 
          resultStr += locale.day[date.getDay()];
        }
        break;
      case "h": // 12 hours AM/PM 
        if (locale.usesAmPm) {
          var hour = date.getHours();
          if (hour < 12) {
            resultStr += pad(hour,patternLength,"0")+locale.AmPm[0];
          } else {
            resultStr += pad(hour-12,patternLength,"0")+locale.AmPm[1];
          }
          break;
        } // else 
      case "H": // 24 hours 
        resultStr += pad(date.getHours(),patternLength,"0",ordinal);
        break;
      case "m": // minutes
        resultStr += pad(date.getMinutes(),patternLength,"0",ordinal);
        break;
      case "s": // seconds
        resultStr += pad(date.getSeconds(),patternLength,"0",ordinal);
        break;
      case "z":
        var tzOffsetMins = date.getTimezoneOffset();
        var tzHour = pad(Math.round(tzOffsetMins/60),2,"0",0);
        var tzMin = pad(Math.round(tzOffsetMins%60),2,"0",0);
        if (tzOffsetMins >= 0) {
            resultStr += "GMT+"+tzHour+":"+tzMin;
        } else {
            resultStr += "GMT-"+tzHour+":"+tzMin;
        }
        break;
      default:
        resultStr += pattern;  
    }
    lastIndex = re.lastIndex;
  }
  resultStr += this.formatString.substring(lastIndex);
  return resultStr;
}

function isInteger(val) {
    var digits="1234567890";
    for (var i=0; i < val.length; i++) {
        if (digits.indexOf(val.charAt(i))==-1) { return false; }
    }
    return true;
}

function getInt(str,i,minlength,maxlength) {
    for (var x=maxlength; x>=minlength; x--) {
    var token=str.substring(i,i+x);
        if (token.length < minlength) { return null; }
    if (isInteger(token)) { return token; }
    }
    return null;
}

function readDate(hiddenInputDate){
    if (hiddenInputDate == null || hiddenInputDate.length == 0) {
        return new Date(today.getFullYear(),today.getMonth(),today.getDate());
    }
    var year = hiddenInputDate.substring(0, 4);
    var month = hiddenInputDate.substring(4, 6);
    var day = hiddenInputDate.substring(6, 8);
    return new Date(year, month - 1, day);
}

function readDate(hiddenInputDate, format){
    if (hiddenInputDate == null || hiddenInputDate.length == 0) {
        return new Date(today.getFullYear(),today.getMonth(),today.getDate());
    }
    if ( !hiddenInputDate.isDate('yyyyMMdd mmhhss') &&
         !hiddenInputDate.isDate('yyyyMMdd') ) {
        return new DateFormatter(format).parse(hiddenInputDate);
    }
    var year = hiddenInputDate.substring(0, 4);
    var month = hiddenInputDate.substring(4, 6);
    var day = hiddenInputDate.substring(6, 8);
    return new Date(year, month - 1, day);
}

function getLocaleData() {
    return default_locale;
}

var dateFormatString = "MM/dd/yyyy";

function getDateFormatString() {
    return dateFormatString;
}

function toDateString(theDate) {
    if (theDate != null) {
        // Formatting the Date object as date string: 
        var format = getDateFormatString();
        if (format == null) {
            format = "MM/dd/yyyy";
        }
        var formatter = new DateFormatter(format);
        var localeData = getLocaleData();
        if (localeData != null) {
            formatter.setLocale(localeData);
        }
        var dateString = formatter.format(theDate); 
        return(dateString); 
    } else return "";
}

/* ---- popup functions --- */
function closePop(){
    if (!window.frameElement) window.frameElement= window.parent.document.getElementsByName(window.name)[0];
    window.parent.closeIframePopup(window.frameElement);
    return false;
}

var dragPoint = {"x":0,"y":0};
var orgPoint = {"x":0,"y":0};

function startDrag(event){
    if (!event) event = window.event;
    if (event && !event.target) event.target = event.srcElement;
    if (!window.frameElement) window.frameElement= window.parent.document.getElementsByName(window.name)[0];
    dragPoint.x = event.screenX;
    dragPoint.y = event.screenY;
    orgPoint.x = parseInt(window.frameElement.style.left,10);
    orgPoint.y = parseInt(window.frameElement.style.top,10);
    dragEle = event.target;
    parent.document.onmousemove = drag;
    parent.document.onmouseup = stopDrag;
    document.onmousemove = drag;
    document.onmouseup = stopDrag;
    return false;
}

function drag(event){
    if (!event) event = window.event;
    evt = event;
    if (evt == null) evt = parent.window.event;
    if (!window.frameElement) window.frameElement= window.parent.document.getElementsByName(window.name)[0];
    var x = orgPoint.x + evt.screenX - dragPoint.x ;
    var y = orgPoint.y + evt.screenY - dragPoint.y ;
    window.setTimeout('window.frameElement.style.left ="'+x+'px"; window.frameElement.style.top ="'+y+'px";');
    return false;
}

function stopDrag(event){
    parent.document.onmousemove = null;
    parent.document.onmouseup = null;
    document.onmousemove = null;
    document.onmouseup = null;
    return false;
}
/*--calendar window functions--*/

var intDateFormatter = new DateFormatter("yyyy-MM-dd");
var internalFormatter = new DateFormatter("yyyyMMdd 000000");
var targetInput = {"value":""};
var targetHidden = {"value":""};
var targetEndInput = {"value":""};
var targetEndHidden = {"value":""};
var autoClose = false;
var targetFieldName = "";
var targetEndFieldName = "";

var today = new Date();
var selectedDate = new Date(today.getFullYear(),today.getMonth(),today.getDate());
var calendarExistingDate = null;
var selectedDateDisplay = null;

function inlineCalendarOnChange() {
}

function doClose(shouldClose){
    if (shouldClose) closePop();
}

function setSelectedDate(millis){
    var newDate = new Date(millis);
    calendarExistingDate = new Date(millis);
    highliteNewDate(newDate);
    updateDateControls(selectedDate);
    displaySelectedDate();
    doClose(autoClose);
}

function highliteNewDate(newDate){
    var highlightDate = (
            calendarExistingDate.getMonth() == selectedDate.getMonth()
        &&  calendarExistingDate.getYear()  == selectedDate.getYear()
    );

    today = new Date();
    var currentDate = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    var currentEle = document.getElementById("id"+internalFormatter.format(selectedDate));
    var locale = getLocaleData();
    if (selectionModeEle != null && selectionModeEle.value != null
            && selectionModeEle.value == "week") {
        if (currentEle != null) {
            var weekDay = new Date(selectedDate);
            var offset = locale.firstDayOfWeek - weekDay.getDay();
            if (weekDay.getDay() < locale.firstDayOfWeek) {
                offset = locale.firstDayOfWeek - weekDay.getDay() - 7;
            }
            weekDay.setDate(weekDay.getDate() + offset);
            for (var i = 0; i < 7; i++) {
                var weekDayEle = document.getElementById("id"+internalFormatter.format(weekDay));
                if (weekDayEle != null) {
                    if (weekDay.valueOf() != currentDate.valueOf()) {
                        if (weekDay.getMonth() == monthEle.value) {
                            weekDayEle.className = "calendarGrid";
                        } else {
                            weekDayEle.className = "calendarGrid calendarOut";
                        }
                    } else {
                        weekDayEle.className = "calendarToday";
                    }
                }
                weekDay.setDate(weekDay.getDate() + 1);
            }
        }
        if (newDate != null) {
            weekDay = new Date(newDate);
            if (weekDay.getDay() < locale.firstDayOfWeek) {
                offset = locale.firstDayOfWeek - weekDay.getDay() - 7;
            } else {
                offset = locale.firstDayOfWeek - weekDay.getDay();
            }
            weekDay.setDate(weekDay.getDate() + offset);
            newDate = new Date(weekDay);
            for (i = 0; i < 7; i++) {
                weekDayEle = document.getElementById("id"+internalFormatter.format(weekDay));
                if (weekDayEle != null && highlightDate) {
                    weekDayEle.className = (highlightDate)?"calendarGrid calendarDay":"calendarGrid";
                }
                weekDay.setDate(weekDay.getDate() + 1);
            }
        }
    } else {
        if (currentEle != null) {
            if (selectedDate.valueOf() != currentDate.valueOf()) {
                if (selectedDate.getMonth() == monthEle.value) {
                    currentEle.className = "calendarGrid";
                } else {
                    currentEle.className = "calendarGrid calendarOut";
                }
            } else {
                currentEle.className = "calendarToday";
            }
        }
        if (newDate != null) {
            var newEle = document.getElementById("id"+internalFormatter.format(newDate));
            if (newEle != null){
                newEle.className = (highlightDate)?"calendarGrid calendarDay":"calendarGrid";
            }
        }
    }
    calendarExistingDate = newDate;
    selectedDate = newDate;
}

function focusSelectedDay(){
    if(document.getElementById("id"+internalFormatter.format(selectedDate)))
    document.getElementById("id"+internalFormatter.format(selectedDate)).focus();
}

function displaySelectedDate(){
    var dateString = toDateString(selectedDate)
    selectedDateDisplay.innerHTML = dateString;
    var dateChanged = false;
    if (targetInput != null && targetInput.value != null 
            && targetInput.value.length > 0) {
        if (targetInput.value != dateString) {
            dateChanged = true;
            targetInput.value = dateString;                        
        }
    } else if (targetInput != null) {
        if (targetInput.value != dateString) {
            dateChanged = true;
            targetInput.value = dateString;
        }
    } else if (targetHidden != null
            && targetHidden.value != internalFormatter.format(selectedDate)) {
        // inline calendar
        dateChanged = true;
    }
    
    if (dateChanged) {
        targetHidden.value = internalFormatter.format(selectedDate); 
        if (targetHidden == targetInput) {
            targetHidden.value = toDateString(selectedDate); 
        }

        if (parent != null && parent.document != null 
                && parent.document.page_form != null
                && parent.document.page_form.elements != null) {
            var targetEle = parent.document.getElementsByName(targetFieldName)[0];
            if (targetFieldName != null
                    && targetEle != null) {
                // don't call onchange/onblur, we might get into an infinite loop
                // this event notification is required - if there is a problem, let's fix it                
                if (targetEle.onchange) {
                    targetEle.onchange();
                }
                if (targetEle.onblur) {
                    targetEle.onblur();
                }
            } else if (targetInput == null) {
                inlineCalendarOnChange();                
            }
        } else {
            inlineCalendarOnChange();            
        }
    }
    if (selectionModeEle != null 
            && selectionModeEle.value != null
            && selectionModeEle.value == "week") {
        var weekEndDate = new Date(selectedDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        dateString = toDateString(weekEndDate)
        if (targetEndInput != null) {
            targetEndInput.value = dateString;
        }
        if (targetEndHidden != null) {
            targetEndHidden.value = internalFormatter.format(weekEndDate); 
        }
        // don't call onchange/onblur, we might get into an infinite loop
    }    
}

function updateDateControls(updateDate, forcePopulateCalendar) {
    if(calendarExistingDate == null){ 
        calendarExistingDate = new Date(updateDate); 
    }
    
    if (updateDate == null){
        today = new Date();
        updateDate = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    }
    highliteNewDate(updateDate);
    var pageChange = pageReloaded;
    var yearValue = updateDate.getFullYear();
    if (yearValue != yearEle.value) {
        if (yearEle.options != null && yearEle.options != "undefined") {
            if (yearEle.type == "select-one" && yearEle.options.length > 0) {
                if(yearValue < yearEle.options[0].value 
                        || yearValue > yearEle.options[yearEle.options.length - 1].value) {
                    var yearStarts = yearValue - Math.round((yearEle.options.length -1) / 2) + 1;
                    for (dex = 0; dex < yearEle.options.length; dex++) {
                        yearEle.options[dex].value = yearStarts + dex;
                        yearEle.options[dex].text = yearStarts + dex;
                    }
                }
            }
            for (dex = 0; dex < yearEle.options.length; dex++) {
                if (yearEle.options[dex].value==yearValue) {
                    yearEle.options[dex].selected = true;
                }
            }
        } else {
            yearEle.value = yearValue;
        }
        pageChange = true;
    }
    var monthValue = updateDate.getMonth();
    if(monthValue != monthEle.value || monthValue == 0){
        if (monthEle.options != null && monthEle.options != "undefined") {
            monthEle.options[monthValue].selected = true;
        } else {
            monthEle.value = monthValue;
        }
        pageChange = true;
    }
    if (pageChange || forcePopulateCalendar) {
        populateCalendar();
        pageReloaded = false;
    }
}

function modeChange() {
    today = new Date();
    var currentDate = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    var currentEle = document.getElementById("id"+internalFormatter.format(selectedDate));
    var locale = getLocaleData();
    if (selectionModeEle != null && selectionModeEle.value != null
            && selectionModeEle.value == "day") {
        if (currentEle != null) {
            var weekDay = new Date(selectedDate);
            var offset = locale.firstDayOfWeek - weekDay.getDay();
            if (weekDay.getDay() < locale.firstDayOfWeek) {
                offset = locale.firstDayOfWeek - weekDay.getDay() - 7;
            }
            weekDay.setDate(weekDay.getDate() + offset);
            for (i = 0; i < 7; i++) {
                var weekDayEle = document.getElementById("id"+internalFormatter.format(weekDay));
                if (weekDayEle != null) {
                    if (weekDay.valueOf() != currentDate.valueOf()) {
                        if (weekDay.getMonth() == monthEle.value) {
                            weekDayEle.className = "calendarGrid";
                        } else {
                            weekDayEle.className = "calendarGrid calendarOut";
                        }
                    } else {
                        weekDayEle.className = "calendarToday";
                    }
                }
                weekDay.setDate(weekDay.getDate() + 1);
            }
        }
    }
    highliteNewDate(selectedDate);
}

function monthChange(offset){
    if (!calendarInitialized) return; // calendar not initialized yet
    var extantMonth = monthEle.value;
    if (!isNaN(offset)){
        monthEle.value = ((parseInt(monthEle.value,10)+offset)+12) % 12;
    }
    if (extantMonth != null && Math.abs(extantMonth - monthEle.value) > 1) 
        yearChange(offset);
    else populateCalendar();
}

function yearChange(offset){
    if (!calendarInitialized) return; // calendar not initialized yet
    if (!isNaN(offset)){
        yearEle.value = parseInt(yearEle.value,10)+offset;
    }
    if (yearEle.value.isDate('yyyy')) {
        populateCalendar();
    } else {
        yearEle.value = selectedDate.getYear();
    }
}

function populateCalendar(){
    today = new Date();
    var currentDate = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    var theDate = new Date(yearEle.value,monthEle.value,1);
    var locale = getLocaleData();
    if (locale.firstDayOfWeek < 0 || locale.firstDayOfWeek > 6) {
        locale.firstDayOfWeek = 0;
    }
    var dayCountIn = 1 - theDate.getDay() + locale.firstDayOfWeek;
    if (locale.firstDayOfWeek > 0 && dayCountIn > 1) {
        dayCountIn = dayCountIn - 7;
    }
    var calDate = new Date(theDate);
    calDate.setDate(dayCountIn)
    var maxRow = 6;
    var daysPerWeek = 7;
    var row = 0;
    var maxRowReached = false;
    var dex = 0;
    for (; (dex < grid.length); dex++){
        if (calDate.getMonth() == monthEle.value) {
            if (calDate.valueOf() == currentDate.valueOf()) {
                theClass = "calendarToday";
            } else {
                theClass = "calendarGrid";
            }
        } else {
            theClass = "calendarGrid calendarOut";
            if ((((calDate.getMonth() > 0) && ((calDate.getMonth()-1) == monthEle.value))
                    || ((calDate.getMonth() == 0) && (monthEle.value == 11))) && !maxRowReached) {
                maxRowReached = true;
                maxRow = row;
            }
        }
        var dateValue = internalFormatter.format(calDate);
        if ((dex > 0) && (dex%daysPerWeek) == 0) {
            if (row == maxRow) {
                break;
            }
            grid[dex].date = calDate.valueOf();
            grid[dex].innerHTML = "<a href='javascript:void(0)' id='id"
                    +dateValue+"' onclick='setSelectedDate("
                    +calDate.valueOf()+")' class='"+theClass
                    +"' >"+calDate.getDate()+"</a>";
            calDate.setDate(calDate.getDate()+1);
            row ++;
        } else {
            grid[dex].date = calDate.valueOf();
            grid[dex].innerHTML = "<a href='javascript:void(0)' id='id"
                    +dateValue+"' onclick='setSelectedDate("
                    +calDate.valueOf()+")' class='"+theClass
                    +"' >"+calDate.getDate()+"</a>";
            calDate.setDate(calDate.getDate()+1);
        }
    }
    if (dex < grid.length) {
        for (; (dex < grid.length); dex++){
            grid[dex].innerHTML = "&nbsp;";
        }
    }
    highliteNewDate(selectedDate);
}

var calendarInitialized = false;
var pageReloaded = false;
function initCalendar(){
    selectedDateDisplay = document.getElementById("selectedDateDIV");
    selectionModeEle = document.getElementById("selection_mode");
    monthEle = document.getElementById("month");
    yearEle = document.getElementById("year");
    gridTable= document.getElementById("calendarTable");
    grid = gridTable.getElementsByTagName("TD");

    pageReloaded = true;
    calendarInitialized = true;
}

/*--host page functions--*/
function addPopupIframe(theId,theSrc) {
    var aCalIframe = document.getElementById(theId);
    if (aCalIframe == null) {
        var newIframe = document.createElement("IFRAME");
        newIframe.setAttribute("id",theId);
        newIframe.setAttribute("name",theId);
        if (theSrc != null) {
            newIframe.setAttribute("src",theSrc);
        }
        newIframe.setAttribute("scrolling","no");
        newIframe.setAttribute("frameBorder","0");
        newIframe.setAttribute("width","480");
        newIframe.setAttribute("height","0");
        newIframe.setAttribute("class","popup");
        newIframe.setAttribute("className","popup");
        // -
        // removed the deactivate event due to inconsistence between IE and Mozilla browsers.
        // -
        //newIframe.setAttribute("ondeactivate",new Function("closePopupIframe('"+theId+"')"));
        document.body.appendChild(newIframe);
    }
}

function getClientSize(axe){
  if( typeof( window.innerWidth ) == 'number' ){
    //Non-IE
    return (axe == 'X')?window.innerWidth:window.innerHeight;    
  } else if( document.documentElement &&
      		( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    return (axe == 'X')?document.documentElement.clientWidth:document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    //IE 4 compatible
    return (axe == 'X')?document.body.clientWidth : document.body.clientHeight;
  }
}

function getScrollXY(axe) {
  if (axe == 'X'){
  	return (window.pageXOffset)?(window.pageXOffset):
		(document.documentElement && document.documentElement.scrollLeft)?document.documentElement.scrollLeft:
			document.body.scrollLeft;
  }else if (axe == 'Y'){
  	return (window.pageYOffset)?(window.pageYOffset):
		(document.documentElement && document.documentElement.scrollTop)?document.documentElement.scrollTop:
			document.body.scrollTop;
  }
}

function showCalendar(id, callingButton, targetField, targetHidden, dateFormat, 
        autoClosePopup, targetEndHidden, targetEndField) {
    var calIframe = document.getElementById(id);
    if (calIframe != null) {
        frames[calIframe.name].targetFieldName = targetField;
        frames[calIframe.name].targetInput = document.getElementsByName(targetField)[0];
        frames[calIframe.name].targetHidden = document.getElementsByName(targetHidden)[0];
        frames[calIframe.name].targetEndHidden = document.getElementsByName(targetEndHidden)[0];
        if (targetEndField != null) {
            frames[calIframe.name].targetEndFieldName = targetEndField;
            frames[calIframe.name].targetEndInput = document.getElementsByName(targetEndField)[0];
        }
        frames[calIframe.name].dateFormatString = dateFormat;
        frames[calIframe.name].autoClose = autoClosePopup;
        frames[calIframe.name].updateDateControls(
                readDate(frames[calIframe.name].targetHidden.value, dateFormat));
        frames[calIframe.name].frameSizeToContent();
    
        calIframe.style.top = (getActualTop(callingButton))+"px";
        calIframe.style.left = (getActualLeft(callingButton))+"px";
        //TT #60326 shift if frame outside browser in ETM
        var dist = 0;

		// The width from the left of the scrollable data to the right of the window.
        var scrollAndViewWidth = getScrollXY('X')+getClientSize('X');

        dist = getActualLeft(callingButton)+parseInt(calIframe.width);        
        if(dist > scrollAndViewWidth){

        	if((scrollAndViewWidth - parseInt(calIframe.width)) >= 0){
        	
        	    // Simply move the calendar slightly to the left so that it becomes in view.        	    
	            // Only do this if moving it to the left does not exceed the left of the window (ie.
	            // positive value in the IF condition), otherwise, the calendar would be truncated.
                calIframe.style.left = (scrollAndViewWidth - calIframe.width)+"px";
            } 
        }                

        dist = getActualTop(callingButton)+parseInt(calIframe.height);

		// The height from the top of the scrollable data to the bottom of the window.
        var scrollAndViewHeight = getScrollXY('Y')+getClientSize('Y');

        // Reset the top of the calendar if parts of the calendar is out of view from the window.
        if(dist > scrollAndViewHeight){
        
        	if((scrollAndViewHeight - parseInt(calIframe.height)) >= 0){
        	
        	    // Simply move the calendar slightly higher so that it becomes in view.        	    
	            // Only do this if moving it higher does not exceeds the top of the window (ie.
	            // positive value in the IF condition), otherwise, the calendar would be truncated.
	            calIframe.style.top  = (scrollAndViewHeight - calIframe.height) + "px";	            
            } 
        }
        calIframe.style.zIndex = "1000";
        
        calIframe.style.visibility = "visible";
        frames[calIframe.name].focusSelectedDay();
    }
    return false;
}

function showPopupMenu(iframeId, callingButton, theSrc) {
    menuIframe = document.getElementById(iframeId);
    if (menuIframe != null) {
        menuIframe.contentWindow.targetInput = null;
        menuIframe.setAttribute("src", theSrc);
        menuIframe.style.top = (getActualTop(callingButton))+"px";
        menuIframe.style.left = (getActualLeft(callingButton))+"px";
        menuIframe.style.zIndex = "1000";
        menuIframe.style.visibility = "visible";
        menuIframe.contentWindow.focus();
    }
    return false;
}

function closePopupIframe(id){
    calIframe = document.getElementById(id);
    if (calIframe != null) {
        calIframe.style.visibility = "hidden";
        if (frames[calIframe.name].targetInput != null) {
            try {
                frames[calIframe.name].targetInput.focus();
            } catch(e) {}
        }
    }
    return false;
}

/* --- collapsible control functions --- */
function getParentByTagName(theNode,byTagName,orTagName1,orTagName2){
    var theParent = theNode.parentNode;
    if (theParent != null) {
        if ((theParent.tagName != byTagName)
                && (theParent.tagName != orTagName1)
                && (theParent.tagName != orTagName2)) {
            theParent=getParentByTagName(theParent,byTagName,
                    orTagName1,orTagName2);
        }
    }
    return theParent;
}

function addCollapseLink(id, isMaster) {
    if (id != null) {
        collapseEle = document.getElementById(id);
        if (collapseEle != null) {
            if (isMaster) {
                tdElements = collapseEle.getElementsByTagName("TH");
            } else {
                tdElements = collapseEle.getElementsByTagName("TD");
            }
            if (tdElements != null) {
                firstTD = tdElements[0];
                if (firstTD != null) {
                    childNodes = firstTD.childNodes;
                    var firstTextNode = null;
                    if (childNodes != null) {
                        for (var i=0; i<childNodes.length; i++) {
                            if (childNodes[i].nodeType == 3) {
                                firstTextNode=childNodes[i];
                                break;
                            }
                        }
                    }
                    if (firstTextNode != null) {
                        var newToggleNode = document.createElement("a");
                        newToggleNode.setAttribute('href', 'javascript:void(0)');
                        if (isMaster) {
                            newToggleNode.setAttribute('class', 'collapse all');
                            newToggleNode.setAttribute('onclick', 
                                    'toggleCollapseMaster(this);return false;');
                            newToggleNode.appendChild(firstTextNode.cloneNode(true));
                            firstTD.replaceChild(newToggleNode,firstTextNode);
                            firstTD.innerHTML = firstTD.innerHTML;
                        } else {
                            newToggleNode.setAttribute('class', 'collapse');
                            newToggleNode.setAttribute('onclick', 'toggleCollapse(this);return false;');
                            newToggleNode.appendChild(firstTextNode.cloneNode(true));
                            firstTD.replaceChild(newToggleNode,firstTextNode);
                            firstTD.innerHTML = firstTD.innerHTML;
                            trElements = collapseEle.childNodes;
                            if (trElements != null && trElements.length > 0) {
                                var firstEncountered = false;
                                for (var i=0; i<trElements.length; i++) {
                                    if (trElements[i].tagName == 'TR') {
                                        if (!firstEncountered) {
                                            // skip the first row
                                            firstEncountered = true;
                                        } else if (trElements[i].className != null) {
                                            trElements[i].className = trElements[i].className+" collapse";
                                        } else {
                                            trElements[i].className = "collapse";
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        // no text node
                        var newToggleNode = document.createElement("a");
                        newToggleNode.setAttribute('href', 'javascript:void(0)');
                        if (isMaster) {
                            newToggleNode.setAttribute('class', 'collapse all');
                            newToggleNode.setAttribute('onclick', 
                                    'toggleCollapseMaster(this);return false;');
                            firstTD.appendChild(newToggleNode);
                            firstTD.innerHTML = firstTD.innerHTML;
                        } else {
                            newToggleNode.setAttribute('class', 'collapse');
                            newToggleNode.setAttribute('onclick', 'toggleCollapse(this);return false;');
                            firstTD.appendChild(newToggleNode);
                            firstTD.innerHTML = firstTD.innerHTML;
                            trElements = collapseEle.childNodes;
                            if (trElements != null && trElements.length > 0) {
                                var firstEncountered = false;
                                for (var i=0; i<trElements.length; i++) {
                                    if (trElements[i].tagName == 'TR') {
                                        if (!firstEncountered) {
                                            // skip the first row
                                            firstEncountered = true;
                                        } else if (trElements[i].className != null) {
                                            trElements[i].className = trElements[i].className+" collapse";
                                        } else {
                                            trElements[i].className = "collapse";
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function addClassName(theNode,theClassName,doAdd){
    if (theNode != null){
        existingClassName = theNode.className;
        theNode.className = addWord(existingClassName, theClassName, doAdd);         
    }
    // return whether or not this function changed the inital class name
    return ( (theNode != null) && (existingClassName != theNode.className) );    
}

function addWord(thePhrase,theWord,doAdd){
    matchWordRegExpr = new RegExp("\\s?\\b"+theWord+"\\b");
    if (thePhrase == null) thePhrase="";
    if (doAdd != false){//add word
        if (!matchWordRegExpr.test(thePhrase)){
            addSpace = (thePhrase > "")? " ":"";
            thePhrase += addSpace+theWord;
        }
    } else {//remove word
        thePhrase = thePhrase.replace(matchWordRegExpr,"");
    }
    return thePhrase;
}

function toggleCollapse(callingNode){
    theTBody = getParentByTagName(callingNode,"TBODY","THEAD","TFOOT");
    isOn = (theTBody.className.indexOf(" on")>-1);
    addClassName(theTBody,"on",!isOn);
    var inputNodes = theTBody.getElementsByTagName("INPUT");
    if (inputNodes != null) {
        for (var dex=0; dex<inputNodes.length; dex++) {
            if (inputNodes[dex].getAttribute("name") == theTBody.id) {
                if (isOn) {
                    inputNodes[dex].setAttribute("value", "off")
                } else {
                    inputNodes[dex].setAttribute("value", "on")
                }
                break;
            }
        }
    }
    //try{theTBody.scrollIntoView()} catch(e){};
}

function toggleCollapseMaster(theCallingNode){
    theTHead = getParentByTagName(theCallingNode,"THEAD","TFOOT");
    if (theTHead != null) {
        isOn = (theTHead.className.indexOf(" on")>-1);
        addClassName(theTHead,"on",!isOn);
        theTBodys = getParentByTagName(theCallingNode,"TABLE").tBodies;
        for (tbDex = 0; tbDex < theTBodys.length; tbDex++){
            addClassName(theTBodys[tbDex],"on",!isOn);
        }
    }
    return false;
}

/*--TabGroupTag and TabTag tab selection function--*/
function selectTabTag(name, position, index) {
    var tabCount = getElement(name + '_TAB_COUNT').value;
    var tabObj;
    var tabClassNameEnd;
    for (i = 1; i <= tabCount; i++) {
        tabObj = document.getElementById(name + '_span_' + i);
        if (tabObj && tabObj.className) {
            if (i != index) {
                tabObj.className = 'tabset';
            } else {
                tabObj.className = 'tabset ' + position + 'slct';
            }
        }
    }
}

function getFunctionName( f )
{
    var s = f.toString().match(/function (\w*)/)[1];
    if ( (s == null) || (s.length==0) )
        return "(anonymous)";
    return s;
}

function getStackTrace()
{
    try
    {
        var stackTrace = new Array();
        for ( var a = arguments.caller; a !=null; a = a.caller )
        {
            stackTrace.push( getFunctionName(a.callee) + "()\n" );
            if ( a.caller == a )
            {
                s.push( "*" );
                break;
            }
        }
        alert( stackTrace.join('') );
    }
    catch ( e )
    {
        alert( "Could not get stack trace: " + e.message );
    }
}

/* This method adds key to the given cacheKeys array and value to the given cacheValues array.
 */
function addToCache(cacheKeys, cacheValues, key, value) {
    cacheKeys.push(key);
    cacheValues.push(value);
}

/* This method looks for index X of key in the cacheKeys array, if found the method
 * returns the value at index X in the cacheValues array otherwise the method returns null.
 */
function getFromCache(cacheKeys, cacheValues, key) {
    var value = null;
    for (var i = 0; i < cacheKeys.length; i++) {
        if (key == cacheKeys[i]) {
            value = cacheValues[i];
            break;
        }
    }
    return value;
}

/* Return the ancestor node with the given nodeName of the elem node or null if it cannot be found. */
function getParentByNodeName(elem, nodeName) {
	var result = null;
	for (var parent = elem.parentNode; parent; parent = parent.parentNode) {
		if (parent.nodeName == nodeName) {
			result = parent;
			break;
		}
	}
	return result;
}

// -----------------------------------------------------------------------------------
	// Note:This method does not support multiple select
	function doCopyField(destWin,srcWin,destName,srcName,create) {
		theForm = destWin.document.forms[0];
		srcObj = srcWin.document.forms[0].elements[srcName];
		destObj = theForm.elements[destName];
		if (srcObj != null) {
		    if (destObj==null && create) {
				createField(destWin.document,theForm,destName,true,'input','');
		    }		
			if (destObj != null) {
				srcValue = srcObj.value;
	            if(srcObj.type!=null && srcObj.type=='checkbox') {
	            	if (srcObj.checked) {
	            		srcValue = 'Y';
	            	} else {
	            		srcValue = '';
	            	}
	            }
	            
	            if (destObj.type!=null && destObj.type=='checkbox') {
                	if (srcValue == 'Y') {
                		destObj.checked = 1;
                	} else {
                		destObj.checked = 0;
	            	}	
	            } else {			
					destObj.value = srcValue;
				}
			}
		}
	}
	
	// Create a field on the targetDoc as child of the parent element	
	function createField(targetDoc, parent, name, isHidden, tagName, val) {
		destObj = targetDoc.createElement(tagName);
		if (isHidden) {				
			destObj.type = 'hidden';
		}
		destObj.name = name;
		destObj.id = name;
		destObj.value = val;
		parent.appendChild(destObj);	
	}
	
// -----------------------------------------------------------------------------------
var submitButtons = new Array();
var childrenWindows = new Array();
var rootOpener = null;

// Set the disable property of all registered buttons
// For this to work, all registered buttons must have a name
// Rebuild the button array if invalid reference to buttons are found
function setSubmitStatus(enable) {
	registerRootOpener();
	for (var i = 0; i < rootOpener.submitButtons.length; i++) {
		try {
			if (rootOpener.submitButtons[i] != null) {							
				rootOpener.submitButtons[i].disabled = !enable;
			}
		} catch (e) {
			rootOpener.submitButtons[i] = null;
		}
	}
}
	
// Register the submit buttons in the opener window
function registerSubmit(button) {
	registerRootOpener();
	rootOpener.submitButtons.push(button);
}

// Register the Popup in the opener window
function registerSelf(win) {
	registerRootOpener();
	rootOpener.childrenWindows.push(win);
}

// Go to the opener and get the root opener.  If the opener
// does not contain a rootopener id or the opener is null,
// set rootOpener to be the contentFrame or the top frame if 
// contentFrame does not exist
function registerRootOpener() {
	if (rootOpener == null) {
		myOpener = foundOpener(self);
		if (myOpener != null) {
			try {			
				if (myOpener.rootOpener != null) {
					rootOpener = myOpener.rootOpener;
				} else {
					rootOpener = getContentFrame(self);
				}
			} catch (e) {
				rootOpener = getContentFrame(self);
			}				
		} else {
			rootOpener = getContentFrame(self);
		}
	}
}

// Find the closest parent who have an opener
// This is for the proper functioning of the logic on IE
function foundOpener(win) {
	if (win.opener != null) {
		return win.opener;
	} else if (win == top) {
		return null;
	} else {
		return foundOpener(win.parent);
	}
}

// Return a reference to the contentFrame or 
// the top frame if contentFrame not found
function getContentFrame(win) {
	var objWin = null;
	try {
		objWin = win.top.frames['contentFrame'];
		// contentFrame not found
		if (objWin == null) {
			objWin = win.top;
		}	
	} catch (e) {
		objWin = win.top;
	}
	return objWin;

}
	
// Check if a popup is still open
function haveOpenPopup() {
	registerRootOpener();
	for (var i=rootOpener.childrenWindows.length-1; i>=0; i--) {
		if (!rootOpener.childrenWindows[i].closed) {
			return rootOpener.childrenWindows[i];
		}
	}
	return null;
}

