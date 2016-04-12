(function(){

	var url = 'https://data.sfgov.org/resource/cuks-n6tp.json?';
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var data = JSON.parse(xhttp.responseText);
			return presentData(data);
		}
	};
	xhttp.open('GET', url, true);
	xhttp.send();

})();

function presentData(data) {
	console.log(data.length);
}