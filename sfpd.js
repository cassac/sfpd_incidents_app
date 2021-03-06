'use strict';

(function(){

var BASE_URL = "https://data.sfgov.org/resource/cuks-n6tp.json?";

function Incident(address, category, date, dayofweek, descript, incidntnum, location, pddistrict,
                  pdid, resolution, time, x, y) {

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

}

Incident.prototype.report = function report() {
  var thisDate = new Date(this.date);

  return ' On ' + thisDate.toDateString() + ' at ' + this.time +' in the ' +
    this.pddistrict + ' district at ' + this.address + ' there was a(n) "' +
    this.category + '" incident - (PD ID: '+ this.pdid +'). ';

};

function getIncidentObj(incident) {
  var newIncident = new Incident();

  for (var item in incident) {
    newIncident[item] = incident[item];
  }

  return newIncident;

}

function requestData(url, funct) {
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function xhttpRequestData() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      document.getElementById('loading').style.display='none';
      var data = JSON.parse(xhttp.responseText);
      funct(data);
      createMenus(data);
    }
  };

  xhttp.open('GET', url, true);
  xhttp.send();

}

function getCollectionValues(collection) {

  return [].slice.call(collection).map(function(item) { return item.value });

}

function generateHtmlMenuOption(item) {

  return '<option value="' + item + '">' + item + '</option>';

}

