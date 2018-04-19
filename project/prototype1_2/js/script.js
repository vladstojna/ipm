/*------------------- auxiliar variables ----------------------------*/
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

var screenOrder = {
	previous : {
		"lockScreen":"lockScreen",
		"startScreen":"lockScreen",
		"mainMenu":"startScreen",
		"emergencyScreen":"helpDeclinedScreen",
		"helpAcceptedScreen":"helpDeclinedScreen",
	},
	next : {
		"lockScreen":"startScreen",
		"startScreen":"mainMenu",
		"mainMenu":"mainMenu",
	}
}

/*-------------------------------------------------------------------*/

/* Image maps coordinates */
var toggle = {coords : [14, 28, 30, 0, 42, 8, 26, 34]}
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

/* Screens ----------------------------------------------------------*/
var lockScreen      = document.getElementById("lockScreen");
var startScreen     = document.getElementById("startScreen");
var mainMenuScreen  = document.getElementById("mainMenu");
var emergency       = document.getElementById("emergencyScreen");
var helpComing      = document.getElementById("helpAcceptedScreen");
var helpDeclined    = document.getElementById("helpDeclinedScreen");
var ambulance       = document.getElementById("foregroundTimer");
var vibratingScreen = document.getElementById("vibratingScreen");
/* Buttons ----------------------------------------------------------*/
var toggleOn  = document.getElementById("toggleOn");
var toggleOff = document.getElementById("toggleOff");

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
	hide(helpDeclined);
	hide(ambulance);
	//hide(vibratingScreen);

	ambulance.style.zIndex      = 9;
	helpComing.style.zIndex     = 3;
	helpDeclined.style.zIndex   = 3;
	emergency.style.zIndex      = 3;
	startScreen.style.zIndex    = 2;
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
function show(screen)        { screen.style.display = "block"; }

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

function backEmergency(screen) {
	show(helpDeclined);
	hide(screen);
	current(helpDeclined);
}

/*--------------------------------------------------------------------
	Getters/Setters
	 getToggleCoords()       - get array of coordinates;
	 setToggleCoords(coords) - sets coords as new array of coordinates

	 getCoords(area)         - gets coordinates from area
	 setCoords(area, coords) - sets coords as new area coordinates

	swapToggle() - swaps toggle button coordinates; swaps images
\---------------------------------------------------------------------*/
function getToggleCoords()       { return toggle.coords; }
function setToggleCoords(coords) { toggle.coords = coords; }
function getCoords(area)         { return area.coords; }
function setCoords(area, coords) { area.coords = coords; }

