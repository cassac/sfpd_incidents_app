var BASE_URL = "https://data.sfgov.org/resource/cuks-n6tp.json?"; // this endpoint newer than `tmnf-yvry.json`
/*
Referemce: https://dev.socrata.com/foundry/data.sfgov.org/cuks-n6tp

Filter date example: BASE_URL + $where=date between '2014-01-10T12:00:00' and '2015-01-10T14:00:00'

https://data.sfgov.org/resource/cuks-n6tp.json?$where=category IN ('ASSAULT', 'KIDNAPPING') AND dayofweek IN ('Monday', 'Saturday') AND date between '2014-01-10T12:00:00' and '2015-01-10T14:00:00' 
*/

function Incident(address, category, date, dayofweek, descript,
					incidntnum, location, pddistrict, pdid,
					resolution, time, x, y) {

	this.incidntnum = incidntnum;
	this.date = date;
	this.time = time;
	this.address = address;
	this.category = category;
	this.dayofweek = dayofweek;
	this.descript = descript;
	this.location = location;
	this.pddistrict = pddistrict;
	this.pdid = pdid;
	this.resolution = resolution;
	this.x = x;
	this.y = y;


	Object.defineProperty(this, 'getDateString', {
		get: function() {
			return new Date(this.date).toDateString();
		}
	});

	Object.defineProperty(this, 'getTableRow', {

		get: function() {

			var targetItems = ['category', 'incidntnum', 'pddistrict', 'time'];

			function isTargetItem(item) {

				return targetItems.indexOf(item) > -1;
			
			}

			var tableData = '<tr>';
			
			for (var item in this) {

				var value;
	
				if (item == 'date') {

					value = this.getDateString;

				} else if (isTargetItem(item)) {

					value = this[item];
				
				} else {

					continue;
				
				}
	
				tableData += "<td>" + value.split(',')[0] + "</td>";
	
			}

			return tableData + '</tr>';

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

function getCollectionValues(collection) {

	return [].slice.call(collection).map(function(item){ return item.value });

}

function generateHtmlMenuOption(item) {

	return '<option value="' + item + '">' + item + '</option>';

}

function populateMenus(array, menuType) {

	var options = '';
	var filters = window.document.getElementById(menuType);
	var existingFilters = getCollectionValues(filters);

	for (var item in array) {

		if (existingFilters.indexOf(array[item]) == -1) {
		
			options += generateHtmlMenuOption(array[item]);
		
		}
	
	}

	if (options.length>0) {

		filters.innerHTML += options;

	}


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

function valid24HrTimeFormat(time) {

	return time.search('^(?:[0-1][0-9]|2[0-3])(?::[0-5][0-9])$') > -1;

}

function areTimesEmptyOrValid(timeStart, timeEnd) {

	var invalidTimeAlert = function() {
		
			alert('Invalid start time. Use 24 hr format HH:MM (ex. 08:00, 19:00)');
		
		}

	if (timeStart != '' && !valid24HrTimeFormat(timeStart)) {
		
		invalidTimeAlert();
		
		return false;

	}

	if (timeEnd != '' && !valid24HrTimeFormat(timeEnd)) {
		
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

	if (areDatesEmptyOrValid(dateStart, dateEnd) && areTimesEmptyOrValid(timeStart, timeEnd)) {
	
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

	if (array.length > 0 && array[0] != '') {

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

	return param.some(function(element){ return element.length > 0});

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

		url += '&$where='.concat(urlExtensions.join(" AND "));

	}

	// url += '&$order=incidntnum DESC';

	// requestData(url, listData);
	requestData(url, initiateStats);
	console.log(url);

}

function listData(array) {

	var dataList = window.document.getElementById('dataTableBody');

	var trs = array.map(function(el) { return getIncidentObj(el).getTableRow });

	dataTableBody.innerHTML = trs.join('');

}

function populateArray(length) {
	var array = [];
	for (var i = 0; i < length; i++) {
		array.push(0);
	}
	return array;
}

var daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday',
	'Friday', 'Saturday', 'Sunday']

function normalizeStats(array) {

	var sum = array.reduce(function(p, c){ return p + c; });

	for (var el in array) {
		array[el] = Math.round(((array[el] / sum) * 100));
	}

	return array;

}

function getTDs(amount) {
	var tds = '';
	for (var i = 0; i < amount; i++) {
		tds += '<td></td>';
	}
	return tds;
}

function displayStats(array, title) {

	var tableStart = "<div class='statsTable'><table><theader>" + title + "</theader><tbody>";
	var tableEnd = "</tbody></table></div>";

	var tableBody = '';

	for (var el in array) {

		tableBody += '<tr><th>' + el + '</th>' + getTDs(array[el]) + '</tr>';

	}

	return tableStart + tableBody + tableEnd;

}

function initiateStats(array) {

	var monthly = populateArray(12);
	var daily = populateArray(7);
	var hourly = populateArray(24);

	for (var el in array) {

		var incident = array[el];
		var month = parseInt(incident.date.split('-')[1]) - 1;
		var day = daysOfWeek.indexOf(incident.dayofweek);
		var hour = parseInt(incident.time.split(':')[0]);

		monthly[month] += 1;
		daily[day] += 1;
		hourly[hour] += 1;
		
	}

	var monthlyNormalized = displayStats(normalizeStats(monthly), 'Monthly');
	var dailyNormalized = displayStats(normalizeStats(daily), 'Daily');
	var hourlyNormalized = displayStats(normalizeStats(hourly), 'Hourly');

	window.document.getElementById('dataStats').innerHTML = hourlyNormalized +
		dailyNormalized + monthlyNormalized;

}


// requestData(BASE_URL+'$limit=100', createMenus);
// requestData(BASE_URL+'$limit=100', getIncidents);