function populateMenus(array, menuType) {
  var options = '';
  var filters = document.getElementById(menuType);
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

document.getElementById('filterSubmit').onclick = function submitForm(e) {
  document.getElementById('loading').style.display='block';
  var form = document.getElementById('filterForm');
  e.preventDefault();
  parseForm(form);
}

document.getElementById('modalDiv').onclick = function modalClick() {
  /* 
  Explicitly references element instead of using the event handlers arguments
  because modalDiv's children may inadvertently be clicked
  */
  document.getElementById('modalDiv').style.display = 'none';
}

function properOrder(arg1, arg2) {

  return arg1 < arg2;

}

function areDatesEmptyOrValid(dateStart, dateEnd) {
  var invalidDateAlert = function invalidDateAlert() {
      alert('Invalid start date. Use correct format YYYY-MM-DD.');
    }

  if (dateStart) {
    dateStart = new Date(dateStart);
  }

  if (dateEnd) {
    dateEnd = new Date(dateEnd);
  }

  if (dateStart && dateStart == 'Invalid Date') {
    invalidDateAlert();

    return false;

  }

  if (dateEnd && dateEnd == 'Invalid Date') {
    invalidDateAlert();

    return false;

  }

  if (dateStart && dateEnd) {
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

  var invalidTimeAlert = function invalidTimeAlert() {
      alert('Invalid start time. Use 24 hr format HH:MM (ex. 08:00, 19:00)');
    }

  if (timeStart && !valid24HrTimeFormat(timeStart)) {
    invalidTimeAlert();

    return false;

  }

  if (timeEnd && !valid24HrTimeFormat(timeEnd)) {
    invalidTimeAlert();

    return false;

  }

  if (timeStart && timeEnd) {
    if (!properOrder(timeStart, timeEnd)) {
      alert('Start time must be prior to end time');

      return false;

    }
  }

  return true;

}

function parseForm(form) {
  var elements = form.elements;
  var outputtype = form.outputType.value;
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
    constructUrl(urlParameters, outputtype);
  } else {
    document.getElementById('loading').style.display='none';
  }

}

function formatUrlDateAndTimeParameters(type, array) {
  var start = array[0];
  var end = array[1];

  if (!start && !end) {

    return false;

  } else if (start&& end) {

    return type + " between '" + start + "' and '" + end + "'";

  } else if (start && !end) {

    return type + " > '" + start + "'";

  } else {

    return type + " < '" + end + "'";

  }

}

function formatUrlStringParameters(type, array) {
  if (array.length && array[0]) {

    return type + " IN ('" + array.join("', '") + "')";

  } else {

    return false;

  }

}


function stringValueExists(param) {
  if (typeof param != 'undefined' && param.length) {

    return true;

  } else {

    return false;

  }

}

function dateOrTimeValueExists(param) {

  return param.some(function(element) { return element.length > 0});

}

function createLi(ul, item) {
  var li = document.createElement('li');
  li.appendChild(document.createTextNode(item));
  ul.appendChild(li);

  return ul;

}

function createQueryDiv(array, limit) {
  var div = document.createElement('div');
  var h3 = document.createElement('h3');
  var ul = document.createElement('ul');
  var span = document.createElement('span');

  ul.setAttribute('class', 'queryUl');
  span.setAttribute('id', 'amountSpan');
  createLi(ul, 'Limit: ' + limit);

  if (array.length) {
    array.forEach(function(el) {
      createLi(ul, el);
    });
  }

  h3.innerHTML = 'Current Query';
  div.appendChild(h3);
  div.appendChild(span);
  div.appendChild(ul);

  return div.innerHTML;

}

function constructUrl(params, outputtype) {
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

  if (urlExtensions.length) {
    url += '&$where='.concat(urlExtensions.join(" AND "));
  }

  document.getElementById('dataColumn').innerHTML = createQueryDiv(urlExtensions, limit);

  if (outputtype == 'graph') {
    requestData(url, initiateStats);
  } else {
    requestData(url, listData);
  }

}


function populateArray(length) {
  var array = [];

  for (var i = 0; i < length; i++) {
    array.push(0);
  }

  return array;

}

function normalizeStats(array) {
  var sum = array.reduce(function(p, c) { return p + c; });

  for (var el in array) {
    array[el] = Math.round(((array[el] / sum) * 100));
  }

  return array;

}

function distributionTableData(amount) {
  var tableData = [];

  for (var i = 0; i < amount; i++) {
    var td = document.createElement('td');
    tableData.push(td);
  }

  return tableData;

}

function createTable(array, title, funct) {
  var table = document.createElement('table');
  var tbody = document.createElement('tbody');
  var thead = document.createElement('thead');
  var tr = document.createElement('tr');
  var th = document.createElement('th');

  table.setAttribute('class', title.split(' ').join(''));
  th.innerHTML = title;
  tr.appendChild(th);
  thead.appendChild(tr);
  table.appendChild(thead);

  for (var el in array) {
    var tdArray;
    var tr = document.createElement('tr');
    var th = document.createElement('th');
    var td = document.createElement('td');
    th.innerHTML = el;
    tr.appendChild(th);
    tdArray = funct(array[el]);
    tdArray.forEach(function(td) {
      tr.appendChild(td)
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  return table;

}


function displayModalDiv(array) {
  var modalContent = document.getElementById('modalContent');

  var incidents = array.forEach(function(el, idx) {
    modalContent.innerText += getIncidentObj(el).report();
  });

}

function viewIncidentDetails(event) {
  var incidentId = event.target.innerText;
  var url = BASE_URL.concat('incidntnum=', incidentId);
  var modalDiv = document.getElementById('modalDiv');
  var modalTitle = document.getElementById('modalTitle');
  var modalContent = document.getElementById('modalContent');
  modalContent.innerText = '';
  modalTitle.innerText = 'Incident #'.concat(incidentId);
  modalDiv.style.display = 'block';
  requestData(url, displayModalDiv);

}

function tabularTableData(obj) {
  var targetProp = ['category', 'pddistrict', 'time'];

  var isTargetProp = function isTargetProp(item) {

    return targetProp.indexOf(item) > -1;

  }

  var tableData = [];

  for (var prop in obj) {
    var value;
    var td = document.createElement('td');

    if (prop == 'date') {
      value = new Date(obj.date).toDateString();
    } else if (prop == 'incidntnum') {
      value = obj[prop];
    } else if (isTargetProp(prop)) {
      value = obj[prop];
    } else {
      continue;
    }

    td.innerHTML = value.split(',')[0];

    if (prop == 'incidntnum') {
      td.setAttribute('class', 'incidentTd')
      td.onclick = viewIncidentDetails;
    }

    tableData.push(td);

  }

  return tableData;


}

function listReturnedAmount(amount) {
  var span = document.getElementById('amountSpan');
  span.innerHTML = 'Returned ' + amount + ' incidents using the filters below:';
}

function listData(array) {
  var dataColumn = document.getElementById('dataColumn');
  var table = createTable(array, 'Tabular Data', tabularTableData);
  dataColumn.appendChild(table);
  listReturnedAmount(array.length);
}

function appendTables(targetEl, array) {
  array.forEach(function(el) {
    var div = document.createElement('div');
    div.setAttribute('class', 'tableDiv');
    div.appendChild(el);
    targetEl.appendChild(div);
  })

  return targetEl;

}

function initiateStats(array) {
  var daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday','Friday', 'Saturday', 'Sunday'];
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

  var monthlyNormalized = createTable(normalizeStats(monthly), 'Monthly', distributionTableData);
  var dailyNormalized = createTable(normalizeStats(daily), 'Daily', distributionTableData);
  var hourlyNormalized = createTable(normalizeStats(hourly), 'Hourly', distributionTableData);
  var dataColumn = document.getElementById('dataColumn');

  appendTables(dataColumn, [hourlyNormalized, dailyNormalized, monthlyNormalized]);
  listReturnedAmount(array.length);

}

document.getElementById('loading').style.display='block';

// Initial API call to populate filter menus
requestData(BASE_URL+'$limit=2000', createMenus);

})();