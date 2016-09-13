if (typeof RootPath == 'undefined') {
	RootPath = '/';
}

var populateListingPending = false, //prevent populate listing to load more than 1 at a time.
	entriesPerType = { //xs,sm - need to consult with cindy chan.
		'0': 6,
		'1': 12,
		'2': 16,
		'3': 16
	},
	endPointURL = (((RootPath == '/') ? '' : RootPath) + '/jsonreq/event/').replace('//', '/'),
	page = 1,
	rowContainer = $('.listing-entries').find('.row'),
	hashMap = {
		event_type: '',
		product: 'byproduct',
		solution: 'bysolution',
		brand: 'bybrand',
		language: 'bylang'
	};

if ($.fn.multipleSelect) {
	init();
} else {
	// load multiple select stylesheet
	if ($('html').hasClass('ie8')) {
		$('<link/>', {rel: 'stylesheet', href: '/static/library/css/multiple-select.css'}).appendTo('head');
	}

	//load multiple select plugin
	$.getScript("/static/library/jQuery/jquery.multiple.select.js", function () {
		$.fn.multipleSelect.defaults.onOpen = function (elem) {
			var nextElem = $(elem).next(), ul = nextElem.find('ul');

			if (ul.outerHeight() < ul.prop('scrollHeight') && !ul.data('width-fixed')) {
				ul.css('width', ul.outerWidth() + $.position.scrollbarWidth());
				ul.data('width-fixed', true);
			}

			//Check if dropdown needs to be reversed.
			nextElem.css('right', 'auto');

			if (nextElem.offset().left + nextElem.find('ul').outerWidth(true) > $('body').width()) {
				nextElem.css('right', 0);
			}
			else {
				nextElem.css('right', 'auto');
			}
		};

		init();
	});
}

