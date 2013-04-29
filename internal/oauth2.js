// http://smus.com/oauth2-chrome-extensions/ is where i'm finding this info

var googleAuth = new OAuth2('google', {
	client_id: '981901574050.apps.googleusercontent.com'
	client_secret: 'AI-p5AEWFdpSq9p7PLjGy9TK'
	api_scope: 'https://www.googleapis.com/auth/calendar'
	
	//redirect_uri: 'https://mytlc.bestbuy.com/etm/time/timesheet/etmTnsMonth.jsp' not sure if this is needed, or if it's even the correct place
	//javascript_origins: 'https://mytlc.bestbuy.com' same as above
});