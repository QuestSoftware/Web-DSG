function DemandBaseInitialize(frm, btn, companyID, ltg, connectObj, callback) {
	var isAfterParseInit = false,
		dbfDefault = {
			emailID: "dumbEmail",
			companyID: companyID,
			key: '96b804f998aaf4409cf333efdb2a3b3c',
			toggleFieldList: ltg,
			autocompletePlaceholder: '',
			getToggleElement: function (id) {
				return this.djq('#tr_' + id);
			},
			priorityMap: {
				'domain': 2,
				'ip': 1,
				'company': 3
			},
			fieldMap: {
				'company_name': 'HiddenCompany', //custom hidden field for Demandbase-provided company
				'demandbase_sid': '', //Unique ID for a company
				// 'industry': 'Industry',
				// 'sub_industry': 'SubIndustry',
				'revenue_range': '', //blank means this will map to 'db_revenue_range'
				'employee_range': 'NumberOfEmployees',
				'street_address': 'Address1',
				'city': 'City',
				'state': 'State',
				'zip': 'PostalCode',
				'country': 'Country',
				'country_name': '', //blank means this will map to 'db_country_name'
				// 'phone': 'Phone',
				'data_source': '', //which data point provided the company profile (one of: 'ip', 'domain', or 'company')
				'watch_list_account_status': '',
				'longitude': 'DB_Longitude',
				'latitude': 'DB_Latitude',
				'industry': 'DB_Industry',
				'sub_industry': 'DB_SubIndustry'
			}
		};
	//Reset form
	$(frm).find(':visible:input').each(function () {
		if ($.inArray($(this).attr('type'), ['button', 'submit', 'checkbox']) == -1) {
			$(this).val('');
		}
	});

	//Test for DemandBase
	//Waits for user input in the company field - JL
	$('#' + companyID).on($('html').hasClass('ie8') ? 'propertychange' : 'input', function () {
		if ($(frm).data('isFrmOpen') == undefined) {
			if ($(this).val().length >= 2) {
				testAutocompleteWidget(frm, companyID);
			}
		}
	});

	/* Initialize demandbase */
	window.dbAsyncInit = function () {
		if (typeof connectObj == 'undefined') {
			connectObj = {};
		}

		Demandbase.Connectors.WebForm.connect($.extend({}, dbfDefault, connectObj));

		if (typeof callback == 'function') {
			callback.apply(this);
		}
	};

	//IS can control siteTags.DemandBaseUp value.
	if (siteTags.DemandBaseUp != "false") {
		//Disable submit button. Button should already be disabled. But this is just in case.
		if ($('#chklicense').length) {
			$('#chklicense').trigger('change');
		}
		else {
			$(frm).find('[type=submit]').prop('disabled', true);
		}

		(function () {
			var dbt = document.createElement('script');
			dbt.type = 'text/javascript';
			dbt.async = true;
			dbt.id = 'demandbase-form';
			dbt.onload = function () {
				var version = $().jquery.split('.');
				if (version[0] == 1 && version[1] < 9) {
					$.noConflict();
				}
				Demandbase.jQuery.ajaxSetup({
					beforeSend: function () {
						var str = this.url,
							regexp = /demandbase\.com\/autocomplete\?callback/g,
							isRealCallback = str.match(regexp);
						if (isRealCallback !== null) {
							startAjaxCallTracker(frm, companyID);
						}
					}
				});

			};
			dbt.onerror = function () {
				PopulateDBFieldsWebFormConnector({}, frm, companyID);
			};
			dbt.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'scripts.demandbase.com/formWidget.js';

			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(dbt, s);
			alreadyPickUpDemanBase = false;
		})();
	}
	else {
		//Demandbase is not running.

		//Enable submit button
		if ($('#chklicense').length) {
			$('#chklicense').trigger('change');
		}
		else {
			$(frm).find('[type=submit]').prop('disabled', false);
		}
	}

	db_hook_init = function () {
		var interval = setInterval(function () {
			//Check to see if #demandbase-company-autocomplete-widget exist. Only then complete the operation.
			if ($('#demandbase-company-autocomplete-widget').find('> ul').length) {
				clearInterval(interval);
				DemandBaseOnComplete(frm, btn, companyID, ltg);
			}
		}, 10);
	};

	db_hook_after_parse = function (data, source) {
		isAfterParseInit = true;
		PopulateDBFieldsWebFormConnector(data, frm, source, enableSubmitButton);
	};

	db_hook_before_parse = function (data, source) {
		if (source == "ip" || source == "domain") {
			Demandbase.Connectors.WebForm.CompanyProfile = null;
			return false;
		}
		if (!isAfterParseInit) { // check if db_hooks get initialized onload
			populateRegFrmDbFields(data); // if db_hooks are not initialized then function will help to populate reg form
			PopulateDBFieldsWebFormConnector(data, frm, source, enableSubmitButton);

			var hasTr = $(frm).find('[id^="tr_"]');

			if (hasTr.length) {
        if (data.country == 'CA') {
          hasTr.show();
        } else {
          hasTr
            .not('[id^="tr_OptIn"]')
            .not('[id^="tr_Privacy"]')
            .show();
        }
      }

			$(frm).find("div[firstscreen=0]").show();
    }
	};

	// When there is an error with demandbase
	// ip.json we need to call this function to utilize
	// db data to populate reg form (called on db_hook_before_parse)
	function populateRegFrmDbFields(data) {
		var fieldMap = dbfDefault.fieldMap,
			$Fields = ['country', 'street_address', 'city', 'state', 'zip', 'latitude', 'longitude', 'industry', 'sub_industry'];

		if (!$.isEmptyObject(data)) {
			$Fields.forEach(function (field) {
				$val = data[field];
				$id = fieldMap[field];
				$('#' + $id).val($val);
			})
		}
	}

	function enableSubmitButton() {
		//Enable submit button if address fields are visible.
		$.each(ltg, function (indx, id) {
			if ($('#' + id).is(':visible')) {
				toggleSubmitButton(btn, true);
				return false;
			}
		});
	}
}

