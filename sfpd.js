var BASE_URL = "https://data.sfgov.org/resource/cuks-n6tp.json?"; // this endpoint newer than `tmnf-yvry.json`
/*
Referemce: https://dev.socrata.com/foundry/data.sfgov.org/cuks-n6tp

Filter date example: BASE_URL + $where=date between '2014-01-10T12:00:00' and '2015-01-10T14:00:00'

https://data.sfgov.org/resource/cuks-n6tp.json?$where=category IN ('ASSAULT', 'KIDNAPPING') AND dayofweek IN ('Monday', 'Saturday') AND date between '2014-01-10T12:00:00' and '2015-01-10T14:00:00' 
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

	var form = window.document.getElementById('filterForm');

	e.preventDefault();
	parseForm(form);

});

function getCollectionValues(collection) {
	return [].slice.call(collection).map(function(item){ return item.value });
}

function properOrder(arg1, arg2) {
	return arg1 < arg2;
}

function areDatesEmptyOrValid(dateStart, dateEnd) {

	if (dateStart != '') {
		dateStart = new Date(dateStart);
	}

	if (dateEnd != '') {
		dateEnd = new Date(dateEnd);
	}

	if (dateStart != '' && dateStart == 'Invalid Date') {
		alert("Invalid start date");
		return false;
	}

	if (dateEnd != '' && dateEnd == 'Invalid Date') {
		alert("Invalid end date");
		return false;
	}	

	if (dateStart != '' && dateEnd != '') {
		if (!properOrder(dateStart, dateEnd)) {
			alert('Start date must be prior to end date')
			return false;
		}
	}

	return true;

}

function valid24TimeFormat(time) {
	// Regex returns 0 if true and -1 if false. Therefore, Boolean is used
	// to convert 0 to `return true` and -1 to `retrun false` 
	return Boolean(!time.search('^(?:[0-1]?[0-9]|2[0-3])(?::[0-5][0-9])$'))
}

function areTimesEmptyOrValid(timeStart, timeEnd) {

	if (timeStart != '' && !valid24TimeFormat(timeStart)) {
		alert('Invalid start time');
		return false;
	}

	if (timeEnd != '' && !valid24TimeFormat(timeEnd)) {
		alert('Invalid end time');
		return false;
	}

	if (timeStart != '' && timeEnd != '') {
		if (!properOrder(timeStart, timeEnd)) {
			alert('Start time must be prior to end time');
			return false;
		}
	}

	return true;

}

function parseForm(form) {

	var elements = form.elements;

	var category = getCollectionValues(elements.category.selectedOptions);
	var dayofweek= getCollectionValues(elements.dayofweek.selectedOptions);
	var pddistrict = getCollectionValues(elements.pddistrict.selectedOptions);
	var resolution = getCollectionValues(elements.resolution.selectedOptions);
	var dateStart = elements.dateStart.value.trim();
	var dateEnd = elements.dateEnd.value.trim();
	var timeStart = elements.timeStart.value.trim();
	var timeEnd = elements.timeEnd.value.trim();
	var limit = elements.limit.value.trim();


	var urlParameters = {
		category: category,
		dayofweek: dayofweek,
		pddistrict: pddistrict,
		resolution: resolution,
		date: [dateStart, dateEnd],
		time: [timeStart, timeEnd],
		limit: limit
	}

	if(areDatesEmptyOrValid(dateStart, dateEnd) && areTimesEmptyOrValid(timeStart, timeEnd)){
		constructUrl(urlParameters);
	} else {
		alert('There was an error while parsing the form.');
	}

}

function formatUrlDateAndTimeParameters(type, array) {
	return type + " between '" + array[0] + "'' and '" + array[1] +"'";
}

function formatUrlStringParameters(type, array) {
	return type + " IN ('" + array.join("', '") + "')";
}


function stringValueExists(param) {

	if (typeof param != 'undefined' && param.length > 0) {
		return true;
	} else {
		return false;
	}

}

function dateOrTimeValueExists(param) {
	return param.some(function(element){ return element.length > 0})
}

function constructUrl(params) {

	var url = BASE_URL.concat('$limit=', params.limit, '&$where=');

	if (stringValueExists(params.category)) {
		url += formatUrlStringParameters('category', params.category);
	} else if (stringValueExists(params.dayofweek)) {
		url += formatUrlStringParameters('dayofweek', params.dayofweek);
	} else if (stringValueExists(params.pddistrict)) {
		url += formatUrlStringParameters('pddistrict', params.pddistrict);
	} else if (stringValueExists(params.resolution)) {
		url += formatUrlStringParameters('resolution', params.resolution);	
	} else if (dateOrTimeValueExists(params.date)) {
		url += formatUrlDateAndTimeParameters('date', params.date);	
	} else if (dateOrTimeValueExists(params.time)) {
		url += formatUrlDateAndTimeParameters('time', params.time);	
	}


	console.log(url);


}


requestData(BASE_URL+'$limit=100', createMenus);
requestData(BASE_URL+'$limit=100', getIncidents);