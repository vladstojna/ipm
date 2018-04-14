/*------------------- auxiliar variables ----------------------------*/
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var previousScreens = {"startScreen":"lockScreen", "mainMenu":"startScreen"};
/*-------------------------------------------------------------------*/

var timer;
var emergencyTimer;

var ticTimer;
var secondsTic = 0; 

var emergencyCalled = false;
var emergencyModeOn = false;

var currentScreen = document.getElementById("lockScreen");
var previousScreen;
var screenOnBackground; /*used when emegency mode is activated*/

/*--------------- all the screens we'll need -----------------------*/
var lockScreen = document.getElementById("lockScreen");
var startScreen = document.getElementById("startScreen");
var mainMenuScreen = document.getElementById("mainMenuScreen");
var emergency = document.getElementById("emergency");
var helpComing = document.getElementById("helpComing");
var helpRejected = document.getElementById("helpRejected");
var ambulance = document.getElementById("ambulance");
var vibratingScreen = document.getElementById("vibratingScreen");
/*-------------------------------------------------------------------*/

/*--------------------------------------------------------------------
| Fucntion: updateHours
| Called every minute to update the time display on the watch.
---------------------------------------------------------------------*/
function updateHours(){
	var date = new Date();
	var month = months[date.getMonth()];
	var day = date.getDate();
	var weekDay = weekDays[date.getDay()];
	var hour = checkTime(date.getHours());
	var minutes = checkTime(date.getMinutes());


	document.getElementById("clock").innerHTML=
		"<span id='time'>" + hour + ":" + minutes + "</span> <br>" +
		"<span id='date'>" + weekDay + ", " + day + " " + month + "</span>";

	document.getElementById("mainMenuClock").innerHTML=
		"<span id='mainMenuTime'>" + hour + ":" + minutes + "</span>";

	colon = !colon;	
	/*Run again in 60 seconds*/
	timer = setTimeout(updateHours, 30000);
}

/*--------------------------------------------------------------------
| Function(auxiliar): checkTime
---------------------------------------------------------------------*/
function checkTime(n){
	if(n < 10 && n.toString().length < 2)
		return "0"+n;
	return n;
}

/*--------------------------------------------------------------------
| Function: unlock
---------------------------------------------------------------------*/
function unlock(){
	if(emergencyCalled)
		ambulance.style.zIndex = 9;
	exchangeScreens(lockScreen, startScreen, 0, 2);
	updateHours();
}

/*--------------------------------------------------------------------
| Function: emergencyModeToggle
| What happens if the emergency toggle switch is changed?
---------------------------------------------------------------------*/
function emergencyModeToggle(){
	var watchBody = document.getElementById("watchBody");

	if(!emergencyModeOn){ /*Activate emergency mode*/
		screenOnBackground = currentScreen;
		if(!emergencyCalled) /*Help hasn't been called*/
			emergencyExchangeScreen(emergency, 3, true);
		else{ /*Help has been called*/
			emergencyExchangeScreen(helpComing, 3, true);
			ambulance.style.zIndex = 0;
		}	
	}
	else{ /*Deactivate emergency mode*/
		if(currentScreen == helpComing){ /*Help hasn been called*/
			emergencyExchangeScreen(helpComing, 0, false);
			if(screenOnBackground != lockScreen)
				ambulance.style.zIndex = 9;
		}
		else /*Help hasn't been called*/
			if(currentScreen == helpRejected)
				emergencyExchangeScreen(helpRejected, 0, false);
			else
				emergencyExchangeScreen(emergency, 0, false);
		currentScreen = screenOnBackground;
	}
	/*auxiliar function*/
	function emergencyExchangeScreen(newScreen, newIndex, newMode){
		previousScreen = currentScreen;
		currentScreen = newScreen;
		newScreen.style.zIndex = newIndex;
		emergencyModeOn = newMode;
	}
}

/*--------------------------------------------------------------------
| Function: acceptEmergency
| Called when the "acceptEmergency" button is clicked.
---------------------------------------------------------------------*/
function acceptEmergency(){
	currentScreen = helpComing;
	helpComing.style.zIndex = 3;
	emergency.style.zIndex = 0;
	emergencyCalled = true;

	var minutes = Math.round(Math.random()*10) + 1;
	updateEmergencyTime( minutes, 0);
}

/*--------------------------------------------------------------------
| Function: declineEmergency
| Called when the "declineEmergency" nutton is clicked.
---------------------------------------------------------------------*/
function declineEmergency(){
	helpRejected.style.zIndex = 3;
	emergency.style.zIndex = 0;
	currentScreen = helpRejected;
}

/*--------------------------------------------------------------------
| Function: updateEmergencyTime
| Called every second to update the time that takes help to
| reach the pacient.
---------------------------------------------------------------------*/
function updateEmergencyTime(minutes, seconds){
	if(minutes == 0 && seconds == 0){
		clearTimeout(emergencyTimer);
		document.getElementById("helpComingTimer").innerHTML=
			"<span id='timeEmergency'> 00:00 </span>";	
		ambulance.style.zIndex = 0;
		if(emergencyModeOn){		
			helpRejected.style.zIndex = 3;
			helpComing.style.zIndex = 0;
			currentScreen = helpRejected;
		}	
		emergencyCalled = false;
		return; 
	}


	if(seconds == 0){
		seconds = 59;
		minutes--;
	}

	seconds--;
	minutes = checkTime(minutes);
	seconds = checkTime(seconds);

	document.getElementById("helpComingTimer").innerHTML=
		"<span id='timeEmergency'>" + minutes + ":" + seconds + "</span>";

	document.getElementById("ambulanceTimer").innerHTML=
		"<span id='timeAmbulance'>" + minutes + ":" + seconds + "</span>";	

	emergencyTimer = setTimeout(updateEmergencyTime, 1000, minutes, seconds);
}