function DemandBaseOnComplete(frm, btn, id, ltg) {
	/* This script creates a wrapper around the dropdown */

	var DemandBaseInterval = setInterval(function () {
		if (Demandbase.CompanyAutocomplete.initialized) {
			clearInterval(DemandBaseInterval);
			DemandBaseBind();
		}
	}, 100);

	function DemandBaseBind() {
		var autoElem = Demandbase.jQuery(Demandbase.CompanyAutocomplete.textField), ajaxtrackerSet = false, widgetContainer = $('#demandbase-company-autocomplete-widget');

		//Prevent browser from display its own autofill dialog.
		autoElem.attr('autocomplete', /Chrome/.test(navigator.userAgent) ? false : 'off');

		Demandbase.jQuery.ui.autocomplete.prototype._resizeMenu = function () {
			this.menu.element.outerWidth(this.element.outerWidth(true) + 6);
		};

		//Initialize
		autoElem
			.data('selected', false)
			.data('mouseenter', false)
			.data('key13_9clicked', false)
			.data('destroyed', false)
			.on('keydown', function (e) {
				if (autoElem.data('selected')) {
					return true;
				}

				if ((e.keyCode == 13 || e.keyCode == 9)) {
					autoElem.data('key13_9clicked', true);

					//clear dataset
					dbDataSet = '';

					PopulateDBFieldsWebFormConnector({}, frm, id);

					autoElem.autocomplete('close');
					notice.css('display', 'none');

					for (var i in ltg) {
						$('#tr_' + ltg[i]).show();
					}

					if ($('#chklicense').length) {
						$('#chklicense').trigger('change');
					}
					else {
						$(frm).find('[type=submit]').prop('disabled', false);
					}
				}
			})
			.on('blur', function () {
				var elem = this;

				setTimeout(function () {
					if (!autoElem.data('destroyed')) {
						if ($(elem).val() != '' && !autoElem.data('selected') && !autoElem.data('mouseenter') && !widgetContainer.find('> ul').is(':visible') && !autoElem.data('key13_9clicked')) {
							PopulateDBFieldsWebFormConnector({}, frm, id);

							if ($('#chklicense').length) {
								$('#chklicense').trigger('change');
							}
							else {
								$(frm).find('[type=submit]').prop('disabled', false);
							}
						}
					}
				}, 200);
			})
			.autocomplete({
				position: {
					my: "right top",
					at: "right bottom",
					offset: "0 0",
					collision: "flip"
				}
			});

		var notice = $('<div class="dbwrapper"><div>Select your company<div>Don\'t see your company? <a href="#" id="use-input-value">Close List &gt;</a></div></div></div>').appendTo('body'),
			ul = widgetContainer.find('> ul:last-child');

		$('#demandbase-autocomplete').css('zIndex', 998);

		$('#use-input-value').on('click', function (e) {
			e.preventDefault();
			e.stopPropagation();

			dbDataSet = '';

			autoElem.data('destroyed', true).autocomplete('destroy');
			notice.css('display', 'none');

			PopulateDBFieldsWebFormConnector({}, frm, id);

			if ($('#chklicense').length) {
				$('#chklicense').trigger('change');
			}
			else {
				$(frm).find('[type=submit]').prop('disabled', false);
			}

			setTimeout(function () {
				autoElem.parents('form').find(':input:visible').each(function (i) {
					if ($(this).css('background-color') == 'rgb(248, 254, 190)') {
						$(this).css('background-color', 'transparent');
					}
				});
			}, 200);
		});

		autoElem
		// autocompletesearch is trigger right before ajax call is made - JL
			.bind('autocompletesearch', function (event, ui) {
				if ($('.ie8').length > 0) {
					if (!ajaxtrackerSet) {
						ie8UnbindTrigger(id);
						startAjaxCallTracker(frm, id);
						ajaxtrackerSet = true;
					}
				}

			})
			.bind('autocompleteselect', function () {
				autoElem.data('selected', true);
			})
			.bind('autocompleteopen', function () {
				companyOpen = true;

				// Check if form is already open JL
				if ($(frm).data('isFrmOpen')) {
					return;
				}

				//Do not show when user clicks on tab or enter before this opens up.
				if (autoElem.data('key13_9clicked')) {
					autoElem.data('key13_9clicked', false).autocomplete('close');
					return false;
				}

				autoElem.data('selected', false);

				var ulWidth = ul.outerWidth(true), position = {
					top: autoElem.offset().top + autoElem.outerHeight(false),
					left: autoElem.offset().left - (ulWidth - autoElem.outerWidth(true))
				};

				if (ulWidth < 243) {
					ulWidth = 243;
					ul.css('width', 243);
				}

				ul.show().parent().show().end().css({
					top: position.top + 24,
					left: position.left + 1
				});

				notice.css({
					top: position.top,
					left: ($('body').hasClass('off-canvas-mode') ? document.body.clientWidth : 0) + position.left,
					width: ulWidth + 2,
					height: ul.outerHeight(true) + 24 + 24,
					display: 'block',
					zIndex: ul.css('zIndex') - 1
				});

				if ($('body').hasClass('off-canvas-mode')) {
					ul.css('left', parseInt(ul.css('left')) + document.body.clientWidth);
				}
			})
			.bind('autocompleteclose', function () {
				notice.css('display', 'none');
			});

		//Automatically perform search if field is not empty.
		if (Demandbase.jQuery(Demandbase.CompanyAutocomplete.textField).val() != '') {
			Demandbase.jQuery(Demandbase.CompanyAutocomplete.textField).autocomplete('search');
		}
	}
}

