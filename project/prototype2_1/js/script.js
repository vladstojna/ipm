
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
	p1_size : [ "53pt", "33pt", "33pt", "47pt" ],
	p1_desc : [ "Restroom", "Food court", "Drinks / Bar", "Camping site"],
	p2 :      [ "charging", "info", "exit", "" ],
	p2_size : [ "35pt", "46pt", "44pt", "0pt" ],
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
var ambulance       = document.getElementById("foregroundTimeleft");
var vibratingScreen = document.getElementById("vibratingScreen");

/* Find places displays ---------------------------------------------*/
var findPlacesWrapper = document.getElementById("findPlacesWrapper"); /* background & orbs */
var findPlaces_page1  = document.getElementById("findPlacesMenu_page1");
var findPlaces_page2  = document.getElementById("findPlacesMenu_page2");
var findPlacesList    = document.getElementById("findPlacesList");

/* GPS related displays ---------------------------------------------*/
var directionsWrapper   = document.getElementById("directionsWrapper");
var directions_start    = document.getElementById("directionsScreen_start");
var directions_end      = document.getElementById("directionsScreen_end");
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

  resetScreenProperties(screen) - resets position and opacity of 'screen'
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

function setEvents(element, ev) { element.style.pointerEvents = ev; }


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
	switch(side) {
		case "left":
			screen.style.left = "-100%";
			break;
		case "right":
			screen.style.left = "100%";
			break;
		case "top":
			screen.style.top  = "100%";
			break;
		case "bottom":
			screen.style.top  = "-100%";
			break;
		default:
			console.error("moveOutOfBounds: invalid parameters", [side, screen]);
	}
}

/* Generic reset properties function */
function resetScreenProperties(screen) {
	screen.style.top     = "0pt";
	screen.style.left    = "0pt";
	screen.style.opacity = 1;
	screen.style.pointerEvents = "auto";
}

function resetMovementProperties(props, init_top, init_left, opacity) {
	if (opacity !== undefined)
		props.opacity = opacity;
	props.top     = init_top;
	props.left    = init_left;
}

/* Generic reset screen function */
function resetScreen(screen) {
	swap(screen, getNext(screen));
	resetScreenProperties(screen);
	resetScreenProperties(getNext(screen));
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

	/* Emergency related screens ------------------------------------------*/
	hide(emergency);
	hide(helpComing);
	hide(helpDeclined);
	hide(ambulance);

	/* Find places screens ------------------------------------------------*/
	//hide(findPlacesWrapper); // hides orbs, don't hide
	hide(findPlaces_page1);
	hide(findPlaces_page2);
	hide(findPlacesList);

	/* GPS related screens ------------------------------------------------*/
	//hide(directionsWrapper); // in general, don't hide
	hide(directions_start);
	hide(directions_end);
	hide(cancelConfirmScreen);
	
	/* Buttons ------------------------------------------------------------*/
	hide(toggleOn);
	hide(movementButtons);

	/* Set visibility z-indexes */
	zIndex(ambulance,    10);
	zIndex(helpComing,   9);
	zIndex(helpDeclined, 9);
	zIndex(emergency,    9);
	zIndex(cancelConfirmScreen, 9);
	zIndex(findPlacesList, 8);
	zIndex(lockScreen,     2);
	zIndex(startScreen,    2);
	zIndex(menuClock,      2);
	zIndex(mainMenu,       1);
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
	setPrev(findPlaces_page1, mainMenu);
	setPrev(findPlaces_page2, mainMenu);
	setPrev(findPlacesList,   findPlaces_page1);
	setNext(findPlaces_page1, findPlaces_page2);
	setNext(findPlaces_page2, findPlaces_page1);

	/* Directions screens -------------------------------------------------*/
	setPrev(directions_start,    cancelConfirmScreen);
	setPrev(directions_end,      cancelConfirmScreen);
	setPrev(cancelConfirmScreen, directions_start);
	setRoot(directions_start,    mainMenu);
	setRoot(directions_end,      mainMenu);
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
	if (emergencyModeOn)
		return;
	if (currentScreen != lockScreen) {
		if (emergencyCalled)
			hide(ambulance);
		if (currentScreen != startScreen)
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
function showClock() {
	if (currentScreen != helpDeclined)
		show(menuClock);
}
function hideClock() { hide(menuClock); }

function resetOrb(orb) {
	orb = document.getElementById(orb);
	orb.style.backgroundColor = "#729fcf";
}

function highlightOrb(orb) {
	orb = document.getElementById(orb);
	orb.style.backgroundColor = "#eeeeec";
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
	setPrev(findPlacesList, findPlaces_page1);
	switchOrb("orb1", "orb2");
}

function goToCandidateList(cand, size, title) {
	if (cand === "")
		return;
	distance = Math.round(Math.random()*1) + 10;
	step     = 2;
	document.getElementById("titleIcon").src           = "images/icons/icon-" + cand + "-white.png";
	document.getElementById("titleIcon").style.width   = size;
	document.getElementById("placeTitle").innerHTML    = "\u2022 " + title + " \u2022";
	document.getElementById("listDistance").innerHTML  = "Distance: " + distance + " m";
	document.getElementById("listOccupancy").innerHTML = "Occupancy: " + Math.round(Math.random()*100) + "%";
	swap(currentScreen, findPlacesList);
}

function goToDirectionsScreen() {
	setPrev(directions_start, getPrev(findPlacesList));
	setPrev(directions_end,   getPrev(findPlacesList));
	swap(findPlacesList, directions_start);
	show(movementButtons);
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
		destinationReached();
		return;
	}
	display.innerHTML = distance + " m";
}

function startGPS(arrow, text, distance, step) {
	text.innerHTML = distance + " m";
	arrow.style.transform = "translateX(-50%) translateY(-50%) rotate(" + degree + "deg)";
}

function endReached() {
	hide(movementButtons);
	swap(directions_start, directions_end);
	//setPrev(directions_end, getRoot(directions_end));
}

function destinationReached() {
	setTimeout(check, 3000, directions_end, getPrev(directions_end));
}

function check(screen1, screen2) {
	if (currentScreen !== screen1)
		return;
	console.log("Swapping");
	swap(screen1, screen2);
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
	setEvents(getNext(startScreen), "none");
	show(getNext(startScreen));
	if (ev.type == "panup") {
		clearInterval(movementTimer);
		fade(fadeUp, timeInterval, props, startScreen, 100, "pt", opacityRate);
	}
	if (ev.type == "pandown") {
		clearInterval(movementTimer);
		fade(fadeDown, timeInterval, props, startScreen, 100, "pt", opacityRate);
	}
	if (ev.type == "panleft") {
		clearInterval(movementTimer);
		fade(fadeLeft, timeInterval, props, startScreen, 100, "pt", opacityRate);
	}
	if (ev.type == "panright") {
		clearInterval(movementTimer);
		fade(fadeRight, timeInterval, props, startScreen, 100, "pt", opacityRate);
	}
})

