//Used to trigger GA event tracking for "View More Features" and "Choose Product" button.
$(document).ready(function () {
	$('[data-target="#more-features"]').addClass("ga").attr({
		"data-gac": "CTA",
		"data-gaa": "Features",
		"data-gal": "Features"
	});

	//trigger GA event tracking for "Choose Product" button and link.
	$('.comparison  h3 a').each(function (index, value) {
		var model = $(this).html();
		$(this).addClass("ga").attr({
			"data-gac": "UX",
			"data-gaa": "Choose Model",
			"data-gal": model
		});

		$(this).closest("div").find('.btn').addClass("ga").attr({
			"data-gac": "UX",
			"data-gaa": "Choose Model",
			"data-gal": model
		});
	});

	//append name of the testers from URL param to ga-cat
	$.urlParam = function (name) {
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results == null) {
			return null;
		}
		else {
			return results[1] || 0;
		}
	};
	var first = $.urlParam('name');

	$('.ga').each(function () {
		$(this).attr("data-gac", $(this).attr("data-gac") + "-" + first);
	});
});