/* Used on Responsive New Header/Footer */

var burl = location.href;

$(document).ready(function () {
	//Social media toolbar
	if ($('.social-media-toolbar').length) {
		socialMediaToolbar();
	}

	//Off Canvas
	if ($('[data-toggle=offcanvas],[data-toggle=show-offcanvas]').length) {
		$.getScript('/static/js/off-canvas.min.js');
	}

	//Toggle Show/Hide
	$('body').on('click', '[data-toggle=show],[data-toggle=show-offcanvas]', function (e) {
		e.preventDefault();

		var target = $($(this).data('target')), //target drop down element
			sourceElem = $(this); //the element this event is being triggered.

		//Do not proceed if on mobile.
		if (pageWidth < 768) {
			return false;
		}

		//close all open dropdowns
		$('.optional-dropdown').each(function () {
			if ($(this).is(':visible') && !target.is(':visible')) {
				$(this).hide().data('hidden-class', 'hidden');
				$(this).data('parent-container').css('height', ''); // reseting the hright of the container
			}

		});

		if (target.is(':visible')) {
			if (target.data('hidden-class')) {
				target.addClass(target.data('hidden-class'));
			}
			else {
				target.hide();
			}

			target.css({top: ''});
			$(this).parents('.container').css('height', '');
		}
		else {
			if (target.hasClass('hidden')) {
				target.data('hidden-class', 'hidden');
				target.removeClass('hidden').show();
			}
			else {
				target.show();
			}

			//Reset
			$(target).css({top: '', marginBottom: ''}).data('parent', $(this));

			//adjust triangle position based on source element
			if ($(target).find('.triangle-top').length) {
				var top = $(this).offset().top + $(this).outerHeight(true) + 12;

				//Find offset if parents of target element has relative positioning.
				var tmpParent = $(target).parent();

				while (tmpParent.get(0).nodeName != 'BODY') {
					if (tmpParent.css('position') == 'relative') {
						top -= tmpParent.offset().top;
						break;
					}

					tmpParent = tmpParent.parent();
				}

				$(target)
					.css({
						'top': top
					})
					.find('.triangle-top').css('left', $(this).offset().left + $(this).width() / 2 + 8);
			}

			var parentContainer = $(this).parents('.container');

			setTimeout(function () {
				if (parentContainer.length) {
					var parentHeight = $(target).offset().top + $(target).height() - parentContainer.offset().top;

					if (parentContainer.height() < parentHeight) {
						parentContainer.css('height', parentHeight);
					}

					$(target).data('parent-container', parentContainer);

					//Scroll to the drop down
					$('html, body').animate({scrollTop: sourceElem.offset().top - sourceElem.height() - 25});
				}
			});

			setTimeout(function () {
				processFlex(target);
			}, 250);

			processEllipsis(target);
		}
	});

	//Workaround for placeholder on unsupported browser
	(function () {
		var test = document.createElement('input');
		if (!('placeholder' in test)) {
			if ($.fn.placeholder) {
				$('input').placeholder();
			}
			else {
				$.getScript('/static/library/jQuery/jquery.placeholder.min.js', function () {
					$('input').placeholder();
				});
			}
		}
	})();

	if ($('form').filter('.has-slide').length) {
		$.getScript('/static/js/events.min.js');
	}

	//LazyLoad
	if ($.fn.lazyload) {
		$('img.lazy').lazyload();
	}
	else {
		$.getScript('/static/library/jQuery/jquery.lazyload.min.js', function () {
			$('img.lazy').lazyload();
		});
	}

	//Hero Banner
	if ($('.hero-banner').length) {
		//Randomize banner
		var randomNumber = Math.floor((Math.random() * $('.item').length));
		$('.item').eq(randomNumber).addClass("active");
		$('.hero-banner .carousel-indicators li').eq(randomNumber).addClass("active");

		$('.hero-banner .carousel').find('.lazy').each(function () {
			$(this).attr('src', $(this).data('original')).removeClass('lazy');
		});
	}

	//Resizing Fat Tabs
	addResize(function () {
		if (pageWidth < 768) {//mobile
			try {
				$('.fat-tabs').tabs('destroy');
			}
			catch (e) {

			}
		}
		else {
			$('.fat-tabs').tabs({
				create: function (event, ui) {
					// Adjust hashes to not affect URL when clicked
					var widget = $('.fat-tabs').data("uiTabs");
					widget.panels.each(function (i) {
						this.id = "uiTab_" + this.id; // Prepend a custom string to tab id
						widget.anchors[i].hash = "#" + this.id;
						$(widget.tabs[i]).attr("aria-controls", this.id);
					});
					//added this fix for FF
					window.scrollTo(0, 0);
				},
				activate: function (event, ui) {
					// Add the original tab id to the URL hash
					window.location.hash = ui.newPanel.attr("id").replace("uiTab_", "");

					ui.newPanel.trigger('tab.visible');
					ui.oldPanel.trigger('tab.hidden');

					resizeFourColumnFilmstripCarousel(ui.newPanel);
					//fix for slick not being initialized when tab activated
					slickPlugin(ui.newPanel);
					loadOoyala(ui.newPanel);
				}
			});
		}

		$(window).load(function () {
			//Remove site catalyst on click attribute on achor tag.
			$('.fat-tabs').find('> ul').find('a').each(function () {
				$(this).prop('onclick', null);
			});
		});
	}, true);

	//Ooyala player popup
	$('body').on('click', '.ooplaylist', function (e) {
		e.preventDefault();

		var width = 642,
			title = '',
			config = $.parseJSON($(this).data('config').replace(/'/g, '"')),
			content = '';

		if (typeof config.title != 'undefined') {
			title = config.title;
		}
		else {
			title = $(this).text();
		}

		if (typeof config.description == 'undefined') {
			config.description = '';
		}

		title = encodeURIComponent(title);

		if (typeof config.playlist == 'string') {
			width = 861;

			content = '<iframe id="oo-popup-content" src="/hidden/ooyala-iframe.htm?playlist=' + config.playlist + '" width="' + width + '" height="407" frameborder="0" scrolling="no"></iframe>';
		}
		else {
			content = '<iframe id="oo-popup-content" src="/hidden/ooyala-iframe.htm?ooyala=' + config.ooyala + '&autoplay=' + config['autoplay'] + '&3Play=' + config['3Play'] + '&title=' + title + '&desc=' + encodeURIComponent(config.description) + '&url=' + config.url + '" width="' + width + '" height="407" frameborder="0" scrolling="no"></iframe>';
		}

		if ($('body').data('modal-appended') == false || $('body').data('modal-appended') == undefined) {
			var modalContent =
				'<div class="modal fade" id="oomodal" tabindex="-1" role="dialog">' +
				'<div class="modal-dialog" role="document">' +
				'<div class="modal-content">' +
				'<div class="modal-header">' +
				'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
				'<div>' +
				'<div class="modal-body">' +
				content +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>';
			$('body').append(modalContent);
			$('body').data('modal-appended', 'true');
		}
		$('.ooplaylist').modal();
	});

	//Toggle
	/*$('body').find('[data-toggle=show],[data-toggle=show-offcanvas]').each(function () {
	 var target = $($(this).data('target'));

	 if (target.is(':visible')) {
	 if (target.data('hidden-class')) {
	 target.addClass(target.data('hidden-class'));
	 }
	 else {
	 target.hide();
	 }
	 }
	 });*/

	//close button in optional dropdown
	$('body').on('click', '.close', function () {
		if ($(this).data('target') == undefined) {
			//Check if this is inside an optional dropdown
			if ($(this).parents('.optional-dropdown').length) {
				$(this).parents('.optional-dropdown').addClass('hidden');
				$(this).parents('.optional-dropdown').data('parent').parents('.container').css('height', '');
			}
		}
		else {
			var closeTarget = $(this).parents('#' + $(this).data('target'));

			if (closeTarget.length && closeTarget != undefined) {
				closeTarget.addClass('hidden');
			}

			if (closeTarget.data('parent')) {
				closeTarget.data('parent').parents('.container').css('height', '');
			}
		}

	});

	addResize('resizeFourColumnFilmstripCarousel', true);
	addResize('grayscaleImage', true);
	loadOoyala();

	//Slick Plugin
	addResize('slickPlugin', true);

	if ($('#affix-nav').length) {
		addResize('resizeAffix', true);
	}

	//Button Flyout
	if ($('#button-flyout').length) {
		$.getScript('/static/js/button-flyout.min.js');
	}

	//Collapse
	$('body').on('click', '[data-toggle=collapse]', function () {
		var elem = $(this);

		setTimeout(function () {
			if (!elem.hasClass('collapsed')) {
				if (elem.data('hide-when-expanded')) {
					elem.hide(0, function () {
						$(elem.data('target')).children().unwrap();
						elem.remove();
					});
				}
			}
		}, 100);
	});

	//Show more list [UL]
	/*if($('ul').filter('.has-show-more')) {
	 getLocalizedContent(['LabelShowMore']).done(function(data) {
	 $('ul').filter('.has-show-more').each(function() {
	 var pos = parseInt($(this).data('show-more-position'));

	 if($(this).find('> li').length > pos) {
	 var elem = $('<li><a href="#"><i aria-hidden="true" class="icon-ui-triangleright"></i>' + data.LabelShowMore + '</a></li>');

	 elem.find('a').on('click', function(e) {
	 e.preventDefault();

	 $(this).parents('ul').find('> li').show();
	 $(this).parent().remove();
	 });

	 elem.insertAfter($(this).find('> li:eq(' + (pos-2) + ')'));

	 $(this).find('> li:gt(' + (pos-1) + ')').hide();

	 }
	 });
	 });
	 }*/
	/* i.e.
	 <ul class="has-show-more" data-show-more-position="8">
	 <li>Microsoft Windows 7 (all x64 editions)</li>
	 <li>Microsoft Windows 8* (all x64 editions)</li>
	 <li>Microsoft Windows 8.1* (all x64 editions)</li>
	 <li>Microsoft Windows Server 2008 (all x64 editions except Windows Server 2008 Core)</li>
	 <li>Microsoft Windows Server 2008 R2 (all x64 editions except Windows Server 2008 R2 Core)</li>
	 <li>Microsoft Windows Server 2012* (all x64 editions except Windows Server 2012 Core)</li>
	 <li>Microsoft Windows Server 2012 R2* (all x64 editions except Windows Server 2012 R2 Core)</li>
	 <li>1--Microsoft Windows 7 (all x64 editions)</li>
	 <li>2--Microsoft Windows 8* (all x64 editions)</li>
	 <li>3--Microsoft Windows 8.1* (all x64 editions)</li>
	 <li>4--Microsoft Windows Server 2008 (all x64 editions except Windows Server 2008 Core)</li>
	 <li>5--Microsoft Windows Server 2008 R2 (all x64 editions except Windows Server 2008 R2 Core)</li>
	 <li>6--Microsoft Windows Server 2012* (all x64 editions except Windows Server 2012 Core)</li>
	 <li>7--Microsoft Windows Server 2012 R2* (all x64 editions except Windows Server 2012 R2 Core)</li>
	 </ul>
	 */

	//Bleed Margins [Not in use]
	addResize(function () {
		$('.bleed').each(function () {
			var children = $(this).children(), lastChild = children.length - 1;

			//Start Reset
			$(this).css('marginTop', '');
			$(children[0]).css('marginTop', '');

			$(this).css('marginBottom', '');
			$(children[lastChild]).css('marginBottom', '');
			//End Reset

			var marginTop = parseInt($(children[0]).css('marginTop')), marginBottom = parseInt($(children[lastChild]).css('marginBottom'));

			if (marginTop) {
				$(this).css('marginTop', marginTop + parseInt($(this).css('marginTop')));
				$(children[0]).attr('style', 'margin-top: 0px !important;');
			}

			if (marginBottom) {
				$(this).css('marginBottom', marginBottom + parseInt($(this).css('marginBottom')));

				var style = (lastChild ? '' : $(children[lastChild]).attr('style'));

				if (style === undefined) {
					style = '';
				}

				$(children[lastChild]).attr('style', style + 'margin-bottom: 0px !important;');
			}
			else if ($(children[lastChild]).css('overflow') == 'visible') {

			}
		});
	}, true);

	//Comparison
	if ($('.comparison').length) {
		$.getScript('/static/js/comparison.min.js');
	}

	//Scroll up on accordion, if and only if a previous accordion is open and is above the new opened accordion.
	$(document).on('show.bs.collapse', function (e) {
		//check if clicked panel is below an open one

		var targetOpenElem = $(e.target).parent(),
			containerElem = $(targetOpenElem).parents('.container'),
			previousOpenElem = containerElem.find('a[aria-expanded="true"]');

		if (previousOpenElem.length && previousOpenElem.offset().top < targetOpenElem.offset().top) {
			window.scrollTo(0, containerElem.offset().top - 50);
		}
	});

	processEllipsis();

	if ($('.comparison-table').data('xs-collapsibles')) {
		addResize('processComparisonTable', true);
	}
});

$(window).load(function () {
	//Dotdotdot
	/* Had to move from document ready to window load because we had an issue where data-max-line didn't work as expected. */
	/* Re-process ellipsis to ensure that we don't have an issue with data-max-line */
	processEllipsis();

	//match columns height
	addResize('matchHeight', true);
});

//Flex box degradation
addResize(function () {
	if (document.readyState == 'complete') {
		processFlex();
	}
	else {
		$(window).load(function () {
			processFlex();
		});
	}
}, true);

//Optional Dropdown. Hide when resize.
addResize(function () {
	$('[data-toggle=show-offcanvas]').each(function () {
		var target = $($(this).data('target'));
		//reset height of the parent container
		$(this).parents('.container').css('height', '');

		if (target.is(':visible')) {
			if (target.data('hidden-class')) {
				target.addClass(target.data('hidden-class'));
			}
			else {
				target.hide();
			}

			target.css({top: ''});
			$(this).parents('.container').css('height', '');
		}
	});
});

function slickPlugin(parentSelector) {
	if (typeof parentSelector == 'undefined') {
		parentSelector = 'body';
	}

	if ($(parentSelector).find('.slick').length) {
		if ($.fn.slick) {
			init();
		}
		else {
			//$('head').append('<link rel="stylesheet" type="text/css" href="/static/css/slick.min.css?' + new Date().getTime() + '">');
			$.getScript('/static/library/jQuery/slick-1.5.9/slick.min.js').done(init);
		}
	}

	function init() {
		var defaults = {
			arrows: true,
			infinite: false,
			slidesToShow: 4,
			slidesToScroll: 1,
			lazyLoad: 'ondemand'
		};

		$(parentSelector).find('.slick').each(function () {
			var cfg = jQuery.extend(true, {}, defaults);

			$(this).find('img').each(function () {
				if ($(this).data('lazy')) {
					$(this).attr('src', $(this).data('lazy')).removeData('lazy');
				}
			});

			//Destroy slick
			if ($(this).data('active') == 'xs-only' && pageType != 0) {
				if ($(this).hasClass('slick-initialized')) {
					$(this).slick('destroy');
				}

				$(this).css('visibility', 'visible');

				return true;
			}

			if (pageType == 0) {
				cfg.slidesToShow = 1;
			}
			else if (pageType == 1) {
				cfg.slidesToShow = $(this).data('slide-sm') || 3;
			}
			else if (pageType == 2) {
				cfg.slidesToShow = $(this).data('slide-md') || 4;
			}
			else if (pageType == 3) {
				cfg.slidesToShow = $(this).data('slide-lg') || 4;
			}

			if ($(this).hasClass('slick-initialized')) {
				$(this).slick('destroy');
			}

			if ($(this).hasClass('banner')) {
				cfg.dots = true;
				cfg.autoplaySpeed = 6000;
				cfg.arrows = false;
				cfg.slidesToShow = 1;
				cfg.autoplay = true;
				cfg.infinite = true;

				if ($(this).data('random')) {
					cfg.initialSlide = Math.floor(Math.random() * $(this).find('> div').length);
				}

				$(this).find('> div').css('display', 'block');
			}

			if ($(this).find('> div').length > cfg.slidesToShow) {
				if (!$(this).hasClass('banner')) {
					$(this).on('init', function (e, slick) {
						var arrowsPos = 0, elem = $(this), firstImage = elem.find('img:first');

						if (firstImage.parent().hasClass('img-crop')) {
							arrowsPos = firstImage.parent().height() / 2 - 30;
						}
						else if (firstImage.parents('.img-crop').length) {
							arrowsPos = firstImage.parents('.img-crop').height() / 2 - 30;
						}
						else {
							arrowsPos = firstImage.height() / 2 - 30;
						}

						if (arrowsPos <= 0) {
							var firstImageInterval = setInterval(function () {
								var imgHeight = elem.find('.slick-active').find('img:first').height();

								if (imgHeight > 100) {
									clearInterval(firstImageInterval);
									elem.find('.slick-arrow').css('top', imgHeight / 2 - 30);

									if ($(slick.$list).parent().data('screenshot') || $(slick.$list).parent().hasClass('slick-screenshot')) {
										fixScreenshot.call(elem, e, slick, 0, 0);
									}
								}
							}, 100);
						}
						else {
							elem.find('.slick-arrow').css('top', arrowsPos);

							if ($(slick.$list).parent().data('screenshot') || $(slick.$list).parent().hasClass('slick-screenshot')) {
								fixScreenshot.call(elem, e, slick, 0, 0);
							}
						}
					});
				}

				$(this).slick(cfg);

				/*un-commented to fix headline-description alignment issue with image*/
				if ($(this).data('screenshot') || $(this).hasClass('slick-screenshot')) {
					$(this).on('beforeChange', fixScreenshot);
				}
			}
			else {
				$(this).css('visibility', 'visible');
			}
		});
	}

	function fixScreenshot(e, slick, currentSlide, nextSlide) {
		var elem = $(slick.$slides[nextSlide]),
			slideWidth = elem.width(),
			imgWidth = elem.find('img').width(),
			innerDiv = elem.find('> div');

		elem.css('opacity', 0);

		innerDiv.css('width', '');

		//in case image didn't load in time.
		$(elem).find('img').on('load', function () {
			innerDiv.css('width', '').addClass('inline-block');

			var imgWidth = $(this).width();

			if (slideWidth < imgWidth) {
				innerDiv.css('width', slideWidth);
			}
			else {
				innerDiv.css('width', imgWidth);
			}

			elem.css('opacity', 1);
		});

		if (imgWidth > 0) {
			if (slideWidth < imgWidth) {
				innerDiv.css('width', slideWidth);
			}
			else {
				innerDiv.css('width', imgWidth);
			}

			innerDiv.addClass('inline-block');
			elem.css('opacity', 1);
		}
	}
}

function processFlex(parentSelector) {
	if (typeof parentSelector == 'undefined') {
		parentSelector = 'body';
	}

	if ($(parentSelector).find('.vertical-center').length && !$('html').hasClass('flexbox')) {
		$(parentSelector).find('.vertical-center').each(function () {
			if (!$(this).is(':visible')) {
				return true;
			}

			var child = $(this).children();

			//Reset
			if ($(this).data('flex-processed')) {
				/*child.each(function () {
				 $(this).get(0).style.textAlign = '';
				 $(this).get(0).style.display = '';
				 $(this).get(0).style.width = '';
				 $(this).get(0).style.paddingLeft = '';
				 });*/

				//New Implementation

				child.each(function () {
					$(this).get(0).style.position = '';
					$(this).get(0).style.left = '';
					$(this).get(0).style.top = '';
					$(this).get(0).style.marginLeft = '';
					$(this).get(0).style.marginTop = '';
					$(this).get(0).width = '';
				});
			}

			var centerHorizontal = $(this).hasClass('horizontal-center'), width = $(this).width(), height = $(this).height();

			/*var height = $(this).height(),
			 width = $(this).outerWidth(),
			 centerHorizontal = $(this).hasClass('horizontal-center');*/

			//Should only have 1 children. Multiple children might not work.
			/*child.each(function () {
			 if ($(this).css('display') == 'block') {
			 $(this).css({
			 display: 'inline-block',
			 width: $(this).parent().width()
			 });
			 }

			 $(this).css({
			 paddingTop: Math.floor((height - $(this).height()) / 2)
			 });

			 if (centerHorizontal) {
			 if(width == $(this).outerWidth()) {
			 $(this).css({
			 textAlign: 'center'
			 });
			 }
			 else {
			 $(this).css({
			 paddingLeft: Math.floor((width - $(this).outerWidth()) / 2)
			 });
			 }
			 }
			 });*/

			//New Implementation

			child.each(function () {
				if ($(this).css('display') == 'block') {
					$(this).css({display: 'inline-block'});
				}

				//If the centered width is greater than the parent element, set the width of the inner element.
				if (width < $(this).width()) {
					$(this).css({width: width});
				}

				if (height > $(this).height()) {
					$(this).css({
						position: 'absolute',
						top: '50%',
						marginTop: -1 * $(this).height() / 2
					});
				}

				if (width > $(this).width()) {
					if (centerHorizontal) {
						$(this).css({
							position: 'absolute',
							left: '50%',
							marginLeft: -1 * $(this).width() / 2
						});
					}
				}
			});

			$(this).data('flex-processed', true);
		});
	}
}

function processEllipsis(parentSelector) {
	var deferred = $.Deferred();

	if (typeof parentSelector == 'undefined') {
		parentSelector = 'body';
	}

	//Dotdotdot
	if ($('.dotdotdot').length) {
		if ($.fn.dotdotdot) {
			init();
		}
		else {
			$.getScript('/static/library/jQuery/jquery.dotdotdot.min.js', function () {
				init();
			});
		}
	}

	function init() {
		$(parentSelector).find('.dotdotdot').filter(':visible').each(function () {
			if ($(this).triggerHandler('isTruncated')) {
				//console.log('truncated', this);
				$(this).trigger('destroy');
			}

			var oneLineHeight = 0, options = {}, content = '', proceed = false;

			//Remove empty paragraph tags.
			$(this).find('p').each(function () {
				if ($(this).html() == '') {
					$(this).remove();
				}
			});

			if ($(this).css('max-height') == 'none') {
				content = $(this).html();

				//Find height of one line.
				$(this).html('<p>.</p>');
				oneLineHeight = parseInt($(this).outerHeight());

				//options.tolerance = Math.ceil(oneLineHeight/4);

				//Restore original content.
				$(this).html(content);

				if ($(this).data('max-line')) { //Used for all breakpoints.
					options.height = $(this).data('max-line') * oneLineHeight;
					proceed = true;
				}

				if (pageWidth >= 1200 && $(this).data('max-line-lg')) {
					options.height = $(this).data('max-line-lg') * oneLineHeight;
					proceed = true;
				}
				else if (pageWidth >= 992 && $(this).data('max-line-md')) {
					options.height = $(this).data('max-line-md') * oneLineHeight;
					proceed = true;
				}
				else if (pageWidth >= 768 && $(this).data('max-line-sm')) {
					options.height = $(this).data('max-line-sm') * oneLineHeight;
					proceed = true;
				}
				else if (pageWidth < 768 && $(this).data('max-line-xs')) {
					options.height = $(this).data('max-line-xs') * oneLineHeight;
					proceed = true;
				}
			}

			if (proceed) {
				if ($(this).data('read-more')) {
					$(this).append('<a class="dotdotdot-read-more" href="javascript:void(0)">Read More <span aria-hidden="true" class="glyphicon glyphicon-triangle-bottom"></span></a>');
					options.after = '.dotdotdot-read-more';
				}

				$(this).dotdotdot(options);

				if ($(this).triggerHandler('isTruncated')) {
					$(this).on('click', '.dotdotdot-read-more', function (e) {
						var p = $(this).parents('.dotdotdot');
						e.preventDefault();
						p.trigger('destroy');
						p.find('.dotdotdot-read-more').remove();
					});
				}
				else {
					$(this).find('.dotdotdot-read-more').remove();
				}
			}

			deferred.resolve();
		});
	}

	return deferred;
}

function loadOoyala(parentSelector) {
	if (typeof parentSelector == 'undefined') {
		parentSelector = 'body';
	}

	if ($(parentSelector).find('.ooyalaplayer').length) {
		if (typeof OO == 'object') {
			init();
		}
		else {
			if (typeof window['OOCreate'] == 'function') {
				loadJS();
			}
			else {
				$('head').append('<link rel="stylesheet" href="/static/css/video-player.min.css?' + new Date().getTime() + '">');

				$.getScript('/static/js/video-player.min.js', function () {
					loadJS();
				});
			}
		}
	}

	function loadJS() {
		if ($('html').hasClass('ie9') || $('html').hasClass('ie8')) {
			$.getScript('//player.ooyala.com/v3/9eba220ad98c47cda9fdf6ba82ce607a?callback=receiveOoyalaP3Event', function () {
				init();
			});
		}
		else {
			$.getScript('//player.ooyala.com/v3/9eba220ad98c47cda9fdf6ba82ce607a?platform=html5&callback=receiveOoyalaP3Event',
				function () {
					init();
				});
		}
	}

	function init() {
		OO.ready(function () {
			$(parentSelector).find('.ooyalaplayer').each(function (indx) {
				var id = $(this).attr('id'),
					videoId = $(this).data('videoid');

				if (id === undefined) {
					id = 'op-' + getRandomString(8);
					$(this).attr('id', id);
				}

				if ($(this).data('on-demand')) {
					var parentContainer = $(this).parent(), elem = $(this);

					if (parentContainer.hasClass('media-player-container')) {
						elem = parentContainer;

						//Check if play button overlay is present, if not create it.
						/*if($(!parentContainer.find('.img-overlay').length)) {
						 var buttonOverlay = '<div class="img-overlay vertical-center horizontal-center"><div><span class="icon-ui-play-underlay"></span><span class="icon-ui-play"></span></div></div>';

						 $(buttonOverlay).insertAfter(parentContainer.find('img:first'));
						 }*/
					}

					elem.on('click', function () {
						if (!$('#' + id).data('loaded')) {
							var videoHeight = Math.floor(($(this).width() * 9) / 16), imgURL = '';

							if (parentContainer && parentContainer.hasClass('media-player-container')) {
								$(this).css('height', videoHeight);
								//$(this).parent().css('height', videoHeight);

								imgURL = parentContainer.find('> img').attr('src');

								parentContainer.find('> img').remove().end().find('> .img-overlay').remove();
							}

							window['ooyala_player_handle_' + indx] = OO.Player.create(id, videoId, {
								onCreate: function (player) {
									//Autoplay workaround for mobile devices. Does not work because of security issue on mobile phone.
									/*player.mb.subscribe(OO.EVENTS.PLAYBACK_READY, 'UITeam', function () {
									 player.play();

									 var playButton = $('#' + id).find('.oo_play');

									 var i = setInterval(function() {
									 if(playButton.is(':visible') && $('#' + id).find('.oo_tap_panel').length) {
									 $('#' + id).find('.oo_tap_panel').trigger('click');
									 playButton.trigger('click');
									 clearInterval(i);
									 }
									 }, 10);
									 });*/

									OOCreate(player);

									//Instead of loading Ooyala still image, use DSG still image. Don't need to download the same image again.
									//Ooyala image might still be downloaded in the background but at least DSG image will show immediately.
									var i = setInterval(function () {
										var elem = $('#' + id).find('.oo_promo');

										if (elem.length && elem.css('backgroundImage') != 'none') {
											if (imgURL != '') {
												elem.css('backgroundImage', 'url("' + imgURL + '")');
											}

											clearInterval(i);
										}
									}, 10);
								},
								autoplay: true,
								wmode: 'transparent'
							});

							$('#' + id).data('loaded', true);
							$(this).off('click');
						}
					});
				}
				else if ($(this).is(':visible') && videoId !== undefined) {
					if (!$('#' + id).data('loaded')) {
						var videoHeight = Math.floor(($(this).width() * 9) / 16);

						if ($(this).parent().hasClass('media-player-container')) {
							$(this).css('height', videoHeight);
							$(this).parent().css('height', videoHeight);
						}

						window['ooyala_player_handle_' + indx] = OO.Player.create(id, videoId, {
							onCreate: OOCreate,
							autoplay: false,
							wmode: 'transparent'
						});

						$('#' + id).data('loaded', true);
					}
				}
			});
		});
	}
}

function resizeFourColumnFilmstripCarousel(parentSelector) {
	if (typeof parentSelector == 'undefined') {
		parentSelector = 'body';
	}

	if ($(parentSelector).find('.screenshot-carousel').length && location.pathname != '/') {
		if ($.fn.slidePagination2) {
			init();
		}
		else {
			$.getScript('/static/library/jQuery/jquery.slidepagination.min.js', function () {
				init();
			});
		}
	}

	function init() {
		if ($(parentSelector).find('.screenshot-carousel').length) {
			var sliderOptions = {
				list: '> ul',
				column: 4,
				row: 1,
				largeArrow: true,
				pagination: [
					{type: 'prepend', nextArrow: false, align: 'left'},
					{type: 'prepend', prevArrow: false}
				]
			};

			$(parentSelector).find('.screenshot-carousel').each(function () {
				if (!$(this).is(':visible')) {
					return true;
				}

				var options = sliderOptions;

				//Only destroy slide pagination if it has already been generated.
				$(this).slidePagination2('destroy');

				if ($(this).data('large-arrows') == 'true') {
					options.largeArrow = true;
					options.pagination = [
						{type: 'prepend', nextArrow: false, align: 'left'},
						{type: 'prepend', prevArrow: false}
					];
				}

				if ($(this).data('row')) {
					options.row = $(this).data('row');
				}

				if (pageWidth >= 992) {
					if ($(this).data('carousel') === 'xs-only') {
						return true;
					}

					options.column = $(this).data('col') ? $(this).data('col') : 4;
				}
				else if (pageWidth >= 768) { //tablet
					if ($(this).data('carousel') === 'xs-only') {
						return true;
					}

					options.column = $(this).data('col-sm') ? $(this).data('col-sm') : 3;
				}
				else if (pageWidth < 768) { //mobile
					options.column = $(this).data('col-xs') ? $(this).data('col-xs') : 1;
				}

				$(this).slidePagination2(options);
			});
		}
	}
}

function socialMediaToolbar() {
	//var bitlyURL = url = location.href;
	var host = location.host.replace(/\-/g, '.'),
		bitlyURL = url = 'https://' + host + location.pathname,
		approvedBitlyGeneration = ['software.dell.com', 'www.quest.com', 'eee.quest.com'];

	//If protocol is https find previous page.
	if (location.protocol == 'https:') {
		var pathnameArr = location.pathname.split('/');

		if (/^\?param=/.test(location.search)) {
			pathnameArr[1] = pathnameArr[1].replace(/(.*)t$/, '$1');
			bitlyURL = url = 'https://' + host + pathnameArr.join('/');
		}
	}

	if ($('.g-plusone').length) {
		$('.g-plusone').attr('data-href', url);

		//Google+
		(function () {
			var po = document.createElement('script');
			po.type = 'text/javascript';
			po.async = true;
			po.src = '//apis.google.com/js/plusone.js';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(po, s);
		})();
	}

	//Retrieve bit.ly url
	if (window.XMLHttpRequest && $.inArray(location.host, approvedBitlyGeneration) > -1 && !/\/emailcl\//.test(location.pathname)) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "/hidden/bitly.asmx/get?URI=" + encodeURIComponent(url.replace('eee', 'www')));
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					xml = $($.parseXML(xhr.responseText));
					var obj = jQuery.parseJSON(xml.find("string").text());

					if (typeof obj.data != 'undefined') {
						bitlyURL = obj.data.url;
					}
				}
			}
		};
		xhr.send();
	}

	//Interaction when clicking on facebook, twitter and linkedin
	$('.social-media-toolbar').on('click', 'a', function (e) {
		var parent = $(this).parent(), title = document.title, via = 'DellSoftware';

		if (parent.hasClass('facebook')) {
			if (typeof s == 'object' && false) {
				//s.tl(this, 'o', 'Share-Facebook');
				s.events = "event13";
				s.eVar18 = "Facebook";
				s.linkTrackVars = "events,eVar18";
				s.linkTrackEvents = "event13";
				s.tl(true, 'o', 'Social Media');
			}

			//_gaq.push(['_trackSocial', 'Facebook', 'Share']);

			e.preventDefault();
			window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(url) + '&t=' + encodeURIComponent(title), 'facebook', 'width=480,height=240,toolbar=0,status=0,resizable=1');
		}
		else if (parent.hasClass('twitter')) {
			if (typeof s == 'object' && false) {
				//s.tl(this, 'o', 'Share-Twitter');
				s.events = "event13";
				s.eVar18 = "Twitter";
				s.linkTrackVars = "events,eVar18";
				s.linkTrackEvents = "event13";
				s.tl(true, 'o', 'Social Media');
			}
			//_gaq.push(['_trackSocial', 'Twitter', 'Tweet']);
			//console.log(bitlyURL);
			//console.log(url);
			//Override twitter title for security (adding #)
			if (location.host == 'security.dell.com') {
				title = 'Dell Security Solutions: Be the #DeptofYes';
			}

			e.preventDefault();

			if (url.includes("quest")) {
				via = 'QuestSoftware';
			}

			window.open('http://twitter.com/share?via=' + via + '&url=' + encodeURIComponent(bitlyURL) + '&text=' + encodeURIComponent(title) + ',%20&counturl=' + encodeURIComponent(url), 'twitter', 'width=480,height=380,toolbar=0,status=0,resizable=1');
		}
		else if (parent.hasClass('linkedin')) {
			if (typeof s == 'object' && false) {
				//s.tl(this, 'o', 'Share-LinkedIn');
				s.events = "event13";
				s.eVar18 = "LinkedIn";
				s.linkTrackVars = "events,eVar18";
				s.linkTrackEvents = "event13";
				s.tl(true, 'o', 'Social Media');
			}
			//_gaq.push(['_trackSocial', 'LinkedIn', 'Share']);

			e.preventDefault();

			window.open('http://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title), 'linkedin', 'width=480,height=360,toolbar=0,status=0,resizable=1');
		}
		else if (parent.hasClass('googleshare')) {
			e.preventDefault();
			window.open('https://plus.google.com/share?url=' + encodeURIComponent(location.href), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
			return false;
		}
	});
}