function init() {
	// Local variable value
	var ajaxArr = [],
		filterMap = {
			country: {
				data: {"type": "event country"},
				init: true,
				callback: function (title) {
					$(this).parent().removeClass('hidden');
					$(this).multipleSelect({
						placeholder: title,
						multiple: false,
						selectAll: false,
						single: true,
						onClick: function (view) {
							if (view.value != '') {
								populateDropdowns('state_province', $.extend({}, filterMap['state_province'].data, {country: view.value}), filterMap['state_province'].callback);
							}
						}
					});
					$(this).multipleSelect("uncheckAll");
				}
			},
			event_type: {
				data: {"type": "event type"},
				init: true,
				callback: function (title) {
					$(this).parent().removeClass('hidden');
					$(this).multipleSelect({
						placeholder: getLocalizedContent('EventLabelEventType'),
						minimumCountSelected: 0,
						countSelected: getLocalizedContent('EventLabelEventType') + '&nbsp;(#)',
						selectAllText: getLocalizedContent('LabelAllEvents'),
						allSelected: getLocalizedContent('LabelAllEvents'),
						onClose: function () {
							// minimum one event should be selected
							if (!$("#event_type").multipleSelect("getSelects").length) {
								$("#event_type").multipleSelect("setSelects", [1]);
							}
						}
					});
					$(this).multipleSelect("checkAll");
				}
			},
			event_date: {
				data: {"type": "event dates"},
				init: true,
				callback: function (title) {
					$(this).parent().removeClass('hidden');
					$(this).multipleSelect({
						placeholder: title,
						multiple: false,
						selectAll: false,
						single: true
					});
					$(this).multipleSelect("uncheckAll");
				}
			},
			brand: {
				data: {"type": "event product line"},
				init: true,
				callback: function (title) {
					$(this).parent().removeClass('hidden');
					$(this).multipleSelect({
						placeholder: title,
						multiple: false,
						selectAll: false,
						single: true,
						onClick: function (view) {
							var obj = {brand: view.value};

							$.each(['product', 'solution'], function (i, j) {
								ajaxArr.push(populateDropdowns(j, $.extend({}, filterMap[j].data, obj), filterMap[j].callback));
							});
						}
					});
					$(this).multipleSelect("uncheckAll");
				}
			},
			product: {
				data: {"type": "event product"},
				init: true,
				callback: function (title, prevValue) {
					if (typeof $(this).data('multipleSelect') == 'object') {
						$(this).next().find('ul').remove();
						$(this).multipleSelect('refresh');
						$(this).multipleSelect('setSelects', [prevValue]);
					}
					else {
						$(this).parent().removeClass('hidden');
						$(this).multipleSelect({
							placeholder: title,
							multiple: false,
							selectAll: false,
							single: true,
							onClick: function (view) {
								if (view.value != '') {
									$('#solution').multipleSelect('setSelects', []);
								}
							}
						});
						$(this).multipleSelect("uncheckAll");
					}
				}
			},
			solution: {
				data: {"type": "event solution"},
				init: true,
				callback: function (title, prevValue) {
					if (typeof $(this).data('multipleSelect') == 'object') {
						$(this).next().find('ul').remove();
						$(this).multipleSelect('refresh');
						$(this).multipleSelect('setSelects', [prevValue]);
					}
					else {
						$(this).parent().removeClass('hidden');
						$(this).multipleSelect({
							placeholder: title,
							multiple: false,
							selectAll: false,
							single: true,
							onClick: function (view) {
								if (view.value != '') {
									$('#product').multipleSelect('setSelects', []);
								}
							}
						});
						$(this).multipleSelect("uncheckAll");
					}
				}
			},
			language: {
				data: {"type": "event language"},
				init: true,
				callback: function (title) {
					$(this).parent().removeClass('hidden');
					$(this).multipleSelect({
						placeholder: title,
						multiple: false,
						selectAll: false,
						single: true
					});
					$(this).multipleSelect('setSelects', [getLanguageCode()]);
				}
			},
			state_province: {
				data: {"type": "event state"},
				init: false,
				callback: function (title) {
					if ($(this).find('option').length > 1) {
						$(this).parent().removeClass('hidden').show().find('.ms-parent').removeClass('hidden').show();

						if (typeof $(this).data('multipleSelect') == 'object') {
							$(this).next().find('ul').remove();
							$(this).multipleSelect('refresh');
							//$(this).multipleSelect('setSelects', [prevValue]);
						}
						else {
							$(this).multipleSelect({
								placeholder: title,
								multiple: false,
								selectAll: false,
								single: true
							});
							$(this).multipleSelect("uncheckAll");
							$(this).next().removeClass('hidden');
						}
					}
					else {
						$(this).parent().hide();
					}
				}
			}
		},
		allDropdownLabel = {};

	$(document).ready(function () {
		// filters event handler
		var filterInterval = null, filterElem = $('.filters');

		//Populate all "filter by" dropdowns
		getLocalizedContent(['EventLabelEventType', 'EventLabelDate', 'LabelAllEvents', 'EventLabelRecordedDate', 'EventLabelLocation', 'EventLabelAllDates', 'LabelAllProducts', 'LabelAllProductLines', 'LabelAllSolutions', 'LabelAllLanguages', 'LabelAllCountries', 'LabelAllStates']).done(function () {
			$.each(filterMap, function (id, entry) {
				if (entry.init) {
					ajaxArr.push(populateDropdowns(id, entry.data, entry.callback));
				}
			});

			allDropdownLabel = {
				event_date: getLocalizedContent('EventLabelAllDates'),
				product: getLocalizedContent('LabelAllProducts'),
				brand: getLocalizedContent('LabelAllProductLines'),
				solution: getLocalizedContent('LabelAllSolutions'),
				language: getLocalizedContent('LabelAllLanguages'),
				country: getLocalizedContent('LabelAllCountries'),
				state_province: getLocalizedContent('LabelAllStates')
			};

			//When filters are loaded, execute function 'hashchange'
			$.when.apply(this, ajaxArr).done(function () {
				if (location.hash.length) {
					parseHashTag();
				}

				filterElem.data('continue', true).on('change', 'select', function () {
					if (filterElem.data('continue') && filterInterval === null) {
						filterInterval = setInterval(function () {
							clearInterval(filterInterval);

							setTimeout(function () {
								filterInterval = null;
							}, 100);

							if (ajaxArr.length) {
								$.when(ajaxArr).done(function () {
									populateListing();
									ajaxArr = [];
								});
							}
							else {
								populateListing();
							}
						}, 100);
					}

					setFilterNum();
				});

				ajaxArr = [];

				setFilterNum();
				populateListing();
			}).fail(function () {
				console.log('Failed');
			});
		});

		// to reset drop down selected
		$('body').on('click', '.resetfilter', function (e) {
			e.preventDefault();

			filterElem.data('continue', false);

			// multiselect uncheckall
			filterElem.find('select').each(function () {
				if ($(this).next().is(':visible')) {
					if ($(this).attr('id') == 'event_type') {
						$(this).multipleSelect('checkAll');
					}
					else if ($(this).attr('id') == 'language') {
						$(this).multipleSelect("setSelects", [getLanguageCode()]);
					}
					else {
						$(this).multipleSelect('uncheckAll');

						if ($(this).attr('id') == 'state_province') {
							$(this).parent().hide();
						}
					}
				}
			});

			$.each(['product', 'solution'], function (i, j) {
				ajaxArr.push(populateDropdowns(j, filterMap[j].data, filterMap[j].callback));
			});

			$.when(ajaxArr).done(function () {
				ajaxArr = [];
				filterElem.data('continue', true);
				populateListing(true);
			});
		});

		$('#view-more').on('click', function (e) {
			e.preventDefault();

			$(this).addClass('hidden');

			var top = window.scrollY || $('html').scrollTop();

			populateListing(false).done(function () {
				window.scrollTo(0, top);
			});

			window.scrollTo(0, top);
		});
	});

	function parseHashTag() {
		//Note: This should only be called once if hash tag exist on page load.
		var hash = location.hash.substr(1),
			hashArr = hash.split('_');

		$.each(hashMap, function (filterName, filterMapTo) {
			var regexp = new RegExp('^' + filterMapTo, 'i');

			$.each(hashArr, function (indx, name) {
				if (regexp.test(name)) {
					var elem = $('#' + filterName), selectFilterValue = name.replace(regexp, '');

					setFilterValue(elem, selectFilterValue);

					return false;
				}
			});
		});

		function setFilterValue(elem, val) {
			// support language hash tag other than default locality
			if (elem.multipleSelect('getSelects') != elem.val() || elem.attr('id') == 'language') {
				var value = '';

				// default language override
				if (elem.attr('id') == 'language' && val.length > 1) {
					var digitlocal = setLanguageCode(val);
					elem.multipleSelect('setSelects', [digitlocal]);
				}

				elem.find('option').each(function () {
					if ($(this).text().replace(/[\s\W]/g, '').toLowerCase() == val) {
						elem.multipleSelect('setSelects', [$(this).val()]);
						value = $(this).val();

						return false;
					}
				});

				if (elem.attr('id') == 'brand' && value != '') {
					$.each(['product', 'solution'], function (i, j) {
						populateDropdowns(j, $.extend({}, filterMap[j].data, {brand: value}), filterMap[j].callback);
					});
				}
			}
		}
	}

	function populateDropdowns(dropdown, data, callback) {
		//Find previous value
		var elem = $('#' + dropdown), prevValue = elem.val();

		elem.empty();

		return $.ajax({
			url: endPointURL,
			type: 'POST',
			dataType: 'JSON',
			data: data
		}).done(function (dataopt) {
			if (dropdown != 'event_type') {
				dataopt.title = allDropdownLabel[dropdown];
				elem.append('<option value="">' + dataopt.title + '</option>');
			}

			$.each(dataopt.data, function (key, val) {
				if (val.englishname) {
					elem.append('<option value="' + val.id + '" data-name="' + val.englishname + '">' + val.value + '</option>');
				}
				else if (val.englishvalue) {
					elem.append('<option value="' + val.id + '" data-name="' + val.englishvalue + '">' + val.value + '</option>');
				}
				else {
					elem.append('<option value="' + val.id + '">' + val.value + '</option>');
				}
			});

			if (typeof callback == 'function') {
				callback.call(elem, dataopt.title, prevValue);
			}
		});
	}
}

