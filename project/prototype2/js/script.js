
/* Auxiliar variables for time */
var months   = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* Timeout related variables */
var vibrationTimeout;
var destinationReachedTimeout;
var secondsTic = 0; /* vibration & blinking counter */

/* Emergency related variables */
var emergencyCalled = false;
var emergencyModeOn = false;
var emergencyTimer;

/* GPS related variables */
var degree;
var rotation;
var walkingForward;
var distance;
var step;

/* Find a place related object */
var candidates = {
	p1 :      [ "wc", "food", "drinks", "camping" ],
	p1_size : [ "54pt", "33pt", "33pt", "47pt" ],
	p1_desc : [ "Restroom", "Food court", "Drinks / Bar", "Camping site"],
	p2 :      [ "charging", "info", "exit3", "" ],
	p2_size : [ "35pt", "46pt", "33pt", "0pt" ],
	p2_desc : [ "Charging station", "Get help / info", "Exit festival"]
};

/* Starting displays ------------------------------------------------*/
var lockScreen      = document.getElementById("lockScreen");
var startScreen     = document.getElementById("startScreen");
var mainMenu        = document.getElementById("mainMenu");

/* Emergency displays -----------------------------------------------*/
var emergency       = document.getElementById("emergencyScreen");
var helpComing      = document.getElementById("helpAcceptedScreen");
var helpDeclined    = document.getElementById("helpDeclinedScreen");
var ambulance       = document.getElementById("foregroundTimer");
var vibratingScreen = document.getElementById("vibratingScreen");

/* Find places displays ---------------------------------------------*/
var findPlacesMenu   = document.getElementById("findPlacesMenu"); /* background & orbs */
var findPlaces_page1 = document.getElementById("findPlacesMenu_page1");
var findPlaces_page2 = document.getElementById("findPlacesMenu_page2");
var findPlacesList   = document.getElementById("findPlacesList");

/* GPS related displays ---------------------------------------------*/
var directionsScreen    = document.getElementById("directionsScreen");
var arrow               = document.getElementById("arrow");
var distanceDisplay     = document.getElementById("distanceDisplay");
var cancelConfirmScreen = document.getElementById("cancelConfirmScreen");

var currentScreen = lockScreen; /* initial screen is always lockscreen */
var backgroundScreen;           /* used when emergency mode is activated */

/* Clocks -----------------------------------------------------------*/
var clock     = document.getElementById("clock");
var menuClock = document.getElementById("menuClock");

/* Buttons ----------------------------------------------------------*/
var toggleOn        = document.getElementById("toggleOn");
var toggleOff       = document.getElementById("toggleOff");
var movementButtons = document.getElementById("movementButtons");

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
  setRoot(screen, root) - sets 'root' as root screen of 'screen'

  getNext(screen) - gets next screen of 'screen'
  getPrev(screen) - gets previous screen of 'screen'
  getRoot(screen) - gets root screen of 'screen'

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

function setPrev(screen, prev) { screen.prev = prev; }
function setNext(screen, next) { screen.next = next; }
function setRoot(screen, root) { screen.root = root; }

function getNext(screen) { return screen.next; }
function getPrev(screen) { return screen.prev; }
function getRoot(screen) { return screen.root; }

function current(screen)     { currentScreen    = screen;  }
function background(screen)  { backgroundScreen = screen;  }

function emergencyMode(mode) { emergencyModeOn  = mode;    }

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

function moveOutOfBounds(side, screen) {
	if (side === "left")
		screen.style.left = "-100%";
	else if (side === "right")
		screen.style.left = "100%";
	else
		console.error("moveOutOfBounds: invalid parameters", [side, screen]);
}

/* Generic reset properties function */
function resetProperties(screen) {
	screen.style.top     = "0pt";
	screen.style.left    = "0pt";
	screen.style.opacity = 1;
	screen.style.pointerEvents = "auto";
}

