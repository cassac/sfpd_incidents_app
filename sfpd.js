var BASE_URL = 'https://data.sfgov.org/resource/cuks-n6tp.json?'

function loadData(url, f) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var data = JSON.parse(xhttp.responseText);
			f(data);
		}
	};
	xhttp.open('GET', url, true);
	xhttp.send();

};

loadData(BASE_URL, function(stuff){ console.log(stuff); });