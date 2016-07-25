addResize(function () {
	processComparison();
}, true);

function processComparison(parentSelector) {
	if (typeof parentSelector == 'undefined') {
		parentSelector = 'body';
	}

	var elem = $(parentSelector).find('.comparison');

	if (elem.length) {
		elem.each(function () {
			//Only process if visible.
			if (!$(this).is(':visible')) {
				return true;
			}

			var displayAmount = 2, //Define how many entries should be shown
				rows = $(this).find('.row'), //All rows
				columnsInFirstRow = $(rows.get(0)).find('> div'),
				total = columnsInFirstRow.length, //Total entries
				cols = $(this).find('[class^="col-"]'), //All columns
				paginationElem = $(this).find('.comparison-pagination'); //Pagination element.

			//Reset
			reset();

			var width = columnsInFirstRow.outerWidth();

			//Define how many entries should be shown.
			if (pageType == 3) { //Large Desktop
				displayAmount = $(this).data('display-lg') == undefined ? 4 : $(this).data('display-lg');
			}
			else if (pageType == 2) { //Medium Desktop
				displayAmount = $(this).data('display-md') == undefined ? 4 : $(this).data('display-md');
			}
			else if (pageType == 1) { //Tablet
				displayAmount = $(this).data('display-sm') == undefined ? 3 : $(this).data('display-sm');
			}
			else if (pageType == 0) { //mobile
				displayAmount = $(this).data('display-xs') == undefined ? 2 : $(this).data('display-xs');
			}

			paginationElem.find('.end').text(displayAmount);


			rows.find('.inactive').html('&nbsp;');

			//Set all expanded collapsible columns the same height.
			$(this).on('shown.bs.collapse', '.collapse', function () {
				if (!$(this).data('comparison-processed')) {
					$(this).find('.row').each(function () {
						var rowHeight = $(this).height();

						$(this).find('> div').css('height', rowHeight);
					});

					$(this).data('comparison-processed', true);
				}
			});

			/*comparison table http://software.dell.com/remotescan/comparison-review.aspx */
			if ($('.comparison-table').data('xs-carousel')) {
				var compTable = $('.comparison-table'),
					offsetTop = compTable.find('.comparison .row > div:first-child').offset().top;

				$(this).data('comparison-processed', true);

				/*move fixed column to the same position as carousel*/
				compTable.find('.fixed-column').offset({top: offsetTop});

				/*match height of each fixed-column table cell with corresponding carousel table cell*/
				compTable.find('.fixed-column tr').each(function () {
					var elem = $(this);
					compTable.find('.comparison table').each(function () {
						$(this).find('tbody tr').eq(elem.index()).find('td').outerHeight(elem.find('td').outerHeight());
					});
				});
			}

			if (total > displayAmount) {
				paginationElem.show();

				cols.css('width', width);
				rows.css('width', width * total);

				elem
					.data('page', 0)
					.data('width', width)
					.data('display', displayAmount);

				paginationElem
					.on('click', '.prev', scroll)
					.on('click', '.next', scroll);

				if ($.fn.touchSwipe) {
					initSwipe();
				}
				else {
					$.getScript('/static/library/jQuery/jquery.touchSwipe.js').done(initSwipe);
				}
			}
			else {
				paginationElem.hide();
			}

			//Add background color on active column
			var selectedColumn = 0;

			columnsInFirstRow.each(function (indx) {
				if ($(this).find('> div').find('> div:eq(0)').hasClass('active')) {
					selectedColumn = indx;

					if ($(this).parents('.comparison-container').hasClass('col-striped')) {
						rows.find('> div:eq(' + indx + ')').addClass('selected');
					}
					else {
						rows.find('> div:eq(' + indx + ')').addClass('bg-grey selected');
					}
				}
			});

			//If there is only 1 panel group show panels
			var panelGroup = $(this).find('.panel-group-collapsible');

			if (panelGroup.find('> div').length == 1) {
				panelGroup.find('.panel-heading').hide().next().removeClass('collapse');
			}

			//Slide through to show selected column in view.
			var tweenAmount = 0;

			if (displayAmount == 2) {
				tweenAmount = selectedColumn;
			}
			else if (displayAmount == 3) {
				tweenAmount = selectedColumn - 1;
			}
			else if (displayAmount == 4) {
				if (total - selectedColumn <= 3) {
					tweenAmount = 4 - (total - selectedColumn);
				}
			}

			if (tweenAmount > (total - displayAmount)) {
				tweenAmount = total - displayAmount;
			}

			var elem2 = $(this);

			for (var i = 0; i < tweenAmount; i++) {
				setTimeout(function () {
					console.log('next');
					elem2.find('.next').trigger('click');
				}, 10);
			}

			function reset() {
				cols.css('width', '');
				rows.css({left: '', width: ''});
				paginationElem
					.off('click', '**')
					.find('.next').removeClass('inactive').end()
					.find('.prev').addClass('inactive').end()
					.find('.start').text(1).end()
					.find('.total').text(total);
				$(this).off('shown.bs.collapse', '**');
				$(rows.get(0)).find('> div').css('height', '');

				//Copy title for each collapsible row and place it in each column.
				elem.find('.panel-body').find('> .row:even').each(function () {
					$(this).find('> div').html($(this).find('> div:eq(0)').html());
					$(this).find('> div:gt(0)').find('> div').css('visibility', 'hidden');
				});
			}

			function scroll() {
				updateDisplay(elem.data('page') + ($(this).hasClass('prev') ? -1 : 1));
			}

			function initSwipe() {
				rows.touchSwipe({
					swipeStatus: function (event, phase, direction, distance, duration, fingerCount) {
						//Here we can check the:
						//phase : 'start', 'move', 'end', 'cancel'
						//direction : 'left', 'right', 'up', 'down'
						//distance : Distance finger is from initial touch point in px
						//duration : Length of swipe in MS
						//fingerCount : the number of fingers used

						var dir = '';

						if (!$(this).data('direction')) {
							if ($.inArray(direction, ['left', 'right']) > -1) {
								dir = 'horizontal';
							}
							else {
								dir = 'vertical';
							}

							$(this).data('direction', dir);
						}
						else {
							dir = $(this).data('direction');
						}

						var page = elem.data('page');

						if (dir == 'horizontal') {
							if (direction == 'left') {
								rows.css('left', (-page * width) - distance);
							}
							else if (direction == 'right') {
								rows.css('left', (-page * width) + distance);
							}
						}
						else {
							if (direction == 'up') {
								window.scrollTo(0, window.scrollY + distance);
							}
							else if (direction == 'down') {
								window.scrollTo(0, window.scrollY - distance);
							}
						}

						if (phase == 'end') {
							$(this).removeData('direction');

							if ($.inArray(direction, ['left', 'right']) > -1) {
								var newPage = Math.ceil(parseInt(rows.css('left')) / width);

								if (newPage >= 0) {
									newPage = 0;
								}
								else {
									newPage = Math.abs(newPage);
								}

								updateDisplay(newPage);
							}
						}
					},
					threshold: 10
				});
			}

			function updateDisplay(page) {
				paginationElem.find('button').removeClass('inactive');

				if (page <= 0) {
					paginationElem.find('.prev').addClass('inactive');
					page = 0;
				}

				if (page + displayAmount >= total) {
					paginationElem.find('.next').addClass('inactive');
					page = total - displayAmount;
				}

				rows.animate({left: -page * width}, 500);
				elem.data('page', page);

				elem.find('.panel-body').find('> .row:even').each(function () {
					$(this).find('> div').find('> div').css('visibility', 'hidden').end().filter(':eq(' + page + ')').find('> div').css('visibility', 'visible');
				});

				paginationElem
					.find('.start').text(page + 1).end()
					.find('.end').text(page + displayAmount).end();
			}
		});
	}
}