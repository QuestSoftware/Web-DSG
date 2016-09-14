$(function () {
	var today = new Date(),
		description = 'By using this site, you agree to the <a href="/legal/privacy.aspx">Privacy Policy</a> and <a href="/legal/">Terms of Use</a>.',
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
			'       <span class="glyphicon glyphicon-remove" aria-hidden="true" style="cursor: pointer; padding-top: 5px;"></span>' +
			'     </div>' +
			'     <p class="mb-0" style="margin-top: 3px; font-size: 15px;">' + description + '</p> ' +
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
		containerElem.on('click', '.glyphicon-remove', function (e) {
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