
var conMan = new Array();
var timeid = null;
var pollcount = 0;
var nullloc = 1810000000;
var lng;
var lat;
var handlealert = true;

var currentTrack = null;
var currentSocket = -1;
var $media = null;
var dommedia = null;

var IGNORE_CANPLAY = -2;
var PLAY_CANPLAY = -1;
var canplaycmd = IGNORE_CANPLAY;  //-2 Nothing, -1 play, otherwise seek to number >= 0
var canplayplay = true;  // If we should play after seek true else just seek
/*
TODO

need to put a status polling handle alert message box		

*/


	
$(document).ready(function(){
	
	console.log("Document ready")
	
	initAjax()

 	$media = $("#media");
	dommedia = $media.get(0);
	$("#copybut").click(beginDownload);
	$("#refresh").click(refreshLookup)
	$("#closesockets").click(closeSockets)
	$("#userhandle").focus(clearPoll)
	$media.bind("canplay",mediaCanPlay).bind("play",mediaPlay).bind("pause",mediaPause)
	
	lng = nullloc;
	lat = nullloc;
	
	initLocation(true)
})



function initAjax() {
	
	$(document).ajaxError(function(ev,xhdr,status,err) {
		alert("Ajax error : "+err)
		console.log(status)
	})
	
	$(document).ajaxStart(function() {
		console.log("Ajax Start")
	})
}


function initLocation() {

	navigator.geolocation.getCurrentPosition(GetLocation, noLocation);
	
	function GetLocation(location) {
		
		lng = location.coords.longitude
		lat = location.coords.latitude

//    console.log("Raw lat : " + lat);
//    console.log("Raw lng : " + lng);
//    console.log(location.coords.accuracy);

		lat = parseInt(lat * 10000000)
		lng = parseInt(lng * 10000000)

		console.log("Proc lat : " + lat);
    console.log("Proc lng : " + lng);

			serverLookup(lng,lat,$("#userhandle").val())
	}

	function noLocation(){
		console.log("No location returned")
			serverLookup(lng, lat, $("#userhandle").val());
	}
	
	timeid = setInterval(pollLookup, 9000)
}


function serverLookup(xlng, xlat, userhandle) {
	
	var pingflg = true;
	
	alertNoLoc(xlng, xlat)
	
	$.get('<%= url %>'+"/api/search",{lng: xlng, lat: xlat, userhandle: userhandle},function(data){
		
		for (i=0; i < data.length; i++) {
			console.log("Got : " + data[i].userhandle)
			
			// Scan for duplicates first
			pingflg = true;
			for (j=0; j < conMan.length; j++){
				if (conMan[j] != null && conMan[j].wsdata.ipadd.indexOf(data[i].ipadd) == 0) {
					pingflg = false;
					console.log("ipadd already in list : " + data[i].ipadd)
					break
				}
			}
			
			if (pingflg) {		//This is a new one
				console.log("go ahead and ping : " + data[i].ipadd)
				pingWebSocket(data[i])
			}
		}
	})
	
	++pollcount;
		console.log("In managePoll count : " + pollcount)
	if (pollcount >= 20) {
		clearPoll()
	}
}


function refreshLookup() {

	clearPoll()
	pollcount = 0
	initLocation()
}


function pollLookup(){
	serverLookup(lng, lat, $("#userhandle").val());
}


function clearPoll() {
	if (timeid != null) {
		clearTimeout(timeid)
		timeid = null;
	}
}


function appendServer(wsdata,pos){
	
	item = $('<tr><td><img class="userimage"/></td><td><a href=\"#\">' + wsdata.userhandle + 
	"</a></td><td><input type='radio' name='playing' /></td></tr>")
	
	item.find('img').attr('src',"http://"+wsdata.ipadd+":"+wsdata.porthttpd+"/FlSkHtml/serverphoto.jpg")
	
	aitem = item.find('input')
	aitem.data('conManpos',pos).click(callServer)
	item.find('a').click(clickRadio)
	$("#pick").append(item)
	if ($("#pick").children('tr').length == 1 ) {  // first item added starts playing imediately
		item.find('a').click()
		setBeforeUnload()
	}
	return item;
}


