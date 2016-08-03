$('head').append('<link rel="stylesheet" href="/static/library/jQueryUI/jquery-ui-1.11.4-structure.min.css">');
$('head').append('<link rel="stylesheet" href="/static/library/jQueryUI/jquery-ui-1.11.4-theme.min.css">');

if (/^\/register\/95427/.test(location.pathname)) {
	$(document).ready(function () {
		$('#footer').css('marginTop', 0);
		$('.breadcrumb').remove();
		$('.round-corners').removeClass('round-corners');

		var html = '<div class="bootstrap is-responsive"><div id="first-container" class="container"></div><div class="container"><div class="row"><div id="left-content" class="col-md-12"></div></div></div></div>';

		$(html).insertBefore('#content-container');
		$('h1').addClass('m-0').appendTo('#first-container');
		$('article').appendTo('#left-content');

		$('article').find('p').each(function () {
			if ($.trim($(this).text()) == '') {
				$(this).remove();
			}
		});

		//$('#frmRegister').addClass('form-horizontal').appendTo('#right-content');
		$('#frmRegister').addClass('form-horizontal').appendTo('#left-content');

		var form = $('#frmRegister').css('marginTop', 20);

		$('#frmRegister').find('table').find('tbody').find('td').each(function () {
			var inputElem = $(this).find(':input');

			if (inputElem.is(':visible')) {
				var label = $(this).find('span:eq(0)').text();

				if ($(this).find(':input').attr('id') == 'Email') {
					label = 'Email Address (Work)';
				}

				var html = $('<div class="form-group col-md-6"><label class="control-label col-md-4">' + label + '</label><div class="col-md-8"></div></div>');

				$(this).find(':input').addClass('form-control required').prop('required', true).appendTo(html.find('label').next());

				form.append(html);
			}
		});

		var DietaryNeedsOtherElem = $('#DietaryNeedsOther').attr('placeholder', 'Please enter your dietary needs.').hide(), DietaryNeedsOtherParent = DietaryNeedsOtherElem.parents('.form-group');

		DietaryNeedsOtherElem.insertAfter('#DietaryNeeds');

		DietaryNeedsOtherParent.remove();

		$('body')
			.on('change', '#DietaryNeeds', function () {
				if ($(this).val() == 'Other') {
					$(this).hide();
					$('#DietaryNeedsOther').prop('required', false).removeClass('required').show().focus();
				}
			})
			.on('change', '#HotelRoomRequired', function () {
				if ($(this).val() == 'Yes') {
					$('#DepartureDate').parents('.form-group').prop('required', true).addClass('required').show();
					$('#ArrivalDate').parents('.form-group').prop('required', true).addClass('required').show();
				}
				else {
					$('#DepartureDate').parents('.form-group').prop('required', false).removeClass('required').hide();
					$('#ArrivalDate').parents('.form-group').prop('required', false).removeClass('required').hide();
				}
			});

		$('#frmRegister').find('table').remove();

		form.append('<div class="clearfix"></div><div class="form-group"><div class="col-md-6 col-md-offset-3"><input type="submit" class="btn btn-block btn-primary" value="Submit"></div></div>');

		$.getScript('/static/library/jquery/jquery.validate-mod.min.js', function () {
			$.validator.addMethod("dsgemail", function (value, element) {
				return this.optional(element) || /^[a-zA-Z0-9\,\!\#\$%&amp;'\*\+/=\?\^_`\{\|}~-]+(\.[a-zA-Z0-9,!#\$%&amp;'\*\+/=\?\^_`\{\|}~-]+)*@(software\.)?dell\.com$/.test(value);
			}, "Please enter a valid DSG email.");
			$.validator.addMethod("positiveinteger", function (value, element) {
				return this.optional(element) || /^\d+$/.test(value);
			}, "A positive non-decimal number please");

			initFormValidate('#frmRegister', {
				errorClass: 'error',
				submitHandler: function () {
					$('#Email').val($('#Email').val().toLowerCase());
					$('#ManagerEmail').val($('#ManagerEmail').val().toLowerCase());

					ProspectProcess();
				},
				messages: validateGenerateErrorMessages2('#frmRegister'),
				rules: {
					EmployeeBadgeNumber: {
						positiveinteger: true
					},
					Email: {
						dsgemail: true
					},
					ManagerEmail: {
						dsgemail: true
					}
				},
				showErrors: function (errorMap, errorList) {
					var form = $(this.currentForm), errors = this.numberOfInvalids(), validator = this, tooltipCreated = null;

					if (errors) {
						//Populate each error to the alert container
						var displayedError = 0, showNextTooltip = false;

						//Find all fields that are new valid that were previously invalid.
						$.each(this.successList, function (i, elem) {
							$(elem).removeClass('error');

							if ($(elem).next().hasClass('tooltip')) {
								$(elem).tooltip('destroy');
							}

							showNextTooltip = true;
							//Show next tooltip
							var nextErrorFormField = form.find(':input').filter('.error:eq(0)');

							if (nextErrorFormField.length && !nextErrorFormField.next().hasClass('tooltip')) {
								createTooltip(nextErrorFormField, validator.settings.messages[nextErrorFormField.attr('name')]);
							}
						});

						//Mark all invalid fields
						$.each(this.invalid, function (name, msg) {
							if (msg === true) {
								msg = validateGenerateErrorMessages2('#frmRegister')[name];
							}

							var fieldElem = form.find(':input[name=' + name + ']'),
								title = fieldElem.data('orig-title') ? fieldElem.data('orig-title') : fieldElem.attr('title');

							fieldElem.addClass('error');

							//Only show first error as tooltip.
							if (!displayedError && !fieldElem.next().hasClass('tooltip')) {
								createTooltip(fieldElem, msg);
							}

							displayedError++;
						});

						//Make sure that only 1 tooltip is being displayed.
						//Need to wait if first invalid field that's now valid to destroy tooltip.
						setTimeout(function () {
							form.find('.tooltip:gt(0)').tooltip('destroy');
						}, 200);
					}
					else {
						if (!$('html').hasClass('ie8')) {
							form.find('.tooltip').tooltip('destroy');
						}

						form.find(':input').filter('.error').removeClass('error');
					}

					if (tooltipCreated !== null) {
						tooltipCreated.tooltip('show');
					}

					function createTooltip(elem, msg) {
						//Only 1 tooltip should be shown at a time. Do not show tooltip on IE8.
						if (!$('html').hasClass('ie8') && elem !== undefined && tooltipCreated === null) {
							//If tooltip is visible, do not proceed to create another tooltip.
							if (form.find('.tooltip').length) {
								return false;
							}

							if (elem.data('orig-title') === undefined) {
								elem.data('orig-title', elem.attr('title'));
							}

							elem.attr('title', msg).tooltip({
								template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner tooltip-alert"></div></div>',
								html: true,
								trigger: 'manual'
							});

							tooltipCreated = elem;
						}
					}
				},
				invalidHandler: function (event, validator) {
				}
			}, false);

			function validateGenerateErrorMessages2(formID) {
				var errorMessages = {};

				$(formID).find(':input').each(function () {
					var fieldName = $(this).attr('name'), title = $(this).attr('title');

					if (fieldName && title) {
						errorMessages[fieldName] = siteTags["SiteRegWarningInvalid"] + ' <strong>"' + title + '"</strong>' + siteTags["SiteRegWarningInvalidPleaseTryAgain"];
					}
				});

				errorMessages['Email'] += '. Enter a valid DSG email address.';
				errorMessages['ManagerEmail'] += '. Enter a valid DSG email address.';

				return errorMessages;
			}
		});

		makeResponsive();

		$('#DepartureDate').datepicker({minDate: new Date(2016, 5, 16), maxDate: new Date(2016, 5, 18)});
		$('#ArrivalDate').datepicker({minDate: new Date(2016, 5, 12), maxDate: new Date(2016, 5, 14)});

		$('#DietaryNeeds').trigger('change');
		$('#HotelRoomRequired').trigger('change');

		$('body').css('visibility', 'visible');
	});
}
else if (/^\/registert\/95427/.test(location.pathname)) {
	$(document).ready(function () {
		$('#footer').css('marginTop', 0);
		$('.breadcrumb').remove();

		makeResponsive();
		$('body').css('visibility', 'visible');
	});
}