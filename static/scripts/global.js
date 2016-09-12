var isChrome = isIE = isSafari = false, burl = '', $path = location.pathname;
//If the browser is Chrome, include additional stylesheet.
if (navigator.appVersion.indexOf('Chrome/') != -1) {
	$('head').append('<link rel="stylesheet" type="text/css" href="/static/styles/chrome.min.css">');
	isChrome = true;
}
else if (navigator.appVersion.indexOf('AppleWebKit/') != -1) {
	isSafari = true;
}
else if (navigator.appName == 'Microsoft Internet Explorer' || /Trident/.test(navigator.userAgent)) {
	isIE = true;
}

$(document).ready(function () {

	if ($path.indexOf('99026') > -1) {
		loadOoyala();
	}
	else {
		$('#content-container').find('h1').css('display', 'block'); // stakeholder requested
		$('#right-form-partialreg').css('display', 'block'); // stakeholder requested the form to in the left, added to the form html
	}

	(function () {
		var lastBreadcrumbElem = $('.breadcrumb').find('li:last');

		lastBreadcrumbElem.html('<span>' + lastBreadcrumbElem.text() + '</span>').hide();

		var breadcrumbHeight = $('.breadcrumb').height();

		$('.breadcrumb').find('li:last').show().css('visibility', 'hidden');

		var breadcrumbWidth = $('.breadcrumb').css({width: 'auto', display: 'inline-block'}).width();
		var totalWidth = $('.breadcrumb').parent().width();

		$('.breadcrumb').css({width: '100%', display: 'block'});

		setTimeout(function () {
			if ($('.breadcrumb').height() >= breadcrumbHeight + 5) {
				var c = 10;

				while ($('.breadcrumb').height() >= breadcrumbHeight + 5) {
					if (!c) {
						break;
					}
					var text = lastBreadcrumbElem.find('span:last').text();

					lastBreadcrumbElem.find('span:last').text(text.substr(0, text.length - 1));
					c--;
				}

				var text = lastBreadcrumbElem.find('span:last').text();

				lastBreadcrumbElem.find('span:last').text(text.substr(0, text.length - 3) + '...');
			}

			lastBreadcrumbElem.css('visibility', 'visible');
		});
	})();

	//First tier navigation
	$('nav').on('click', '#tier1 > li > a, #tier1 > li > span', function () {
		setActiveNavigation.call(this, $(this).parent());

		//Set all li on the 2nd tier to have the same height.
		var ul = $(this).parent().find('> div > ul');

		if (ul.length && ul.data('processed') == undefined) {
			var maxHeight = 0, a = ul.find('> li > a');

			a.each(function () {
				if ($(this).height() > maxHeight) {
					maxHeight = $(this).height();
				}
			});

			a.css('height', maxHeight);
			ul.data('processed', true);
		}

		if ($(this).data('processed') == undefined) {
			if (!$(this).parent().find('.tier2').length) { //tier2 does not exist
				$(this).parent().addClass('no-tier2');

				var aHeight = 0;

				$(this).parent().find('.tier3').find('> div > div > ul > li > a').each(function () {
					if ($(this).height() > aHeight) {
						aHeight = $(this).height();
					}
				});

				$(this).parent().find('.tier3').find('> div > div > ul > li').find('> a, > span').css('height', aHeight);
			}

			$(this).data('processed', true);
		}

		$(this).parent().find('> div > ul > li').removeClass('active');

		//Open the first third tier automatically.
		$(this).parent().find('> div > ul > li:first-child > a').trigger('click');
	});

	//Second tier navigation
	$('nav').find('.tier2 > ul > li > a').each(function () {
		if ($(this).attr('href') == '#') {
			$(this).append('<span class="nav-caret"></span>');
		}
	});

	$('nav').on('click', '.tier2 > ul > li > a', function (e) {
		if ($(this).attr('href') == '#') {
			e.preventDefault();

			//Set active second tier navigation.
			setActiveNavigation.call(this, $(this).parent().parent());

			var tier3 = $(this).next(),
				columns = tier3.find('> div').find('> div'),
				aHeight = 0;

			columns.each(function (i) {
				if ($(this).data('processed') == undefined) {
					if ($(this).find('> ul > li > a').height() > aHeight) {
						aHeight = $(this).find('> ul > li > a').height();
					}

					$(this).find('li').each(function () {
						//Find if any li has a class "next-column". If found, we'll move every item after li.next-column to the next column.
						if ($(this).hasClass('next-column')) {
							var nextColumn = $(columns.get(i + 1)), needToMoveLIs = $(this).nextAll();

							if (nextColumn.find('> ul').length) {
								nextColumn.prepend('<hr>');
							}

							nextColumn.prepend('<ul></ul>');

							var insertInto = $('<li></li>').appendTo(nextColumn.find('> ul:eq(0)'));

							$('<span style="display: inline-block; height: ' + $(this).parent().parent().find('> a').outerHeight(true) + 'px;">&nbsp;</a>').appendTo(insertInto);
							insertInto = $('<ul></li>').appendTo(insertInto);
							insertInto.append(needToMoveLIs);

							$(this).removeClass('next-column');
						}
					});


				}
			});

			if ($(this).data('processed') == undefined) {
				columns.find('> ul > li').each(function () {
					if (!$(this).hasClass('single') && !$(this).parents('.bottom').length) {
						$(this).find('> a, > span').css('height', aHeight);
					}
				});
			}

			$(this).data('processed', true);
		}
	});

	//If user click on the "x" image on the navigation, close the navigation.
	$('nav').on('click', '.close', function (e) {
		e.preventDefault();
		$($(this).parents('li')[1]).removeClass('active');
	});

	function setActiveNavigation(p) {
		$(this).parent().siblings().removeClass('active');

		if (p.hasClass('active')) {
			$(this).parent().removeClass('active');
		}
		else {
			p.siblings().removeClass('active');
			$(this).parent().addClass('active');
		}
	}

	//Determine width if there's only 4 column
	$('.tier3').each(function () {
		var c = 0;

		$(this).find('> div').find('> div').each(function () {
			if ($(this).hasClass('bottom')) {
				return true;
			}
			c++;
		});

		if (c == 4) {
			$(this).find('> div').find('> div').each(function () {
				if ($(this).hasClass('bottom')) {
					return true;
				}
				$(this).css('width', '22.6%');
			});
		}
	});

	/* Country Dropdown */

	$('#list-countries').on('click', function (e) {
		e.stopPropagation();
		e.preventDefault();

		$('#list-countries-popup').toggle();
	});

	$('body').on('click', function () {
		$('#list-countries-popup').hide();
	});


	//This is no longer being used.
	$('#page-tools').on('click', 'a', function (e) {
		var id = $(this).attr('id');

		if (id == 'print') {
			e.preventDefault();
			window.print();
		}
		else if (id == 'request-quote') {
		}
		else if (id == 'email') {
		}
	});

	//Social media toolbar
	if ($('#toolbar').length) {
		/*(function () {
		 var po = document.createElement('script');
		 po.type = 'text/javascript';
		 po.async = true;
		 po.src = '//apis.google.com/js/plusone.js';
		 var s = document.getElementsByTagName('script')[0];
		 s.parentNode.insertBefore(po, s);
		 })();*/

		//replace googleplusone with googleshare
		$('#toolbar').is('ul') ? $('#toolbar').find('.googleplusone').remove().end().find('> .twitter').before('<li class="googleshare"><a href="#"><span class="icon googleshare"></span>Google</a></li>') :
			$('#toolbar').find('.googleplusone').remove().end().find('ul > .twitter').before('<li class="icon googleshare"><a href="#"><span>Google</span></a></li>');

		//Retrieve bit.ly url
		if (window.XMLHttpRequest) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "/hidden/bitly.asmx/get?URI=" + encodeURIComponent('http://' + location.host + '/' + location.pathname));
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						xml = $($.parseXML(xhr.responseText));
						var obj = jQuery.parseJSON(xml.find("string").text());

						if (typeof obj.data != 'undefined') {
							burl = obj.data.url;
						}
					}
				}
			}
			xhr.send();
		}

		//Align right rail to the toolbar
		if ($('#toolbar').parents('#right-rail').length) {
			//If toolbar is located on the right rail.
			$('#right-rail').css('padding-top', parseInt($('#right-rail').css('margin-top')) + $('article').find('> h2').outerHeight(true));
		}
		else if (!$('#toolbar').parents('#right-rail').length && $('#right-rail').length) {
			//If toolbar is not on the right rail but a right rail is present.
			$('#right-rail').css('padding-top', parseInt($('#right-rail').css('margin-top')) + $('#toolbar').offset().top - $('#right-rail').offset().top);
		}

		//Interaction when clicking on facebook, twitter and linkedin
		$('#toolbar').on('click', 'a', function (e) {
			var parent = $(this).parent(), classname = parent.attr('class'), u = location.href, t = document.title;
			if (parent.hasClass('facebook')) {
				if (typeof s == 'object') {
					//s.tl(this, 'o', 'Share-Facebook');
					s.events = "event13";
					s.eVar18 = "Facebook";
					s.linkTrackVars = "events,eVar18";
					s.linkTrackEvents = "event13";
					s.tl(true, 'o', 'Social Media');
				}
				//_gaq.push(['_trackSocial', 'Facebook', 'Share']);

				e.preventDefault();
				window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(burl) + '&t=' + encodeURIComponent(t), 'facebook', 'width=480,height=240,toolbar=0,status=0,resizable=1');
			}
			else if (parent.hasClass('twitter')) {
				if (typeof s == 'object') {
					//s.tl(this, 'o', 'Share-Twitter');
					s.events = "event13";
					s.eVar18 = "Twitter";
					s.linkTrackVars = "events,eVar18";
					s.linkTrackEvents = "event13";
					s.tl(true, 'o', 'Social Media');
				}
				//_gaq.push(['_trackSocial', 'Twitter', 'Tweet']);

				if (burl == '') {
					burl = u;
				}
				e.preventDefault();
				window.open('http://twitter.com/share?via=DellSoftware&url=' + encodeURIComponent(burl) + '&text=' + encodeURIComponent(t) + ',%20&counturl=' + encodeURIComponent(u), 'twitter', 'width=480,height=380,toolbar=0,status=0,resizable=1');
			}
			else if (parent.hasClass('linkedin')) {
				if (typeof s == 'object') {
					//s.tl(this, 'o', 'Share-LinkedIn');
					s.events = "event13";
					s.eVar18 = "LinkedIn";
					s.linkTrackVars = "events,eVar18";
					s.linkTrackEvents = "event13";
					s.tl(true, 'o', 'Social Media');
				}
				//_gaq.push(['_trackSocial', 'LinkedIn', 'Share']);

				e.preventDefault();
				window.open('http://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(burl) + '&title=' + encodeURIComponent(t), 'linkedin', 'width=480,height=360,toolbar=0,status=0,resizable=1');
			}
		});
	}
	else if (!$('.homepage').length) {
		//Only executed when there is no social media toolbar and it's not on the homepage.
		//Align right rail to the bottom of h2. Not to be used on the homepage
		if ($('#right-rail').length && $('h2').length) {
			//Right rail and H2 is present
			$('#right-rail').css('padding-top', parseInt($('#right-rail').css('margin-top')) + $('h2').offset().top + $('h2').outerHeight(true) - $('#right-rail').offset().top);
		}
		else if ($('#right-rail').length && !$('h2').length) {
			//Right rail is present but H2 is not.
			$('#right-rail').css('margin-top', 20);
		}
	}

	if ($('#right-rail').length) {
		//Velocity product page.
		if ($('#right-rail').parents('.velocity').length && !$('.homepage').length) {
			//Velocity subpage has its own js file.
			//Not a velocity sub page.
			if (!$('#right-rail').parents('.velocity.subpage').length) {
				if ($('#tabs').length) {
					$('#right-rail').css('padding-top', $('#tabs').position().top);
				}
				else {
					$('#right-rail').css('padding-top', $('.teasers.large').outerHeight(true));
				}
			}
		}

		$('#right-rail').animate({opacity: 1}, 500);
	}

	/* START: Search */

	var urlParams = {};

	(function () {
		var match,
			pl = /\+/g,  // Regex for replacing addition symbol with a space
			search = /([^&=]+)=?([^&]*)/g,
			decode = function (s) {
				return decodeURIComponent(s.replace(pl, " "));
			},
			query = window.location.search.substring(1);

		while (match = search.exec(query)) {
			urlParams[decode(match[1])] = decode(match[2]);
		}
	})();

	$('#searchterm').val(urlParams['q']).keypress(function (event) {
		if (event.which == 13) {
			event.preventDefault();
			goAllSearch();
		}
	});

	/* END: Search */

	if ($('#tabs').length) {
		$('#tabs').tabs({
			activate: function (e, ui) {
				//Add/Remove vertical pipe on the tabs when an individual tab is activated.
				var indx = $('#tabs').find('> ul > li').index(ui.newTab);

				$('#tabs').find('> ul > li').removeClass('hide-pipe');

				if (indx) {
					for (var c = indx - 1; c >= 0; c--) {
						var tab = $('#tabs').find('> ul > li:eq(' + c + ')');

						if (tab.is(':visible')) {
							tab.addClass('hide-pipe');
							break;
						}
					}
				}

				$('#' + ui.newTab.attr('aria-controls')).trigger('isVisible');

				//Fix height issue bug on IE 8
				if ($('html').hasClass('ie8')) {
					$('#body-container').parent().css('min-height', $('#body-container').height());
				}
			}
		});

		//Remove vertical pipe on previous tab on load.
		var indx = $('#tabs').find('> ul > li').index($('#tabs').find('> ul > .ui-tabs-active'));
		if (indx) {
			$('#tabs').find('> ul > li:eq(' + (indx - 1) + ')').addClass('hide-pipe');
		}

		//startTab will set the tab on page load.
		if (location.hash != '' && $('#' + location.hash.substr(1)).length) {
			startTab = location.hash.substr(1);
		}

		if (typeof startTab == 'string') {
			$('#tabs').find('> ul.ui-tabs-nav > li').each(function (i) {
				if ($(this).attr('aria-controls') == startTab) {
					$('#tabs').tabs('option', 'active', i);
				}
			});
		}

		(function () {
			var lis = $('#tabs').find('.ui-tabs-nav').find('li'),
				referenceHeight = lis.filter(':eq(0)').offset().top,
				currentFontSize = parseInt(lis.filter(':eq(0)').find('a').css('fontSize'));

			while (!checkIfSameLine()) {
				lis.find('a').css('fontSize', --currentFontSize);

				if (currentFontSize <= 10) {
					break;
				}
			}

			function checkIfSameLine() {
				var result = true;

				$('#tabs').find('.ui-tabs-nav').find('li').each(function (i) {
					if (i && referenceHeight != $(this).offset().top) {
						result = false;
						return false;
					}
				});

				return result;
			}

		})();
	}

	//Create slide pagination on right rail if there is a list greater than 4 items.
	if ($('#right-rail').length) {
		$('#right-rail').find('ul').each(function () {
			var interval = 4;

			if (!$(this).hasClass('no-pagination')) {
				if ($(this).data('row')) {
					interval = $(this).data('row');
				}
				$(this).slidePagination({interval: interval, column: 1, force: false});
			}
		});
	}

	//Another different slide pagination implementation for the video's widget.
	$('.pagination-type1').find('ul').each(function () {
		var column = 2, interval = 4;

		if ($(this).parent().data('column') != undefined) {
			column = $(this).parent().data('column');
			interval = column * 2;
		}

		$(this).slidePagination({interval: interval, column: column, force: false});
	}).find('li > img').css('cursor', 'pointer').on('click', function () {
		//Trigger the anchor tag if the image is clicked.

		var anchor = $(this).next().find('> a');

		if (anchor.hasClass('bcplaylist')) {
			anchor.trigger('click');
		}
		else {
			if (anchor.attr('target') == undefined) {
				location.href = anchor.attr('href');
			}
			else {
				window.open(anchor.attr('href'), anchor.attr('target'));
			}
		}
	});

	//Create sliding banners using the jquery plugin "cycle".
	if (!$('.homepage').length) {
		var banner = $('#banner-container').find('> .banner');

		if (banner.children().length > 1) {
			banner.before('<ul id="banner-nav"></ul>').cycle({
				fit: 1,
				activePagerClass: 'active',
				pager: '#banner-nav',
				pagerAnchorBuilder: function (idx, slide) {
					return '<li><a href="#">' + (idx + 1) + '</a></li>';
				},
				random: (typeof bannerrandomize != 'undefined' && bannerrandomize) ? true : false,
				timeout: (typeof bannerrotateint != 'undefined') ? bannerrotateint * 1000 : 5000,
				autostop: true,
				autostopCount: (banner.find('> div').length * 2) + 1
			});
		}
		else {
			banner.children().show();
		}

		if (banner.find('img:eq(0)').attr('src') !== undefined) {
			var img = new Image();
			img.src = banner.find('img:eq(0)').attr('src');
			img.onload = function () {
				//banner.css('width', this.width).find('> div').css('width', this.width);
				if (!$('#banner-container').hasClass('boxshot')) {
					$('#banner-container').css('width', this.width);
				}
			};
		}

		//Pause the sliding banner when the banner navigation is clicked.
		$('#banner-nav').on('click', 'a', function () {
			$('#banner-container').find('> .banner').cycle('pause');
		});
	}

	$('.fancybox').fancybox({padding: 0});

	//Collapsible DL tag.
	$('dl.collapsible').on('click', 'dt', function () {
		if ($(this).hasClass('expand')) {
			$(this).removeClass('expand');
		}
		else {
			$(this).addClass('expand');
		}
	});

	//Collapsible DIV tag.
	$('div.collapsible').each(function () {
		if (!$(this).find('> h4').find('span').length) {
			$(this).find('> h4').prepend('<span></span>');
		}
	});

	//Collapsible table.
	$('body').on('click', 'tbody.collapsible > tr > th', function () {
		var p = $(this).parents('tbody.collapsible');
		if (p.hasClass('collapse')) {
			p.removeClass('collapse');
		}
		else {
			p.addClass('collapse');
		}
	});

	//Display arrow on the collapsible table row.
	$('tbody.collapsible').each(function () {
		$(this).find('th').prepend('<span>');
	});

	//Expand/Collapse when clicking on the H4 tag.
	$('body').on('click', '.collapsible > h4', function () {
		if ($(this).parent().hasClass('collapse')) {
			$(this).parent().removeClass('collapse');
		}
		else {
			$(this).parent().addClass('collapse');
		}
	});

	//Breadcrumb
	$('ol.breadcrumb').each(function () {
		var total = $(this).find('> li').length;

		$(this).find('> li').each(function (j) {
			/* Right Arrow */
			if (j == 0) {
				$(this).find('a').html('<span class="icon home"></span>');
			}
			else {
				$(this).prepend('<span class="icon breadcrumb-arrow"></span>');
			}
		});
	});

	//Tooltip
	$('body').on('mouseover mouseout', '.hastooltip', function (e) {
		if (e.type == 'mouseover' && $(this).find('> div').length) {
			if ($('#tooltip').length == 0) {
				$(document.body).append('<div id="tooltip" class="hide"><div class="arrow"></div><div class="body"><div></div></div></div>');
			}

			var description = $(this).find('> div').html();
			description = description.replace('<p></p>', '');

			if (description.length) {
				$('#tooltip').find('> .body > div').html(description).find('p').each(function () {
					if ($(this).html() == '') {
						$(this).remove();
					}
				});

				$('#tooltip').css({display: 'block'}).removeClass('hide');
				$('#tooltip').css('height', $('#tooltip').find('> .body').height());

				var leftPos = $(this).offset().left + $(this).outerWidth(true) + 10, height = $('#tooltip').outerHeight(true);

				$('#tooltip').css({
					top: Math.ceil($(this).offset().top + ($(this).height() / 2) - (height / 2) - 2),
					left: leftPos
				});
				$('#tooltip').find('> .body').dotdotdot({height: 94});
				$('#tooltip').css('height', $('#tooltip').find('> .body').height());
			}
		}
		else {
			$('#tooltip').hide();
			$('#tooltip').find('> .body').trigger('destroy.dot');
		}
	});

	//Brightcove player popup.
	$('body').on('click', '.bcplaylist', function (e) {
		e.preventDefault();

		var width = 736, height = 414, fheight = height + 52,
			playerID = '2280150732001', objid = '', videoType = '@videoPlayer',
			h1margin = '6px 0 17px 0',
			playerKey = 'AQ~~,AAAAuIVrAck~,krN9qiM0opZFgcTJ2x4pANu_kTPzjQpH', title = $(this).html(),
			url = 'http://admin.brightcove.com/js/BrightcoveExperiences.js',
			isSecure = (location.protocol == 'https:') ? 'true' : 'false';

		if ($('.homepage').length) {
			playerID = '2879403485001';
		}

		if (isSecure == 'true') {
			url = 'https://sadmin.brightcove.com/js/BrightcoveExperiences.js';
		}

		if ($(this).data('config') != undefined) {
			var rel = $(this).data('config');
			rel = jQuery.parseJSON(rel.replace(/'/g, '"'));

			if (typeof rel.playlistID != 'undefined') {
				videoType = '@playlistTabs';
				videoID = rel.playlistID;
				playerKey = 'AQ~~,AAAAuIVrAck~,krN9qiM0opbQy0FyufcD6EUJJ_5heYej';
				width = 800;
				height = 370;
				fheight = 414;
				playerID = '1637139480001';
				h1margin = '6px 0 -11px 0';

				if ($('.homepage').length) {
					playerID = '2879403486001';
				}
			}
			else {
				videoID = rel.videoID || rel.VideoID;
			}

			if (typeof rel.title != 'undefined') {
				title = rel.title;
			}

			if (typeof rel.playerID != 'undefined') {
				playerID = rel.playerID;
			}

			if (typeof rel.playerKey != 'undefined') {
				playerKey = rel.playerKey;
			}

			objid = 'myExperience' + videoID;

			if (typeof (rel.width) != 'undefined') {
				width = rel.width;
			}
		}

		var content = '<h1>' + title + '</h1>\
          <object id="' + objid + '" class="BrightcoveExperience">\
            <param name="autoStart" value="true">\
            <param name="bgcolor" value="none">\
            <param name="width" value="' + width + '">\
            <param name="height" value="' + height + '">\
            <param name="playerID" value="' + playerID + '">\
            <param name="playerKey" value="' + playerKey + '">\
            <param name="isVid" value="true">\
            <param name="isUI" value="true">\
            <param name="' + videoType + '" value="' + videoID + '">\
            <param name="wmode" value="transparent">\
            <param name="secureConnections" value="' + isSecure + '">\
            <param name="secureHTMLConnections" value="' + isSecure + '">\
          </object>\
        ';

		$.fancybox({
			'autoDimensions': false,
			'autoScale': false,
			'width': width,
			'height': fheight,
			'content': content,
			'onStart': function () {
				$.fancybox.center();
			},
			'onComplete': function () {
				$.fancybox.showActivity();
				$('#fancybox-content').find('h1').css({'padding': '4px 0 10px 0', 'font-size': 20});

				if (typeof brightcove !== 'object') {
					$.getScript(url, function () {
						brightcove.createExperiences();
						$.fancybox.hideActivity();
					});
				}
				else {
					brightcove.createExperiences();
					$.fancybox.hideActivity();
				}
			}
		});
	});

	if ($('object.BrightcoveExperience').length) {
		if (typeof brightcove !== 'object') {
			var url = 'http://admin.brightcove.com/js/BrightcoveExperiences.js';

			if (location.protocol == 'https:') {
				url = 'https://sadmin.brightcove.com/js/BrightcoveExperiences.js';
			}
			else {
				$('object.BrightcoveExperience')
					.find('> param[name=secureConnections]').val('false').end()
					.find('> param[name=secureHTMLConnections]').val('false');
			}
			$.getScript(url, function () {
				brightcove.createExperiences();
			});
		}
		else {
			brightcove.createExperiences();
		}
	}

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

			content = '<iframe id="oo-popup-content" src="/Hidden/ooyala-iframe.htm?playlist=' + config.playlist + '" width="' + width + '" height="407" frameborder="0" scrolling="no"></iframe>';
		}
		else {
			content = '<iframe id="oo-popup-content" src="/Hidden/ooyala-iframe.htm?ooyala=' + config.ooyala + '&autoplay=' + config['autoplay'] + '&3Play=' + config['3Play'] + '&title=' + title + '&desc=' + encodeURIComponent(config.description) + '&url=' + config.url + '" width="' + width + '" height="407" frameborder="0" scrolling="no"></iframe>';
		}

		$.fancybox({
			'autoDimensions': false,
			'autoScale': false,
			'width': width,
			'height': 'auto',
			'content': content,
			autoSize: true,
			iframe: {
				preload: false // fixes issue with iframe and IE
			},
			'onStart': function () {
				$.fancybox.center();
			}
		});
	});

	//Iframe popup modal.
	$('a').filter('.iframe').each(function () {
		var width = 0, height = 0;

		if ($(this).attr('dimensions') != undefined) {
			var rel = $(this).attr('dimensions');
			rel = rel.replace(/'/g, '"');
			rel = jQuery.parseJSON(rel);
			width = rel.width;
			height = rel.height;
			$(this).fancybox({
				'width': width,
				'height': height,
				'type': 'iframe',
				'onComplete': function () {
					setTimeout(function () {
						var h = $('#fancybox-content').find('iframe').contents().find('body').height();
						$('#fancybox-content').css('height', h + 10);
					}, 500);
				}
			});
		}
		else {
			$(this).fancybox({
				'autoDimensions': true,
				'type': 'iframe'
			});
		}
	});

	var productLetters = $('#products').find('> div');

	// highlight selected letter
	$('#atoz')
		.on('click', 'li.inactive a', function (e) {
			e.preventDefault();
		}) //Prevent A to Z default action
		.on('click', 'ul li a', function (e) {
				if (!($(this).parent().hasClass('inactive'))) {
					$(this).parent().parent().find('> .highlight').removeClass('highlight');
					$(this).parent().addClass('highlight');

					var selected = $(this).attr('href').replace('#', '');

					$('#products').find('> div').each(function () {
						if ($(this).attr('id') == selected) {
							$(this).removeClass('collapse');
						}
						else {
							$(this).addClass('collapse');
						}
					});
				}
			}
		);

	//Used for search more/less link
	$('#left-rail').on('click', '.expand', function (e) {
		e.preventDefault();

		var siblings = $(this).parent().siblings().filter('.hide');

		if ($(this).hasClass('expanded')) {
			$(this).removeClass('expanded').html($(this).data('expandname'));
			siblings.hide();
		}
		else {
			$(this).addClass('expanded').html($(this).data('collapsename'));
			siblings.show();
		}
	});

	//If button has the text "Buy Online", change the button color to green.
	$('.button').each(function () {
		if ($(this).html() == 'Buy Online') {
			$(this).removeClass('blue').addClass('green');
		}
	});

	//Load screenshot tour main image from the tour list.
	if ($('a.screenshot.loading').length) {
		$('a.screenshot.loading').each(displayScreenshotImage);
	}

	if ($('a.screenshot').length > 0) {
		$('a.screenshot').each(processScreenshot);
	}

	//Enable placeholder for older browser.
	$('input, textarea').placeholder();

	$('body').on('click', '.has-trigger', function () {
		if ($('#' + $(this).data('trigger')).get(0).tagName == 'A' && $('#' + $(this).data('trigger')).attr('href').charAt(0) != '#') {
			var elem = $('#' + $(this).data('trigger'));
			window.open(elem.attr('href'), elem.attr('target'));
		}
		else {
			$('#' + $(this).data('trigger')).trigger('click');
		}
	});

	$('.event-banner-text').css('top', parseInt(($('.event-banner-text').parents('.banner').height() - $('.event-banner-text').height()) / 2)).animate({opacity: 1}, 500);


	/* dotdotdot used for thank you pages */
	$('.calls-to-action').find(".ellipsis").dotdotdot({
		/*  The HTML to add as ellipsis. */
		ellipsis: '... ',
		/*  How to cut off the text/html: 'word'/'letter'/'children' */
		wrap: 'word',
		/*  Wrap-option fallback to 'letter' for long words */
		fallbackToLetter: true,
		/*  jQuery-selector for the element to keep and put after the ellipsis. */
		after: null,
		/*  Whether to update the ellipsis: true/'window' */
		watch: false,
		/*  Optionally set a max-height, if null, the height will be measured. */
		height: 75,
		/*  Deviation for the height-option. */
		tolerance: 0,
		/*  Callback function that is fired after the ellipsis is added,
		 receives two parameters: isTruncated(boolean), orgContent(string). */
		callback: function (isTruncated, orgContent) {
		},
		lastCharacter: {
			/*  Remove these characters from the end of the truncated text. */
			remove: [' ', ',', ';', '.', '!', '?'],
			/*  Don't add an ellipsis if this array contains
			 the last character of the truncated text. */
			noEllipsis: []
		}
	});

	if ($('#main-content').find('> div:eq(0)').hasClass('product')) {
		$('div.collapsible').filter('.collapse').removeClass('collapse');
	}

	if ($('#main-content').find('> div:eq(0)').hasClass('product velocity')) {
		$('dl.collapsible').removeClass('collapsible');
	}

	// dot dot dot for the thank you cta pages -product teaser ~ global jl 11-12-2014
	if ($(".product-content").length) {
		$('.product-content').find('> div > p:eq(1)').dotdotdot({height: 70})
	}

	// Social Media Widget from DataProtection Now on DSG pages (Case Studies) Jl - 11/17/2014
	if ($('.social-media-wrapper').length > 0) {
		socialMediaBarWidget();
	}

	// Fix padding issue when video is not present - sprint 26 JL
	// in case study landing pages:
	if ($('.case-study-lp').length > 0) {
		var $blkqt = $('.blkqt-wrapper');
		$blkqt.next('.cs-info-cta').css('padding-top', 0);
	}

	//video list resources tab
	if ($('#resources,#Resources').is(':visible')) {//when resources tab is active on page load
		$('#video-list p a').dotdotdot({height: 65});

		$('#video-list').find('ul').each(function () {
			var column = 3, interval = 3, position = 'top';
			$(this).slidePagination({
				interval: interval,
				column: column,
				force: false,
				show: position
			});
		});
	}

	$('#resources,#Resources').on('isVisible', function () {
		$('#video-list p a').dotdotdot({height: 65});
		$('#resources,#Resources').css("display", "none");

		if (!$(this).data('processed')) {
			$('#video-list').find('ul').each(function () {
				var column = 3, interval = 3, position = 'top';
				$(this).slidePagination({
					interval: interval,
					column: column,
					force: false,
					show: position
				});
			});
		}

		$('#resources,#Resources').css("display", "block");
		$(this).data('processed', true);
	});
	// New home page case study section hover effect
	$('.clientlist > a > img').hover(function () {
		var srcOver = $(this).attr('src').replace(/-gray.png/, '-color.png');
		$(this).attr('src', srcOver);
	}, function () {
		var srcOut = $(this).attr('src').replace(/-color.png/, '-gray.png');
		$(this).attr('src', srcOut);
	});

	//playhead icon trigger video popup on awarene template
	$('.playhead').on('click', function () {
		if ($(this).is(':visible')) {
			$(this).next().trigger('click');
		}
	});

	// Contact Us Form pre select dropdown option based on URL
	var topic = getQueryVariable("topic");
	if (topic.length > -1) {
		$("select option").each(function () {
			if ($(this).attr("value") == topic) {
				$(this).attr("selected", "selected");
			}
		});
	}

	// small fil for a white gap showing on landing pages that have nav turned off on O2
	/*
	 if ($('#footer-links').length == 0) {
	 $('#wrapper footer').css('margin-top', '-30px');
	 }
	 */

	/*************sliding banner start*************/
	$('#banner-slide-navigate').after('<ul class="slide-markers"></ul>').cycle({
		timeout: 10000,
		speed: 600,
		fx: 'scrollLeft',
		height: 395,
		width: 965,
		pager: '.slide-markers',
		random: $('#banner-slide-navigate').data('randomize') ? true : false,
		pagerAnchorBuilder: function (indx, elem) {
			return '<li><span></span></li>';
		}
	}).find('.lazy').each(function () {
		$(this).attr('src', $(this).data('original')).removeClass('lazy');
	});
	/*************sliding banner end*************/

	/*************Google share handler start*************/
	$('body').on('click', '.googleshare', function (e) {
		e.preventDefault();
		window.open('https://plus.google.com/share?url=' + encodeURIComponent(location.href), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
		return false;
	});
	/*************Google share handler end*************/

	//Reduce font size of CTA if it wraps for localized sites.
	if (/\?param=/.test(location.search) && RootPath != '/') {
		$('aside.next-step').find('.action').each(function () {
			var elem = $(this).find('a'),
				curHeight = elem.height(),
				fontSize = parseInt(elem.css('font-size')),
				idealHeight = elem.css('white-space', 'nowrap').height(),
				count = 5;

			elem.css('white-space', 'wrap');

			while (curHeight > idealHeight) {
				if (!count) {
					break;
				}

				elem.css('font-size', --fontSize + 'px');
				console.log(elem.height());
				curHeight = elem.height();

				count--;
			}
		});
	}

	// Use for specific legacy pages that need ooyala video
	// currently used for only one form page but it can be extended.


}); // end of document ready function