function loadImage(wsdata, item) {
	
	var fullurl = 'http://'+wsdata.ipadd + ":"+ wsdata.porthttpd +
		"/FlSkHtml/serverid.json"
		console.log("Send get for serverid : "+fullurl);
		
	$.getJSON(fullurl,null,function(data){
			console.log("Back with serverid status data : " + data)
		})
}


function removeServer(jqobj) {
	
	if (jqobj != null) {
		jqobj.remove()
	}
	
	if ($("#pick").children('tr').length == 0 ) {  // table empty
		clearBeforeUnload()
	}
}


function callServer() {
	currentSocket = parseInt($(this).data("conManpos"))
	signalServer();
}


function clickRadio() {

		$(this).parent().next().find('input').attr('checked',true).click()
}


function conQueue(wsdata, websocket){
	this.wsdata = wsdata;
	this.websocket = websocket;
	this.jqry = null;		// Hold object for table item
}


function conManLoad(wsaddr){
	var i;
	for (i=0; i < conMan.length; i++){
		if (conMan[i] != null && wsaddr.indexOf(conMan[i].wsdata.ipadd) >= 0 && 
					parseInt(conMan[i].wsdata.portsock) > 0){
//			console.log("Found in conMan : "+wsaddr)
			conMan[i].jqry = appendServer(conMan[i].wsdata,i)
			conMan[i].wsdata.portsock = 0;		//This is here to stop reconnecting but may not be needed
			return
		}
	}
}


function conManClear(wsaddr){
	
//	console.log("Clear conMan : "+wsaddr + "   len : " + conMan.length)
	var i;
	for (i=0; i < conMan.length; i++){
		if (conMan[i] != null && wsaddr.indexOf(conMan[i].wsdata.ipadd) >= 0){
			console.log("Found in Clear conMan : "+wsaddr)
			if (i == currentSocket) {
					clearPlayingTrack()
			}
			
			removeServer(conMan[i].jqry)
			conMan[i] = null;
			return
		}
	}
}


function clearPlayingTrack() {
	
	currentSocket = -1;
	currentTrack = null;
	$media.attr("src", "")
	$("#songdisp").text("")
	$('#copybut').data("ziplink","")
}


function alertNoLoc(xlng, xlat){
	
	if (handlealert && (parseInt(xlng) >= nullloc || 
					parseInt(xlat) >= nullloc)) {
		alert("Location unavailable : Enter User Handle for server")
		handlealert =  false
	}
}


function closeSockets() {
	
	$(window).unbind('beforeunload',closeSockets)
	clearPoll();
	
	for (i=0; i < conMan.length; i++){
		if (conMan[i] != null && conMan[i].jqry != null) {
			conMan[i].websocket.close()
			console.log("Closed socket : "+conMan[i].wsdata.ipadd)
		}
	}
	return "Do you want to leave?"
}


function pingWebSocket(wsdata) { 

	console.log("Test for socket addr : "+wsdata.ipadd+"   port : "+wsdata.portsock)
	var i, pushflg = true;
	var conQ = new conQueue(wsdata, new WebSocket('ws://'+ wsdata.ipadd + ':'+ wsdata.portsock +'/'));
	
	for (i=0; i < conMan.length; i++){
		if (conMan[i] == null) {
			conMan[i] = conQ;
			pushflg = false;
			break;
		}
	}
	
	if (pushflg) {	conMan.push(conQ) }
	
	conQ.websocket.onopen = function(evt) { onOpen(evt) };
	conQ.websocket.onclose = function(evt) { onClose(evt) };
	conQ.websocket.onmessage = function(evt) { onMessage(evt) };
	conQ.websocket.onerror = function(evt) { onError(evt) }; 
}  


function signalServer() {
	
	doSend("CONNECT:Browser")
	doSend("INIT")
}


function onOpen(evt) {

  console.log("onOpen : CONNECTED :");
	conManLoad(evt.srcElement.URL)
}  


function onClose(evt) { 
	console.log("DISCONNECTED : " + evt.code); 
	conManClear(evt.srcElement.URL)
} 