function swapToggle() {
	var area      = document.getElementById("emergencyToggle");
	var newCoords = getToggleCoords().join(",");
	var oldCoords = JSON.parse("[" + getCoords(area) + "]");
	var swap;

	setToggleCoords(oldCoords);
	setCoords(area, newCoords);

	hide(toggleOff);
	show(toggleOn);
	swap      = toggleOff;
	toggleOff = toggleOn;
	toggleOn  = swap;
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


function lock() {
	if(emergencyModeOn) return;

	if(currentScreen != lockScreen){
		if(emergencyCalled) 
			hide(ambulance);
		swap(currentScreen, lockScreen);
	}
	else unlock();
}


function back() {
	switch (currentScreen) {
		case mainMenuScreen:
			show(startScreen);
			current(startScreen);
			break;
		case helpComing:
			backEmergency(helpComing);
			break;
		case emergency:
			backEmergency(emergency);
			break;
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
	else { /* Deactivate emergency mode */
		hideEmergency(currentScreen);
		if (emergencyCalled && backgroundScreen != lockScreen)
			show(ambulance);
		swap(currentScreen, backgroundScreen);
	}
}


function acceptEmergency() {
	show(helpComing);
	hide(emergency);
	current(helpComing);
	emergencyCalled = true;

	var minutes = Math.round(Math.random()*4) + 1;
	updateEmergencyTime(minutes, 0);
}


function declineEmergency() {
	show(helpDeclined);
	hide(emergency);
	current(helpDeclined);
}


function updateEmergencyTime(minutes, seconds){
	if(minutes == 0 && seconds == 0){
		clearTimeout(emergencyTimer);
		document.getElementById("helpTimer").innerHTML=
			"<span id='timeEmergency'> 00:00 </span>";	
		hide(ambulance);
		if(emergencyModeOn){
			show(helpDeclined);
			hide(helpComing);
			current(helpDeclined);
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
	var transparent = "0pt 0pt 0pt 0pt rgba(0, 0, 0, 0)"
	var yellow      = "0pt 0pt 50pt 0pt yellow";
	var orange      = "0pt 0pt 50pt 0pt orange";
	var red         = "0pt 0pt 50pt 0pt red";

	secondsTic += 1;

	if (emergencyModeOn) {
		vibratingScreen.style.borderColor = "black";
		if ((secondsTic % 4) % 2 == 0)
			vibratingScreen.style.boxShadow = transparent;
		else
			vibratingScreen.style.boxShadow = red;
		/*Run again in 1 second*/
		vibrationTimeout = setTimeout(vibration, 500);
	}
	else {
		vibratingScreen.style.borderColor = "transparent";
		vibratingScreen.style.boxShadow   = transparent;
		secondsTic = 0;
		clearTimeout(vibrationTimeout);
	}
}

/*--------------- Hammer.js library variables ----------------------*/
var mc = new Hammer(startScreen);
mc.get('pan').set({direction: Hammer.DIRECTION_ALL});
/*-------------------------------------------------------------------*/

mc.on("panup panleft panright pandown tap press", function(ev){
  show(mainMenuScreen);
  if(ev.type == "panup") {
    clearInterval(movementTimer);
    move(up);
  }
  if(ev.type == "pandown") {
    clearInterval(movementTimer);
    move(down);
  }
  if(ev.type == "panleft") {
    clearInterval(movementTimer);
    move(left);
  }
  if(ev.type == "panright") {
    clearInterval(movementTimer);
    move(right);
  }
})

/*-------------------------------------------------------------------*/
var initTop    = 0;
var initLeft   = 0;
var bound      = 100;
var upperBound = -bound;
var lowerBound =  bound;
var leftBound  = -bound;
var rightBound =  bound;

var y = initTop;
var x = initLeft;

var opacity = 1;
var opacityRate = 0.02;

var timeInterval = 1;

var movementTimer;

function move(direction) {
	movementTimer = setInterval(direction, timeInterval);
}

function up() {
	y--;
  opacity -= opacityRate;
  if(upperBound >= y) {
    clearInterval(movementTimer);
		//resetStartScreen();
		resetScreen(startScreen);
  }
  else {
    startScreen.style.opacity = opacity;
    startScreen.style.top = y + "pt";
  }
}

function down() {
  y++;
  opacity -= opacityRate;
  if(lowerBound <= y) {
    clearInterval(movementTimer);
		//resetStartScreen();
		resetScreen(startScreen);
  }
  else {
    startScreen.style.opacity = opacity;
    startScreen.style.top = y + "pt";
  }
}

function left() {
  x--;
  opacity -= opacityRate;
  if(leftBound >= x) {
    clearInterval(movementTimer);
		//resetStartScreen();
		resetScreen(startScreen);
  }
  else {
    startScreen.style.opacity = opacity;
    startScreen.style.left = x + "pt";
  }
}

function right() {
  x++;
  opacity -= opacityRate;
  if(rightBound <= x) {
    clearInterval(movementTimer);
		//resetStartScreen();
		resetScreen(startScreen);
  }
  else {
    startScreen.style.opacity = opacity;
    startScreen.style.left = x + "pt";
  }
}

/*--------------------------------------------------------------------
	resetStartScreen()
	 - returns start screen to usual position after swiping unlock
\---------------------------------------------------------------------*/
function resetStartScreen(){
	swap(startScreen, mainMenuScreen);
  startScreen.style.top = "0";
  startScreen.style.left = "0";
  x = initLeft;
  y = initTop;
  opacity = 1;
	startScreen.style.opacity = 1;
}

function resetProperties(screen) {
	screen.style.top  = "0";
	screen.style.left = "0";
	screen.style.opacity = 1;
}

function nextScreen(screen) {
	return document.getElementById(screenOrder.next[screen.id]);
}

function prevScreen(screen) {
	return document.getElementById(screenOrder.previous[screen.id]);
}

function resetScreen(screen) {
	swap(screen, nextScreen(screen));
	resetProperties(screen);
  x = initLeft;
  y = initTop;
  opacity = 1;
}
