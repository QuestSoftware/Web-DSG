if(document.getElementsByTagName('html')[0].className.indexOf('ie8') == -1) {
	$( document ).ajaxSuccess(function( event, xhr, settings ) {
		if (settings.url.match(/Registerv2\/ProspectProcess/)) {
			window.VWO = window.VWO || [];

			VWO.push(['nls.formAnalysis.markSuccess', document.getElementById('frmRegister'), true]);
		}
	});

	/*window.VWO = window.VWO || [];

	var forms = document.getElementsByTagName('form'), i = 0;

	for(i=0; i < forms.length; i++) {
		if(forms[i].id != 'search-form') {
			VWO.push(['nls.formAnalysis.markSuccess', forms[i], true]);
		}
	}*/

	_vwo_clicks=100;
	_vwo_code=(function(){
		var account_id=40342,
			settings_tolerance=2000,
			library_tolerance=2500,
			use_existing_jquery = (typeof jQuery !== "undefined"), f = false, d = document;

		setTimeout(function () {
			var a = d.getElementById('_vis_opt_path_hides');

			if (a) {
				a.parentNode.removeChild(a);
			}
		}, settings_tolerance * 2);

		return {
			use_existing_jquery: function () {
				return use_existing_jquery;
			}, library_tolerance: function () {
				return library_tolerance;
			}, finish: function () {
				if (!f) {
					f = true;
					var a = d.getElementById('_vis_opt_path_hides');
					if (a)a.parentNode.removeChild(a);
				}
			}, finished: function () {
				return f;
			}, load: function (a) {
				var b = d.createElement('script');
				b.src = a;
				b.type = 'text/javascript';
				b.innerText;
				b.onerror = function () {
					_vwo_code.finish();
				};
				d.getElementsByTagName('head')[0].appendChild(b);
			}, init: function () {
				settings_timer = setTimeout('_vwo_code.finish()', settings_tolerance);
				this.load('//dev.visualwebsiteoptimizer.com/j.php?a=' + account_id + '&u=' + encodeURIComponent(d.URL) + '&r=' + Math.random());
				var a = d.createElement('style'), b = 'body{opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important;}', h = d.getElementsByTagName('head')[0];
				a.setAttribute('id', '_vis_opt_path_hides');
				a.setAttribute('type', 'text/css');
				if (a.styleSheet)a.styleSheet.cssText = b;
				else a.appendChild(d.createTextNode(b));
				h.appendChild(a);
				return settings_timer;
			}
		};
	}());
	_vwo_settings_timer = _vwo_code.init();
}