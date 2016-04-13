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

function generateHtmlMenuOption(item) {
	return '<option value="' + item + '">' + item + '</option>';
}

function populateMenus(array, menuType) {
	var options = array.map(function(item) { return generateHtmlMenuOption(item); });
	var filters = window.document.getElementById(menuType);
	filters.innerHTML += options;
}

function createMenus(array) {

	var menuTypes = {
		category: [],
		dayofweek: [],
		pddistrict: [],
		resolution: []
	}

	for (var item in array) {
		var incident = array[item];
		for (var type in menuTypes) {
			if (menuTypes[type].indexOf(incident[type]) === -1) {
				menuTypes[type].push(incident[type]);
			}
		}
	}
	
	for (var menu in menuTypes) {
		populateMenus(menuTypes[menu], menu);
	}

};


loadData(BASE_URL, createMenus);