function grayscaleImage() {
	if ($('.grayscale').length) {
		init('.grayscale');
	}
	if (pageWidth >= 1200 && $('.grayscale-lg').length) {
		init('.grayscale-lg');
	}
	if (pageWidth >= 992 && $('.grayscale-md').length) {
		init('.grayscale-md');
	}
	if (pageWidth >= 768 && $('.grayscale-sm').length) {
		init('.grayscale-sm');
	}
	if ($('.grayscale-xs').length) {
		init('.grayscale-xs');
	}

	function init(className) {
		if (document.readyState == 'complete') {
			execute(className);
		}
		else {
			$(window).load(function () {
				execute(className);
			});
		}
	}

	function execute(className) {
		if ($.fn.gray) {
			setTimeout(function () {
				$(className + ':not(.grayscale-replaced)').gray();
			}, 200);
		}
		else {
			$('head').append('<link rel="stylesheet" href="/static/css/grayscale-image.min.css">');

			$.getScript('/static/library/jQuery/jquery.gray.min.js', function () {
				setTimeout(function () {
					$(className + ':not(.grayscale-replaced)').gray();
				}, 200);
			});
		}
	}
}

function getRandomString(len) {
	var ranString = '',
		alphaLower = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
		alphaUpper = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
		digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
		r, n, ranString;

	for (i = 0; i < len; i++) {
		r = Math.random() * 8;

		if (r >= 0 && r <= 2) {
			n = Math.floor(Math.random() * 25);
			ranString += alphaLower[n];
		}
		else if (r >= 3 && r <= 5) {
			n = Math.floor(Math.random() * 25);
			ranString += alphaUpper[n];
		}
		else if (r >= 6) {
			n = Math.floor(Math.random() * 9);
			ranString += digits[n];
		}
	}

	return ranString;
}

