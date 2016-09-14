(function () {
	var today = new Date(),
		consentButtonText = 'I Agree',
		privacyButtonText = 'Read More',
		description = 'This website uses cookies to improve user experience. By using our website you consent to all cookies in accordance with our Cookie Policy.',
		privacyURL = '/legal/privacy.aspx',
		containerID = 'ePrivacy',
		cookieParams = {
			expire: 30, //In days
			path: '/'
		},
		cookieVar = ['ePrivacyConsent', 'ePrivacyConsentDate'];

	//Do not modify below this line

	var containerElem = null,
		containerHeight = 0,
		cookies = document.cookie.split(';'),
		template = '<div id="' + containerID + '" style="position: fixed; bottom: 0; width: 100%; background-color: #eeeeee; padding: 5px 0; z-index: 9999; -webkit-box-shadow: 0 0 15px rgba(0, 0, 0, 0.75); box-shadow: 0 0 15px rgba(0, 0, 0, 0.75);">' +
			'<div class="container">' +
			' <div class="row">' +
			'   <div class="col-sm-12">' +
			'     <div class="pull-right">' +
			'       <a href="#" class="btn btn-success btn-sm ml-15">' + consentButtonText + '</a>' +
			'     </div>' +
			'     <p class="mb-0" style="margin-top: 7px; font-size: 15px;">' + description +
			'      <a href="' + privacyURL + '">' + privacyButtonText + '</a>' +
			'     </p> ' +
			'   </div>' +
			' </div>' +
			'</div>' +
			'</div>';

	cookieParams.expire *= 1000; //24*60*60*1000

	if (displayNotice() || true) {
		$('body').append(template);

		containerElem = $('#' + containerID);
		containerHeight = containerElem.outerHeight(true);

		containerElem.css('bottom', -1 * containerHeight).animate({'bottom': 0}, 500);

		bindEvent();
	}

	function bindEvent() {
		containerElem.on('click', '.btn-success', function (e) {
			var expireDate = new Date(today.getTime() + cookieParams.expire).toUTCString();

			e.preventDefault();

			document.cookie = cookieVar[0] + "=1; expires=" + expireDate + "; path=" + cookieParams.path;
			document.cookie = cookieVar[1] + "=" + today.getTime() + "; expires=" + expireDate + "; path=" + cookieParams.path;

			containerElem.animate({bottom: -1 * containerHeight}, 500, function () {
				containerElem.remove();
			});
		})
	}

	function displayNotice() {
		var consent = getCookie(cookieVar[0]),
			consentDate = parseInt(getCookie(cookieVar[1]));

		//Check if user has already consent to our ePrivacy and is within the expiry date.
		if (consent === '1' && consentDate + cookieParams.expire > today.getTime()) {
			return false;
		}

		return true;
	}

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
})();