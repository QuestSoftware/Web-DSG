if (typeof RootPath == 'undefined') {
	RootPath = '/';
}

var populateListingPending = false, //prevent populate listing to load more than 1 at a time.
	endPointURL = (((RootPath == '/') ? '' : RootPath) + '/jsonreq/product/').replace('//', '/'),
	listingContainer = $('.listing-entries'),
	entryContainer = listingContainer.find('.col-xs-12'),
	hashMap = {
		solution: 'bysolution',
		brand: 'bybrand'
	},
	range = [
		{
			range: /^[ab]/i,
			id: 'A-B'
		},
		{
			range: /^[cd]/i,
			id: 'C-D'
		},
		{
			range: /^[ef]/i,
			id: 'E-F'
		},
		{
			range: /^[g-m]/i,
			id: 'G-M'
		},
		{
			range: /^[n-r]/i,
			id: 'N-R'
		},
		{
			range: /^[s]/i,
			id: 'S'
		},
		{
			range: /^[t-x]/i,
			id: 'T-X'
		}
	],
	previous = {dataset: null, response: null};

$('#affix-nav').on('click', '.disabled a', function(e) {
	e.stopImmediatePropagation();
});

if($.fn.matchHeight) {

}
else {
	$.getScript('/static/library/jQuery/jquery.matchheight.min.js').done(function () {

	});
}