/* Generic reset screen function */
function resetScreen(screen) {
	swap(screen, getNext(screen));
	resetProperties(screen);
	resetProperties(getNext(screen));
	x = initLeft;
	y = initTop;
	opacity = 1;
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
	/* Starting screens ---------------------------------------------------*/
	//hide(startScreen); //Commenting hides occasional pop up when unlocking screen
	hide(mainMenu);

	/* Find places screens ------------------------------------------------*/
	//hide(findPlacesMenu) // hides background, don't hide
	hide(findPlaces_page1);
	hide(findPlaces_page2);
	hide(findPlacesList);

	/* Emergency related screens ------------------------------------------*/
	hide(emergency);
	hide(helpComing);
	hide(helpDeclined);
	hide(ambulance);

	/* GPS related screens ------------------------------------------------*/
	hide(directionsScreen);
	hide(cancelConfirmScreen);
	
	/* Buttons ------------------------------------------------------------*/
	hide(toggleOn);
	hide(movementButtons);

	/* Set visibility z-indexes */
	zIndex(ambulance,    4);
	zIndex(helpComing,   3);
	zIndex(helpDeclined, 3);
	zIndex(emergency,    3);
	zIndex(lockScreen,   2);
	zIndex(startScreen,  2);
	zIndex(menuClock,    2);
	zIndex(mainMenu,     1);
}

