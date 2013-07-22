
var currentTrack = null;
var $media = null;
var dommedia = null;
var downloadstate = true;
var onRemote = false;

var IGNORE_CANPLAY = -2;
var PLAY_CANPLAY = -1;
var SELECT_TARGET = 'input[type=radio]';

var canplaycmd = IGNORE_CANPLAY;  //-2 Nothing, -1 play, otherwise seek to number >= 0
var canplayplay = true;  // If we should play after seek true else just seek


var nullloc = 1810000000;
var lng;
var lat;
var handlealert = true;
var currentSocket = -1;

var conMan = new Array();
var timeid = null;
var pollcount = 0;
var maxpollcnt = -1;   // This is used only for polling online

/*
TODO

need to put a status polling handle alert message box		

*/


	
function initCommon(){

 	$media = $("#media");
	dommedia = $media.get(0);
	$("#copybut").click(beginDownload)
	$("#playbut").click(playAudio)
	$("#refresh").click(refreshLookup)
	$("#remotebut").click(setRemote)
	
	$("#userhandle").focus(clearPoll).blur(refreshLookup).keydown(scanrtn)
	
	$media.bind("canplay",mediaCanPlay).bind("play",mediaPlay).bind("pause",mediaPause)
	
	lng = nullloc;
	lat = nullloc;
}



function processAddress(data) {
	
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
	//				console.log("go ahead and ping : " + data[i].ipadd)
					pingWebSocket(data[i])
				}
			}
}


function scanrtn(evt) {
	
	var code = (evt.keyCode ? evt.keyCode : evt.which);
	
	if(code == 13) { //Enter keycode
		refreshLookup()
	}
}


function refreshLookup() {

	if (maxpollcnt >= 0) {	// using the polling routine
		clearPoll()
		pollcount = 0
		initOnLine()
	}
}


/*		Leave in for awhile
function pollLookup(){
	serverLookup(lng, lat, $("#userhandle").val());
}
*/


function clearPoll() {
	if (timeid != null) {
		clearTimeout(timeid)
		timeid = null;
	}
	butonIndicator($('#refresh'), false)
}


function appendServer(wsdata,pos){
	
	item = $('<li data-theme="c" data-icon="false"><a href="#"><div class="ui-grid-b">'+
	'<div class="ui-block-a" style="width:20%;"><img class="userimage" src="img/ic_menu_invite.png"/></div>'+
	'<div class="ui-block-b" style="width:75%;"><div>' + wsdata.userhandle + 
	'</div><div class="songtitle"></div><div class="albumartist"></div></div><div class="ui-block-c" style="width:5%;">'+
	'<h2></h2><input type="radio" name="playing" /></div></div></a></li>')
	
	item.find('img').attr('src',"http://"+wsdata.ipadd+":"+wsdata.porthttpd+"/UserHtml/serverphoto.jpg").error(
		function(){
			item.find('img').attr('src',"img/ic_menu_invite.png")
		})
	
	console.log("image value : "+ item.find('img').attr('src'))
	
	aitem = item.find('a')
	aitem.click(callServer)
	aitem.find(SELECT_TARGET).click(clickRadio).data('conManpos',pos)
	$("#pick").append(item)
	$("#pick").listview('refresh');
	
	if ($("#pick").children('li').length == 1 ) {  // first item added starts playing imediately
		item.find(SELECT_TARGET).click()
		setBeforeUnload()
		
	}
	return item;
}


function removeServer(jqobj) {
	
	if (jqobj != null) {
		jqobj.remove()
	}
	
	if ($("#pick").children('li').length == 0 ) {  // table empty
		clearBeforeUnload()
	}
}


function callServer(ev, data) {
	ev.preventDefault();
	
	$(this).find(SELECT_TARGET).click()
}



