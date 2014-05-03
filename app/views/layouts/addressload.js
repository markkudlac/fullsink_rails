
//////*************** Below is for online polling fullsink.com  **************////

function initAjax() {
	
	$(document).ajaxError(function(ev,xhdr,status,err) {
		alert("Ajax error : "+err)
		console.log(status)
	})
	
	$(document).ajaxStart(function() {
		console.log("Ajax Start")
	})
}


function initOnLine() {
	
	maxpollcnt = 30;		// Numer of polls to make to server -1 means none
	
//	butonIndicator($('#refresh'), true)


//		routerLookup($("#userhandle").val());
		routerLookup();
		timeid = setInterval(pollRouterLookup, 10000)
	}



	function routerLookup() {

//		$.get('<%= url %>'+"/api/router",{userhandle: userhandle},processAddress);
		$.get('<%= url %>'+"/api/router",{},processAddress);

		++pollcount;
			console.log("In routerLookup count : " + pollcount)
		if (pollcount >= maxpollcnt) {
			clearPoll()
		}
	}



//////*************** Below is for offline local serving  **************////



function baseURL(){
	return("http://"+parseUri(window.location).host+":" +
				parseUri(window.location).port+"/")
}


function loadAdressandPage() {

	var fullurl = baseURL() + "FlSkHtml/serverid.json"
		console.log("Send get for serverid : "+fullurl);
		

		
	$.getJSON(fullurl,null,function(data){
		  var conn = {
//				userhandle:"Test Handle",
//				ipadd:"192.168.1.102",
//				portsock:8887,
//				porthttpd:8080
			}
		
			conn.ipadd = parseUri(window.location).host
			conn.porthttpd = parseUri(window.location).port
			console.log("Back with serverid socketport data : " + data.port)
//			createWebSocket(parseUri(window.location).host, data.port)
			conn.userhandle = data.id;
			conn.portsock = data.port

			processAddress([ conn ])
		})
}


function initOffLine() {
	
//	$("#refresh").button("disable")
	$("#remotebut").button("disable")
	
//	$("#userhandle").attr("disabled",true)
	
	loadAdressandPage()
	
}



function parseUri (str) {
        var     o   = parseUri.options,
                m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
                uri = {},
                i   = 14;

        while (i--) uri[o.key[i]] = m[i] || "";

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
                if ($1) uri[o.q.name][$1] = $2;
        });

        return uri;
};

parseUri.options = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host",
				"port","relative","path","directory","file","query","anchor"],
        q:   {
                name:   "queryKey",
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
}