addResize(function () {
	populateListing(true);

	//reset filter nums
	setFilterNum();
});

// makes ajax call, result list and index
function populateListing(clear) {
	// clear equals true, it would clear listings
	if (typeof clear == 'undefined') {
		clear = true;
	}

	if (populateListingPending) {
		return false;
	}

	buildAHashTag();

	var dataset = getDataSet(!clear), viewMoreButton = $('#view-more');
	;

	if (dataset === false) {
		rowContainer.empty();
		$('#no-results').removeClass('hidden');
		viewMoreButton.addClass('hidden');

		return false;
	}

	populateListingPending = true;

	return $.ajax({
		url: endPointURL,
		type: 'POST',
		dataType: 'JSON',
		data: dataset,
		beforeSend: function () {
			$('#ui-loader').show();
		}
	}).done(function (dataopt) {
		populateListingPending = false;

		$('#ui-loader').hide();

		if (clear) {
			rowContainer.empty();
		}

		$.each(dataopt.data, function (key, val) {
			if (val.typeid == 1) {
				event_bg = 'bg-green';
				event_img = 'online-event.jpg';
			}
			else if (val.typeid == 2) {
				event_bg = 'bg-purple';
				event_img = 'in-person-event.jpg';
			}
			else if (val.typeid == 3) {
				event_bg = 'bg-orange';
				event_img = 'webcast.jpg';
			}

			var htmlFragment = '<div class="col-md-3 col-sm-4 col-xs-12" style="display: none;"> ' +
				'<a href="' + val.url + '">' +
				'  <div class="border-grey img-crop">' +
				'    <p class="img-header-overlay ' + event_bg + ' "> ' + val.eventtype + ' </p>' +
				'    <img class="img-responsive center-block" src="/images/shared/listing-entries/' + event_img + '" alt=""> ' +
				'  </div> ' +
				'  <h4 class="text-blue dotdotdot" data-max-line="3">' + val.title + ' </h4> ' +
				'  <p class="teaser dotdotdot" data-max-line="5"> ' + $('<div>' + val.description + '</div>').text() + ' </p>';

			if ($.inArray(val.typeid, [1, 2]) > -1) {
				htmlFragment += '<p class="dates">' + getLocalizedContent('EventLabelDate') + ': ' + val.date + '</p>';
			}
			else if (val.typeid == 3) {
				htmlFragment += '<p>' + getLocalizedContent('EventLabelRecordedDate') + ': ' + val.recordeddate + '</p>';
			}

			if (val.location) {
				htmlFragment += '<p>' + getLocalizedContent('EventLabelLocation') + ': ' + val.location + '</p>';
			}

			htmlFragment += '</a></div>';

			rowContainer.append(htmlFragment);

			if ((pageType >= 2 && ((key + 1) % 4 == 0) && key != 0) || (pageType == 1 && ((key + 1) % 3 == 0) && key != 0)) {
				rowContainer.append('<div class="clearfix">');
			}
		});

		//TODO: total record counts < pages x 16 or 12 hide View More button
		if (dataopt.total) {
			$('#no-results').addClass('hidden');

			if (dataopt.total > entriesPerType[pageType] * page) {
				viewMoreButton.removeClass('hidden');
			}
			else {
				viewMoreButton.addClass('hidden');
			}
		}
		else {
			$('#no-results').removeClass('hidden');
			viewMoreButton.addClass('hidden');
		}

		// add total results number
		$('.total_results').html(dataopt.total);

		setTimeout(function () {
			rowContainer.find('> div').filter(':not(:visible)').show().css('opacity', 0).animate({'opacity': 1}, 500, function () {
				processEllipsis(this);
			});
		}, 100);
	});
}

