//Used to trigger GA event tracking for "View More Features" and "Choose Product" button.
$(document).ready(function () {
	$('[data-target="#more-features"]').addClass("ga").attr({
		"data-gac": "UX",
		"data-gaa": "View More Features",
		"data-gal": "Features"
	});

	//trigger GA event tracking for "Choose Product" button and link.
	$('.comparison').find('h3').find('a').each(function (index, value) {
		var model = $(this).text();
		var dataga = {
			"data-gac": "UX",
			"data-gaa": "Choose Model",
			"data-gal": model
		};
		$(this).addClass("ga").attr(dataga);
		$(this).closest("div").find('.btn').addClass("ga").attr(dataga);
	});
});
