

var url = "http://192.168.1.104:3000"

$(document).ready(function(){
	
	var lng = 0;
	var lat = 0;
	
	console.log("Document ready")
	
	initAjax()
	
	navigator.geolocation.getCurrentPosition(GetLocation);
	function GetLocation(location) {
		
			lng = location.coords.longitude
			lat = location.coords.latitude
			
//	    console.log("Raw lat : " + lat);
//	    console.log("Raw lng : " + lng);
//	    console.log(location.coords.accuracy);
	
			lat = parseInt(lat * 10000000)
			lng = parseInt(lng * 10000000)
			
			console.log("Proc lat : " + lat);
	    console.log("Proc lng : " + lng);
	
			serverLookup(lng,lat)
	}
})


function initAjax() {
	
	$(document).ajaxError(function() {
		alert("Ajax error")
	})
	
	$(document).ajaxStart(function() {
		console.log("Ajax Start")
	})
}


function serverLookup(lng, lat) {
	
	$.get(url+"/api/search",{lng: lng, lat: lat},function(data){
		
		for (i=0; i < data.length; i++) {
			console.log("Got : " + data[i].userhandle)
			
			item = $('<li><img class="userimage"/><a href=\"#\">' + data[i].userhandle + "</a></li>")
			
//			console.log("Got image size : " + data[i].userimage.length)
			
			item.find('img').attr('src','data:image/jpg;base64,' + data[i].userimage)
			aitem = item.find('a')
			aitem.data('addr', data[i].ipadd + ":"+data[i].porthttpd+
					"/F_html_S/fullsinkaudio.html?socketport="+data[i].portsock)
			aitem.click(callserver)
			$("#pick").append(item)
		}
	})
}

function callserver(evt) {
	evt.preventDefault()
	
	val = "http://" + $(this).data("addr")
	alert("Got click : " + val)
	$("#player").attr("src", val)
}