findPlacesAnim_page1.on("panleft", function(ev){

	if (props.left === 0) {
		setEvents(findPlaces_page1, "none");
		setEvents(getNext(findPlaces_page1), "none");
		moveOutOfBounds("right", getNext(findPlaces_page1));
		show(getNext(findPlaces_page1));
		setPrev(findPlacesList, findPlaces_page2);
		switchOrb("orb2", "orb1");
	}

	if (ev.type == "panleft") {
		clearInterval(movementTimer);
		drag(dragLeft, 1, props, findPlaces_page1, getNext(findPlaces_page1), 100, "%");
	}
})

findPlacesAnim_page2.on("panright", function(ev){

	if (props.left === 0) {
		setEvents(findPlaces_page2, "none");
		setEvents(getNext(findPlaces_page2), "none");
		moveOutOfBounds("left", getNext(findPlaces_page2));
		show(getNext(findPlaces_page2));
		setPrev(findPlacesList, findPlaces_page1);
		switchOrb("orb1", "orb2");
	}

	if (ev.type == "panright") {
		clearInterval(movementTimer);
		drag(dragRight, 1, props, findPlaces_page2, getNext(findPlaces_page2), 100, "%");
	}
})

/*-------------------------------------------------------------------*/
var initTop    = 0;
var initLeft   = 0;

var y = initTop;
var x = initLeft;

var opacityRate  = 0.015;
var timeInterval = 1;

var movementTimer; /* interval variable */

var props = { top : 0, left : 0, opacity : 1 }

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
function fade(direction, interval, properties, screen, bound, unit, fadeRate) {
	movementTimer = setInterval(direction, interval, properties, screen, bound, unit, fadeRate);
}

function drag(direction, interval, properties, screen1, screen2, bound, unit) {
	movementTimer = setInterval(direction, interval, properties, screen1, screen2, bound, unit);
}


function fadeUp(properties, screen, bound, unit, rate) {
	fade_generic(properties, "up", screen, bound, unit, rate, "top");
}

function fadeDown(properties, screen, bound, unit, rate) {
	fade_generic(properties, "down", screen, bound, unit, rate, "top");
}

function fadeLeft(properties, screen, bound, unit, rate) {
	fade_generic(properties, "left", screen, bound, unit, rate, "left");
}

function fadeRight(properties, screen, bound, unit, rate) {
	fade_generic(properties, "right", screen, bound, unit, rate, "left");
}

function dragLeft(properties, screen1, screen2, bound, unit) {
	drag_generic(properties, "left", screen1, screen2, bound, unit, "left");
}

function dragRight(properties, screen1, screen2, bound, unit) {
	drag_generic(properties, "right", screen1, screen2, bound, unit, "left");
}

function dragUp(properties, screen1, screen2, bound, unit) {
	drag_generic(properties, "up", screen1, screen2, bound, unit, "top");
}

function dragDown(properties, screen1, screen2, bound, unit) {
	drag_generic(properties, "down", screen1, screen2, bound, unit, "top");
}


function fade_generic(properties, dir, screen, bound, unit, rate, attr) {
	var step;
	if (dir === "right" || dir === "down")
		step = 1;
	else if (dir === "left" || dir === "up")
		step = -1;
	else {
		clearInterval(movementTimer);
		console.error("fade_generic: invalid direction (left, right, up, down): ", dir);
		return;
	}

	properties[attr]   += step;
	properties.opacity -= rate;
	if (Math.abs(bound) <= Math.abs(properties[attr])) {
		clearInterval(movementTimer);
		resetScreen(screen);
		resetMovementProperties(properties, 0, 0, 1);
	}
	else {
		screen.style.opacity = properties.opacity;
		screen.style[attr]   = properties[attr] + unit;
	}
}

function drag_generic(properties, dir, screen1, screen2, bound, unit, attr) {
	var step;
	if (dir === "right" || dir === "down")
		step = 1;
	else if (dir === "left" || dir === "up")
		step = -1;
	else {
		clearInterval(movementTimer);
		console.error("fade_generic: invalid direction (left, right, up, down): ", dir);
		return;
	}

	properties[attr] += step;
	if (Math.abs(bound) <= Math.abs(properties[attr])) {
		clearInterval(movementTimer);
		resetScreen(screen2);
		resetScreen(screen1);
		resetMovementProperties(properties, 0, 0);
	}
	else {
		screen1.style[attr] = properties[attr] + unit;
		screen2.style[attr] = (-step * bound + properties[attr]) + unit;
	}
}