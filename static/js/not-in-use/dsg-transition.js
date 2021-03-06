/*
 Usage:
 <script src="/static/js/dsg-transition.min.js"></script>
 <script>
 $(function () {
 ePrivacy.init({
 description: 'By using this site, you agree to the <a href="/legal/privacy.aspx">Privacy Policy</a> and <a href="/legal/">Terms of Use</a>.',
 });
 })();
 </script>

 $.getScript('/static/js/dsg-transition.js').done(function() {});
 */

var DSGTransition = function () {
	var config = {
		url: 'https://www.quest.com',
		containerID: 'DSG-Transition',
		description: [
			'<span class="main-blurb">Dell Software is now Quest</span>',
			'Visit our new site at <span class="text-underline">Quest.com</span>'
		],
		cookieParams: {
			expire: 999, //In days
			path: '/'
		},
		cookieVar: ['DSGTransitionConsent', 'DSGTransitionConsentDate'],
		css: '#DSG-Transition {' +
		' background-color: #b72959;' +
		' font-family: "Trebuchet MS", Arial;' +
		' font-size: 16px;' +
		' line-height: 1.3em;' +
		' text-align: center;' +
		' position: absolute;' +
		' top: 0;' +
		' left: 0;' +
		' width: 100%;' +
		' overflow: hidden;' +
		' z-index: 9999;' +
		' color: #fff;' +
		' padding-top: 15px;' +
		'}' +
		'#DSG-Transition:hover {' +
		' text-decoration: none;' +
		'}' +
		'#DSG-Transition .main-blurb {' +
		' font-size: 20px;' +
		'}' +
		'#DSG-Transition .text-underline {' +
		' text-decoration: underline;' +
		'}'
	};

	var today = new Date(),
		containerElem = null,
		containerHeight = 0,
		cookies = document.cookie.split(';'),
		template = '',
		scrollPos = scrollPosition();

	/**
	 * Initializing ePrivacy module.
	 * @param obj
	 */
	function init(obj) {
		$.extend(config, obj);

		template = '<a href="' + config.url + '" target="_blank" id="' + config.containerID + '">' +
			' <p><span class="main-blurb">' + config.description[0] + '</span><br>' + config.description[1] + '</p> ' +
			'</a>';

		config.cookieParams.expire *= 24 * 60 * 60 * 1000;

		if (displayNotice() || location.search == '?DSGTransition=true') {
			$('head').append('<style>' + config.css + '</style>');

			if (scrollPos[1] > 0) {
				$('html, body').animate({'scrollTop': 0}, 500, function () {
					showNotice();
				});
			}
			else {
				showNotice();
			}

			bindEvent();

			var expireDate = new Date(today.getTime() + config.cookieParams.expire).toUTCString();

			document.cookie = config.cookieVar[0] + "=1; expires=" + expireDate + "; path=" + config.cookieParams.path;
			document.cookie = config.cookieVar[1] + "=" + today.getTime() + "; expires=" + expireDate + "; path=" + config.cookieParams.path;
		}
	}

	/**
	 * Bind ePrivacy module so that user can close the popup
	 */
	function bindEvent() {
		containerElem.on('click', function (e) {
			containerElem.animate({'top': -1 * containerHeight}, 500, function () {
				containerElem.remove();
			});

			$('body').animate({'paddingTop': 0}, 500);
		})
	}

	function scrollPosition() {
		if (window.pageYOffset != undefined) {
			return [pageXOffset, pageYOffset];
		}
		else {
			var sx, sy, d = document, r = d.documentElement, b = d.body;
			sx = r.scrollLeft || b.scrollLeft || 0;
			sy = r.scrollTop || b.scrollTop || 0;
			return [sx, sy];
		}
	}

	/**
	 * Detect if ePrivacy module should be displayed or not.
	 * @returns {boolean}
	 */
	function displayNotice() {
		var consent = getCookie(config.cookieVar[0]),
			consentDate = parseInt(getCookie(config.cookieVar[1]));

		//Check if user has already consent to our ePrivacy and is within the expiry date.
		if (consent === '1' && consentDate + config.cookieParams.expire > today.getTime()) {
			return false;
		}

		return true;
	}

	function showNotice() {
		var bodyElem = $('body');

		bodyElem.append(template);

		containerElem = $('#' + config.containerID);
		containerHeight = containerElem.outerHeight(true);

		containerElem.css('top', -1 * containerHeight).animate({'top': 0}, 500);
		bodyElem.animate({'paddingTop': containerHeight}, 500);
	}

	function showNotice() {
		var bodyElem = $('body');

		bodyElem.append(template);

		containerElem = $('#' + config.containerID);
		containerHeight = containerElem.outerHeight(true);

		containerElem.css('top', -1 * containerHeight).animate({'top': 0}, 500);
		bodyElem.animate({'paddingTop': containerHeight}, 500);
	}

	/**
	 * Get cookie value by name.
	 * @param cname
	 * @returns {*}
	 */
	function getCookie(cname) {
		var name = cname + "=";

		for (var i = 0; i < cookies.length; i++) {
			var c = cookies[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}

		return "";
	}

	return {
		init: init
	}
}();

/*$.getScript('/static/js/dsg-transition.js').done(function() {
 DSGTransition.init({
 url: 'https://www.quest.com',
 description: [
 'Dell Software is now Quest',
 'Visit our new site at <span class="text-underline">Quest.com</span>'
 ]
 });
 });*/

/*
 <script src="/static/js/dsg-transition.min.js"></script>
 <script>
 $(function () {
 DSGTransition.init({
 url: 'https://www.quest.com',
 description: [
 'Dell Software is now Quest',
 'Visit our new site at <span class="text-underline">Quest.com</span>'
 ]
 });
 })();
 </script>*/