/*--------------------------------------------------------------------
| Function(auxiliar): exchangeScreens
---------------------------------------------------------------------*/
function exchangeScreens(oldScreen, newScreen, oldIndex, newIndex){
	if(oldIndex >= newIndex)
		console.log("You sure?");
	oldScreen.style.zIndex = oldIndex;
	newScreen.style.zIndex = newIndex;
	previousScreen = oldScreen;
	currentScreen = newScreen;
}

function lock(){
	if(emergencyModeOn){return;}

	if(currentScreen != lockScreen){
		if(emergencyCalled) 
			ambulance.style.zIndex = 0;
		exchangeScreens(currentScreen, lockScreen, 0, 2);
	}
	else{
		unlock();
	}
}


/*--------------- Hammer.js libarary variables ----------------------*/
var mc = new Hammer(startScreen);
mc.get('pan').set({direction: Hammer.DIRECTION_ALL});
/*-------------------------------------------------------------------*/

mc.on("panup panleft panright pandown tap press", function(ev){
  mainMenuScreen.style.zIndex = 1;
  if(ev.type == "panup") {
    clearInterval(movementTimer);
    up();
  }
  if(ev.type == "pandown") {
    clearInterval(movementTimer);
    down();
  }
  if(ev.type == "panleft") {
    clearInterval(movementTimer);
    left();
  }
  if(ev.type == "panright") {
    clearInterval(movementTimer);
    right();
  }
})

var initTop = 0;
var initLeft = 0;
var upperBound = -10;
var lowerBound = 10;
var leftBound = -10;
var rightBound = 10;
var y = initTop;
var x = initLeft;
var opacity = 1;
var movementTimer;

function up() {
  movementTimer = setInterval(moveUp, 30);
}

function down() {
  movementTimer = setInterval(moveDown, 30);
}

function left() {
  movementTimer = setInterval(moveLeft, 30);
}

function right() {
  movementTimer = setInterval(moveRight, 30);
}

function moveUp() {
  y--;
  opacity -= 0.05;
  if(upperBound >= y) {
    clearInterval(movementTimer);
    returnStartScreen();
  }
  else{
    startScreen.style.opacity = opacity;
    startScreen.style.top = y + "pt";
  }
}

function moveDown() {
  y++;
  opacity -= 0.05;
  if(lowerBound <= y) {
    clearInterval(movementTimer);
    returnStartScreen();
  }
  else{
    startScreen.style.opacity = opacity;
    startScreen.style.top = y + "pt";
  }
}

function moveLeft() {
  x--;
  opacity -= 0.05;
  if(leftBound >= x) {
    clearInterval(movementTimer);
    returnStartScreen();
  }
  else{
    startScreen.style.opacity = opacity;
    startScreen.style.left = x + "pt";
  }
}

function moveRight() {
  x++;
  opacity -= 0.05;
  if(rightBound <= x) {
    clearInterval(movementTimer);
    returnStartScreen();
  }
  else{
    startScreen.style.opacity = opacity;
    startScreen.style.left = x + "pt";
  }
}

function returnStartScreen(){
  currentScreen = mainMenuScreen;
  startScreen.style.zIndex = 0;
  startScreen.style.top = "0pt";
  startScreen.style.left = "0pt";
  x = initLeft;
  y = initTop;
  opacity = 1;
  startScreen.style.opacity = 1;
  currentScreen = mainMenuScreen;
}

function back(){
	if(currentScreen == mainMenuScreen){
		currentScreen = startScreen;
		startScreen.style.zIndex = 2;
		mainMenuScreen.style.zIndex = 1;
	}
}


var shadow0 = "0pt 0pt 50pt 0pt white";
var shadow1 = "0pt 0pt 50pt 0pt yellow";
var shadow2 = "0pt 0pt 50pt 0pt orange";
var shadow3 = "0pt 0pt 50pt 0pt red";

var container = document.getElementById("container");

function init(){
	secondsTic += 1;
	if(emergencyModeOn){
		vibratingScreen.style.borderColor = "black";
		if((secondsTic%4) == 0){
			vibratingScreen.style.boxShadow = shadow0;
		}
		if((secondsTic%4) == 1){
			vibratingScreen.style.boxShadow = shadow3;
		}
		if((secondsTic%4) == 2){
			vibratingScreen.style.boxShadow = shadow0;
		}
		if((secondsTic%4) == 3){
			vibratingScreen.style.boxShadow = shadow3;
		}
	}
	else{
		vibratingScreen.style.borderColor = "transparent";
		vibratingScreen.style.boxShadow = shadow0;
		secondsTic = 0;
	}
	/*Run again in 1 second*/
	ticTimer = setTimeout(init, 500);
}