// DemandBase preventive
// testAutocompleteWidget is called after user input in the company field (more than 2 letters)
// it checks if demandbase-company-autocomplete-widget exist after 1500ms (based on the research with the India Team - with the latest response ~1000ms)
// if FormWidget or DemandBaseOnComplete failed demandbase-compnay-autocomplete-widget will not be created. - Jl
function testAutocompleteWidget(frm, id) {
	if ($('#demandbase-company-autocomplete-widget').find('> ul').length > 0) {
		ie8UnbindTrigger(id);
		return true;
	}

	setTimeout(function () {
		if (!$('#demandbase-company-autocomplete-widget').find('> ul').length > 0) {
			PopulateDBFieldsWebFormConnector({}, frm, id);
			$(frm).find('[type=submit]').prop('disabled', false);
			ie8UnbindTrigger(id);
			document.getElementById(id).focus();
			/* needed for ie8 */
			$(frm).data('isFrmOpen', 'true');
			/* prevents script to re-run is form is already open */

		}
	}, 1500);
}

// startAjaxCallTracker is called right before autocomplete ajax call
// after 1500ms checkes for companyOpen to be true. companyOpen will only be set true
// if autocomplete "autocompleteopen" gets triggered by a successful ajax call - Jl
function startAjaxCallTracker(frm, id) {
	if (companyOpen === false) {
		setTimeout(function () {
			if (companyOpen === false) {
				$('#' + id).removeClass('ui-autocomplete-loading');
				PopulateDBFieldsWebFormConnector({}, frm, id);
				var autoElem = Demandbase.jQuery(Demandbase.CompanyAutocomplete.textField);
				autoElem.autocomplete('destroy');
				$(frm).find('[type=submit]').prop('disabled', false);

				$(frm).data('isFrmOpen', 'true');

			}
		}, 1800);
	}
}

// for IE8  we need to use 'propertychange' to bind company field to test for Demandbase connection, this function is called right after
// The full form is shown. to prevent unnecessary calls.
function ie8UnbindTrigger(id) {
	if ($('.ie8').length > 0) {
		$('#' + id).unbind('propertychange');
	}
}

/* Note: on ie8 and only on ie8 when startAjaxCallTracker is called (late response from Demandbase) the user will not be able to enter any data on
 the company field while the function to open the full form is running (less than a second).
 */
