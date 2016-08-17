/*
 Usage:
 <script src="/static/js/ePrivacy.min.js"></script>
 <script>
 $(function () {
 ePrivacy.init({
 description: 'By using this site, you agree to the <a href="/legal/privacy.aspx">Privacy Policy</a> and <a href="/legal/">Terms of Use</a>.',
 });
 })();
 </script>

 $.getScript('/static/js/ePrivacy.js').done(function() {
 $(function () {
 ePrivacy.init({
 description: 'By using this site, you agree to the <a href="/legal/privacy.aspx">Privacy Policy</a> and <a href="/legal/">Terms of Use</a>.',
 });
 });
 });
 */

var ePrivacy = function () {
	var config = {
		containerID: 'ePrivacy',
		description: '',
		cookieParams: {
			expire: 30, //In days
			path: '/'
		},
		cookieVar: ['ePrivacyConsent', 'ePrivacyConsentDate'],
		css: '#ePrivacy {' +
		' position: fixed; bottom: 0;' +
		' width: 100%;' +
		' background-color: #eeeeee;' +
		' padding: 16px 0;' +
		' z-index: 9999;' +
		' -webkit-box-shadow: 0 0 15px rgba(0, 0, 0, 0.50);' +
		' box-shadow: 0 0 15px rgba(0, 0, 0, 0.75);' +
		'}' +
		'#ePrivacy .glyphicon-remove {' +
		' cursor: pointer;' +
		' font-size: 20px;' +
		' line-height: 1em;' +
		'}' +
		'#ePrivacy p {' +
		' font-size: 17px;' +
		' line-height: 1.3em;' +
		' margin: 0 35px 0 0;' +
		'}' +
		'@media (max-width: 767px) {' +
		' #ePrivacy p {' +
		'   font-size: 14px;' +
		' }' +
		'}'
	};

	var today = new Date(),
		containerElem = null,
		containerHeight = 0,
		cookies = document.cookie.split(';'),
		template = '';

	/**
	 * Initializing ePrivacy module.
	 * @param obj
	 */
	function init(obj) {
		$.extend(config, obj);

		template = '<div id="' + config.containerID + '" class="bootstrap">' +
			'<div class="container">' +
			' <div class="row">' +
			'   <div class="col-sm-12">' +
			'     <span class="glyphicon glyphicon-remove pull-right" aria-hidden="true"></span>' +
			'     <p>' + config.description + '</p> ' +
			'   </div>' +
			' </div>' +
			'</div>' +
			'</div>';

		config.cookieParams.expire *= 1000; //24*60*60*1000

		if (displayNotice() || location.search == '?ePrivacy=true') {
			$('head').append('<style>' + config.css + '</style>');
			$('body').append(template);

			containerElem = $('#' + config.containerID);
			containerHeight = containerElem.outerHeight(true);

			containerElem.css('bottom', -1 * containerHeight).animate({'bottom': 0}, 500);

			bindEvent();
		}
	}

	/**
	 * Bind ePrivacy module so that user can close the popup
	 */
	function bindEvent() {
		containerElem.on('click', '.glyphicon-remove', function (e) {
			var expireDate = new Date(today.getTime() + config.cookieParams.expire).toUTCString();

			e.preventDefault();

			document.cookie = config.cookieVar[0] + "=1; expires=" + expireDate + "; path=" + config.cookieParams.path;
			document.cookie = config.cookieVar[1] + "=" + today.getTime() + "; expires=" + expireDate + "; path=" + config.cookieParams.path;

			containerElem.animate({bottom: -1 * containerHeight}, 500, function () {
				containerElem.remove();
			});
		})
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

/*
 $(function () {
 ePrivacy.init({
 description: 'By using this site, you agree to the <a href="/legal/privacy.aspx">Privacy Policy</a> and <a href="/legal/">Terms of Use</a>.',
 });
 })();*/
