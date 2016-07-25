var player_handle = null;

$(document).ready(function() {
	$('.media-player-container').on('click', function () {
		var container = $(this);

		OO.ready(function () {
			player_handle = OO.Player.create('player-wrapper', container.data('code'), {
				onCreate: function (player) {
					OOCreate(player);

					var videoCTA = null, playthrough = [false, false, false, false, false], target = $('#' + player.elementId);

					if(pageType != 0) {
						player.mb.subscribe(OO.EVENTS.PLAYBACK_READY, 'LearnMoreCTA', function () {
							target.find('.innerWrapper').append($('#video-cta').html());

							videoCTA = $('#video-cta-content');

							target.find('.oo-replay').on('click', function () {
								$(this).parents('.innerWrapper').find('.oo_end_screen').find('.oo_replay').trigger('click');
							});

							videoCTA.find('> a:eq(0)').data('galabel', player.getTitle());
							$('#video-description-learn-more').data('galabel', player.getTitle());
							videoCTA.hide();

							target.on('click', '.player-toolbar ul li', function () {
								videoCTA.hide();
							});

							target.find('.plugins').on('remove-overlay', function () {
								videoCTA.show();
							});
						});

						player.mb.subscribe(OO.EVENTS.PAUSED, 'LearnMoreCTA', function () {
							videoCTA.find('> a:eq(1)').hide();
							showCTA();
						});

						player.mb.subscribe(OO.EVENTS.PLAY, 'LearnMoreCTA', function () {
							videoCTA.hide();

							if(!playthrough[0]) {
								if (typeof ga == 'function') {
									ga('send', {
										hitType: 'event',
										eventCategory: 'Video',
										eventAction: 'Video Watched %',
										eventLabel: player.getTitle(),
										eventValue: 0
									});
								}

								playthrough[0] = true;
							}
						});

						player.mb.subscribe(OO.EVENTS.PLAYHEAD_TIME_CHANGED, "LearnMoreCTA", function (eventName, currentTime, totalTime) {
							var percentPlayed = (currentTime / totalTime) * 100;

							if(percentPlayed >= 25 && !playthrough[1]) {
								if (typeof ga == 'function') {
									ga('send', {
										hitType: 'event',
										eventCategory: 'Video',
										eventAction: 'Video Watched %',
										eventLabel: player.getTitle(),
										eventValue: 25
									});
								}

								playthrough[1] = true;
							}
							else if(percentPlayed >= 50 && !playthrough[2]) {
								if (typeof ga == 'function') {
									ga('send', {
										hitType: 'event',
										eventCategory: 'Video',
										eventAction: 'Video Watched %',
										eventLabel: player.getTitle(),
										eventValue: 50
									});
								}

								playthrough[2] = true;
							}
							else if(percentPlayed >= 75 && !playthrough[3]) {
								if (typeof ga == 'function') {
									ga('send', {
										hitType: 'event',
										eventCategory: 'Video',
										eventAction: 'Video Watched %',
										eventLabel: player.getTitle(),
										eventValue: 75
									});
								}

								playthrough[3] = true;
							}
						});

						player.mb.subscribe(OO.EVENTS.PLAYED, 'LearnMoreCTA', function () {
							if(!playthrough[4]) {
								if (typeof ga == 'function') {
									ga('send', {
										hitType: 'event',
										eventCategory: 'Video',
										eventAction: 'Video Watched %',
										eventLabel: player.getTitle(),
										eventValue: 100
									});
								}

								playthrough[4] = true;
							}

							videoCTA.find('> a:eq(1)').show();
							showCTA();
							target.find('.oo_replay').hide();
						});
					}

					function showCTA() {
						var buttonWidth = 0;

						videoCTA.show().find('> a').each(function () {
              // check if learn more cta has link if not will hide it
							if ($(this).attr('href') === '' && $(this).hasClass('btn')) {
                $(this).hide();
							}

							if ($.inArray($(this).css('display'), ['block', 'inline-block']) > -1) {
								buttonWidth += parseInt($(this).outerWidth(true)) + parseInt($(this).css('marginLeft'));
							}
						}).end().find('> div').css('marginLeft', buttonWidth + 10);

						//If there are no buttons visible, hide CTA.
						if (!videoCTA.find('> a:visible').length) {
							videoCTA.hide();
						}
					}
				},
				autoplay: true,
				wmode: 'transparent'
			});
		});

		$(this).off('click');
	});

	addResize(function () {
		// addResize is invoked as break points is hit when it is dragged
		// height of player-wrapper is recalculated by 16 by 9 ratio
		setTimeout(function () {
			var player = $('#player-wrapper'), h = Math.floor(player.width() * 9) / 16;

			player.css('height', h);
			$('.media-player-container').css('height', h).find('.img-responsive').css('height', h);
		}, 650);
	}, true);
});
