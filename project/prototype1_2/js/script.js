/*------------------- auxiliar variables ----------------------------*/
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var previousScreens = {"startScreen":"lockScreen", "mainMenu":"startScreen"};
/*-------------------------------------------------------------------*/

var timer;
var emergencyTimer;

var vibrationTimeout;
var secondsTic = 0; 

var emergencyCalled = false;
var emergencyModeOn = false;

var currentScreen = document.getElementById("lockScreen");
var previousScreen;
var backgroundScreen; /*used when emegency mode is activated*/

/*--------------- all the screens we'll need -----------------------*/
var lockScreen      = document.getElementById("lockScreen");
var startScreen     = document.getElementById("startScreen");
var mainMenuScreen  = document.getElementById("mainMenu");
var emergency       = document.getElementById("emergencyScreen");
var helpComing      = document.getElementById("helpAcceptedScreen");
var helpRejected    = document.getElementById("helpDeclinedScreen");
var ambulance       = document.getElementById("foregroundTimer");
var vibratingScreen = document.getElementById("vibratingScreen");
/*-------------------------------------------------------------------*/

/*-------------------------------------------------------------------
	initVisibility:
	 hides all screens but lockScreen;
	 initializes zIndexes
\--------------------------------------------------------------------*/
function initVisibility() {
	hide(startScreen);
	hide(mainMenuScreen);
	hide(emergency);
	hide(helpComing);
	hide(helpRejected);
	hide(ambulance);
	//hide(vibratingScreen);

	ambulance.style.zIndex    = 9;
	helpComing.style.zIndex   = 3;
	helpRejected.style.zIndex = 3;
	emergency.style.zIndex    = 3;
	startScreen.style.zIndex = 2;
	mainMenuScreen.style.zIndex = 1;
}

/*--------------------------------------------------------------------
  updateHours - Called every minute to update the time display
  checkTime   - formats time correctly
\---------------------------------------------------------------------*/
function updateHours(){
	var date    = new Date();
	var month   = months[date.getMonth()];
	var day     = date.getDate();
	var weekDay = weekDays[date.getDay()];
	var hour    = checkTime(date.getHours());
	var minutes = checkTime(date.getMinutes());


	document.getElementById("clock").innerHTML=
		"<span id='time'>" + hour + ":" + minutes + "</span> <br>" +
		"<span id='date'>" + weekDay + ", " + day + " " + month + "</span>";

	document.getElementById("mainMenuClock").innerHTML=
		"<span id='mainMenuTime'>" + hour + ":" + minutes + "</span>";

	/*Run again in 60 seconds*/
	timer = setTimeout(updateHours, 30000);
}

function checkTime(n){
	if(n < 10 && n.toString().length < 2)
		return "0"+n;
	return n;
}

/*--------------------------------------------------------------------
  Setters:
	 previous(screen)    - sets screen as previous screen
	 current(screen)     - sets screen as current screen
	 emergencyMode(mode) - sets mode as emergency mode
	 hide(screen)        - hides screen
	 show(screen)        - shows screen

  swap(screenBefore, screenAfter) -
		swaps screenBefore with screenAfter

	hideEmergency(screen) - hides screen when working with emergency
	showEmergency(screen) - shows screen when working with emergency
\---------------------------------------------------------------------*/
function previous(screen)    { previousScreen = screen; }

function current(screen)     { currentScreen = screen; }

function emergencyMode(mode) { emergencyModeOn = mode; }

function hide(screen)        { screen.style.display = "none"; }

function show(screen)        { screen.style.display = "inline"; }

function swap(screenBefore, screenAfter) {
	show(screenAfter);
	hide(screenBefore);
	previous(screenBefore);
	current(screenAfter);
}

function hideEmergency(screen) {
	hide(screen);
	previous(current);
	current(screen);
	emergencyMode(false);
}

function showEmergency(screen) {
	show(screen);
	previous(current);
	current(screen);
	emergencyMode(true);
}

/*--------------------------------------------------------------------
	unlock() - unlocks screen
	lock()   - locks screen
  back()   - returns to previous screen
\---------------------------------------------------------------------*/
function unlock() {
	if(emergencyCalled)
		show(ambulance);
	swap(lockScreen, startScreen)
	updateHours();
}


function lock(){
	if(emergencyModeOn) return;

	if(currentScreen != lockScreen){
		if(emergencyCalled) 
			hide(ambulance);
		swap(currentScreen, lockScreen);
	}
	else unlock();
}


function back(){
	if(currentScreen == mainMenuScreen) {
		show(startScreen);
		current(startScreen);
	}
}

