/*
 * Created by: Edward Chong, Elnaz Doostdar
 * Description:
 * This file handles all the features for the video player, including:
 * - Interactions for custom toolbar appearing at the top of the player on hover (video title and info, share , email, embed code icons)
 * - Close caption
 * Notes:
 *- multiple player handling enhancements have been added during DSG responsive project
 * */
var languageList = [], videoList = [];

/*store required info of each video player*/
function OOCreate(player) {
  videoList.push({
		player: player,
    target: player.elementId,
    MBID: player.mb.MbId,
    MB: player.mb,
    captions: []
  });

  //Unsure if this variable is being used elsewhere.
  //window['messageBus'] = player.mb;

  /*fix full screen mode cut off in IE for non-responsive pages*/
  player.mb.subscribe(OO.EVENTS.FULLSCREEN_CHANGED, 'UITeam', function () {
    if ($('.oo_fullscreen').hasClass('oo_fullscreen_off')) {
      $('.wrapper').css({'width': '100%', 'height': '100%'});
      $('.round-corners').css('overflow', 'visible');
      $('.ooyalaplayer .plugins').hide();
      disableHoverToggle($('.ooyalaplayer .plugins'));
    }
    else if ($('.oo_fullscreen').hasClass('oo_fullscreen_on')) {
      $('.wrapper').css('width', '967px');
      $('.round-corners').css('overflow', 'hidden');
      enableHoverToggle($('.ooyalaplayer .plugins'));
    }
  });

  player.mb.subscribe(OO.EVENTS.INITIAL_PLAY, 'UITeam', function () {
    jQuery.ajax({
      url: "/sso/VideoIDSet",
      data: {
        videoid: ooyala_player_handle.currentItem.embed_code
      },
      contentType: "application/json; charset=utf-8"
    });
  });

  /*Once player loaded fully this event will be triggered*/
  player.mb.subscribe(OO.EVENTS.PLAYBACK_READY, 'UITeam', function () {
    var MBID = this.mb.MbId, plugins = null, videoProp = null;

    $.each(videoList, function (indx, obj) {
      if (obj.MBID == MBID) {
        plugins = $('#' + obj.target).find('.plugins');
        videoProp = obj;
        return false;
      }
    });

    var title = player.getTitle();

    addPlayerControls(plugins, player);

	  if ($('#' + videoProp.target).parent().data('internal')) {
		  /* If the video player is internal use, do not show social media properties */
		  plugins.css('display', '').append('<div class="player-toolbar"><p>' + title + '</p></div>');

		  enableHoverToggle(plugins);

		  /*show player-toolbar when player loads for one second*/
		  plugins.show().delay(1000).fadeOut();
	  }
	  else {
		  /*append player toolbar*/

		  plugins.css('display', '').append('<div class="player-toolbar">' +
			  '<p>' + title + '</p>' +
			  '<ul>' +
			  '<li class="info"><span></span></li>' +
			  '<li class="email"><span></span></li>' +
			  '<li class="share"><span></span></li>' +
			  '<li class="embed"><span></span></li>' +
			  '</ul>' +
			  '</div>');

		  enableHoverToggle(plugins);

		  /*show player-toolbar when player loads for one second*/
		  plugins.show().delay(1000).fadeOut();

		  /*issue where plugin is only applied to the first tab's video title and not the rest of the tabs*/
		  /* Currently using CSS to add ellipsis */
		  /* TODO: Need to find a way to do this for unsupported browsers */
		  //plugins.find('.player-toolbar > p').dotdotdot({height: 20});

		  /*player toolbar icons click handler*/
		  plugins.find('.player-toolbar ul li').on('click', function () {
			  disableHoverToggle(plugins);

			  var iconClass = $(this).attr('class'),
				  overlay = $('<div class="overlay"><div></div></div>');

			  //hide title
			  plugins.find('.player-toolbar > p').hide();

			  //remove any active classes from the list
			  plugins.find('.player-toolbar ul li span').removeClass('active');

			  //stop player
			  player.pause();

			  //append overlay div
			  if (plugins.parents('.innerWrapper').find('.overlay').length == 0) {
				  overlay.appendTo(plugins.parents('.innerWrapper'));
			  }

			  plugins.parents('.innerWrapper').find('.oo_promo div.oo_start_button').hide();

			  plugins.find('.player-toolbar ul').show();

			  plugins.removeClass('show').show().css('background', 'none');

			  plugins.parents('.innerWrapper').find('.overlay > div').empty();

			  plugins.find('.player-toolbar').find('.' + iconClass + ' span').addClass('active');

			  //append overlay content
			  appendOverlayContent(plugins, iconClass, player);
		  });

		  /*social media click handler*/
		  $('body').on('click', '.oo-toolbar a', function (e) {
			  var parent = $(this).parent(), u = '', t = $('h1').text().trim() + ' | Dell Software';

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
			  else if (parent.hasClass('googleshare')) {
				  if (typeof s == 'object') {
					  s.events = "event13";
					  s.eVar18 = "Google+";
					  s.linkTrackVars = "events,eVar18";
					  s.linkTrackEvents = "event13";
					  s.tl(true, 'o', 'Social Media');
				  }
				  e.preventDefault();
				  window.open('https://plus.google.com/share?url=' + encodeURIComponent(location.href), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
			  }
		  });
	  }


    processClosedCaption(player, videoProp);

    /*fix for mini-controls showing instead of full-controls*/
    $('.oo_controls').each(function () {
      if ($(this).hasClass('oo_mini_controls')) {
        $(this).removeClass('oo_mini_controls').addClass('oo_full_controls')
      }
    });

		var target = $('#' + player.elementId);
		target.find('.oo_controls').prepend('<div class="top-control-container"><div class="captionsContainer" style="display: none;"><div class="caption"></div></div><div class="cta-container" style="display: none;"></div></div>');
  });

	player.mb.subscribe(OO.EVENTS.PLAY, 'UITeam', function() {
		//Pause other ooyala player.
		$.each(videoList, function() {
			if(this.MBID != player.mb.MbId) {
				this.player.pause();
			}
		});
	});

	/*if(/^\/video\//.test(location.pathname)) {
		player.mb.subscribe(OO.EVENTS.PLAYHEAD_TIME_CHANGED, "UITeam", function (eventName, currentTime, totalTime) {
			var percentPlayed = (currentTime / totalTime) * 100;
			var target = $('#' + player.elementId);
			var ctaContainer = target.find('.cta-container');

			if(percentPlayed > 25) {
				ctaContainer.show();

				if(!ctaContainer.data('processed')) {
					var html = 'Jibberish text <a href="#" class="btn btn-primary btn-sm">CTA Text</a>';

					ctaContainer.html(html).data('processed', true);
				}
			}
			else {
				ctaContainer.hide();
			}
		});

		player.mb.subscribe(OO.EVENTS.PLAYED, 'UITeam', function() {
			var target = $('#' + player.elementId);
			var html = '<div style="width: 100%; height: 100%; z-index: 1; background-color: #000; opacity: .8;"></div>';
			var description = $.trim(player.getCurrentItemDescription());
			var exp = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
			var urlMatch = description.match(exp);

			if(urlMatch !== null) {
				description = $.trim(description.replace(exp, ''));
			}

			html += '<div style="position: absolute; z-index: 2; top: 40px; left: 0; padding: 20px; color: #fff; text-align: left;">';
			html += '<p>' + description + '</p>';

			if(urlMatch !== null) {
				html += '<a href="' + urlMatch[0] + '" class="btn btn-primary mr-20">CTA Text</a>';
			}

			html += '<a href="#replay" onclick="$(this).parents(\'.oo_end_screen\').find(\'.oo_replay\').trigger(\'click\');" class="btn btn-primary">Replay Video</a>';
			html += '</div>';

			target.find('.oo_replay').hide();
			target.find('.oo_end_screen').append(html);
		});
	}*/
}

/*********************/

function getTime(time) {
  var time = time.split(":"),
      hours = parseInt(time[0], 10),
      minutes = parseInt(time[1], 10),
      seconds = parseInt(time[2], 10);

  return ((hours * 3600) + (minutes * 60) + seconds);
}

function onPlayheadTimeChanged(currentTime, playerRoot, videoProp) {
  var currentCaption = '';

  // determine the language
  for (var caption in videoProp.captions) {
    var caption = videoProp.captions[caption];

    if (currentTime > caption["begin"] && currentTime <= caption["end"]) {
      currentCaption = caption;
      break;
    }
  }

  var captionContainer = playerRoot.find(".captionsContainer");

  if (currentCaption && (currentCaption != "")) {
    captionContainer.css("opacity", "1");
    playerRoot.find(".caption")[0].innerHTML = currentCaption["text"];

    if (currentCaption["text"].replace(' ', '') == '') {
      captionContainer.css("opacity", "0");
    }
  }
  else {
    captionContainer.css("opacity", "0");
  }

  if (lastCaption != currentCaption) {
    captionContainer.css("width", "100%");

    if (currentCaption != "") {
      resizeCaptions();
    }
  }

  lastCaption = currentCaption;
}

function mapLanguageCodes(localeCode) {
  switch (localeCode.toLowerCase()) {
    case "da":
      return "Dansk";
    case "de":
      return "Deutsch";
    case "en":
      return "English";
    case "en-us":
      return "English (US)";
    case "en-uk":
      return "English (UK)";
    case "es":
      return "Espa�ol";
    case "fr":
      return "Fran�ais";
    case "hi":
      return "&#2361;&#2367;&#2344;&#2381;&#2342;&#2368;";
    case "it":
      return "Italiano";
    case "ja":
      return '&#26085;&#26412;&#35486;';
    case "ko":
      return "&#51312;&#49440;&#47568;, &#54620;&#44397;&#50612;";
    case "nl":
      return "Nederlands";
    case "pt":
    case "pt-pt":
      return "Portugu�s";
    case "pt-br":
      return "Portugu�s (Brasil)";
    case "zh-hans":
      return "&#31616;&#20307;&#20013;&#25991;";
    case "zh-hant":
      return "&#32321;&#39636;&#20013;&#25991;";
    case "ar":
      return "Arabic";
    case "cs":
      return "Czech";
    case "el":
      return "Greek";
    case "fi":
      return "Finnish";
    case "fr-ca":
      return "Fran�ais (Canada)";
    case "he":
      return "Hebrew";
    case "hu":
      return "Hungarian";
    case "no":
      return "Norweigan";
    case "pl":
      return "Polish";
    case "ro":
      return "Romanian";
    case "ru":
      return "Russian";
    case "sv":
      return "Swedish";
    case "tr":
      return "Turkish";
  }
}

/*handle player overlay content interactions*/
function appendOverlayContent(plugins, iconClass, player) {
  if (plugins.parents('.innerWrapper').find('.overlay > div').is(':empty')) {
    plugins.parents('.innerWrapper').find('.overlay > div').append('<div class="info"><p>' + player.getTitle() + '</p><p>' + player.getCurrentItemDescription() + '</p><a href="#" class="remove-overlay">Close</a></div><div class="email"><h2>Email to a friend</h2><form class="sendemail"><label>Email to</label><span class="required">*</span><input class="emailfield" type="text" size="37"/><label>Message</label><textarea rows="3" cols="35"></textarea><input type="button" value="Send" class="sendbutton btn btn-primary mt-7 mr-10" /><a href="#" class="remove-overlay">Close</a></form><p class="errormessage">Please enter correct email addresses.<p></div><div class="share"><h2>Share this video</h2><div class="sharebuttons"><p>Share via social media</p><ul class="oo-toolbar"><li class="googleshare"><a href="#"><span class="icon googleshare"></span></a></li><li class="twitter"><a href="#"><span class="icon twitter"></span></a></li><li class="linkedin"><a href="#"><span class="icon linkedin"></span></a></li><li class="facebook"><a href="#"><span class="icon facebook"></span></a></li></ul><label>Copy and paste this url to share</label><input type="text" size="37"></div><a href="#" class="cancelbtn remove-overlay">Close</a></div><div class="embed"><h2>Add to website or blog</h2><label>Embed code</label><textarea rows="5" cols="35"><script height="384px" width="570px" src="http://player.ooyala.com/iframe.js#pbid=9eba220ad98c47cda9fdf6ba82ce607a&ec=' + player.embedCode + '"></script></textarea><a href="#" class="remove-overlay">Close</a></div>');
  }

  //Google +1
  (function () {
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = '//apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
  })();

  plugins.parents('.innerWrapper').find('.sharebuttons input').val(burl);

  plugins.parents('.innerWrapper').find('.overlay > div > div').each(function () {
    if (!$(this).hasClass(iconClass)) {
      $(this).hide();
    }
  });
  plugins.parents('.innerWrapper').find('.overlay > div .' + iconClass).show();

  /*remove overlay on close button click*/
  plugins.parents('.innerWrapper').find('.remove-overlay').on('click', function (e) {
    e.preventDefault();
    $(this).parents('.overlay').remove();

    enableHoverToggle(plugins);
    //remove any active classes from the list
    plugins.find('.player-toolbar ul li span').removeClass('active');

    plugins.parents('.innerWrapper').find('.oo_promo div.oo_start_button').show();

    plugins.removeAttr('style');

	  plugins.trigger('remove-overlay');
  });

  /*send email*/
  plugins.parents('.innerWrapper').find('.sendbutton').on('click', function () {
	  validateOOEmailForm(plugins, player.getTitle());
  });

}

/*toggle player toolbar on hover*/
function enableHoverToggle(plugins) {
  plugins.parents('.ooyalaplayer').on({
    mouseover: function () {
      //disable hover event if user clicks on any icon
      plugins.addClass('show');
      if (plugins.hasClass('show')) {
        plugins.find('.player-toolbar > p').show();
      }
    }
    ,
    mouseout: function () {
      plugins.removeClass('show');
    }
  });
}

/*disable toggle player on hover when user clicks on any of toolbar icons*/
function disableHoverToggle(plugins) {
  plugins.parents('.ooyalaplayer').off('mouseover mouseout');
  plugins.removeClass('show');
}

/*validate email form in overlay*/
function validateOOEmailForm(plugins, title) {
  var isValid = true, str = '', email = plugins.parents('.innerWrapper').find('.sendemail .emailfield'), emailBody = '';

  if (email.attr('type') != 'button') {
    str = (email.val() == undefined) ? '' : email.val();
    if (!str.match(/^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/)) {
      isValid = false;
      email.css('border-color', '#fd5400');
    } else {
      isValid = true;
    }
  }
  if (!isValid) {
    plugins.parents('.innerWrapper').find('.overlay > div p').show();
  }
  else {
    plugins.parents('.innerWrapper').find('.overlay > div p').hide();
    email.css('border-color', '#ccc');
    emailBody = plugins.parents('.innerWrapper').find('.sendemail textarea').val() + '\n\n' + location.href;
    window.location.href = 'mailto:' + plugins.parents('.innerWrapper').find('.sendemail input').val() + '?subject=' + title + ' - (video)&body='
    + encodeURIComponent(emailBody);
  }
}

/*add volume control to the player*/
function addPlayerControls(plugins, player) {
  var VOLUME_CONTROL = '<div class="volume-wrapper"><div class="oo_toolbar_item oo_button oo_volume oo_volume_high oo_customUI">'
      + '<div class="volume_slider"><input type="range" min="0" max="100" value="100"></div></div></div>';

  $(VOLUME_CONTROL).insertBefore(plugins.parents('.innerWrapper').find('.oo_pause')[0]);

  plugins.parents('.ooyalaplayer')
      .on('mouseenter', '.volume-wrapper', function () {
        $('.volume_slider').show();
        $('.oo_controls .oo_pause,.oo_play').animate({left: 80}, 500);
        $('.oo_full_controls .vod .oo_scrubber').animate({left: 120}, 500);
        $('.volume-wrapper').css({width: 100});
      })
      .on('mouseleave', '.volume-wrapper', function () {

        $('.volume_slider').hide();
        $('.oo_controls .oo_pause, .oo_play').animate({left: 30}, 500);
        $('.oo_full_controls .vod .oo_scrubber').animate({left: 75}, 500);
        $('.volume-wrapper').css({width: 25});
      })
      .find('.oo_volume input').on('change', function () {
        player.setVolume($(this).val() / 100);
      });
}

/* Closed Caption */

function createCaptionsCollection(d, videoProp) {
  numCCLanguages = d.length;

  var _allCaptions = [], _lastLanguage = "xx", _currentLanguage = "", elem = $('#' + videoProp.target);

  if (numCCLanguages > 0 && false) {
    elem.append('\
								<div class="ccLanguageModal" style="display:none;">\
										<p style="margin-bottom:10px;">Captions : \
												<a href="javascript:void(0);" class="on-caption ooyala-caption" onClick="onCaptions("' + videoProp.target + '");">On</a>\
												<a href="javascript:void(0);" class="off-caption disabled ooyala-caption" onClick="offCaptions("' + videoProp.target + '");">Off</a>\
										</p>\
										<ul class="listLanguages" data-target="' + videoProp.target + '"></ul>\
								</div>');

  }

  // create a quick array of language codes (assumes that these are in the same order)
  for (var _z = 0; _z < numCCLanguages; _z++) {
    var divElement = $(d[_z]);

    //languages
    var _langCode = divElement.attr("xml:lang"), _langName = mapLanguageCodes(_langCode);

    languageList.push(_langCode);

    // populate the language list modal
    elem.find(".listLanguages").append("<li class=\"ccLanguage\" data=\"" + _langCode + "\" >" + _langName + "</li>");

    //process the captions
    var _caption = [];
    // grab the <p> element
    var _el = divElement.find("p");
    // spin through the <p>
    for (var _y = 0; _y < _el.length; _y++) {
      // get parent language
      _currentLanguage = _langCode;
      if (_currentLanguage != _lastLanguage) {
        _caption.push({
          "begin": getTime($(_el[_y]).attr("begin")),
          "end": getTime($(_el[_y]).attr("end")),
          "text": $(_el[_y]).text()
        });
      }
    }
    _lastLanguage = _currentLanguage;
    _allCaptions.push(_caption);
  }

  // add event handler
  elem.on("click", '.ccLanguage', function (e) {
    changeCC.call(this, e, videoProp);
  });

  return _allCaptions;
}

function findCurrentCC(_locLanguage, _locCountry) {
  for (var _a = 0; _a < languageList.length; _a++) {
    var _listLang = languageList[_a].toLowerCase();
    var _locale = (_locCountry != undefined) ? (_locLanguage + "-" + _locCountry) : _locLanguage;
    // check for special cases
    if (_locale.toLowerCase() == "zh-cn") {
      _locale = "zh-hans";
    } else if (_locale.toLowerCase() == "zh-tw") {
      _locale = "zh-hant";
    }
    if (_listLang.toLowerCase() == _locale.toLowerCase()) {
      return allCaptions[_a];
    }
  }
  return [];
}

function processClosedCaption(player, videoProp) {
  var elementId = player.elementId,
      language = 'en',
      country = 'us';

  jQuery.ajax({
    url: player.currentItem.closed_captions[0].url,
    type: "GET",
    dataType: "xml"
  }).done(function (xmldata) {
    /*issue where last video's closed captioning shows for all of the videos*/
    allCaptions = createCaptionsCollection($(xmldata).find("div"), videoProp);

    if (allCaptions.length > 0) {
      var playerRoot = $("#" + elementId);

			//var topControlContainer = playerRoot.find('.top-control-container');
			//topControlContainer.prepend('<div class="captionsContainer"><div class="caption"></div></div>');

      addCCButton(videoProp);
      //languageList - spin through the language list and grab the current CC captions
      // first try full locale

      videoProp.captions = findCurrentCC(language, country);

      if (videoProp.captions.length == 0) {
        videoProp.captions = findCurrentCC(language);
      }

      if (playerRoot.find('.off-caption').hasClass('disabled')) {
        onCaptions(elementId);
      }

      playerRoot.find('.oo_controls').addClass('has-cc');
    }

    videoProp.MB.subscribe(OO.EVENTS.PLAYHEAD_TIME_CHANGED, "UITeam", function (eventName, currentTime, totalTime) {
      onPlayheadTimeChanged(currentTime, playerRoot, videoProp);
    });
  }).fail(function (xmldata) {
    console.log("Did not get closed captions");
  });
}

function changeCC(obj, videoProp) {
  var target = $(this).find('ul').data('target');

  if ($(this).hasClass("ccLanguage-disabled") == false) {
    var _langStr = obj.target.attributes.data.nodeValue;

    captions = findCurrentCC(_langStr);

    $("#" + target)
      //.find(".ccLanguageModal").trigger('reveal:close').end()
      //.find(".videoLanguage01").hide().end()
        .find(".cc_icon").attr("lanhidden", "true");
  }

  videoProp.MB.publish(OO.EVENTS.PLAY);
}

function offCaptions(elementId) {
  $('#' + elementId)
      .find(".off-caption").removeClass("disabled").end()
      .find(".on-caption").addClass("disabled").end()
      .find(".captionsContainer").hide().end()
      .find(".listLanguages").hide().end()
      .find(".ccLanguage").addClass("ccLanguage-disabled").end()
      .find(".videoLanguage01").hide().end()
      .find(".cc_icon").attr("lanhidden", "true");
}

function onCaptions(elementId) {
  $('#' + elementId)
      .find(".on-caption").removeClass("disabled").end()
      .find(".off-caption").addClass("disabled").end()
      .find(".captionsContainer").show().end()
      .find(".listLanguages").show().end()
    //.find(".videoLanguage01").show().end()
      .find(".ccLanguage").removeClass("ccLanguage-disabled").end()
      .find(".cc_icon").attr("lanhidden", "false");
}

function addCCButton(videoProp) {
  $("#" + videoProp.target)
      .find(".vod").append("<div class=\"cc_icon\" class=\"oo_button oo_toolbar_item oo_cc\" lanhidden=\"true\"></div>").end()
      .on("click", ".cc_icon", function () {
        if ($(this).attr("lanhidden") == "true") {
          onCaptions(videoProp.target);
        }
        else {
          offCaptions(videoProp.target);
        }
      });

  var playerObj = $("#" + videoProp.target), vodNode = playerObj.find(".vod");

  playerObj.find('.oo_controls').attr("cc", "cc");

  //var ccPopupHtml = '<div class="videoLanguage01"></div>';

  //$(vodNode).append(ccPopupHtml);

  playerObj
    //.find(".videoLanguage01").hide().append($(".ccLanguageModal")).end()
    //.find(".ccLanguageModal").show().end()
      .find(".off-caption").removeClass("disabled").end()
      .find(".on-caption").addClass("disabled").end()
      .find(".captionsContainer").hide().end()
      .find(".listLanguages").hide().end()
      .find(".ccLanguage").addClass("ccLanguage-disabled").end()
    //.find(".videoLanguage01").hide().end()
      .find(".cc_icon").attr("lanhidden", "true");
}