function initScreenOrder() {
	/* Initial screens ----------------------------------------------------*/
	setPrev(lockScreen,  lockScreen);
	setPrev(startScreen, startScreen);
	setPrev(mainMenu,    mainMenu);
	setNext(lockScreen,  startScreen);
	setNext(startScreen, mainMenu);
	setNext(mainMenu,    mainMenu);
	
	/* Emergency screens --------------------------------------------------*/
	setPrev(emergency,    helpDeclined);
	setPrev(helpComing,   helpDeclined);
	setPrev(helpDeclined, helpDeclined);

	/* Find Places menu ---------------------------------------------------*/
	setPrev(findPlacesMenu,   mainMenu);
	setPrev(findPlaces_page1, mainMenu);
	setPrev(findPlaces_page2, mainMenu);
	setPrev(findPlacesList,   findPlaces_page1);
	setNext(findPlaces_page1, findPlaces_page2);
	setNext(findPlaces_page2, findPlaces_page1);

	/* Directions screens -------------------------------------------------*/
	setPrev(directionsScreen,    cancelConfirmScreen);
	setPrev(cancelConfirmScreen, directionsScreen);
	setRoot(directionsScreen,    mainMenu);
	setRoot(cancelConfirmScreen, mainMenu);
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

	/* Run again in 30 seconds */
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
  back()   - returns to previous screen from current screen
  root()   - returns to root screen from current screen
---------------------------------------------------------------------*/
function unlock() {
	if (emergencyCalled)
		show(ambulance);
	swap(lockScreen, startScreen)
	updateHours();
}

function lock() {
	if (emergencyCalled)
		swap(currentScreen, getPrev(currentScreen));
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

function back() { swap(currentScreen, getPrev(currentScreen)); }
function root() { swap(currentScreen, getRoot(currentScreen)); }

/*--------------------------------------------------------------------
  showClock()    - shows menu clock
  hideClock()    - hides menu clock
  resetOrb()     - resets menu progress orb
  highlightOrb() - highlights menu progress orb
  switchOrb()    - switches states of two orbs
---------------------------------------------------------------------*/
function showClock() { show(menuClock); }
function hideClock() { hide(menuClock); }

function resetOrb(orb) {
	orb = document.getElementById(orb);
	orb.style.backgroundColor = "grey";
	orb.style.width = "4pt";
	orb.style.height = "4pt";
}

function highlightOrb(orb) {
	orb = document.getElementById(orb);
	orb.style.backgroundColor = "white";
	orb.style.width = "4.5pt";
	orb.style.height = "4.5pt";
}

function switchOrb(orb1, orb2) {
	highlightOrb(orb1);
	resetOrb(orb2);
}

/*--------------------------------------------------------------------
  goToFindPlacesMenu()   - goes from main menu to find places menu
  goToCandidateList()    - goes from current screen to screen with candidate place
  goToDirectionsScreen() - goes from current screen to GPS screen
  switchCandidateList()  - switch menu list with new icons when switching pages
---------------------------------------------------------------------*/
function goToFindPlacesMenu() {
	swap(mainMenu, findPlaces_page1);
	switchCandidateList("p2");
	switchOrb("orb1", "orb2");
}

function goToCandidateList(cand, size, title) {
	if (cand === "")
		return;
	distance = Math.round(Math.random()*50) + 10;
	step     = 2;
	document.getElementById("titleIcon").src = "images/icons/icon-" + cand + ".png";
	document.getElementById("titleIcon").style.width = size;
	document.getElementById("placeTitle").innerHTML = title;
	document.getElementById("listDistance").innerHTML = "Distance: " + distance + " m";
	document.getElementById("listOccupancy").innerHTML = "Occupancy: " + Math.round(Math.random()*100) + " %";
	swap(currentScreen, findPlacesList);
	hide(menuClock);
}

function goToDirectionsScreen() {
	swap(currentScreen, directionsScreen);
	show(movementButtons);
	show(arrow);
	show(distanceDisplay);
	showClock();
	setPrev(directionsScreen, cancelConfirmScreen);
	degree   = Math.round(Math.random()*360);
	startGPS(arrow, distanceDisplay, distance, step);
}

function switchCandidateList(page) {
	switch(page) {
		case "p1":
			document.getElementById("topLeftButton").setAttribute("onclick",
				"goToCandidateList(\'" + candidates.p2[0] + "\',\'" + candidates.p2_size[0] + "\',\'" + candidates.p2_desc[0] + "\')");
			document.getElementById("topRightButton").setAttribute("onclick",
				"goToCandidateList(\'" + candidates.p2[1] + "\',\'" + candidates.p2_size[1] + "\',\'" + candidates.p2_desc[1] + "\')");
			document.getElementById("bottomLeftButton").setAttribute("onclick",
				"goToCandidateList(\'" + candidates.p2[2] + "\',\'" + candidates.p2_size[2] + "\',\'" + candidates.p2_desc[2] + "\')");
			document.getElementById("bottomRightButton").setAttribute("onclick",
				"goToCandidateList(\'" + candidates.p2[3] + "\',\'" + candidates.p2_size[3] + "\',\'" + candidates.p2_desc[3] + "\')");
			break;
		case "p2":
			document.getElementById("topLeftButton").setAttribute("onclick",
				"goToCandidateList(\'" + candidates.p1[0] + "\',\'" + candidates.p1_size[0] + "\',\'" + candidates.p1_desc[0] + "\')");
			document.getElementById("topRightButton").setAttribute("onclick",
				"goToCandidateList(\'" + candidates.p1[1] + "\',\'" + candidates.p1_size[1] + "\',\'" + candidates.p1_desc[1] + "\')");
			document.getElementById("bottomLeftButton").setAttribute("onclick",
				"goToCandidateList(\'" + candidates.p1[2] + "\',\'" + candidates.p1_size[2] + "\',\'" + candidates.p1_desc[2] + "\')");
			document.getElementById("bottomRightButton").setAttribute("onclick",
				"goToCandidateList(\'" + candidates.p1[3] + "\',\'" + candidates.p1_size[3] + "\',\'" + candidates.p1_desc[3] + "\')");
			break;
	}
}

/*--------------------------------------------------------------------
  forward()        - move character forward
  leftRotation()   - rotate arrow left until it's pointing forwards
  rightRotation()  - rotate arrow right until it's pointing forwards
  resetArrow()     - resets arrow to forward position
  updateArrow()    - updates arrow to some position
  updateDistance() - updates distance to destination
  startGPS()       - starts GPS simulation with random distance and angle
  endReached()     - behaviour when character reaches destination
  notifyDestinationReached() - notifies user that destination was reached
---------------------------------------------------------------------*/
function forward() {
	var coeff;
	var f;
	clearTimeout(rotation);
	Math.random() < 0.9 ? f = 0 : f = 1;
	Math.random() < 0.5 ? coeff = -1 : coeff = 1;

	if (f != 0)
		updateArrow(arrow, coeff, f * coeff * Math.round(Math.random()*120));

	if (degree === 0 && distance > 0) {
		updateDistance(distanceDisplay, step);
		walkingForward = setTimeout(forward, 100);
	}
	else
		clearTimeout(walkingForward);
}

function leftRotation() {
	clearTimeout(rotation);
	resetArrow(arrow, 1, 0);
}

function rightRotation() {
	clearTimeout(rotation);
	resetArrow(arrow, -1, 0);
}

function resetArrow(arrow, direction, finalDegree) {
	var inc = 1;
	arrow.style.transform = "translateX(-50%) translateY(-50%) rotate(" + degree + "deg)";
	if (degree === finalDegree) {
		clearTimeout(rotation);
		return;
	}
	degree = (degree + direction * inc) % 360;
	rotation = setTimeout(resetArrow, 7, arrow, direction, finalDegree);
}

function updateArrow(arrow, coeff, finalDegree) {
	resetArrow(arrow, coeff, finalDegree);
}

function updateDistance(display, step) {
	distance -= step;
	if (distance <= 0) {
		clearTimeout(walkingForward);
		endReached();
		notifyDestinationReached();
		return;
	}
	display.innerHTML = distance + " m";
}

function startGPS(arrow, text, distance, step) {
	text.innerHTML = distance + " m";
	arrow.style.transform = "translateX(-50%) translateY(-50%) rotate(" + degree + "deg)";
}

function endReached() {
	distanceDisplay.innerHTML = "End";
	hide(movementButtons);
	hide(arrow);
	hide(distanceDisplay);
	setPrev(directionsScreen, getRoot(directionsScreen));
}

function notifyDestinationReached() {
	if (secondsTic < 7) {
		if (secondsTic % 2 == 0)
			show(distanceDisplay);
		else
			hide(distanceDisplay);
	}
	else {
		hide(distanceDisplay);
		secondsTic = 0;
		clearTimeout(destinationReachedTimeout);
		root();
		return;
	}
	secondsTic += 1;
	destinationReachedTimeout = setTimeout(notifyDestinationReached, 500);
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
		/*Run again in 0.5 second*/
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
var startScreenAnim      = new Hammer(startScreen);
var findPlacesAnim_page1 = new Hammer(findPlaces_page1);
var findPlacesAnim_page2 = new Hammer(findPlaces_page2);

startScreenAnim.get('pan').set({direction: Hammer.DIRECTION_ALL});
findPlacesAnim_page1.get('pan').set({direction: Hammer.DIRECTION_ALL});
findPlacesAnim_page2.get('pan').set({direction: Hammer.DIRECTION_ALL});
/*-------------------------------------------------------------------*/

startScreenAnim.on("panup panleft panright pandown", function(ev){
	getNext(startScreen).style.pointerEvents = "none";
	show(getNext(startScreen));
	if (ev.type == "panup") {
		clearInterval(movementTimer);
		fade(up, timeInterval, startScreen, bound, "pt", opacityRate);
	}
	if (ev.type == "pandown") {
		clearInterval(movementTimer);
		fade(down, timeInterval, startScreen, bound, "pt", opacityRate);
	}
	if (ev.type == "panleft") {
		clearInterval(movementTimer);
		fade(left, timeInterval, startScreen, bound, "pt", opacityRate);
	}
	if (ev.type == "panright") {
		clearInterval(movementTimer);
		fade(right, timeInterval, startScreen, bound, "pt", opacityRate);
	}
})

findPlacesAnim_page1.on("panleft", function(ev){

	moveOutOfBounds("right", getNext(findPlaces_page1));
	show(getNext(findPlaces_page1));
	setPrev(findPlacesList, findPlaces_page2);
	switchCandidateList("p1");
	switchOrb("orb2", "orb1");

	if (ev.type == "panleft") {
		clearInterval(movementTimer);
		drag(dragLeft, timeInterval, findPlaces_page1, getNext(findPlaces_page1), 100, "%");
	}
})

findPlacesAnim_page2.on("panright", function(ev){

	moveOutOfBounds("left", getNext(findPlaces_page2));
	show(getNext(findPlaces_page2));
	setPrev(findPlacesList, findPlaces_page1);
	switchCandidateList("p2");
	switchOrb("orb1", "orb2");

	if (ev.type == "panright") {
		clearInterval(movementTimer);
		drag(dragRight, timeInterval, findPlaces_page2, getNext(findPlaces_page2), 100, "%");
	}
})

/*-------------------------------------------------------------------*/
var initTop    = 0;
var initLeft   = 0;
var bound      = 100;

var y = initTop;
var x = initLeft;

var opacity      = 1;
var opacityRate  = 0.015;
var timeInterval = 1;

var movementTimer; /* interval variable */

/* Generic movement functions ----------------------------------------*/
/*--------------------------------------------------------------------
  fade(direction, interval, screen, bound, unit) - moves screen with fading effect
	- direction: direction of movement (up, down, left, right)
	- interval:  frequency of movement update (ms)
	- screen:    screen to fade
	- bound:     max movement bound
	- unit:      unit of movement (%, pt, etc)
	- fadeRate:  rate of fading effect (higher = fades faster)

  drag(direction, interval, screen1, screen2, bound, unit) - drags screen2 after screen1
	- direction: direction of movement (dragLeft, dragRight)
	- interval:  frequency of movement update (ms)
	- screen1:   screen to drag
	- screen2:   screen to be dragged after screen1
	- unit:      unit of movement (%, pt, etc)
---------------------------------------------------------------------*/
function fade(direction, interval, screen, bound, unit, fadeRate) {
	movementTimer = setInterval(direction, interval, screen, bound, unit, fadeRate);
}

function drag(direction, interval, screen1, screen2, bound, unit) {
	movementTimer = setInterval(direction, interval, screen1, screen2, bound, unit);
}


function up(screen, bound, unit, rate) {
	y--;
	opacity -= rate;
	if (Math.abs(bound) <= Math.abs(y)) {
		clearInterval(movementTimer);
		resetScreen(screen);
	}
	else {
		screen.style.opacity = opacity;
		screen.style.top = y + unit;
	}
}

function down(screen, bound, unit, rate) {
	y++;
	opacity -= rate;
	if (Math.abs(bound) <= Math.abs(y)) {
		clearInterval(movementTimer);
		resetScreen(screen);
	}
	else {
		screen.style.opacity = opacity;
		screen.style.top     = y + unit;
	}
}

function left(screen, bound, unit, rate) {
	x--;
	opacity -= rate;
	if (Math.abs(bound) <= Math.abs(x)) {
		clearInterval(movementTimer);
		resetScreen(screen);
	}
	else {
		screen.style.opacity = opacity;
		screen.style.left    = x + unit;
	}
}

function right(screen, bound, unit, rate) {
	x++;
	opacity -= rate;
	if (Math.abs(bound) <= Math.abs(x)) {
		clearInterval(movementTimer);
		resetScreen(screen);
	}
	else {
		screen.style.opacity = opacity;
		screen.style.left    = x + unit;
	}
}

function dragLeft(screen1, screen2, bound, unit) {
	x--;
	if (Math.abs(bound) <= Math.abs(x)) {
		clearInterval(movementTimer);
		resetScreen(screen2);
		resetScreen(screen1);
	}
	else {
		screen1.style.left = x + unit;
		screen2.style.left = (bound + x) + unit;
	}
}

function dragRight(screen1, screen2, bound, unit) {
	x++;
	if (Math.abs(bound) <= Math.abs(x)) {
		clearInterval(movementTimer);
		resetScreen(screen2);
		resetScreen(screen1);
	}
	else {
		screen1.style.left = x + unit;
		screen2.style.left = (-bound + x) + unit;
	}
}