function onMessage(evt) { 
	
	// Check to see that messages are for the current live stream only. Drop rest
	if (! currentSocketRange() || evt.srcElement.URL.indexOf(conMan[currentSocket].wsdata.ipadd) != 5) {
		console.log("message not for : " + conMan[currentSocket].wsdata.ipadd +"  from : "+evt.srcElement.URL)
		return
	}
	
	console.log('onMessage : ' + evt.data);

		if (iscommand(evt,"PREP:")) {
			var fullurl;

			currentTrack = getComArg(evt)
			if (currentSocketRange()) {
				fullurl = "http://" + conMan[currentSocket].wsdata.ipadd + ":" + 
						conMan[currentSocket].wsdata.porthttpd + "/" + currentTrack;
			
	console.log("In prep calling url for player")

				$media.attr("src", fullurl)
				dommedia.load();	//This is not needed in all browsers but good for now
				$("#songdisp").text("Now Playing : " + currentTrack)
				$('#copybut').data("ziplink", fullurl + ".zip")			
				doSend("READY")
			}
		} else if (iscommand(evt,"PAUSE")){
				dommedia.pause()
		}	else if (iscommand(evt,"RESUME:")){
			dommedia.currentTime = calcSeek(getComArg(evt))
			dommedia.play()
		}	else if (iscommand(evt,"SEEK:")){
			canplayplay = false;
			try {
				var seekto = calcSeek(getComArg(evt))
				
				canplaycmd = seekto
				dommedia.currentTime = seekto
				canplaycmd = IGNORE_CANPLAY
			} 	catch(err) {
					console.log("Got Seek error : " + err + "  canplaycmd : " + canplaycmd)
				}
		}	else if (iscommand(evt,"PLAY:")){
			try {
				var seekto = calcSeek(getComArg(evt))
				
				canplayplay = true;
				canplaycmd = seekto
				dommedia.currentTime = seekto
				dommedia.play()
				console.log("In Play try block");
				canplaycmd = IGNORE_CANPLAY
			} catch(err) {
				console.log("Got Play error : " + err)
			}
		} else if (iscommand(evt,"ZIPREADY")){
			console.log("zip link is : "+ $('#copybut').data("ziplink"))

			window.location.href = $('#copybut').data("ziplink")
			setTimeout(setBeforeUnload, 8000)	//Seems to need time after location call else thinks leaving
		}
}


function calcSeek(seektime) {
	return(parseInt((parseInt(seektime) + 500) / 1000));
}


function startPlay(seektime){
	dommedia.currentTime = calcSeek(seektime)
	dommedia.play()
}


function mediaCanPlay(evt){

	if (canplaycmd == IGNORE_CANPLAY) {
		return
	} else {
		console.log("In mediaCanPlay  canplaycmd : " + canplaycmd);
		dommedia.currentTime = canplaycmd
		
		if (canplayplay) {
				dommedia.play()
		}
	}
	canplaycmd = IGNORE_CANPLAY;
}

function mediaPlay(evt){
	console.log("Got media play");
	}
	
	
function mediaPause(evt){
	console.log("Got media pause");
}


function onError(evt) { 
	alert('ERROR:  ' + evt.message); 
}


function doSend(message) {
	console.log("SENT to server : " + message + "  conMan index : "+ currentSocket);

	if (currentSocketRange()) {
		conMan[currentSocket].websocket.send(message); 
	} 
}


function setBeforeUnload() {
	$(window).bind('beforeunload',closeSockets)
}


function clearBeforeUnload() {
	$(window).unbind('beforeunload',closeSockets)
}



function currentSocketRange() {
	
	if (currentSocket >= 0 && currentSocket < conMan.length && conMan[currentSocket] != null) {
		return true;
		} else {
			console.log("currentSocket out of range")
			return false;
	}
}


function beginDownload(){

	clearBeforeUnload()
	doSend("ZIPPREP:"+currentTrack)
}


function iscommand(evt,com) {

	return(evt.data.indexOf(com) == 0)
}


function getComArg(evt) {

	return(evt.data.split(":",2)[1])
}