/*--------------------------------------------------------------------
  emergencyModeToggle() - toggles emergency mode when using toggle

	acceptEmergency()     - sends call for help
	declineEmergency()    - cancel call for help
	updateEmergencyTime() - updates time left for help to come
\---------------------------------------------------------------------*/
function emergencyModeToggle() {
	if (!emergencyModeOn) { /*Activate emergency mode*/
		backgroundScreen = currentScreen;
		if (!emergencyCalled) /*Help hasn't been called*/
			showEmergency(emergency);
		else { /*Help has been called*/
			showEmergency(helpComing);
			hide(ambulance);
		}	
	}
	else { /*Deactivate emergency mode*/
		if (currentScreen == helpComing) { /*Help hasn been called*/
			hideEmergency(helpComing);
			if (backgroundScreen != lockScreen)
				show(ambulance);
		}
		else /*Help hasn't been called*/
			if (currentScreen == helpRejected)
				hideEmergency(helpRejected);
			else
				hideEmergency(emergency);
		swap(currentScreen, backgroundScreen);
	}
}


function acceptEmergency() {
	show(helpComing);
	hide(emergency);
	current(helpComing);
	emergencyCalled = true;

	var minutes = Math.round(Math.random()*10) + 1;
	updateEmergencyTime(minutes, 0);
}


function declineEmergency() {
	show(helpRejected);
	hide(emergency);
	current(helpRejected);
}


function updateEmergencyTime(minutes, seconds){
	if(minutes == 0 && seconds == 0){
		clearTimeout(emergencyTimer);
		document.getElementById("helpTimer").innerHTML=
			"<span id='timeEmergency'> 00:00 </span>";	
		hide(ambulance);
		if(emergencyModeOn){
			show(helpRejected);
			hide(helpComing);
			current(helpRejected);
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

	document.getElementById("helpTimer").innerHTML=
		"<span id='timeEmergency'>" + minutes + ":" + seconds + "</span>";

	document.getElementById("foregroundTimeleft").innerHTML=
		"<span id='timeAmbulance'>" + minutes + ":" + seconds + "</span>";	

	emergencyTimer = setTimeout(updateEmergencyTime, 1000, minutes, seconds);
}

/*--------------------------------------------------------------------
  vibration() - simulates vibrating effect when in emergency mode
\---------------------------------------------------------------------*/
function vibration() {

	/* shadows */
	var white  = "0pt 0pt 50pt 0pt white";
	var yellow = "0pt 0pt 50pt 0pt yellow";
	var orange = "0pt 0pt 50pt 0pt orange";
	var red    = "0pt 0pt 50pt 0pt red";

	secondsTic += 1;

	if (emergencyModeOn) {
		vibratingScreen.style.borderColor = "black";
		if ((secondsTic % 4) % 2 == 0)
			vibratingScreen.style.boxShadow = white;
		else
			vibratingScreen.style.boxShadow = red;
	}
	else {
		vibratingScreen.style.borderColor = "transparent";
		vibratingScreen.style.boxShadow   = white;
		secondsTic = 0;
		clearTimeout(vibrationTimeout);
	}
	/*Run again in 1 second*/
	vibrationTimeout = setTimeout(vibration, 500);
}

/*--------------- Hammer.js library variables ----------------------*/
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

var initTop    = 0;
var initLeft   = 0;
var offset     = 115;
var bound      = 10;
var upperBound = -bound;
var lowerBound = bound;
var leftBound  = -bound;
var rightBound = bound;

var y = initTop;
var x = initLeft;

var opacity = 1;
var opacityRate = 0.1;

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
	show(mainMenuScreen);
	y--;
  opacity -= opacityRate;
  if(upperBound >= y) {
    clearInterval(movementTimer);
    returnStartScreen();
  }
  else {
    startScreen.style.opacity = opacity;
    startScreen.style.top = offset + y + "pt";
  }
}

function moveDown() {
	show(mainMenuScreen);
  y++;
  opacity -= opacityRate;
  if(lowerBound <= y) {
    clearInterval(movementTimer);
    returnStartScreen();
  }
  else {
    startScreen.style.opacity = opacity;
    startScreen.style.top = offset + y + "pt";
  }
}

function moveLeft() {
	show(mainMenuScreen);
  x--;
  opacity -= opacityRate;
  if(leftBound >= x) {
    clearInterval(movementTimer);
    returnStartScreen();
  }
  else {
    startScreen.style.opacity = opacity;
    startScreen.style.left = offset + x + "pt";
  }
}

function moveRight() {
	show(mainMenuScreen);
  x++;
  opacity -= opacityRate;
  if(rightBound <= x) {
    clearInterval(movementTimer);
    returnStartScreen();
  }
  else {
    startScreen.style.opacity = opacity;
    startScreen.style.left = offset + x + "pt";
  }
}

/*--------------------------------------------------------------------
	returnStartScreen()
	 - returns start screen to usual position after swiping unlock
\---------------------------------------------------------------------*/
function returnStartScreen(){
	swap(startScreen, mainMenuScreen);
  startScreen.style.top = "50%";
  startScreen.style.left = "50%";
  x = initLeft;
  y = initTop;
  opacity = 1;
	startScreen.style.opacity = 1;
}
