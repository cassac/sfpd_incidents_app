var BASE_URL = "https://data.sfgov.org/resource/cuks-n6tp.json?$limit=5"; // this endpoint newer than `tmnf-yvry.json`
/*
Filter date example: BASE_URL + $where=date between '2014-01-10T12:00:00' and '2015-01-10T14:00:00'
*/

function loadData(url, f) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var data = JSON.parse(xhttp.responseText);
			console.log('data: ', data);
			f(data);
		}
	};
	xhttp.open('GET', url, true);
	xhttp.send();

};

function makeMenus(param) {
	var menu = '<select id="' + param + '"><option value="--">' + param + '</option></select>';
	var filters = window.document.getElementById('filters');
	filters.innerHTML += menu;
}

function populateMenus(array) {
	params = Object.keys(array[0]);
	params.map(makeMenus);
	var category = window.document.getElementById('location');
	console.log(category);
};


loadData(BASE_URL, populateMenus);