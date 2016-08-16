//Used to trigger GA event tracking for "View More Features" and "Choose Product" button.
$(document).ready(function () {
	$('[data-target="#more-features"]').addClass("ga").attr({
		"data-gac": "CTA",
		"data-gaa": "Features",
		"data-gal": "Features"
	});
	var model = $("#comparison-container h3 a").html();

	$('#comparison-container a:contains("Choose Product")').addClass("ga").attr({
		"data-gac": "UX",
		"data-gaa": "Choose Model",
		"data-gal": model
	});
});
