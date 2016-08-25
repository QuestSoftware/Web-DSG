/*
$(function ($) {
  if ($('.affix-scroll-nav-top').length) {
    resizeAffix();
    addResize('resizeAffix');
  }
});

function resizeAffix() {
  var affix = $('.affix-scroll-nav-top'),
      siteWrapper = $('.site-wrapper'),
      body = $('body'),
      affixHeight = affix.height();

  if (pageType > 0) {
    //fix for adjusting height of all tabs if we have multiple lines
    affix.find('a').each(function(){
      if($(this).parent().outerHeight() < affixHeight){
        var heightDiff = affixHeight - $(this).parent().outerHeight()+ parseInt($(this).css('padding-top'));
        $(this).css('padding-bottom', heightDiff + 'px');
      }
    });

    //fix to keep first affix item active when on top of the page
    if (!siteWrapper.attr('id')) {
			var id = affix.find('a:first-child').attr('href').substr(1);

			$('#' + id).attr('id', id + '_old');

      siteWrapper.attr('id', affix.find('a:first-child').attr('href').substr(1));
    }

    //fix for affix width changing when floating on the page
    affix.css("width", affix.parents('.container').width());

    //prepend div to fix affix position on bookmarked section
    if (!$('.affix-fix').length && false) {
      affix.find('a:gt(0)').each(function () {
        body.find($(this).attr('href'))
            .prepend('<div class="affix-fix" style="padding-top:' + affix.height() + 'px; margin-top:'
            + -affix.height() + 'px">');
      });
    }

    //trigger scrollspy if it hasn't been triggered already
    if (!body.data('bs.scrollspy')) {
      /!*set offset to activate tab based on position*!/
      body.scrollspy({target: '.affix-scroll-nav-top', offset: affix.outerHeight(true) + 10});

			affix.on('click', 'a', function(e) {
				e.preventDefault();
				var targetTop = $($(this).attr('href')).offset().top, navTop = affix.outerHeight(true);

				if(affix.hasClass('affix-top')) {
					navTop *= 2;
				}

				var top = targetTop - navTop;

				if(top < 0) {
					top = 0;
				}

				$('html,body').scrollTop(Math.ceil(top));
				//body.scrollspy('refresh');
			});
    }

    //trigger affix if it hasn't been triggered already
    if (!body.data('bs.affix')) {
			$('body').css('position', 'relative');

      affix.affix({
        offset: {
          top: affix.offset().top
        }
      });
    }
  }
	else {
    $('.affix-fix').remove();

    //destroy scrollspy
    body.scrollspy({target: ''});
    affix.removeData('bs.scrollspy');

    //destroy affix
    $(window).off('.affix');
    affix.removeData('bs.affix');
  }
}

*/
