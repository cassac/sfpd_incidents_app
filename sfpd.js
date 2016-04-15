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


	Object.defineProperty(this, 'getDateString', {
		get: function() {
			return new Date(this.date).toDateString();
		}
	});

	Object.defineProperty(this, 'toTd', {
		get: function() {
			tds = '';
			for (var item in this) {
				tds += "<td>" + this[item] + "</td>";
			}
			return tds;
		}
	});

	Object.defineProperty(this, 'report', {
		get: function() {
			return 'On ' + this.getDateString + ' at ' + this.time +' in the ' +
				this.pddistrict + ' there was a(n) "' + this.category + '" incident.';
		}
	});

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
			createMenus(data);
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

	var invalidDateAlert = function() {
			alert('Invalid start date. Use correct format YYYY-MM-DD.');
		}

	if (dateStart != '') {
		dateStart = new Date(dateStart);
	}

	if (dateEnd != '') {
		dateEnd = new Date(dateEnd);
	}

	if (dateStart != '' && dateStart == 'Invalid Date') {
		invalidDateAlert();
		return false;
	}

	if (dateEnd != '' && dateEnd == 'Invalid Date') {
		invalidDateAlert();
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
	return Boolean(!time.search('^(?:[0-1][0-9]|2[0-3])(?::[0-5][0-9])$'))
}

function areTimesEmptyOrValid(timeStart, timeEnd) {

	var invalidTimeAlert = function() {
			alert('Invalid start time. Use 24 hr format HH:MM (ex. 08:00, 19:00)');
		}

	if (timeStart != '' && !valid24TimeFormat(timeStart)) {
		invalidTimeAlert();
		return false;
	}

	if (timeEnd != '' && !valid24TimeFormat(timeEnd)) {
		invalidTimeAlert();
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
	} 

}

function formatUrlDateAndTimeParameters(type, array) {

	var start = array[0];
	var end = array[1];

	if (start == '' && end == '') {
		return false;
	} else if (start != '' && end != '') {
		return type + " between '" + start + "' and '" + end + "'";
	} else if (start != '' && end == '') {
		return type + " > '" + array[0] + "'";
	} else {
		return type + " < '" + array[0] + "'";
	}

}

function formatUrlStringParameters(type, array) {
	if (array.length > 0 ) {
		return type + " IN ('" + array.join("', '") + "')";
	} else {
		return false;
	}

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

	var limit;
	var urlExtensions = [];
	var url = BASE_URL.concat('$limit=');

	for (var param in params) {

		var valuesArray = params[param];

		if (param == 'time' || param == 'date') {
			var dateOrTimeValue = formatUrlDateAndTimeParameters(param, valuesArray);
			if (dateOrTimeValue) {
				urlExtensions.push(dateOrTimeValue);
			}
		} else if (param == 'limit') {
			limit = valuesArray;
		} else {
			var stringValue = formatUrlStringParameters(param, valuesArray);
			if (stringValue) {
				urlExtensions.push(stringValue);
			}
			
		}

	}

	url = url.concat(limit);

	if (urlExtensions.length > 0) {
		url += '&$where='.concat(urlExtensions.join(" AND ")) ;
	}

	requestData(url, listData);

}

function listData(array) {
	var dataList = window.document.getElementById('dataList');

	console.log(  getIncidentObj(array[0]).toTd  )

	// var lis = array.map(function(el) {return "<li>" + getIncidentObj(el) +"</li>"})

	// dataList.innerHTML = lis;

}

requestData(BASE_URL+'$limit=100', createMenus);
requestData(BASE_URL+'$limit=100', getIncidents);