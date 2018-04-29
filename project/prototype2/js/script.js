/*------------------- auxiliar variables ----------------------------*/
var months   = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/*-------------------------------------------------------------------*/
var emergencyTimer;
var vibrationTimeout;
var secondsTic = 0; /* vibration counter */
var emergencyCalled = false;
var emergencyModeOn = false;

/* Screens ----------------------------------------------------------*/
var lockScreen      = document.getElementById("lockScreen");
var startScreen     = document.getElementById("startScreen");
var mainMenu        = document.getElementById("mainMenu");
var emergency       = document.getElementById("emergencyScreen");
var helpComing      = document.getElementById("helpAcceptedScreen");
var helpDeclined    = document.getElementById("helpDeclinedScreen");
var ambulance       = document.getElementById("foregroundTimer");
var vibratingScreen = document.getElementById("vibratingScreen");
var findPlacesMenu  = document.getElementById("findPlacesMenu");

var currentScreen = lockScreen;
var backgroundScreen; /*used when emegency mode is activated*/

var clock = document.getElementById("clock");
var menuClock = document.getElementById("menuClock");

/* Buttons ----------------------------------------------------------*/
var toggleOn  = document.getElementById("toggleOn");
var toggleOff = document.getElementById("toggleOff");

/* Image maps coordinates -------------------------------------------*/
var toggle = {coords : [14, 28, 30, 0, 42, 8, 26, 34]}

/* Shadows (for vibration effect) -----------------------------------*/
var shadowTransparent = "0pt 0pt 0pt 0pt rgba(0, 0, 0, 0)"
var shadowRed         = "0pt 0pt 50pt 0pt red";

/* Main Interface ----------------------------------------------------------------------------*/

/*--------------------------------------------------------------------
  valid(element) - checks if 'element' is valid

  setPrev(screen, prev) - sets 'prev' as previous screen of 'screen'
  setNext(screen, next) - sets 'next' as next screen of 'screen'

  getNext(screen) - gets next screen of 'screen'
  getPrev(screen) - gets previous screen of 'screen'

  current(screen)     - sets 'screen' as current screen
  background(screen)  - sets 'screen' as background screen

  emergencyMode(mode) - sets 'mode' as emergency mode

  zIndex(element, z)  - sets 'z' as z-index of 'element'

  hide(element) - hides 'element'
  show(element) - shows 'element'

  getButtonCoords(button) - gets map coordinates of 'button'
  getAreaCoords(area)     - gets map coordinates of 'area'

  setButtonCoords(button, coords) - sets 'coords' as coords of 'button'
  setAreaCoords(area, coords)     - sets 'coords' as coords of 'area'

  swap(screenBefore, screenAfter) -
    swaps 'screenBefore' with 'screenAfter'

  hideEmergency(screen, bg) - swaps 'screen' with 'bg' and sets mode
  showEmergency(screen, bg) - shows 'screen' over 'bg' and sets mode

  resetProperties(screen) - resets position and opacity of 'screen'
  resetScreen(screen)     - resets 

  swapIcon(button, oldIcon, newIcon, areaId) -
	swaps area from 'areaId' coords with 'button' coords;
	swaps 'oldIcon' with 'newIcon';
	returns array of icons
---------------------------------------------------------------------*/
function valid(element) { return element instanceof Element; }

function setPrev(screen, prev)  { screen.prev = prev;  }
function setNext(screen, next)  { screen.next = next;  }

function getNext(screen) { return screen.next; }
function getPrev(screen) { return screen.prev; } 

function current(screen)     { currentScreen    = screen;  }
function background(screen)  { backgroundScreen = screen;  }

function emergencyMode(mode) { emergencyModeOn  = mode;     }

function zIndex(element, z)  { if (valid(element)) element.style.zIndex = z;   }

function hide(element)       { if (valid(element)) element.style.visibility = "hidden";  }
function show(element)       { if (valid(element)) element.style.visibility = "visible"; }

function getButtonCoords(button) { return button.coords; }
function getAreaCoords(area)     { return area.coords; }

function setButtonCoords(button, coords) { button.coords = coords; }
function setAreaCoords(area, coords)     { area.coords = coords; }


function swap(screenBefore, screenAfter) {
	if (!valid(screenBefore) || !valid(screenAfter)) {
		console.error("swap: invalid parameters", [screenBefore, screenAfter]);
		return;
	}
	if (screenBefore != screenAfter) {
		show(screenAfter);
		hide(screenBefore);
		current(screenAfter);
	}
}

function hideEmergency(screen, bg) {
	swap(screen, bg);
	emergencyMode(false);
}

function showEmergency(screen, bg) {
	show(screen);
	current(screen);
	background(bg);
	emergencyMode(true);
}

/* Generic reset properties function */
function resetProperties(screen) {
	screen.style.top     = "0pt";
	screen.style.left    = "0pt";
	screen.style.opacity = 1;
}

/* Generic icon and image map swapper */
function swapIcon(button, oldIcon, newIcon, areaId) {
	var area      = document.getElementById(areaId);
	var newCoords = button.coords.join(",");
	var oldCoords = JSON.parse("[" + getAreaCoords(area) + "]");

	setButtonCoords(button, oldCoords);
	setAreaCoords(area, newCoords);

	hide(oldIcon);
	show(newIcon);
	return [oldIcon, newIcon];
}

/* Functions onload --------------------------------------------------------------------------*/

