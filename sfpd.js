var BASE_URL = "https://data.sfgov.org/resource/cuks-n6tp.json?$limit=5"; // this endpoint newer than `tmnf-yvry.json`
/*
Filter date example: BASE_URL + $where=date between '2014-01-10T12:00:00' and '2015-01-10T14:00:00'
*/

function Incident(address, category, date, dayofweek, descript,
					incidntnum, location, pddistrict, pdid,
					resolution, time, x, y) {

	this.address = address;
	this.category = category;
	this.date = date;
	this.dayofweek = dayofweek;
	this.descript = descript;
	this.incidntnum = incidntnum;
	this.location = location;
	this.pddistrict = pddistrict;
	this.pdid = pdid;
	this.resolution = resolution;
	this.time = time;
	this.x = x;
	this.y = y;

}

Incident.prototype.report = function(incident) {
	console.log('On', this.date, this.dayofweek, 'at', this.time,'a\nin the',
		this.pddistrict, 'there was a(n)', this.category,'incident.')
}

function getIncidentObj(incident) {
	var newIncident = new Incident();
	for (var item in incident) {
		newIncident[item] = incident[item];
	}
	return newIncident;
}

function requestData(url, f) {
	
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

}

function getIncidents(array) {
	incidents = [];
	for (var incident in array) {
		incidents.push(array[incident]);
	}
	return incidents;
}

var filterFormSubmitBtn = window.document.getElementById('filterSubmit');

filterFormSubmitBtn.addEventListener('click', function(e) { 
	e.preventDefault();
	var form = window.document.getElementById('filterForm');
	var selectedCategory = form.category.value;
	var formElements = [];
	for (var i = 0; i < form.elements.length - 1; i++) {
		console.log(form.elements[i].value);
	}

});



requestData(BASE_URL, createMenus);
requestData(BASE_URL, getIncidents);