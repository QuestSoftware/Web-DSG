if (typeof RootPath == 'undefined') {
	RootPath = '/';
}

var populateListingPending = false, //prevent populate listing to load more than 1 at a time.
	endPointURL = (((RootPath == '/') ? '' : RootPath) + '/jsonreq/cde/').replace('//', '/'),
	listingContainer = $('.listing-entries'),
	entryContainer = listingContainer.find('.row'),
	hashMap = {
		solution: 'bysolution',
		brand: 'bybrand'
		},
	range = [
		{
			range: /^[ab]/i,
			id: 'A-B',
			row: $('#A-B').find('.row')
		},
		{
			range: /^[cd]/i,
			id: 'C-D',
			row: $('#C-D').find('.row')
		},
		{
			range: /^[ef]/i,
			id: 'E-F',
			row: $('#E-F').find('.row')
		},
		{
			range: /^[g-m]/i,
			id: 'G-M',
			row: $('#G-M').find('.row')
		},
		{
			range: /^[n-r]/i,
			id: 'N-R',
			row: $('#N-R').find('.row')
		},
		{
			range: /^[s]/i,
			id: 'S',
			row: $('#S').find('.row')
		},
		{
			range: /^[t-x]/i,
			id: 'T-X',
			row: $('#T-X').find('.row')
		}
	],
	rangeIndex = 0,
	affixNav = $('#affix-nav'),
	navList = affixNav.find('li');

affixNav.on('click', '.disabled a', function (e) {
	e.stopImmediatePropagation();
});

if ($.fn.matchHeight) {

}
else {
	$.getScript('/static/library/jQuery/jquery.matchheight.min.js').done(function () {
	});
}

if ($.fn.dotdotdot) {

}
else {
	$.getScript('/static/library/jQuery/jquery.dotdotdot.min.js', function () {
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
				callback: brandCallback
			},
			solution: {
				data: {"type": "solution"},
				init: true,
				callback: solutionCallback
				}
			},
		allDropdownLabel = {};

	function brandCallback(title) {
		$(this).parent().removeClass('hidden').end().multipleSelect({
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
		}).multipleSelect("uncheckAll");
	}

	function solutionCallback(title, prevValue) {
		$(this).parent().removeClass('hidden').end().multipleSelect({
			placeholder: title,
			multiple: false,
			selectAll: false,
			single: true,
			onClick: function (view) {
				if (view.value != '') {
					$('#product').multipleSelect('setSelects', []);
				}
			}
		}).multipleSelect("uncheckAll");
	}

	$(document).ready(function () {
		// filters event handler
		var filterInterval = null, filterElem = $('.filters');

		listingContainer.find('>div').hide();

		//Populate all "filter by" dropdowns
		getLocalizedContent(['LabelAllProductLines', 'LabelAllSolutions']).done(function () {
			$.each(filterMap, function (id, entry) {
				if (entry.init) {
					ajaxArr.push(populateDropdowns(id, entry.data, entry.callback));
				}
				else {
					entry.callback.call($('#' + id).get(0));
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
									listingContainer.find('>div').hide(); // hide parent divs
									populateListing();
									ajaxArr = [];
								});
							}
							else {
								listingContainer.find('>div').hide();
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
		$('body')
			.on('click', '.resetfilter', function (e) {
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
			})
			.on('offcanvas.hidden', function () {
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

	navList.addClass('disabled');

	$.each(range, function (k, v) {
		range[k].total = 0;
		range[k].html = '';
	});

	rangeIndex = 0;

	return $.ajax({
		url: endPointURL,
		type: 'POST',
		dataType: 'JSON',
		data: dataset,
		beforeSend: function () {
			//listingContainer.css({opacity: 0}).hide();
			$('#ui-loader').show();
		}
	}).done(function (dataopt) {
		populateListingPending = false;
		entryContainer.empty();

		var template = $('#listing-template').html(), offsetTotal = 0;

		$.each(dataopt.data, function (key, val) {
			//Assuming dataopt.data titles are already in alphabetical order.
			if (range[rangeIndex].range.test(val.title)) {
				range[rangeIndex].total++;
				range[rangeIndex].html += populateTemplate(val, template);
			}
			else {
				finalizeRangeDisplay(rangeIndex);

				rangeIndex++;

				if (range[rangeIndex].range.test(val.title)) {
					range[rangeIndex].total++;
					range[rangeIndex].html += populateTemplate(val, template);
				}
			}
		});

		finalizeRangeDisplay(rangeIndex);

		function finalizeRangeDisplay(rangeIndex) {

			// Css changes only one for parent container
			if (listingContainer.css('display') == 'none') {
				listingContainer.show();
				listingContainer.css('opacity', 1);
			}
			setTimeout(function () {
				if (range[rangeIndex].total) {
					range[rangeIndex].row.append(range[rangeIndex].html).show();
					navList.filter(':eq(' + rangeIndex + ')').removeClass('disabled');

					processEllipsis('#' + range[rangeIndex].id).done(function () {
					});
					$('#' + range[rangeIndex].id).show();
				}
				else {
					range[rangeIndex].row.hide();
				}
			}, 10);
			$('#ui-loader').hide();
		}

		//TODO: total record counts < pages x 16 or 12 hide View More button
		if (dataopt.total - offsetTotal) {
			$('#no-results').addClass('hidden');
		}
		else {
			$('#no-results').removeClass('hidden');
			$('#ui-loader').hide();
		}

		// add total results number
		$('.total_results').html(dataopt.total - offsetTotal);

		setTimeout(function () {

			if (pageType > 0) {
				entryContainer.find('> div').matchHeight({byRow: false});
			}

			affixNav.find('li').removeClass('active').each(function () {
				if (!$(this).hasClass('disabled')) {
					$(this).addClass('active');
					return false;
				}
			});

		}, 10);
	});
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
			"type": "cde list"
		},
		mapping = {
			productType: 'trialsfreeware',
			solution: 'solution',
			brand: 'brand'
		},
		hasError = false;

	$.each(mapping, function (key, id) {
		var v = $('#' + id).val();

		if (v !== null) {
			dataset[key] = v;
		}
	});

	return hasError ? false : dataset; // hasError would always be false, right? JL
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
				var regExp = new RegExp("\\[\\[" + prefix + n + "\\]\\]", "g");
				tpl = tpl.replace(regExp, '');
			}
			else {
				tpl = populateTemplate(v, tpl, prefix + n + '.');
			}
		}
		else {
			var regExp = new RegExp("\\[\\[" + prefix + n + "\\]\\]", "g");
			tpl = tpl.replace(regExp, v);
		}
	});

	return tpl;
}