if ($.fn.multipleSelect) {
	init();
}
else {
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
			brand: {
				data: {"type": "product line"},
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

							$.each(['solution'], function (i, j) {
								ajaxArr.push(populateDropdowns(j, $.extend({}, filterMap[j].data, obj), filterMap[j].callback));
							});
						}
					});
					$(this).multipleSelect("uncheckAll");
				}
			},
			solution: {
				data: {"type": "solution"},
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
			}
		},
		allDropdownLabel = {};

	$(document).ready(function () {
		// filters event handler
		var filterInterval = null, filterElem = $('.filters');

		//Populate all "filter by" dropdowns
		getLocalizedContent(['EventLabelEventType', 'EventLabelDate', 'LabelAllEvents', 'EventLabelRecordedDate', 'EventLabelLocation', 'EventLabelAllDates', 'LabelAllProductLines', 'LabelAllSolutions']).done(function () {
			$.each(filterMap, function (id, entry) {
				if (entry.init) {
					ajaxArr.push(populateDropdowns(id, entry.data, entry.callback));
				}
			});

			allDropdownLabel = {
				brand: getLocalizedContent('LabelAllProductLines'),
				solution: getLocalizedContent('LabelAllSolutions')
			};

			//When filters are loaded, execute function 'hashchange'
			$.when.apply(this, ajaxArr).done(function () {
				$('.filters').css('opacity', 1);

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
					$(this).multipleSelect('uncheckAll');
				}
			});

			$.each(['solution'], function (i, j) {
				ajaxArr.push(populateDropdowns(j, filterMap[j].data, filterMap[j].callback));
			});

			$.when(ajaxArr).done(function () {
				ajaxArr = [];
				filterElem.data('continue', true);
				populateListing();
			});
		});

		$('body').on('offcanvas.hidden', function() {
			processEllipsis('.listing-entries').done(function() {
				setTimeout(function() {
					if(pageType > 0) {
						if(location.search == '?v2') {
							listingContainer.find('.row').each(function() {
								var columns = $(this).find('> div'),
									firstColumn = $(columns.get(0)),
									lastColumn = $(columns.get(1));

								firstColumn.find('a').each(function(index) {
									var h = Math.max($(this).height(), lastColumn.find('a:eq(' + index + ')').height());

									columns.find('a:eq(' + index + ')').css('height', h);
								});
							});
						}
						else {
							entryContainer.find('> a').matchHeight({byRow: false});
						}
					}

					listingContainer.css('opacity', 1);
				}, 100);
			});
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

				elem.find('option').each(function () {
					if ($(this).text().replace(/[\s\W]/g, '').toLowerCase() == val) {
						elem.multipleSelect('setSelects', [$(this).val()]);
						value = $(this).val();

						return false;
					}
				});

				if (elem.attr('id') == 'brand' && value != '') {
					$.each(['solution'], function (i, j) {
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
			dataopt.title = allDropdownLabel[dropdown];
			elem.append('<option value="">' + dataopt.title + '</option>');

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
	populateListing();

	//reset filter nums
	setFilterNum();
});

// makes ajax call, result list and index
function populateListing() {
	if (populateListingPending) {
		return false;
	}

	buildAHashTag();

	var dataset = getDataSet();

	if (dataset === false) {
		entryContainer.empty();
		$('#no-results').removeClass('hidden');

		return false;
	}

	populateListingPending = true;

	if(objectEquals(dataset, previous.dataset)) {
		processListing(previous.response);
	}
	else {
		previous.dataset = dataset;

		$.ajax({
			url: endPointURL,
			type: 'POST',
			dataType: 'JSON',
			data: dataset,
			beforeSend: function () {
				listingContainer.css({opacity: 0}).hide();
				$('#ui-loader').show();
			}
		}).done(processListing);
	}
}

function processListing(dataopt) {
	previous.response = dataopt;
	
	populateListingPending = false;

	entryContainer.empty();

	$.each(range, function (k, v) {
		range[k] = $.extend({}, v, {data: [[], []]});
	});

	var template = $('#listing-template').html();

	$.each(dataopt.data, function (key, val) {
		htmlFragment = populateTemplate(val, template);

		$.each(range, function (k, v) {
			if (v.range.test(val.title)) {
				range[k].data[0].push(htmlFragment);

				return false;
			}
		});
	});

	$.each(range, function (k, v) {
		if (v.data[0].length) {
			var midpoint = Math.ceil(v.data[0].length / 2);

			range[k].data[1] = range[k].data[0].splice(midpoint, v.data[0].length - midpoint);

			//Enable navigation for specified range.
			$('#affix-nav').find('li:eq(' + k + ')').removeClass('disabled');

			$('#' + v.id).show().find('.row').find('> div:eq(0)').html(range[k].data[0].join('')).end().find('> div:eq(1)').html(range[k].data[1].join(''));
		}
		else {
			$('#' + v.id).hide();

			//Disable navigation for specified range.
			$('#affix-nav').find('li:eq(' + k + ')').addClass('disabled');
		}
	});

	//TODO: total record counts < pages x 16 or 12 hide View More button
	if (dataopt.total) {
		$('#no-results').addClass('hidden');
	}
	else {
		$('#no-results').removeClass('hidden');
	}

	// add total results number
	$('.total_results').html(dataopt.total);

	setTimeout(function () {
		listingContainer.show();

		processEllipsis('.listing-entries').done(function () {
			setTimeout(function () {
				if (pageType > 0) {
					if (location.search == '?v2') {
						listingContainer.find('.row').each(function () {
							var columns = $(this).find('> div'),
								firstColumn = $(columns.get(0)),
								lastColumn = $(columns.get(1));

							firstColumn.find('a').each(function (index) {
								var h = Math.max($(this).height(), lastColumn.find('a:eq(' + index + ')').height());

								columns.find('a:eq(' + index + ')').css('height', h);
							});
						});
					}
					else {
						entryContainer.find('> a').matchHeight({byRow: false});
					}
				}

				listingContainer.css('opacity', 1);

				$('#affix-nav').find('.active').removeClass('active').end().find('li').each(function () {
					if (!$(this).hasClass('disabled')) {
						$(this).addClass('active');
						return false;
					}
				});
			}, 100);
		});

		$('#ui-loader').hide();
	}, 100);
}

// Generates hash from selected filters and tabs
function buildAHashTag() {
	var hashArr = [], top = window.scrollY || $('html').scrollTop();

	$.each(hashMap, function (id, prefix) {
		var elem = $('#' + id), val = elem.multipleSelect('getSelects');

		elem.find('option').each(function () {
			if ($(this).attr('value') == val[0]) {
				hashArr.push(prefix + $.trim($(this).data('name') || $(this).text()).toLowerCase().replace(/[\s\W]/g, ''));

				return false;
			}
		});
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

// iterates selected filters and createsd dataset for ajax call
function getDataSet() {
	var dataset = {
			"type": "product list"
		},
		mapping = {
			solution: 'solution',
			brand: 'brand'
		},
		hasError = false;

	$.each(mapping, function (key, id) {
		var v = $('#' + id).val();

		if(v !== null) {
			dataset[key] = v;
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

function populateTemplate(obj, tpl, prefix) {
	if (prefix === undefined) {
		prefix = '';
	}

	$.each(obj, function (n, v) {
		if (typeof v == 'object') {
			if ($.isEmptyObject(v)) {
				tpl = tpl.replace('[[' + prefix + n + ']]', '');
			}
			else {
				tpl = populateTemplate(v, tpl, prefix + n + '.');
			}
		}
		else {
			tpl = tpl.replace('[[' + prefix + n + ']]', v);
		}
	});

	return tpl;
}