// Generates hash from selected filters and tabs
function buildAHashTag() {
	var hashArr = [], top = window.scrollY || $('html').scrollTop();

	$.each(hashMap, function (id, prefix) {
		var elem = $('#' + id), val = elem.multipleSelect('getSelects');

		if (id == 'event_type') {
			if (val.length == 1) {
				elem.find('option').each(function () {
					if ($(this).attr('value') == val[0]) {
						hashArr.push($.trim($(this).data('name') || $(this).text()).toLowerCase().replace(/[\s\W]/g, ''));

						return false;
					}
				});
			}
		}
		else if (id != 'language' || (id == 'language' && parseInt(val[0]) != getLanguageCode())) {
			elem.find('option').each(function () {
				if ($(this).attr('value') == val[0]) {
					hashArr.push(prefix + $.trim($(this).data('name') || $(this).text()).toLowerCase().replace(/[\s\W]/g, ''));

					return false;
				}
			});
		}
	});

	if (hashArr.length) {
		var newHash = hashArr.join('_');
		location.hash = (newHash == '') ? ' ' : newHash;
	}
	else {
		location.hash = ' ';
	}

	window.scrollTo(0, top);
}

function getLanguageCode() {
	var langval = 53;

	switch (RootPath) {
		case '/br-pt/':
			langval = 139;
			break;
		case '/mx-es/':
			langval = 156;
			break;
		case '/cn-zh/':
			langval = 202;
			break;
		case '/jp-ja/':
			langval = 109;
			break;
		case '/fr-fr/':
			langval = 75;
			break;
		case '/de-de/':
			langval = 86;
			break;
	}

	return langval;
}

