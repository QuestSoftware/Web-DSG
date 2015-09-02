/**
* Created by jleon on 9/1/2015.
*/

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
	$('#search_all_sites').multipleSelect({
		placeholder: "Search all sites",
		multiple: true,
		selectAll: true,
		single: false
	});

	$('#solution').multipleSelect({
		placeholder: "Solution",
		multiple: false,
		selectAll: false,
		single: true
	});

	$('#product').multipleSelect({
		placeholder: "Product",
		multiple: false,
		selectAll: false,
		single: true
	});
	$('#content-type').multipleSelect({
		placeholder: "Content Type",
		multiple: false,
		selectAll: false,
		single: true
	});

}