$.getScript('/Static/Library/jQuery/jquery.lazyload.min.js', function () {
	$(document).ready(function () {
		$("img.lazy").lazyload();
	});
});

$(window).load(function () {
	$('div.column2').each(function () {
		var height = 0, elem = $(this).find('> div');

		if ($(this).hasClass('type1')) {
			var h4height = 0, ulheight = 0;

			elem.each(function () {
				if (h4height < $(this).find('> h4').height()) {
					h4height = $(this).find('> h4').height(true);
				}

				if (ulheight < $(this).find('> ul').outerHeight()) {
					ulheight = $(this).find('> ul').outerHeight(true);
				}
			});

			elem.find('> h4').css('height', h4height).end().find('> ul').css('height', ulheight);
		}
		else {
			elem.each(function () {
				if (height < $(this).height()) {
					height = $(this).outerHeight(true);
				}
			}).css('height', height);
		}
	});

});

function displayScreenshotImage() {
	//Find the first image of the screenshot tour to populate the main image.

	var elem = this;
	img = new Image();
	hash = $(this).attr('href');
	hash = hash.substr(hash.indexOf('#') + 1);

	var firstImgElem = $('#' + hash).find('> div:eq(0)').find('img');

	if (firstImgElem.data('src') != undefined || firstImgElem.data('original') != undefined) {
		$(elem)
			.removeClass('loading')
			.addClass('enlarge')
			.append('<span class="icon enlarge">')
			.find('> img')
			.attr('src', $('#' + hash).find('> div:eq(0)').find('img').data('src') || $('#' + hash).find('> div:eq(0)').find('img').data('original'));
	}
	else {
		img.onload = function () {
			$(elem)
				.removeClass('loading')
				.addClass('enlarge')
				.append('<span class="icon enlarge">')
				.find('> img')
				.attr({src: this.src});
		};

		img.src = $('#' + hash).find('> div:eq(0)').find('img').attr('src');
	}
}

