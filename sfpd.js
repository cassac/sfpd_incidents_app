var BASE_URL = "https://data.sfgov.org/resource/cuks-n6tp.json?"; // this endpoint newer than `tmnf-yvry.json`
/*
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

	e.preventDefault();
	parseForm();

});

function parseForm() {

	var urlLimitParam;
	var urlParameters = [];
	var form = window.document.getElementById('filterForm');

	for (var i = 0; i < form.elements.length - 1; i++) {

		var el = form.elements[i];
		// console.log(el.name, el.name=='limit');
		var urlParam = {};
		urlParam[el.name] = [];

		if (el.name == 'limit') {
			urlLimitParam = el.value;
		} 
		else if (typeof el.selectedOptions != 'undefined' && el.selectedOptions.length > 0) {
			var options = el.selectedOptions;
			urlParam[el.name] = [];
			for (var j = 0; j < options.length; j++) {
				urlParam[el.name].push(options[j].value);
			}
		} 
		else if (el.value) {
			urlParam[el.name].push(form.elements[i].value);
		}

		if (urlParam[el.name].length > 0) {
			urlParameters.push(urlParam);
		}

	}

	constructUrl(urlParameters, urlLimitParam);
}

function formatUrlDateAndTimeParameters(type, array) {
	return type + " between '" + array[0] + "'' and '" + array[1] +"'";
}

function formatUrlStringParameters(type, array) {
	return type + " IN ('" + array.join("', '") + "')";
}

function formatUrlParameters(array) {

	var urlTail = '$where='
	
	for (var i in array) {

		var obj = array[i];
		var urlParam = Object.keys(obj)[0];
		var urlParamArgs = obj[urlParam];
		var checkIfDateOrTime = urlParam.slice(0,4);	

		if (checkIfDateOrTime == 'date' || checkIfDateOrTime == 'time') {

			var urlExt = formatUrlDateAndTimeParameters(urlParam, urlParamArgs);

		} else {
			var urlExt = formatUrlStringParameters(urlParam, urlParamArgs);

		}

		urlTail += urlExt;

		if (i != array.length - 1) {
			urlTail += ' AND ';
		}

	}

	console.log(urlTail);
}

function constructUrl(urlParameters, limit) {

	if (typeof limit == 'undefined')
		limit = 100;

	var url = BASE_URL.concat('$limit=', limit, '&');

	if (urlParameters.length > 0) {
		formatUrlParameters(urlParameters);
	} else {
		return url;
	}

}


requestData(BASE_URL+'$limit=100', createMenus);
requestData(BASE_URL+'$limit=100', getIncidents);