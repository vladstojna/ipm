/*------------------- auxiliar variables ----------------------------*/
var months   = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

var screenOrder = {
	previous : {
		"lockScreen"  : "lockScreen",
		"startScreen" : "startScreen",
		"mainMenu"    : "startScreen",
		"emergencyScreen"    : "helpDeclinedScreen",
		"helpAcceptedScreen" : "helpDeclinedScreen",
		"helpDeclinedScreen" : "helpDeclinedScreen"
	},
	next : {
		"lockScreen"  : "startScreen",
		"startScreen" : "mainMenu",
		"mainMenu"    : "mainMenu",
	}
}

/*-------------------------------------------------------------------*/
var date = new Date(); /* System time */

var emergencyTimer;

var vibrationTimeout;
var secondsTic = 0; /* vibration counter */

var emergencyCalled = false;
var emergencyModeOn = false;

var currentScreen = document.getElementById("lockScreen");
var previousScreen; /* unused at the moment */
var backgroundScreen; /*used when emegency mode is activated*/

/* Screens ----------------------------------------------------------*/
var lockScreen      = currentScreen; /* at this moment, currentScreen = lockScreen */
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
/* Image maps coordinates -------------------------------------------*/
var toggle = {coords : [14, 28, 30, 0, 42, 8, 26, 34]}
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
	hide(helpDeclined);
	hide(ambulance);

	zIndex(ambulance,      9);
	zIndex(helpComing,     3);
	zIndex(helpDeclined,   3);
	zIndex(emergency,      3);
	zIndex(startScreen,    2);
	zIndex(mainMenuScreen, 1)
}

/*--------------------------------------------------------------------
  updateHours - called every minute to update the time display
  checkTime   - formats time correctly
\---------------------------------------------------------------------*/
function updateHours() {
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
	setTimeout(updateHours, 30000);
}

function checkTime(n) {
	if (n < 10 && n.toString().length < 2)
		return "0" + n;
	return n;
}

/*--------------------------------------------------------------------
  Setters:
   previous(screen)    - sets screen as previous screen *unused atm*
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
function hide(element)       { element.style.display = "none"; }
function show(element)       { element.style.display = "block"; }
function zIndex(element, z)  { element.style.zIndex = z; }

function swap(screenBefore, screenAfter) {
	if (screenBefore != screenAfter) {
		show(screenAfter);
		hide(screenBefore);
		current(screenAfter);
	}
}

function hideEmergency(screen) {
	swap(screen, backgroundScreen);
	emergencyMode(false);
}

function showEmergency(screen) {
	show(screen);
	current(screen);
	emergencyMode(true);
}

/* Uneeded but kept */
function backEmergency(screen) {
	swap(screen, helpDeclined);
}

/*--------------------------------------------------------------------
  Getters/Setters
   getToggleCoords()       - get array of coordinates;
   setToggleCoords(coords) - sets coords as new array of coordinates

   getCoords(area)         - gets coordinates from area
   setCoords(area, coords) - sets coords as new area coordinates

  swapToggle() - swaps toggle button coordinates; swaps images
\---------------------------------------------------------------------*/
function getButtonCoords(button)         { return button.coords; }
function setButtonCoords(button, coords) { button.coords = coords; }

function getAreaCoords(area)         { return area.coords; }
function setAreaCoords(area, coords) { area.coords = coords; }

/* generic icon and image map swapper */
function swapIcon(button, oldIcon, newIcon, areaId) {
	var area      = document.getElementById(areaId);
	var newCoords = button.coords.join(",");
	var oldCoords = JSON.parse("[" + getAreaCoords(area) + "]");

	setButtonCoords(button, oldCoords);
	setAreaCoords(area, newCoords);

	hide(oldIcon);
	show(newIcon);
	return [newIcon, oldIcon];
}

function swapToggle() {
	[toggleOff, toggleOn] = swapIcon(toggle, toggleOff, toggleOn, "emergencyToggle");
}

/*--------------------------------------------------------------------
  unlock() - unlocks screen
  lock()   - locks screen
  back()   - returns to previous screen
\---------------------------------------------------------------------*/
function unlock() {
	if (emergencyCalled)
		show(ambulance);
	swap(lockScreen, startScreen)
	updateHours();
}


function lock() {
	if (emergencyModeOn)
		return;
	if (currentScreen != lockScreen) {
		if (emergencyCalled)
			hide(ambulance);
		swap(currentScreen, lockScreen);
	}
	else unlock();
}