/*---------------------------------------------------------------------
  initVisibility:
   hides uneeded screens and buttons;
   initializes zIndexes

  initScreenOrder:
    adds previous and next properties to screens
----------------------------------------------------------------------*/
function initVisibility() {

	// Hide uneeded screens at the start
	/* hide(startScreen); */
	hide(mainMenu);
	hide(emergency);
	hide(helpComing);
	hide(helpDeclined);
	hide(ambulance);
	hide(findPlacesMenu);

	// Hide uneeded buttons at the start
	hide(toggleOn);

	// Set visibility z-indexes
	zIndex(ambulance,    4);
	zIndex(helpComing,   3);
	zIndex(helpDeclined, 3);
	zIndex(emergency,    3);
	zIndex(lockScreen,   2);
	zIndex(startScreen,  2);
	zIndex(mainMenu,     1);
	zIndex(menuClock,    2);
}

function initScreenOrder() {
	setPrev(lockScreen,   lockScreen);
	setPrev(startScreen,  startScreen);
	setPrev(mainMenu,     mainMenu);
	setPrev(emergency,    helpDeclined);
	setPrev(helpComing,   helpDeclined);
	setPrev(helpDeclined, helpDeclined);
	setPrev(findPlacesMenu, mainMenu);

	setNext(lockScreen,  startScreen);
	setNext(startScreen, mainMenu);
	setNext(mainMenu,    mainMenu);
}
/* -------------------------------------------------------------------------------------------*/

/*--------------------------------------------------------------------
  updateHours - called every minute to update the time display
  checkTime   - formats time correctly
---------------------------------------------------------------------*/
function updateHours() {
	var date    = new Date(); /* System date */
	var month   = months[date.getMonth()];
	var day     = date.getDate();
	var weekDay = weekDays[date.getDay()];
	var hour    = checkTime(date.getHours());
	var minutes = checkTime(date.getMinutes());


	clock.innerHTML=
		"<span id='time'>" + hour + ":" + minutes + "</span> <br>" +
		"<span id='date'>" + weekDay + ", " + day + " " + month + "</span>";

	menuClock.innerHTML=
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
  unlock() - unlocks screen
  lock()   - locks screen
  back()   - returns to previous screen
---------------------------------------------------------------------*/
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
		setNext(startScreen, currentScreen);
		swap(currentScreen, lockScreen);
	}
	else unlock();
}


function back() {
	swap(currentScreen, getPrev(currentScreen));
}


function goToFindPlacesMenu() {
	swap(mainMenu, findPlacesMenu);
}
/*--------------------------------------------------------------------
  emergencyModeToggle() - toggles emergency mode when using toggle

  acceptEmergency()     - sends call for help
  declineEmergency()    - cancel call for help
  updateEmergencyTime() - updates time left for help to come
  swapToggle()          - swaps toggle button map and icon image
---------------------------------------------------------------------*/
function emergencyModeToggle() {
	if (!emergencyModeOn) { /*Activate emergency mode*/
		if (!emergencyCalled) /*Help hasn't been called*/
			showEmergency(emergency, currentScreen);
		else { /*Help has been called*/
			showEmergency(helpComing, currentScreen);
			hide(ambulance);
		}
	}
	else { /* Deactivate emergency mode */
		/* backgroundScreen = screen before using emergency */
		if (emergencyCalled && backgroundScreen != lockScreen)
			show(ambulance);
		/* currentScreen = emergency OR helpComing */
		hideEmergency(currentScreen, backgroundScreen);
	}
}


function acceptEmergency() {
	var minutes = Math.round(Math.random()*4) + 1;
	swap(emergency, helpComing);
	emergencyCalled = true;
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


function swapToggle() {
	[toggleOn, toggleOff] = swapIcon(toggle, toggleOff, toggleOn, "emergencyToggle");
}

/*--------------------------------------------------------------------
  vibration() - simulates vibrating effect when in emergency mode
---------------------------------------------------------------------*/
function vibration() {

	secondsTic += 1;

	if (emergencyModeOn) {
		vibratingScreen.style.borderColor   = "black";
		if (secondsTic % 2 == 1)
			vibratingScreen.style.boxShadow = shadowTransparent;
		else
			vibratingScreen.style.boxShadow = shadowRed;
		/*Run again in 1 second*/
		vibrationTimeout = setTimeout(vibration, 500);
	}
	else {
		vibratingScreen.style.borderColor = "transparent";
		vibratingScreen.style.boxShadow   = shadowTransparent;
		secondsTic = 0;
		clearTimeout(vibrationTimeout);
	}
}

/*--------------- Hammer.js library variables ----------------------*/
var mc = new Hammer(startScreen);
mc.get('pan').set({direction: Hammer.DIRECTION_ALL});
/*-------------------------------------------------------------------*/

mc.on("panup panleft panright pandown tap press", function(ev){
	show(getNext(startScreen));
	if (ev.type == "panup") {
		clearInterval(movementTimer);
		move(up, timeInterval, startScreen, upperBound);
	}
	if (ev.type == "pandown") {
		clearInterval(movementTimer);
		move(down, timeInterval, startScreen, lowerBound);
	}
	if (ev.type == "panleft") {
		clearInterval(movementTimer);
		move(left, timeInterval, startScreen, leftBound);
	}
	if (ev.type == "panright") {
		clearInterval(movementTimer);
		move(right, timeInterval, startScreen, rightBound);
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

/* Generic reset screen function */
function resetScreen(screen) {
	swap(screen, getNext(screen));
	resetProperties(screen);
	x = initLeft;
	y = initTop;
	opacity = 1;
}