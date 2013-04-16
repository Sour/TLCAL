  //<iframe name="MyTLC" src="https://mytlc.bestbuy.com/etm/time/timesheet/etmTnsMonth.jsp" width="750" height="750" marginwidth="10" marginheight="10" scrolling="auto"></iframe>
  
var url = "https://mytlc.bestbuy.com/etm/";
var changed = "https://mytlc.bestbuy.com/etm/login.jsp"

var oldLocation = location.href;
 setInterval(function() {
      if(location.href != oldLocation) {
           alert("test");
           oldLocation = location.href
      }
  }, 1000); // check every second