function processScreenshot() {
	//Added ability to remove border by reading in data-border attribute.
	var list = [], elem = this, group = $(this).attr('href');

	if (group.substr(0, 1) != '#') {
		return false;
	}

	var total = $(group).find('> div').length - 1, thumbnailSlider = content = '';
	var isVelocity = $('.velocity').length ? true : false;

	$(group).find('> div').each(function (i) {
		var html = $(this).find('div').html(), className = '', imgsrc = $(this).find('img').data('src') || $(this).find('img').data('original') || $(this).find('img').attr('src');
		;

		html = html.replace("\n", "");

		if (i == 0) {
			className = 'active';
			button = '';

			if (isVelocity) {
				var elem2 = $(elem), cntr = 5, proceed = true;

				while (!elem2.find('.button-container').length) {
					if (!cntr) {
						proceed = false;
						break;
					}

					elem2 = elem2.parent();
					cntr--;
				}

				if (proceed) {
					button = '<div class="button-container right" style="margin: -5px 20px 0 0;">' + elem2.find('.button-container').html() + '</div>';
				}
			}

			var imgclass = '';

			if ($(elem).data('border') != undefined && !$(elem).data('border')) {
				imgclass = ' class="no-borders"';
			}

			content = '\
<div id="screenshot-container">\
' + button + '\
<h3>' + $(this).find('h3').html() + '</h3>\
<div class="screenshot-image-container ' + $(this).find('img').attr('class') + '"><img alt="" src="' + imgsrc + '"' + imgclass + '></div>\
<div class="thumbnail">\
<a href="#prev"><span class="icon prev inactive"></span></a>\
<div class="thumbnail-container">\
<ul>[slider]</ul>\
</div>\
<a href="#next"><span class="icon next"></span></a>\
<div class="thumbnail-bullets"></div>\
</div>\
<div class="description">' + $(this).find('div').html() + '</div>\
</div>';
		}

		thumbnailSlider += '<li><a href="' + imgsrc + '" data-index="' + i + '" class="' + className + '"><img alt="' + $(this).find('h3').html() + '" src="/images/shared/blank.gif"></a></li>';
	});

	content = content.replace('[slider]', thumbnailSlider);

	$(this).on('click', {content: content}, function (e) {
		e.preventDefault();

		$.fancybox([{content: e.data.content}], {
			'transitionIn': 'none',
			'transitionOut': 'none',
			'padding': 0,
			'margin': 10,
			'min-top': 95,
			'modal': false,
			'changeSpeed': 0,
			'changeFade': 0,
			'onStart': function () {
				window.scrollTo(window.scrollX, 0);
			},
			'onComplete': function () {
				var elem = $('#screenshot-container'), ul = elem.find('.thumbnail > div > ul'),
					containerWidth = elem.find('> .thumbnail').width(), step = [0],
					tnContainer = elem.find('> .thumbnail > div.thumbnail-container');

				elem.find('img').each(function () {
					if ($(this).data('src') != undefined || $(this).data('original') != undefined) {
						$(this).attr('src', $(this).data('src') || $(this).data('original'));
					}
				});

				//Load thumbnail image
				ul.find('li').each(function () {
					$(this).find('img').attr('src', $(this).find('a').attr('href'));
				});

				tnContainer.css('width', 9999);
				ul.css('width', ul.width());
				tnContainer.css('width', containerWidth);

				elem.on('click', '.prev, .next', function (e) {
					e.preventDefault();

					if ($(this).hasClass('inactive')) {
						return false;
					}

					var dir = $(this).hasClass('prev') ? -1 : 1;
					var indx = 0;

					for (var i in step) {
						i = parseInt(i);

						if (step[i] == parseInt(ul.css('left'))) {
							indx = i + dir;
							ul.animate({left: step[indx]}, 500, function () {
								setArrows(indx);
							});
						}
					}
				});

				function resize() {
					setTimeout(function () {
						$.fancybox.resize();
						$.fancybox.center();
					}, 200);
				}

				function setArrows(indx) {
					var left = step[indx],
						lastChild = ul.find('li:last-child'),
						parent = ul.parent(),
						prev = parent.parent().find('.prev'),
						next = parent.parent().find('.next');

					if (left == 0) {
						prev.addClass('inactive');
					}
					else {
						prev.removeClass('inactive');
					}

					if ((lastChild.position().left + lastChild.outerWidth(true) + parseInt(ul.css('left'))) > parent.width()) {
						next.removeClass('inactive');
					}
					else {
						next.addClass('inactive');
					}

					elem.find('.thumbnail-bullets').find('a span').removeClass('blue-bullet');
					elem.find('.thumbnail-bullets').find('a:eq(' + indx + ') span').addClass('blue-bullet');
				}

				function processSteps() {
					var ulLeft = left = 0;

					ul.find('li').each(function (i) {
						var liPosStart = $(this).position().left;
						var liPosEnd = liPosStart + $(this).outerWidth(true);

						if ((liPosEnd + ulLeft) > containerWidth) { //If li is greater than the width of the container
							left = parseInt(-1 * liPosStart);
							step.push(left);
							ulLeft = left;
						}
					});
				}

				(function () {
					processSteps();

					if (step.length == 1) {
						if (ul.find('> li').length == 1) {
							elem.find('> .thumbnail').hide();
						}
						else {
							elem.find('.thumbnail-bullets').hide();
							elem.find('> .thumbnail').find('> a').hide();
							elem.find('> .thumbnail > div.thumbnail-container').css({width: '100%', margin: '0 auto'});
							ul.css({display: 'block', margin: '0 auto'});
						}
					}
					else {
						var activeBullet = '';

						containerWidth = 684;
						elem.find('> .thumbnail > div.thumbnail-container').css('width', containerWidth);
						step = [0];

						processSteps();

						for (var c = 0; c < step.length; c++) {
							activeBullet = c ? '' : ' blue-bullet';
							elem.find('.thumbnail-bullets').append('<a href="#page' + c + '"><span class="icon grey-bullet' + activeBullet + '"></span></a>');
						}
					}
				})();

				$('body').on('keydown', function (e) {
					e.preventDefault();

					var li = elem.find('.thumbnail-container a.active').parent();

					if (e.keyCode == 39 && !li.is(':last-child')) {
						li = li.next();
					}
					else if (e.keyCode == 37 && !li.is(':first-child')) {
						li = li.prev();
					}
					else {
						return false
					}

					li.find('a').trigger('click');

					if ((li.position().left + li.outerWidth(true) + parseInt(ul.css('left'))) > containerWidth) {
						elem.find('.next').trigger('click');
					}
					else if ((li.position().left + li.outerWidth(true) + parseInt(ul.css('left'))) <= 0) {
						elem.find('.prev').trigger('click');
					}
				});

				elem.find('.thumbnail-container').on('click', 'a', function (e) {
					e.preventDefault();

					elem.find('.thumbnail-container').find('a').removeClass('active');
					$(this).addClass('active');

					var item = $(group).find('> div:eq(' + $(this).data('index') + ')'),
						imgelem = item.find('img');

					elem.find('h3').html(item.find('h3').html());

					var imgsrc = imgelem.data('src') || imgelem.data('original') || imgelem.attr('src');

					elem.find('.screenshot-image-container').find('img').attr('src', imgsrc);

					if (imgelem.attr('class') == '' || imgelem.attr('class') == undefined) {
						elem.find('.screenshot-image-container').removeClass('no-resize');
					}
					else if (imgelem.attr('class') == 'no-resize') {
						elem.find('.screenshot-image-container').addClass('no-resize');
					}

					elem.find('.description').html(item.find('div').html());
				});

				elem.find('.thumbnail-bullets').on('click', 'a', function (e) {
					var indx = elem.find('.thumbnail-bullets').find('a').index(this);
					ul.animate({left: step[indx]}, 500, function () {
						setArrows(indx);
					});
				});
			},
			'onCleanup': function () {
				$('body').off('keydown');
			}
		});
	});
}

