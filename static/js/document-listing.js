var populateListingPending = false, //prevent populate listing to load more than 1 at a time.
	entriesPerType = { //xs,sm - need to consult with cindy chan.
		'0': 6,
		'1': 12,
		'2': 16,
		'3': 16
	},
	endPointURL = (((RootPath == '/') ? '' : RootPath) + '/jsonreq/document/').replace('//', '/'),
	page = 1,
	rowContainer = $('.listing-entries').find('.row'),
	hashMap = {
		content_type: '',
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

if (typeof RootPath == 'undefined') {
	RootPath = '/';
}

function init() {
	// Local variable value
	var ajaxArr = [],
		filterMap = {
			country: {
				data: {"type": "document country"},
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
			content_type: {
				data: {"type": "document type"},
				init: true,
				callback: function (title) {
					$(this).parent().removeClass('hidden');
					$(this).multipleSelect({
						placeholder: getLocalizedContent('LabelDocumentType'),
						minimumCountSelected: 0,
						countSelected: getLocalizedContent('LabelDocumentType') + '&nbsp;(#)',
						selectAllText: getLocalizedContent('LabelAllDocumentTypes'),
						allSelected: getLocalizedContent('LabelAllDocumentTypes'),
						onClose: function () {
							// minimum one event should be selected
							if (!$("#content_type").multipleSelect("getSelects").length) {
								$("#content_type").multipleSelect("setSelects", [$('#content_type').find('option:eq(0)').attr('value')]);
							}
							else {
								caseStudyFilter();
							}
						}
					});
					$(this).multipleSelect("checkAll");
				}
			},
			brand: {
				data: {"type": "document product line"},
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
				data: {"type": "document product"},
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
				data: {"type": "document solution"},
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
				data: {"type": "document language"},
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
			industry: {
				data: {"type": "document industry"},
				init: true,
				callback: function (title) {
					if (typeof $(this).data('multipleSelect') == 'object') {
						$(this).next().find('ul').remove();
						$(this).multipleSelect('refresh');
						//$(this).multipleSelect('setSelects', [prevValue]);
					}
					else {
						$(this).parent().removeClass('hidden');
						$(this).multipleSelect({
							placeholder: title,
							multiple: false,
							selectAll: false,
							single: true
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
		getLocalizedContent(['DocumentLabelUpdated', 'EventLabelAllDates', 'LabelAllIndustries', 'LabelAllProducts', 'LabelAllProductLines', 'LabelAllSolutions', 'LabelAllLanguages', 'LabelAllCountries', 'LabelDocumentType', 'LabelAllDocumentTypes']).done(function () {
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
				industry: getLocalizedContent('LabelAllIndustries')
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

				//Unhide main content area after all filter values have been loaded.
				//$('#mainer').removeClass('hidden');

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
					if ($(this).attr('id') == 'content_type') {
						$(this).multipleSelect('checkAll');
					}
					else if ($(this).attr('id') == 'language') {
						$(this).multipleSelect("setSelects", [getLanguageCode()]);
					}
					else {
						$(this).multipleSelect('uncheckAll');
					}
				}
				else {
					$(this).parent().show();
					$(this).multipleSelect('uncheckAll');
				}
			});

			$.each(['product', 'solution'], function (i, j) {
				ajaxArr.push(populateDropdowns(j, filterMap[j].data, filterMap[j].callback));
			});

			$.when(ajaxArr).done(function() {
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

				if(elem.attr('id') == 'brand' && value != '') {
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
			if(dropdown != 'content_type') {
				dataopt.title = allDropdownLabel[dropdown];
				elem.append('<option value="">' + dataopt.title + '</option>');
			}

			$.each(dataopt.data, function (key, val) {
				if(val.englishname) {
					elem.append('<option value="' + val.id + '" data-name="' + val.englishname + '">' + val.value + '</option>');
				}
				else if(val.englishvalue) {
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

	var dataset = getDataSet(!clear), viewMoreButton = $('#view-more');;

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
			var htmlFragment = '<div class="col-md-3 col-sm-4 col-xs-12" style="display: none;"> ' +
				'<a href="' + val.url + '" target="'+ val.target +'">' +
				'  <div class="border-grey img-crop">' +
				'     <p class="img-header-overlay"></p>' +
				'    <img class="img-responsive center-block" src="' + val.imageurl + '" alt=""> ' +
				'  </div> ' +
				'  <h4 class="text-blue dotdotdot" data-max-line="3">' + val.documenttype + ': ' + val.title + ' </h4> ';

			if (val.description != null) {
				htmlFragment += '<p class="teaser dotdotdot" data-max-line="5"> ' + $('<div>' + val.description + '</div>').text() + ' </p>';
			}

			if (val.date != '') {
				htmlFragment += '<p>' + getLocalizedContent('DocumentLabelUpdated') + ': ' + val.date + '</p>';
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

		if (id == 'content_type') {
			if (val.length == 1) {
				elem.find('option').each(function() {
					if($(this).attr('value') == val[0]) {
						hashArr.push($.trim($(this).data('name') || $(this).text()).toLowerCase().replace(/[\s\W]/g, ''));

						return false;
					}
				});
			}
		}
		else if (id != 'language' || (id == 'language' && parseInt(val[0]) != getLanguageCode())) {
			elem.find('option').each(function() {
				if($(this).attr('value') == val[0]) {
					hashArr.push(prefix + $.trim($(this).data('name') || $(this).text()).toLowerCase().replace(/[\s\W]/g, ''));

					return false;
				}
			});
		}
	});

	if(hashArr.length) {
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
	if (typeof RootPath == 'string') {
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
			"type": "document list",
			"page": page,
			"pagesize": entriesPerType[pageType]
		},
		mapping = {
			documenttypes: 'content_type',
			product: 'product',
			solution: 'solution',
			brand: 'brand',
			language: 'language',
			country: 'country',
			state: 'state_province',
			industry: 'industry'
		},
		hasError = false;

	$.each(mapping, function (key, id) {
		var val = $('#' + id).val();

		if (id == 'content_type') {
			if (val === null || val === undefined) {
				hasError = true;
				return false;
			}

			dataset[key] = val.join(',');
		}
		else {
			dataset[key] = val;
		}
	});

	return hasError ? false : dataset;
}

function caseStudyFilter() {
	if ($.inArray('167', $('#content_type').multipleSelect('getSelects')) > -1) {
		//One of the value is for case study
		$('#country').parent().show();
		$('#industry').parent().show();
	}
	else {
		$('#country').parent().hide();
		$('#industry').parent().hide();
	}
}

function setFilterNum() {
	var counter = 0;

	$('.filters').find('select').each(function() {
		if(($(this).is(':visible') || pageType == 0) && $(this).data('multipleSelect') !== undefined) {
			var selects = $(this).multipleSelect('getSelects');

			if(selects.length == 1) {
				if(selects[0] != '') {
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
