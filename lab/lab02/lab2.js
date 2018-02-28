// Drag and drop aux variables
var pid;
var clone;


function loadAllRoomData(roomData) {
	localStorage.setItem("AllRoomData", JSON.stringify(roomData));

}


function getRoomCoords(roomName) {
	roomData = JSON.parse(localStorage.getItem("AllRoomData"));
	for (let i = 0; i < roomData.length; i++) {
		if (roomData[i].roomname == roomName)
			return roomData[i].coords;
	}

}


function setLocationPin(x1, y1, x2, y2) {
  var positionX = x1 + (x2 - x1) / 2.0 - 45;
  var positionY = y1 + (y2 - y1) / 2.0 - 45;

  document.getElementById("target").style.left = positionX;
  document.getElementById("target").style.top = positionY;

  document.getElementById("target").style.visibility = "visible";
}


function selectRoom(roomName) {
  localStorage.setItem("roomName", roomName);
  coords = getRoomCoords(roomName);
  setLocationPin(coords[0], coords[1], coords[2], coords[3]);
}


function removeElement(id) {
    var node = document.getElementById(id);
    node.parentNode.removeChild(node);
}


function drag(target, e) {
  pid = target.parentNode.id;
  clone = target.cloneNode(true);
  e.dataTransfer.setData('SpanImg', target.id);
}


function drop(target, e, roomName) {
  target.appendChild(clone);
  removeElement(e.dataTransfer.getData('SpanImg'));

  selectRoom(roomName);
}


function getToday() {
  var date = new Date();

  //return date.toString();
  //return date.toUTCString();
  //return date.toDateString();
  return date.toLocaleString();
}


function displayDate() {
  document.getElementById("date").innerHTML = getToday();
}


function getRoomSchedule(roomName) { 
 // TODO

}


function displaySchedule() {

  // Get and display the selected room
  var roomName = localStorage.getItem("roomName");
  // TODO
  
  // Load the schedule for the current room
  currentSchedule = getRoomSchedule(roomName);

  hourcol = document.getElementById("hours");
  classcol = document.getElementById("classes");

  // TODO

}


function notifyON() {
  // TODO
}


function showAlert() {
  // TODO
}


function closeAlert() {
  var div1 = document.getElementById("alertsuccess");
  div1.style.opacity = "0";
  setTimeout(function(){ div1.style.display = "none"; }, 600);
}


function goBack() {
  // TODO - TPC
}