function resizeAffix() {
	var affixID = '#affix-nav',
		affixElem = $(affixID),
		siteWrapper = $('.site-wrapper'),
		body = $('body').css('position', 'relative');

	reset();

	if (affixElem.data('even-width') && ((pageType == 0 && !affixElem.hasClass('affix-list-xs')) || pageType > 0)) {
		affixElem.find('li').css('width', (100 / affixElem.find('li').length) + '%');
	}

	if (pageType > 0 || !affixElem.hasClass('affix-list-xs')) {
		//Need to break out of the sequential flow in order to retrieve the true height.
		setTimeout(function () {
			affixElem.find('li').css('height', affixElem.height());
		});

		//Navigate to bookmark.
		affixElem.on('click', 'a', affixAnchorClick);

		siteWrapper.attr('id', 'top');

		//fix for affix width changing when floating on the page
		affixElem.css("width", affixElem.parents('.container').width());

		//trigger scrollspy if it hasn't been triggered already
		/*set offset to activate tab based on position*/
		body.scrollspy({
			target: affixID,
			offset: affixElem.outerHeight(true) + 20
		});

		//trigger affix if it hasn't been triggered already
		setTimeout(function () {
			affixElem.affix({
				offset: {
					top: affixElem.offset().top
				}
			});

			//Prevent page jumpiness when using the scrollbar when passing the first bookmark area.
			affixElem
				.on('affixed.bs.affix', function () {
					$('<div class="affix-dummy">').css('height', $(this).outerHeight(true)).insertAfter(this);
				})
				.on('affixed-top.bs.affix', function () {
					$(this).next().remove();
				});
		}, 250);
	}

	function reset() {
		//Reset
		$('.affix-dummy').remove();
		affixElem.css('width', '').find('li').css({height: 'auto', width: ''});
		affixElem.off('click', 'a', affixAnchorClick);

		//destroy scrollspy
		//body.scrollspy({target: ''});
		affixElem.removeData('bs.scrollspy');

		//destroy affix
		$(window).off('.affix');
		affixElem.removeData('bs.affix').off('affixed.bs.affix').off('affixed-top.bs.affix');
		affixElem.removeClass('affix affix-top affix-bottom');
	}

	function affixAnchorClick(e) {
		e.preventDefault();

		var target = $($(this).attr('href'));

		$('html, body').animate({scrollTop: Math.ceil(target.offset().top - affixElem.height() - parseInt(target.css('marginTop')))}, 500);

		//Workaround where the first tab doesn't have the "active" class when clicked for the first time.
		//$(this).parent().addClass('active');
	}
}

