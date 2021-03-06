var jQuery = top.jQuery;

$ = function (selector, context) {
  if (typeof selector == 'undefined' && typeof context == 'undefined') {
    return jQuery;
  }

  return jQuery(selector, context ? context : this.document);
}

var query = location.search.substr(1),
    config = {},
    playlist = [],
    burl = '';

//Process query string into an array.
query = query.split('&');

for (var i in query) {
  if (typeof query[i] == 'string') {
    var tmp = query[i].split('=');
    config[tmp[0]] = tmp[1];
  }
}

OO.ready(function () {
  console.log(config['autoplay']);
  window["ooyala_player_handle"] = OO.Player.create("ooyalaplayer", config['ooyala'] || config['playlist'], {
    onCreate: OOCreate,
    autoplay: config['autoplay'] === 'undefined' ? false : true,
    enableChannels: true
  });
});

$('body').on('click', 'a', function (e) {
  e.preventDefault();
});

if (typeof config['playlist'] != 'undefined') {
  $('#playlist').css('display', 'inline-block');
  $('#ooyalaplayer').addClass('playlist');

  jQuery.ajax({
    url: '/jsonrequest/videoplaylistget/?playlistID=' + config['playlist']
  }).done(function (data) {
    playlist = data.data

    jQuery.each(playlist, function (indx, d) {
      var className = '';

      if (!indx) {
        className = 'active';
        $('h1').text(d.DisplayName);
        $('#description').html(d.Desc || '');

        resize();
      }

      $('#playlist').find('ul').append('<li class="' + className + '"><img src="' + d.ImageURL3 + '" width="100"><div>' + d.DisplayName + '</div></li>');
    });
  });

  $('#playlist').on('click', 'li', function () {
    var lis = $('#playlist').find('li'),
        id = lis.index(this);

    lis.removeClass('active');
    $(this).addClass('active');
    $('h1').text(playlist[id].DisplayName);
    $('#description').html(playlist[id].Desc || '');

    ooyala_player_handle.destroy();

    window["ooyala_player_handle"] = OO.Player.create("ooyalaplayer", playlist[id].Embed_Code, {
      onCreate: OOCreate,
      autoplay: false,
      enableChannels: true
    });
  });
}
else {
  $('#transcript').show();

  $('h1').text(decodeURIComponent(config['title']));
  $('#description').text(decodeURIComponent(config['desc']) || '');

  $(window).load(function () {
    $('#transcript').removeClass('loading');
  });

  if (!(decodeURIComponent(config['3Play']) == 'Transcript ID Not Found' || config['3Play'] == '')) {
    document.getElementById('transcript').style.display = 'block';

    p3_api_key = "";
    p3_window_wait = true;

    if (typeof p3_instances == "undefined") p3_instances = {};
    if (!p3_instances["ooyala_player_handle"]) {
      p3_instances["ooyala_player_handle"] = {
        file_id: config['3Play'],
        player_type: "ooyala",
        api_version: "simple",
        project_id: "11091",
        platform_integration: false
      }
    }
    p3_instances["ooyala_player_handle"]["transcript"] = { target: "transcript", width: "640", height: "203", skin: "minamalist" }
    if (typeof p3_is_loading == "undefined" || (!p3_is_loading)) {
      p3_is_loading = true;
      var e = document.createElement('script');
      e.async = true;
      e.src = "//p3.3playmedia.com/p3.js"
      document.getElementById('p3-js-main-root').appendChild(e);
    }
  }
  else {
    document.getElementById('transcript').style.display = 'none';
  }

  //Social media toolbar
  (function () {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = '//apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();

  //Retrieve bit.ly url
  if (window.XMLHttpRequest && location.host == 'software.dell.com') {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/hidden/bitly.asmx/get?URI=" + encodeURIComponent('http://' + location.host + config['url']));//to add href from config
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          xml = $(jQuery.parseXML(xhr.responseText));
          var obj = jQuery.parseJSON(xml.find("string").text());
          if (typeof obj.data != 'undefined') {
            burl = obj.data.url;
          }
        }
      }
    }
    xhr.send();
  }

  $('body').on('click', '#player-toolbar li', initializeToolbar);
}

resize();

$('#description').html(replaceURL($('#description').text()));

/*fix for links in iframe not working*/
$('#description').find('a').on('click', function () {
  window.parent.document.location = $(this).attr('href');
});

function initializeToolbar() {
  //override validation function to update the video url 
  $('#sendbutton').attr('onclick', 'validateFromPopUp()');

  //Interaction when clicking on facebook, twitter and linkedin
  $('#oo-toolbar').on('click', 'a', function (e) {
    var parent = $(this).parent(), classname = parent.attr('class'), u = '', t = $('h1').text().trim() + ' | Dell Software';

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
  });

  $('body').off('click', '#player-toolbar li', initializeToolbar);
}

function onCreate(player) {
  window['messageBus'] = player.mb;

  $('.oo_fullscreen').hide();

  resize();
};

function resize() {
  var h = document.body.scrollHeight;

  window.parent.document.getElementById('oo-popup-content').style.height = h + 'px';
  window.parent.document.getElementById('fancybox-content').style.height = h + 'px';
  window.parent.document.getElementById('fancybox-content').getElementsByTagName('div')[0].style.overflowY = 'hidden';
  window.parent.$.fancybox.resize();
}

function validateFromPopUp() {
  var isValid = true,
      str = '',
      email = $('#sendemail #emailfield'),
      emailBody = '';

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
    $('#overlay > div p').show();
  } else {
    $('#overlay > div p').hide();
    email.css('border-color', '#ccc');
    emailBody = $('#sendemail textarea').val() + '\n\n http://software.dell.com' + config['url'];
    window.location.href = 'mailto:' + $('#sendemail input').val() + '?subject=' + ooyala_player_handle.currentItem.title + ' - (video)&body=' + encodeURIComponent(emailBody);
  }
}

function replaceURL(text) {
  var exp = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp, "<a href='$1'>$1</a>");
}