function clickRadio(ev,data) {	//This is here to eat the event. Do not remove
	ev.stopPropagation();
	
	currentSocket = parseInt($(this).data("conManpos"))
	signalToRemotes(currentSocket)
	signalServer();
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
			conMan[i].websocket.send("WHATPLAY");  // Give me the current songs
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


function currentSocketRange() {
	
	if (currentSocket >= 0 && currentSocket < conMan.length && conMan[currentSocket] != null) {
		return true;
		} else {
			console.log("currentSocket out of range")
			return false;
	}
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
	
	if (onRemote) {
		setRemote()		//Clear any remotes and toggle button
	}
	
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


function streamURL(track) {
	
	return("http://" + conMan[currentSocket].wsdata.ipadd + ":" + 
			conMan[currentSocket].wsdata.porthttpd + "/" + track);
}


function messageNotMine(evt) {
	
	return(! currentSocketRange() || evt.srcElement.URL.indexOf(conMan[currentSocket].wsdata.ipadd) != 5);
}



function getWebSocket(){
	
	return(conMan[currentSocket].websocket);
}



function updatePlaying(evt){
	
	ipadd = evt.srcElement.URL.substr(5)
	ipadd = ipadd.split(":",2)[0]
	
	for (i=0; i<conMan.length; i++) {
		if (conMan[i] != null && conMan[i].wsdata.ipadd == ipadd) {
			songa = getSongData(evt) 
			conMan[i].jqry.find('.songtitle').text(songa[1])
			conMan[i].jqry.find('.albumartist').text(formatAlArtist(songa[2],songa[3]))
		}
	}
}


function formatAlArtist(album, artist){
	
	var albart = "";
	
	if (artist.indexOf("<unknown>") == -1 && artist.indexOf("Unknown") == -1) {
		        	albart = artist;
	} else {
  	albart = "";
  }

  if (albart.length > 0) {
	  if (album.length > 0) {
		  albart = album +"  -   " + albart;
	  }
  } else {
	  albart = album;
  }
  return(albart);
}


function sendToAll(cmd){
	
	for (i=0; i<conMan.length; i++) {
		if (conMan[i] != null) {
			conMan[i].websocket.send(cmd)
		}
	}
}


function setRemoteRequest(evt){
	
	ipadd = evt.srcElement.URL.substr(5)
	ipadd = ipadd.split(":",2)[0]
	
	for (i=0; i<conMan.length; i++) {
		if (conMan[i] != null && conMan[i].wsdata.ipadd == ipadd) {
			conMan[i].jqry.find(SELECT_TARGET).click()
		}
	}
}


function signalToRemotes(selected){
	
	if (currentSocketRange() && onRemote){
		sendToAll("REMOTE:"+conMan[selected].wsdata.ipadd);
	}
}




//*******************  Below is old common  **********/


function playAudio() {

	dommedia.play()
}

function clearPlayingTrack() {
	
	currentSocket = -1;
	currentTrack = null;
	$media.attr("src", "")
	$('#copybut').data("ziplink","")
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
	
	// The playing command updates all connected servers
	if (iscommand(evt,"PLAYING:")){
		updatePlaying(evt)
		return
	}	else if (iscommand(evt,"REMOTE:")){
		console.log("GOT REMOTE")
			if (getComArg(evt) == "S") {
				if (onRemote) {
					setRemoteRequest(evt);
				}
			}
	}
	
	// Check to see that messages are for the current live stream only. Drop rest
	if (messageNotMine(evt)) {
//		console.log("message not for : " + conMan[currentSocket].wsdata.ipadd +"  from : "+evt.srcElement.URL)
		return
	}
	
	console.log('onMessage : ' + evt.data);

		if (iscommand(evt,"PREP:")) {
			var fullurl;

			currentTrack = getComArg(evt)
			if (currentSocketRange()) {
				
				fullurl = streamURL(currentTrack);
	console.log("In prep calling url for player")

				$media.attr("src", fullurl)
				dommedia.load();	//This is not needed in all browsers but good for now
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
//				console.log("In Play try block");
				canplaycmd = IGNORE_CANPLAY
			} catch(err) {
				console.log("Got Play error : " + err)
			}
		} else if (iscommand(evt,"ZIPREADY")){
			console.log("Got zip ready : " + $('#copybut').data("ziplink"))
			window.location.href = $('#copybut').data("ziplink")
			setTimeout(setBeforeUnload, 8000)	//Seems to need time after location call else thinks leaving
		} else if (iscommand(evt,"DOWNEN:")){
			enableDownload(getComArg(evt) == "T")
		}	
}


function calcSeek(seektime) {
	return(parseInt((parseInt(seektime) + 500) / 1000));
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
//	console.log("SENT to server : " + message + "  conMan index : "+ currentSocket);

	if (currentSocketRange()) {
		getWebSocket().send(message); 
	} 
}


function setBeforeUnload() {
	$(window).bind('beforeunload',closeSockets)
}


function clearBeforeUnload() {
	$(window).unbind('beforeunload',closeSockets)
}


function beginDownload(){

	clearBeforeUnload()
//	console.log("ZIP : " +currentTrack)
	doSend("ZIPPREP:"+currentTrack)
}


function iscommand(evt,com) {

	return(evt.data.indexOf(com) == 0)
}


function getComArg(evt) {

	return(evt.data.substring(evt.data.indexOf(':')+1));
}


function getSongData(evt) {
	var i;
	
	songa =	evt.data.split(":",4)
	for (i=0; i<songa.length; i++){
		songa[i] = songa[i].replace(/~%~/g,":")
	}
	return songa;
}


function enableDownload(enflg) {
	
	if (enflg != downloadstate) {		//Only update on change of state
		if (enflg){
			$("#copybut").button("enable")
		} else {
			$("#copybut").button("disable")
		}
		downloadstate = enflg
	}
}	


function setRemote(){
	cmd = "REMOTE:";
	
	jobj = $(this).parent().find('span.ui-btn-text')
	
	if (onRemote) {
		cmd += "F"
		butonIndicator($(this), false)
	} else {
		cmd += "T"
		butonIndicator($(this), true)
	}
	
	onRemote = !onRemote;
	sendToAll(cmd)
}
	
	
function butonIndicator(butn, onoff){
	
	jobj = butn.parent().find('span.ui-btn-text')
	
	if (jobj.length == 0) return;
	
	if (onoff){
		jobj.addClass("butactive")
	} else {
		jobj.removeClass("butactive")
	}
}



function localSelectRemote(ipadd) {
	
	if (onRemote){
		sendToAll("REMOTE:"+ipadd)
	}
}