function matchHeight() {
	if ($('*[data-target="match-height"]').filter(':visible').length) {
		if ($.fn.matchHeight) {
			init();
		}
		else {
			$.getScript('/static/library/jQuery/jquery.matchheight.min.js').done(function () {
				init();
			});
		}
	}

	function init() {
		var config = {};

		//if (pageType > 0) {
		//ignore rows if applying match height to elements within a box (this is for product listing page)
		if ($('*[data-ignore-row="1"]').length) {
			config.byRow = false;
		}

		$('*[data-target="match-height"]').filter(':visible').matchHeight(config);
		//}
	}
}

function replaceURL(text) {
	var exp = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	return text.replace(exp, "<a href=\"$1\">$1</a>");
}

/**
 * Create collapsible rows for camparison tables on Mobile view
 */
function processComparisonTable() {

	if (pageWidth < 768 && $('.comparison-table').data('xs-collapsibles')) {
		$('.comparison-table').each(function () {
			if ($(this).data('xs-collapsibles')) {
				var htmlFragment = '';
				/*Generating random string to use as id for collapse instead of #accordion to avoid id duplication issue*/
				var accId = getRandomString(8);

				$(this).find('tbody tr').each(function (index) {
					htmlFragment +=
						'<div class="panel">' +
						'<div class="panel-heading">' +
						'<h4 class="panel-title">' +
						'<a data-toggle="collapse" data-parent="#' + accId + '" href="#panel' + accId + index + '" aria-expanded="false" class="collapsed">'
						+ $(this).find('>td:first-child').text() +
						'</a>' +
						'</h4>' +
						'</div>' +
						'<div id="panel' + accId + index + '" class="collapse table-responsive" aria-expanded="false">' +
						'<div class="panel-body"> ' +
						getBodyContent($(this)) +
						'</div>' +
						'</div>' +
						'</div>';
				});

				$(this).find('.panel-group-collapsible').attr('id', accId).append(htmlFragment);
			}
		});

		/**
		 *
		 * Getting the comparison table content
		 */
		function getBodyContent(row) {
			var panelContentHtml = '';
			row.find('td:gt(0)').each(function () {
				panelContentHtml +=
					'<div class="row">' +
					'<div class="col-xs-10">' +
					'<p>' + $('.comparison-table').find('th').eq($(this).index()).text() + '</p>' +
					'</div>' +
					'<div class="col-xs-2">' +
					$(this).html() +
					'</div>' +
					'</div>';
			});

			return panelContentHtml;
		}
	}
}