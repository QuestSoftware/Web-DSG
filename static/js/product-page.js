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

		$(this).closest("div").find('a:contains("Choose Product")').addClass("ga").attr({
			"data-gac": "UX",
			"data-gaa": "Choose Model",
			"data-gal": model
		});
	});
});
