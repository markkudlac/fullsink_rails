
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




