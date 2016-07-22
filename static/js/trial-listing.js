if (typeof RootPath == 'undefined') {
	RootPath = '/';
}

var populateListingPending = false, //prevent populate listing to load more than 1 at a time.
		endPointURL = (((RootPath == '/') ? '' : RootPath) + '/jsonreq/trial/').replace('//', '/'),
		listingContainer = $('.listing-entries'),
		entryContainer = listingContainer.find('.row'),
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
		navList = $('#affix-nav').find('li'),
		previous = {dataset: null, response: null};

$('#affix-nav').on('click', '.disabled a', function (e) {
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

var multiSelectInit;
function multiSelectFilters() {

	// Local variables
	var ajaxArr = [],
			filterInterval = null,
			filterElem = $('.filters'),
			allDropdownLabel = {};
		filterMap = {
			trialsfreeware: {
				callback: function () {
					$(this).multipleSelect({
						multiple: false,
						selectAll: false,
						single: true,
						onClose: function () {
						},
						onUncheckAll: function () {
							$('#trialsfreeware').multipleSelect('setSelects', ['All']);
						}
					});
				}
			},
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
		}


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

		//Populate all "filter by" dropdowns
		getLocalizedContent(['EventLabelEventType', 'EventLabelDate', 'LabelAllEvents', 'EventLabelRecordedDate', 'EventLabelLocation', 'EventLabelAllDates', 'LabelAllProductLines', 'LabelAllSolutions']).done(function () {
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


	function resetFilters() {
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
	}

	function whenOffCanvasHidden() {
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
	}

	return {
		resetFilters: resetFilters,
		whenOffCanvasHidden: whenOffCanvasHidden
	}
}

if ($.fn.multipleSelect) {
	multiSelectInit = multiSelectFilters();
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

		multiSelectInit = multiSelectFilters();
	});
}

$(document).ready(function () {

	// to reset drop down selected
	$('body').on('click', '.resetfilter', function (e) {
		e.preventDefault();
		multiSelectInit.resetFilters()

	});

	$('body').on('offcanvas.hidden', function () {
		processEllipsis('.listing-entries').done(function () {
			setTimeout(function () {
				multiSelectInit.whenOffCanvasHidden()
			}, 100);
		});
	});
});

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
	});

	if (objectEquals(dataset, previous.dataset)) {
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

	var template = $('#listing-template').html(), type = $('#trialsfreeware').val(), offsetTotal = 0;

	$.each(dataopt.data, function (key, val) {
		if ((type == 'Virtual Trials' && val.url.virt == '') || (type == 'Freeware' && val.url.freeware == '') || (type == 'Trials' && val.url.trial == '')) {
			offsetTotal++;
			return true;
		}

		val.tooltip = val.tooltip.replace(/(<([^>]+)>)/ig, "");

		$.each(range, function (k, v) {
			if (v.range.test(val.title)) {
				range[k].total++;

				var target = $('#' + v.id).find('.row').append(populateTemplate(val, template)),
						elem = target.find('> div:last'), buyCount = 0, tryCount = 0;

				$.each([val.url.trial, val.url.virt, val.url.freeware], function (i, v) {
					if (v != '') {
						tryCount++;
					}
				});

				$.each([val.url.buy, val.url.contact], function (i, v) {
					if (v != '') {
						buyCount++;
					}
				});

				if (tryCount > 1) {
					elem.find('.try-single').remove().end().find('.try-group').find('a').each(function () {
						if ($(this).attr('href') == '') {
							$(this).parent().remove();
						}
					});
				}
				else {
					elem.find('.try-group').remove().end().find('.try-single').each(function () {
						if ($(this).attr('href') == '') {
							$(this).remove();
						}
					});
				}

				if (buyCount > 1) {
					elem.find('.buy-single').remove().end().find('.buy-group').find('a').each(function () {
						if ($(this).attr('href') == '') {
							$(this).parent().remove();
						}
					});
				}
				else {
					elem.find('.buy-group').remove().end().find('.buy-single').each(function () {
						if ($(this).attr('href') == '') {
							$(this).remove();
						}
					});
				}

				return false;
			}
		});

		//entryContainer.append(populateTemplate(val, template));

		/*var elem = entryContainer.find('> div:last'), buyCount = 0, tryCount = 0;

		 $.each([val.url.trial, val.url.virt, val.url.freeware], function(i, v) {
		 if(v != '') {
		 tryCount++;
		 }
		 });

		 $.each([val.url.buy, val.url.contact], function(i, v) {
		 if(v != '') {
		 buyCount++;
		 }
		 });

		 if(tryCount > 1) {
		 elem.find('.try-single').remove();

		 elem.find('.try-group').find('a').each(function() {
		 if($(this).attr('href') == '') {
		 $(this).parent().remove();
		 }
		 });
		 }
		 else {
		 elem.find('.try-group').remove();

		 elem.find('.try-single').each(function() {
		 if($(this).attr('href') == '') {
		 $(this).remove();
		 }
		 });
		 }

		 if(buyCount > 1) {
		 elem.find('.buy-single').remove();

		 elem.find('.buy-group').find('a').each(function() {
		 if($(this).attr('href') == '') {
		 $(this).parent().remove();
		 }
		 });
		 }
		 else {
		 elem.find('.buy-group').remove();

		 elem.find('.buy-single').each(function() {
		 if($(this).attr('href') == '') {
		 $(this).remove();
		 }
		 });
		 }*/
	});

	/*$.each(range, function(i, obj) {
	 if(obj.set) {
	 $('#affix-nav').find('li:eq(' + i + ')').removeClass('disabled');
	 }
	 else {
	 $('#affix-nav').find('li:eq(' + i + ')').addClass('disabled');
	 }
	 });*/

	$.each(range, function (k, v) {
		if (v.total) {
			$('#' + v.id).show();
			navList.filter(':eq(' + k + ')').removeClass('disabled');
		}
		else {
			$('#' + v.id).hide();
		}
	});

	//TODO: total record counts < pages x 16 or 12 hide View More button
	if (dataopt.total - offsetTotal) {
		$('#no-results').addClass('hidden');
	}
	else {
		$('#no-results').removeClass('hidden');
	}

	// add total results number
	$('.total_results').html(dataopt.total - offsetTotal);

	setTimeout(function () {
		listingContainer.show();

		processEllipsis('.listing-entries').done(function () {
			setTimeout(function () {
				if (pageType > 0) {
					entryContainer.find('> div').matchHeight({byRow: false});
				}

				listingContainer.css('opacity', 1);

				$('#affix-nav').find('li').removeClass('active').each(function () {
					if (!$(this).hasClass('disabled')) {
						$(this).addClass('active');
						return false;
					}
				});
			}, 10);
		});

		$('#ui-loader').hide();
	}, 10);
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
				"type": "trial list"
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