//Used to trigger GA event tracking for "View More Features" button.
$(document).ready(function () {
	$('[data-target="#more-features"]').addClass("ga").attr({
		"data-gac": "CTA",
		"data-gaa": "Features",
		"data-gal": "Features"
	});
});
