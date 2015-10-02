$(function () {
	addResize('navigationFix', true);

	$('#masthead').find('> nav')
		.on('click', '.tier1 > li > a', function () {
			navigationFix();

			$('div.tier2 .container > div').removeClass('active');
			$(this).parent().find('div.tier2 .container > div').first().addClass('active');
		})
		.on('click', 'div.tier2 .container > div > a', function (e) {
			if ($(this).attr('href') == '#') {
				e.preventDefault();
				$(this).parent().siblings().removeClass('active').end().addClass('active');
			}
		})
		.on('click', '.close', function (e) {
			e.preventDefault();
			$(this).parents('li').removeClass('open');
		});
});

function navigationFix() {
	if (pageType > 1) {
		$('.tier1 > li').removeClass('open');//remove any open sub menu
	}
}