function setLanguageCode(localstr) {
	var tmp = localstr.toLowerCase();
	var langval = 53;
	switch (tmp) {
		case 'portuguese':
			langval = 139;
			break;
		case 'spanish':
			langval = 156;
			break;
		case 'chinese':
			langval = 202;
			break;
		case 'japanese':
			langval = 109;
			break;
		case 'french':
			langval = 75;
			break;
		case 'german':
			langval = 86;
			break;
		case 'dutch':
			langval = 50;
			break;
		case 'italian':
			langval = 106;
			break;
		case 'korean':
			langval = 117;
			break;
	}
	return langval;
}


// iterates selected filters and createsd dataset for ajax call
function getDataSet(incrementPage) {
	//incrementPage - We assume that if the list is not cleared that we are going to load the next page.

	page = incrementPage ? ++page : 1;

	var dataset = {
			"type": "event list",
			"page": page,
			"pagesize": entriesPerType[pageType]
		},
		mapping = {
			eventtypes: 'event_type',
			daterange: 'event_date',
			product: 'product',
			solution: 'solution',
			brand: 'brand',
			language: 'language',
			country: 'country',
			state: 'state_province'
		},
		hasError = false;

	$.each(mapping, function (key, id) {
		var val = $('#' + id).val();

		if (id == 'event_type') {
			if (val === null || val === undefined) {
				hasError = true;
				return false;
			}

			dataset[key] = val.join(',');
		}
		else if (id == 'event_date') {
			dataset[key] = (val === null || val === undefined) ? 'All' : val;
		}
		else {
			dataset[key] = val;
		}
	});

	return hasError ? false : dataset;
}

function setFilterNum() {
	var counter = 0;

	$('.filters').find('select').each(function () {
		if (($(this).is(':visible') || pageType == 0) && $(this).data('multipleSelect') !== undefined) {
			var selects = $(this).multipleSelect('getSelects');

			if (selects.length == 1) {
				if (selects[0] != '') {
					counter++;
				}
			}
			else {
				counter += selects.length;
			}
		}
	});

	$('.filter-num').text(counter);
}