function goAllSearch() {
	var siteValue = "?q=";
	settings = {inputElement: "#searchterm"};
	document.location.href = "/search/results/" + siteValue + encodeURIComponent($(settings.inputElement).val());
	return false;
}

function haveProductAtoZ() {
	$('#atoz').find('a').each(function () {
		if ($('#body-container').find($(this).attr('href')).find('li').size() == 0) {
			$(this).parent().addClass('inactive');
		}
		else {
			$(this).parent().removeClass('inactive');
		}
	});

	setTimeout(function () {
		$('#products').find('ul').each(function () {
			var row = -1, prevrow = 0, height = 0, elem = this, lis = $(this).find('> li');

			if (lis.length > 3) {
				lis.each(function (i) {
					if ((i % 3) == 0) {
						row++;
					}

					if ($(this).height() > height) {
						height = $(this).height();
					}

					if ((i % 3) == 2) { //last column
						var end = i + 1, start = i - 3;

						if (start > 0) {
							$(elem).find('> li:lt(' + end + '):gt(' + start + ')').css('height', height);
						}
						else {
							$(elem).find('> li:lt(' + end + ')').css('height', height);
						}

						prevrow = row;
						height = 0;
					}
				});
			}
		});
	}, 200);
}

function escapeUnicode(str) {
	var r = /\\u([\d\w]{4})/gi;
	str = unescape(str.replace(r, function (match, grp) {
		return String.fromCharCode(parseInt(grp, 16));
	}));
	return str;
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

/* Stretchy Social Media Bar Widget (from Data Protection) now in DSG pages (Case Studies) */

function socialMediaBarWidget() {

	/* Interaction when clicking on facebook, twitter and linkedin -- Modified implementation from (global.min.js) */


	//Retrieve bit.ly url
	if (window.XMLHttpRequest) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "/hidden/bitly.asmx/get?URI=" + encodeURIComponent('http://software.dell.com' + location.pathname));
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					xml = $($.parseXML(xhr.responseText));
					var obj = jQuery.parseJSON(xml.find("string").text());

					if (typeof obj.data != 'undefined') {
						burl = obj.data.url;
					}
				}
			}
		}
		xhr.send();
	}


	$('.social-media-set').on('click', 'a', function (e) {
		var parent = $(this).parent(), classname = parent.attr('class'), u = location.href, t = document.title;

		if (parent.hasClass('facebook')) {
			if (typeof s == 'object') {
				//s.tl(this, 'o', 'Share-Facebook');
				s.events = "event13";
				s.eVar18 = "Facebook";
				s.linkTrackVars = "events,eVar18";
				s.linkTrackEvents = "event13";
				s.tl(true, 'o', 'Social Media');
			}
			//_gaq.push(['_trackSocial', 'Facebook', 'Share']);

			e.preventDefault();
			window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(u) + '&t=' + encodeURIComponent(t), 'facebook', 'width=480,height=240,toolbar=0,status=0,resizable=1');
		}
		else if (parent.hasClass('twitter')) {
			if (typeof s == 'object') {
				//s.tl(this, 'o', 'Share-Twitter');
				s.events = "event13";
				s.eVar18 = "Twitter";
				s.linkTrackVars = "events,eVar18";
				s.linkTrackEvents = "event13";
				s.tl(true, 'o', 'Social Media');
			}
			//_gaq.push(['_trackSocial', 'Twitter', 'Tweet']);

			if (burl == '') {
				burl = u;
			}
			e.preventDefault();

			var via = 'DellSoftware';

			if ($(this).data('via') != undefined) {
				via = $(this).data('via');
			}

			window.open('http://twitter.com/share?via=' + via + '&url=' + encodeURIComponent(burl) + '&text=' + encodeURIComponent(t) + ',%20&counturl=' + encodeURIComponent(u), 'twitter', 'width=480,height=380,toolbar=0,status=0,resizable=1');
		}
		else if (parent.hasClass('linkedin')) {
			if (typeof s == 'object') {
				//s.tl(this, 'o', 'Share-LinkedIn');
				s.events = "event13";
				s.eVar18 = "LinkedIn";
				s.linkTrackVars = "events,eVar18";
				s.linkTrackEvents = "event13";
				s.tl(true, 'o', 'Social Media');
			}
			//_gaq.push(['_trackSocial', 'LinkedIn', 'Share']);

			e.preventDefault();
			window.open('http://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(u) + '&title=' + encodeURIComponent(t), 'linkedin', 'width=480,height=360,toolbar=0,status=0,resizable=1');
		}
		else if (parent.hasClass('googleshare')) {
			if (typeof s == 'object') {
				s.events = "event13";
				s.eVar18 = "Google+";
				s.linkTrackVars = "events,eVar18";
				s.linkTrackEvents = "event13";
				s.tl(true, 'o', 'Social Media');
			}
		}
	});
}

function replaceURL(text) {
	var exp = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	return text.replace(exp, "<a href='$1'>$1</a>");
}

// Function to help get url variables [jl]
function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
	return (false);
}