function back() {
	swap(currentScreen, prevScreen(currentScreen));
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
		/* backgroundScreen = screen before using emergency */
		if (emergencyCalled && backgroundScreen != lockScreen)
			show(ambulance);
		/* currentScreen = emergency OR helpComing */
		hideEmergency(currentScreen);
	}
}


function acceptEmergency() {
	swap(emergency, helpComing);
	emergencyCalled = true;

	var minutes = Math.round(Math.random()*4) + 1;
	updateEmergencyTime(minutes, 0);
}


function declineEmergency() {
	swap(emergency, helpDeclined);
}


function updateEmergencyTime(minutes, seconds){
	if (minutes == 0 && seconds == 0) {
		clearTimeout(emergencyTimer);
		document.getElementById("helpTimer").innerHTML =
			"<span id='timeEmergency'> 00:00 </span>";
		hide(ambulance);
		if (emergencyModeOn)
			swap(helpComing, helpDeclined);
		emergencyCalled = false;
		return;
	}


	if (seconds == 0) {
		seconds = 59;
		minutes--;
	}

	seconds--;
	minutes = checkTime(minutes);
	seconds = checkTime(seconds);

	document.getElementById("helpTimer").innerHTML =
		"<span id='timeEmergency'>" + minutes + ":" + seconds + "</span>";

	document.getElementById("foregroundTimeleft").innerHTML =
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
		vibratingScreen.style.borderColor   = "black";
		if (secondsTic % 2 == 0)
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
	clearInterval(movementTimer);
	if (ev.type == "panup")
		move(up, timeInterval, startScreen, upperBound);
	if (ev.type == "pandown")
		move(down, timeInterval, startScreen, lowerBound);
	if (ev.type == "panleft")
		move(left, timeInterval, startScreen, leftBound);
	if (ev.type == "panright")
		move(right, timeInterval, startScreen, rightBound);
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

var opacity      = 1;
var opacityRate  = 0.02;
var timeInterval = 1;

var movementTimer;

/* Generic movement functions ---------------------------------------*/

function move(direction, interval, screen, bound) {
	movementTimer = setInterval(direction, interval, screen, bound);
}

function up(screen, bound) {
	y--;
	opacity -= opacityRate;
	if (bound >= y) {
		clearInterval(movementTimer);
		resetScreen(screen);
	}
	else {
		screen.style.opacity = opacity;
		screen.style.top = y + "pt";
	}
}

function down(screen, bound) {
	y++;
	opacity -= opacityRate;
	if (bound <= y) {
		clearInterval(movementTimer);
		resetScreen(screen);
	}
	else {
		screen.style.opacity = opacity;
		screen.style.top     = y + "pt";
	}
}

function left(screen, bound) {
	x--;
	opacity -= opacityRate;
	if (bound >= x) {
		clearInterval(movementTimer);
		resetScreen(screen);
	}
	else {
		screen.style.opacity = opacity;
		screen.style.left    = x + "pt";
	}
}

function right(screen, bound) {
	x++;
	opacity -= opacityRate;
	if (bound <= x) {
		clearInterval(movementTimer);
		resetScreen(screen);
	}
	else {
		screen.style.opacity = opacity;
		screen.style.left    = x + "pt";
	}
}

/*-------------------------------------------------------------------*/

/*
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
	if (lowerBound <= y) {
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
*/

/*--------------------------------------------------------------------
  resetStartScreen()
   - returns start screen to usual position after swiping unlock
\---------------------------------------------------------------------*/
function resetStartScreen() {
	swap(startScreen, mainMenuScreen);
	startScreen.style.top = "0pt";
	startScreen.style.left = "0pt";
	x = initLeft;
	y = initTop;
	opacity = 1;
	startScreen.style.opacity = 1;
}

/* nextScreen and prevScreen getters */
function nextScreen(screen) {
	return document.getElementById(screenOrder.next[screen.id]);
}

function prevScreen(screen) {
	return document.getElementById(screenOrder.previous[screen.id]);
}

/* Generic reset screen function */
function resetScreen(screen) {
	swap(screen, nextScreen(screen));
	resetProperties(screen);
	x = initLeft;
	y = initTop;
	opacity = 1;
}

/* Generic reset properties function */
function resetProperties(screen) {
	screen.style.top     = "0pt";
	screen.style.left    = "0pt";
	screen.style.opacity = 1;
}
