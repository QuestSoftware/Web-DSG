var isChrome = isIE = isSafari = false, burl = "", $path = location.pathname;

if (navigator.appVersion.indexOf("Chrome/") != -1) {
	$("head").append('<link rel="stylesheet" type="text/css" href="/static/styles/chrome.min.css">');
	isChrome = true;
}
else {
	if (navigator.appVersion.indexOf("AppleWebKit/") != -1) {
		isSafari = true;
	}
	else {
		if (navigator.appName == "Microsoft Internet Explorer" || /Trident/.test(navigator.userAgent)) {
			isIE = true;
		}
	}
}

$(document).ready(function () {
	if ($path.indexOf("99026") > -1) {
		loadOoyala();
	}
	else {
		$("#content-container").find("h1").css("display", "block");
		$("#right-form-partialreg").css("display", "block");
	}
	(function () {
		var l = $(".breadcrumb").find("li:last");
		l.html("<span>" + l.text() + "</span>").hide();
		var m = $(".breadcrumb").height();
		$(".breadcrumb").find("li:last").show().css("visibility", "hidden");
		var n = $(".breadcrumb").css({
			width: "auto",
			display: "inline-block"
		}).width();
		var k = $(".breadcrumb").parent().width();
		$(".breadcrumb").css({
			width: "100%",
			display: "block"
		});
		setTimeout(function () {
			if ($(".breadcrumb").height() >= m + 5) {
				var p = 10;
				while ($(".breadcrumb").height() >= m + 5) {
					if (!p) {
						break;
					}
					var o = l.find("span:last").text();
					l.find("span:last").text(o.substr(0, o.length - 1));
					p--;
				}
				var o = l.find("span:last").text();
				l.find("span:last").text(o.substr(0, o.length - 3) + "...");
			}
			l.css("visibility", "visible");
		});
	})();
	$("nav").on("click", "#tier1 > li > a, #tier1 > li > span", function () {
		i.call(this, $(this).parent());
		var l = $(this).parent().find("> div > ul");
		if (l.length && l.data("processed") == undefined) {
			var m = 0, k = l.find("> li > a");
			k.each(function () {
				if ($(this).height() > m) {
					m = $(this).height();
				}
			});
			k.css("height", m);
			l.data("processed", true);
		}
		if ($(this).data("processed") == undefined) {
			if (!$(this).parent().find(".tier2").length) {
				$(this).parent().addClass("no-tier2");
				var n = 0;
				$(this).parent().find(".tier3").find("> div > div > ul > li > a").each(function () {
					if ($(this).height() > n) {
						n = $(this).height();
					}
				});
				$(this).parent().find(".tier3").find("> div > div > ul > li").find("> a, > span").css("height", n);
			}
			$(this).data("processed", true);
		}
		$(this).parent().find("> div > ul > li").removeClass("active");
		$(this).parent().find("> div > ul > li:first-child > a").trigger("click");
	});
	$("nav").find(".tier2 > ul > li > a").each(function () {
		if ($(this).attr("href") == "#") {
			$(this).append('<span class="nav-caret"></span>');
		}
	});
	$("nav").on("click", ".tier2 > ul > li > a", function (l) {
		if ($(this).attr("href") == "#") {
			l.preventDefault();
			i.call(this, $(this).parent().parent());
			var n = $(this).next(), k = n.find("> div").find("> div"), m = 0;
			k.each(function (o) {
				if ($(this).data("processed") == undefined) {
					if ($(this).find("> ul > li > a").height() > m) {
						m = $(this).find("> ul > li > a").height();
					}
					$(this).find("li").each(function () {
						if ($(this).hasClass("next-column")) {
							var r = $(k.get(o + 1)), q = $(this).nextAll();
							if (r.find("> ul").length) {
								r.prepend("<hr>");
							}
							r.prepend("<ul></ul>");
							var p = $("<li></li>").appendTo(r.find("> ul:eq(0)"));
							$('<span style="display: inline-block; height: ' + $(this).parent().parent().find("> a").outerHeight(true) + 'px;">&nbsp;</a>').appendTo(p);
							p = $("<ul></li>").appendTo(p);
							p.append(q);
							$(this).removeClass("next-column");
						}
					});
				}
			});
			if ($(this).data("processed") == undefined) {
				k.find("> ul > li").each(function () {
					if (!$(this).hasClass("single") && !$(this).parents(".bottom").length) {
						$(this).find("> a, > span").css("height", m);
					}
				});
			}
			$(this).data("processed", true);
		}
	});
	$("nav").on("click", ".close", function (k) {
		k.preventDefault();
		$($(this).parents("li")[1]).removeClass("active");
	});
	function i(k) {
		$(this).parent().siblings().removeClass("active");
		if (k.hasClass("active")) {
			$(this).parent().removeClass("active");
		}
		else {
			k.siblings().removeClass("active");
			$(this).parent().addClass("active");
		}
	}

	$(".tier3").each(function () {
		var k = 0;
		$(this).find("> div").find("> div").each(function () {
			if ($(this).hasClass("bottom")) {
				return true;
			}
			k++;
		});
		if (k == 4) {
			$(this).find("> div").find("> div").each(function () {
				if ($(this).hasClass("bottom")) {
					return true;
				}
				$(this).css("width", "22.6%");
			});
		}
	});
	$("#list-countries").on("click", function (k) {
		k.stopPropagation();
		k.preventDefault();
		$("#list-countries-popup").toggle();
	});
	$("body").on("click", function () {
		$("#list-countries-popup").hide();
	});
	$("#page-tools").on("click", "a", function (k) {
		var l = $(this).attr("id");
		if (l == "print") {
			k.preventDefault();
			window.print();
		}
		else {
			if (l == "request-quote") {
			}
			else {
				if (l == "email") {
				}
			}
		}
	});
	if ($("#toolbar").length) {
		$("#toolbar").is("ul") ? $("#toolbar").find(".googleplusone").remove().end().find("> .twitter").before('<li class="googleshare"><a href="#"><span class="icon googleshare"></span>Google</a></li>') : $("#toolbar").find(".googleplusone").remove().end().find("ul > .twitter").before('<li class="icon googleshare"><a href="#"><span>Google</span></a></li>');
		if (window.XMLHttpRequest) {
			var j = new XMLHttpRequest();
			j.open("GET", "/hidden/bitly.asmx/get?URI=" + encodeURIComponent("http://" + location.host + "/" + location.pathname));
			j.onreadystatechange = function () {
				if (j.readyState == 4) {
					if (j.status == 200) {
						xml = $($.parseXML(j.responseText));
						var k = jQuery.parseJSON(xml.find("string").text());
						if (typeof k.data != "undefined") {
							burl = k.data.url;
						}
					}
				}
			};
			j.send();
		}
		if ($("#toolbar").parents("#right-rail").length) {
			$("#right-rail").css("padding-top", parseInt($("#right-rail").css("margin-top")) + $("article").find("> h2").outerHeight(true));
		}
		else {
			if (!$("#toolbar").parents("#right-rail").length && $("#right-rail").length) {
				$("#right-rail").css("padding-top", parseInt($("#right-rail").css("margin-top")) + $("#toolbar").offset().top - $("#right-rail").offset().top);
			}
		}
		$("#toolbar").on("click", "a", function (o) {
			var m = $(this).parent(), n = m.attr("class"), k = location.href, l = document.title;
			if (m.hasClass("facebook")) {
				if (typeof s == "object") {
					s.events = "event13";
					s.eVar18 = "Facebook";
					s.linkTrackVars = "events,eVar18";
					s.linkTrackEvents = "event13";
					s.tl(true, "o", "Social Media");
				}
				o.preventDefault();
				window.open("http://www.facebook.com/sharer.php?u=" + encodeURIComponent(burl) + "&t=" + encodeURIComponent(l), "facebook", "width=480,height=240,toolbar=0,status=0,resizable=1");
			}
			else {
				if (m.hasClass("twitter")) {
					if (typeof s == "object") {
						s.events = "event13";
						s.eVar18 = "Twitter";
						s.linkTrackVars = "events,eVar18";
						s.linkTrackEvents = "event13";
						s.tl(true, "o", "Social Media");
					}
					if (burl == "") {
						burl = k;
					}
					o.preventDefault();
					window.open("http://twitter.com/share?via=DellSoftware&url=" + encodeURIComponent(burl) + "&text=" + encodeURIComponent(l) + ",%20&counturl=" + encodeURIComponent(k), "twitter", "width=480,height=380,toolbar=0,status=0,resizable=1");
				}
				else {
					if (m.hasClass("linkedin")) {
						if (typeof s == "object") {
							s.events = "event13";
							s.eVar18 = "LinkedIn";
							s.linkTrackVars = "events,eVar18";
							s.linkTrackEvents = "event13";
							s.tl(true, "o", "Social Media");
						}
						o.preventDefault();
						window.open("http://www.linkedin.com/shareArticle?mini=true&url=" + encodeURIComponent(burl) + "&title=" + encodeURIComponent(l), "linkedin", "width=480,height=360,toolbar=0,status=0,resizable=1");
					}
				}
			}
		});
	}
	else {
		if (!$(".homepage").length) {
			if ($("#right-rail").length && $("h2").length) {
				$("#right-rail").css("padding-top", parseInt($("#right-rail").css("margin-top")) + $("h2").offset().top + $("h2").outerHeight(true) - $("#right-rail").offset().top);
			}
			else {
				if ($("#right-rail").length && !$("h2").length) {
					$("#right-rail").css("margin-top", 20);
				}
			}
		}
	}
	if ($("#right-rail").length) {
		if ($("#right-rail").parents(".velocity").length && !$(".homepage").length) {
			if (!$("#right-rail").parents(".velocity.subpage").length) {
				if ($("#tabs").length) {
					$("#right-rail").css("padding-top", $("#tabs").position().top);
				}
				else {
					$("#right-rail").css("padding-top", $(".teasers.large").outerHeight(true));
				}
			}
		}
		$("#right-rail").animate({
			opacity: 1
		}, 500);
	}
	var c = {};
	(function () {
		var k, m = /\+/g, l = /([^&=]+)=?([^&]*)/g, o = function (p) {
			return decodeURIComponent(p.replace(m, " "));
		}, n = window.location.search.substring(1);
		while (k = l.exec(n)) {
			c[o(k[1])] = o(k[2]);
		}
	})();
	$("#searchterm").val(c.q).keypress(function (k) {
		if (k.which == 13) {
			k.preventDefault();
			goAllSearch();
		}
	});
	if ($("#tabs").length) {
		$("#tabs").tabs({
			activate: function (n, m) {
				var l = $("#tabs").find("> ul > li").index(m.newTab);
				$("#tabs").find("> ul > li").removeClass("hide-pipe");
				if (l) {
					for (var o = l - 1; o >= 0; o--) {
						var k = $("#tabs").find("> ul > li:eq(" + o + ")");
						if (k.is(":visible")) {
							k.addClass("hide-pipe");
							break;
						}
					}
				}
				$("#" + m.newTab.attr("aria-controls")).trigger("isVisible");
				if ($("html").hasClass("ie8")) {
					$("#body-container").parent().css("min-height", $("#body-container").height());
				}
			}
		});
		var g = $("#tabs").find("> ul > li").index($("#tabs").find("> ul > .ui-tabs-active"));
		if (g) {
			$("#tabs").find("> ul > li:eq(" + (g - 1) + ")").addClass("hide-pipe");
		}
		if (location.hash != "" && $("#" + location.hash.substr(1)).length) {
			startTab = location.hash.substr(1);
		}
		if (typeof startTab == "string") {
			$("#tabs").find("> ul.ui-tabs-nav > li").each(function (k) {
				if ($(this).attr("aria-controls") == startTab) {
					$("#tabs").tabs("option", "active", k);
				}
			});
		}
		(function () {
			var m = $("#tabs").find(".ui-tabs-nav").find("li"), k = m.filter(":eq(0)").offset().top, l = parseInt(m.filter(":eq(0)").find("a").css("fontSize"));
			while (!n()) {
				m.find("a").css("fontSize", --l);
				if (l <= 10) {
					break;
				}
			}
			function n() {
				var o = true;
				$("#tabs").find(".ui-tabs-nav").find("li").each(function (p) {
					if (p && k != $(this).offset().top) {
						o = false;
						return false;
					}
				});
				return o;
			}
		})();
	}
	if ($("#right-rail").length) {
		$("#right-rail").find("ul").each(function () {
			var k = 4;
			if (!$(this).hasClass("no-pagination")) {
				if ($(this).data("row")) {
					k = $(this).data("row");
				}
				$(this).slidePagination({
					interval: k,
					column: 1,
					force: false
				});
			}
		});
	}
	$(".pagination-type1").find("ul").each(function () {
		var l = 2, k = 4;
		if ($(this).parent().data("column") != undefined) {
			l = $(this).parent().data("column");
			k = l * 2;
		}
		$(this).slidePagination({
			interval: k,
			column: l,
			force: false
		});
	}).find("li > img").css("cursor", "pointer").on("click", function () {
		var k = $(this).next().find("> a");
		if (k.hasClass("bcplaylist")) {
			k.trigger("click");
		}
		else {
			if (k.attr("target") == undefined) {
				location.href = k.attr("href");
			}
			else {
				window.open(k.attr("href"), k.attr("target"));
			}
		}
	});
	if (!$(".homepage").length) {
		var h = $("#banner-container").find("> .banner");
		if (h.children().length > 1) {
			h.before('<ul id="banner-nav"></ul>').cycle({
				fit: 1,
				activePagerClass: "active",
				pager: "#banner-nav",
				pagerAnchorBuilder: function (l, k) {
					return '<li><a href="#">' + (l + 1) + "</a></li>";
				},
				random: typeof bannerrandomize != "undefined" && bannerrandomize ? true : false,
				timeout: typeof bannerrotateint != "undefined" ? bannerrotateint * 1e3 : 5e3,
				autostop: true,
				autostopCount: h.find("> div").length * 2 + 1
			});
		}
		else {
			h.children().show();
		}
		if (h.find("img:eq(0)").attr("src") !== undefined) {
			var e = new Image();
			e.src = h.find("img:eq(0)").attr("src");
			e.onload = function () {
				if (!$("#banner-container").hasClass("boxshot")) {
					$("#banner-container").css("width", this.width);
				}
			};
		}
		$("#banner-nav").on("click", "a", function () {
			$("#banner-container").find("> .banner").cycle("pause");
		});
	}
	$(".fancybox").fancybox({
		padding: 0
	});
	$("dl.collapsible").on("click", "dt", function () {
		if ($(this).hasClass("expand")) {
			$(this).removeClass("expand");
		}
		else {
			$(this).addClass("expand");
		}
	});
	$("div.collapsible").each(function () {
		if (!$(this).find("> h4").find("span").length) {
			$(this).find("> h4").prepend("<span></span>");
		}
	});
	$("body").on("click", "tbody.collapsible > tr > th", function () {
		var k = $(this).parents("tbody.collapsible");
		if (k.hasClass("collapse")) {
			k.removeClass("collapse");
		}
		else {
			k.addClass("collapse");
		}
	});
	$("tbody.collapsible").each(function () {
		$(this).find("th").prepend("<span>");
	});
	$("body").on("click", ".collapsible > h4", function () {
		if ($(this).parent().hasClass("collapse")) {
			$(this).parent().removeClass("collapse");
		}
		else {
			$(this).parent().addClass("collapse");
		}
	});
	$("ol.breadcrumb").each(function () {
		var k = $(this).find("> li").length;
		$(this).find("> li").each(function (l) {
			if (l == 0) {
				$(this).find("a").html('<span class="icon home"></span>');
			}
			else {
				$(this).prepend('<span class="icon breadcrumb-arrow"></span>');
			}
		});
	});
	$("body").on("mouseover mouseout", ".hastooltip", function (n) {
		if (n.type == "mouseover" && $(this).find("> div").length) {
			if ($("#tooltip").length == 0) {
				$(document.body).append('<div id="tooltip" class="hide"><div class="arrow"></div><div class="body"><div></div></div></div>');
			}
			var m = $(this).find("> div").html();
			m = m.replace("<p></p>", "");
			if (m.length) {
				$("#tooltip").find("> .body > div").html(m).find("p").each(function () {
					if ($(this).html() == "") {
						$(this).remove();
					}
				});
				$("#tooltip").css({
					display: "block"
				}).removeClass("hide");
				$("#tooltip").css("height", $("#tooltip").find("> .body").height());
				var l = $(this).offset().left + $(this).outerWidth(true) + 10, k = $("#tooltip").outerHeight(true);
				$("#tooltip").css({
					top: Math.ceil($(this).offset().top + $(this).height() / 2 - k / 2 - 2),
					left: l
				});
				$("#tooltip").find("> .body").dotdotdot({
					height: 94
				});
				$("#tooltip").css("height", $("#tooltip").find("> .body").height());
			}
		}
		else {
			$("#tooltip").hide();
			$("#tooltip").find("> .body").trigger("destroy.dot");
		}
	});
	$("body").on("click", ".bcplaylist", function (q) {
		q.preventDefault();
		var l = 736, w = 414, m = w + 52, t = "2280150732001", y = "", v = "@videoPlayer", o = "6px 0 17px 0", n = "AQ~~,AAAAuIVrAck~,krN9qiM0opZFgcTJ2x4pANu_kTPzjQpH", u = $(this).html(), k = "http://admin.brightcove.com/js/BrightcoveExperiences.js", r = location.protocol == "https:" ? "true" : "false";
		if ($(".homepage").length) {
			t = "2879403485001";
		}
		if (r == "true") {
			k = "https://sadmin.brightcove.com/js/BrightcoveExperiences.js";
		}
		if ($(this).data("config") != undefined) {
			var x = $(this).data("config");
			x = jQuery.parseJSON(x.replace(/'/g, '"'));
			if (typeof x.playlistID != "undefined") {
				v = "@playlistTabs";
				videoID = x.playlistID;
				n = "AQ~~,AAAAuIVrAck~,krN9qiM0opbQy0FyufcD6EUJJ_5heYej";
				l = 800;
				w = 370;
				m = 414;
				t = "1637139480001";
				o = "6px 0 -11px 0";
				if ($(".homepage").length) {
					t = "2879403486001";
				}
			}
			else {
				videoID = x.videoID || x.VideoID;
			}
			if (typeof x.title != "undefined") {
				u = x.title;
			}
			if (typeof x.playerID != "undefined") {
				t = x.playerID;
			}
			if (typeof x.playerKey != "undefined") {
				n = x.playerKey;
			}
			y = "myExperience" + videoID;
			if (typeof x.width != "undefined") {
				l = x.width;
			}
		}
		var p = "<h1>" + u + '</h1>          <object id="' + y + '" class="BrightcoveExperience">            <param name="autoStart" value="true">            <param name="bgcolor" value="none">            <param name="width" value="' + l + '">            <param name="height" value="' + w + '">            <param name="playerID" value="' + t + '">            <param name="playerKey" value="' + n + '">            <param name="isVid" value="true">            <param name="isUI" value="true">            <param name="' + v + '" value="' + videoID + '">            <param name="wmode" value="transparent">            <param name="secureConnections" value="' + r + '">            <param name="secureHTMLConnections" value="' + r + '">          </object>        ';
		$.fancybox({
			autoDimensions: false,
			autoScale: false,
			width: l,
			height: m,
			content: p,
			onStart: function () {
				$.fancybox.center();
			},
			onComplete: function () {
				$.fancybox.showActivity();
				$("#fancybox-content").find("h1").css({
					padding: "4px 0 10px 0",
					"font-size": 20
				});
				if (typeof brightcove !== "object") {
					$.getScript(k, function () {
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
	if ($("object.BrightcoveExperience").length) {
		if (typeof brightcove !== "object") {
			var a = "http://admin.brightcove.com/js/BrightcoveExperiences.js";
			if (location.protocol == "https:") {
				a = "https://sadmin.brightcove.com/js/BrightcoveExperiences.js";
			}
			else {
				$("object.BrightcoveExperience").find("> param[name=secureConnections]").val("false").end().find("> param[name=secureHTMLConnections]").val("false");
			}
			$.getScript(a, function () {
				brightcove.createExperiences();
			});
		}
		else {
			brightcove.createExperiences();
		}
	}
	$("body").on("click", ".ooplaylist", function (n) {
		n.preventDefault();
		var l = 642, o = "", k = $.parseJSON($(this).data("config").replace(/'/g, '"')), m = "";
		if (typeof k.title != "undefined") {
			o = k.title;
		}
		else {
			o = $(this).text();
		}
		if (typeof k.description == "undefined") {
			k.description = "";
		}
		o = encodeURIComponent(o);
		if (typeof k.playlist == "string") {
			l = 861;
			m = '<iframe id="oo-popup-content" src="/Hidden/ooyala-iframe.htm?playlist=' + k.playlist + '" width="' + l + '" height="407" frameborder="0" scrolling="no"></iframe>';
		}
		else {
			m = '<iframe id="oo-popup-content" src="/Hidden/ooyala-iframe.htm?ooyala=' + k.ooyala + "&autoplay=" + k.autoplay + "&3Play=" + k["3Play"] + "&title=" + o + "&desc=" + encodeURIComponent(k.description) + "&url=" + k.url + '" width="' + l + '" height="407" frameborder="0" scrolling="no"></iframe>';
		}
		$.fancybox({
			autoDimensions: false,
			autoScale: false,
			width: l,
			height: "auto",
			content: m,
			autoSize: true,
			iframe: {
				preload: false
			},
			onStart: function () {
				$.fancybox.center();
			}
		});
	});
	$("a").filter(".iframe").each(function () {
		var m = 0, l = 0;
		if ($(this).attr("dimensions") != undefined) {
			var k = $(this).attr("dimensions");
			k = k.replace(/'/g, '"');
			k = jQuery.parseJSON(k);
			m = k.width;
			l = k.height;
			$(this).fancybox({
				width: m,
				height: l,
				type: "iframe",
				onComplete: function () {
					setTimeout(function () {
						var n = $("#fancybox-content").find("iframe").contents().find("body").height();
						$("#fancybox-content").css("height", n + 10);
					}, 500);
				}
			});
		}
		else {
			$(this).fancybox({
				autoDimensions: true,
				type: "iframe"
			});
		}
	});
	var d = $("#products").find("> div");
	$("#atoz").on("click", "li.inactive a", function (k) {
		k.preventDefault();
	}).on("click", "ul li a", function (l) {
		if (!$(this).parent().hasClass("inactive")) {
			$(this).parent().parent().find("> .highlight").removeClass("highlight");
			$(this).parent().addClass("highlight");
			var k = $(this).attr("href").replace("#", "");
			$("#products").find("> div").each(function () {
				if ($(this).attr("id") == k) {
					$(this).removeClass("collapse");
				}
				else {
					$(this).addClass("collapse");
				}
			});
		}
	});
	$("#left-rail").on("click", ".expand", function (k) {
		k.preventDefault();
		var l = $(this).parent().siblings().filter(".hide");
		if ($(this).hasClass("expanded")) {
			$(this).removeClass("expanded").html($(this).data("expandname"));
			l.hide();
		}
		else {
			$(this).addClass("expanded").html($(this).data("collapsename"));
			l.show();
		}
	});
	$(".button").each(function () {
		if ($(this).html() == "Buy Online") {
			$(this).removeClass("blue").addClass("green");
		}
	});
	if ($("a.screenshot.loading").length) {
		$("a.screenshot.loading").each(displayScreenshotImage);
	}
	if ($("a.screenshot").length > 0) {
		$("a.screenshot").each(processScreenshot);
	}
	$("input, textarea").placeholder();
	$("body").on("click", ".has-trigger", function () {
		if ($("#" + $(this).data("trigger")).get(0).tagName == "A" && $("#" + $(this).data("trigger")).attr("href").charAt(0) != "#") {
			var k = $("#" + $(this).data("trigger"));
			window.open(k.attr("href"), k.attr("target"));
		}
		else {
			$("#" + $(this).data("trigger")).trigger("click");
		}
	});
	$(".event-banner-text").css("top", parseInt(($(".event-banner-text").parents(".banner").height() - $(".event-banner-text").height()) / 2)).animate({
		opacity: 1
	}, 500);
	$(".calls-to-action").find(".ellipsis").dotdotdot({
		ellipsis: "... ",
		wrap: "word",
		fallbackToLetter: true,
		after: null,
		watch: false,
		height: 75,
		tolerance: 0,
		callback: function (k, l) {
		},
		lastCharacter: {
			remove: [" ", ",", ";", ".", "!", "?"],
			noEllipsis: []
		}
	});
	if ($("#main-content").find("> div:eq(0)").hasClass("product")) {
		$("div.collapsible").filter(".collapse").removeClass("collapse");
	}
	if ($("#main-content").find("> div:eq(0)").hasClass("product velocity")) {
		$("dl.collapsible").removeClass("collapsible");
	}
	if ($(".product-content").length) {
		$(".product-content").find("> div > p:eq(1)").dotdotdot({
			height: 70
		});
	}
	if ($(".social-media-wrapper").length > 0) {
		socialMediaBarWidget();
	}
	if ($(".case-study-lp").length > 0) {
		var b = $(".blkqt-wrapper");
		b.next(".cs-info-cta").css("padding-top", 0);
	}
	if ($("#resources,#Resources").is(":visible")) {
		$("#video-list p a").dotdotdot({
			height: 65
		});
		$("#video-list").find("ul").each(function () {
			var m = 3, l = 3, k = "top";
			$(this).slidePagination({
				interval: l,
				column: m,
				force: false,
				show: k
			});
		});
	}
	$("#resources,#Resources").on("isVisible", function () {
		$("#video-list p a").dotdotdot({
			height: 65
		});
		$("#resources,#Resources").css("display", "none");
		if (!$(this).data("processed")) {
			$("#video-list").find("ul").each(function () {
				var m = 3, l = 3, k = "top";
				$(this).slidePagination({
					interval: l,
					column: m,
					force: false,
					show: k
				});
			});
		}
		$("#resources,#Resources").css("display", "block");
		$(this).data("processed", true);
	});
	$(".clientlist > a > img").hover(function () {
		var k = $(this).attr("src").replace(/-gray.png/, "-color.png");
		$(this).attr("src", k);
	}, function () {
		var k = $(this).attr("src").replace(/-color.png/, "-gray.png");
		$(this).attr("src", k);
	});
	$(".playhead").on("click", function () {
		if ($(this).is(":visible")) {
			$(this).next().trigger("click");
		}
	});
	var f = getQueryVariable("topic");
	if (f.length > -1) {
		$("select option").each(function () {
			if ($(this).attr("value") == f) {
				$(this).attr("selected", "selected");
			}
		});
	}
	$("#banner-slide-navigate").after('<ul class="slide-markers"></ul>').cycle({
		timeout: 1e4,
		speed: 600,
		fx: "scrollLeft",
		height: 395,
		width: 965,
		pager: ".slide-markers",
		random: $("#banner-slide-navigate").data("randomize") ? true : false,
		pagerAnchorBuilder: function (l, k) {
			return "<li><span></span></li>";
		}
	}).find(".lazy").each(function () {
		$(this).attr("src", $(this).data("original")).removeClass("lazy");
	});
	$("body").on("click", ".googleshare", function (k) {
		k.preventDefault();
		window.open("https://plus.google.com/share?url=" + encodeURIComponent(location.href), "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600");
		return false;
	});
	if (/\?param=/.test(location.search) && RootPath != "/") {
		$("aside.next-step").find(".action").each(function () {
			var m = $(this).find("a"), o = m.height(), n = parseInt(m.css("font-size")), k = m.css("white-space", "nowrap").height(), l = 5;
			m.css("white-space", "wrap");
			while (o > k) {
				if (!l) {
					break;
				}
				m.css("font-size", --n + "px");
				console.log(m.height());
				o = m.height();
				l--;
			}
		});
	}
});

$.getScript("/Static/Library/jQuery/jquery.lazyload.min.js", function () {
	$(document).ready(function () {
		$("img.lazy").lazyload();
	});
});

$(window).load(function () {
	$("div.column2").each(function () {
		var a = 0, b = $(this).find("> div");
		if ($(this).hasClass("type1")) {
			var d = 0, c = 0;
			b.each(function () {
				if (d < $(this).find("> h4").height()) {
					d = $(this).find("> h4").height(true);
				}
				if (c < $(this).find("> ul").outerHeight()) {
					c = $(this).find("> ul").outerHeight(true);
				}
			});
			b.find("> h4").css("height", d).end().find("> ul").css("height", c);
		}
		else {
			b.each(function () {
				if (a < $(this).height()) {
					a = $(this).outerHeight(true);
				}
			}).css("height", a);
		}
	});
});

function displayScreenshotImage() {
	var a = this;
	img = new Image();
	hash = $(this).attr("href");
	hash = hash.substr(hash.indexOf("#") + 1);
	var b = $("#" + hash).find("> div:eq(0)").find("img");
	if (b.data("src") != undefined || b.data("original") != undefined) {
		$(a).removeClass("loading").addClass("enlarge").append('<span class="icon enlarge">').find("> img").attr("src", $("#" + hash).find("> div:eq(0)").find("img").data("src") || $("#" + hash).find("> div:eq(0)").find("img").data("original"));
	}
	else {
		img.onload = function () {
			$(a).removeClass("loading").addClass("enlarge").append('<span class="icon enlarge">').find("> img").attr({
				src: this.src
			});
		};
		img.src = $("#" + hash).find("> div:eq(0)").find("img").attr("src");
	}
}

function processScreenshot() {
	var e = [], d = this, f = $(this).attr("href");
	if (f.substr(0, 1) != "#") {
		return false;
	}
	var c = $(f).find("> div").length - 1, a = content = "";
	var b = $(".velocity").length ? true : false;
	$(f).find("> div").each(function (j) {
		var h = $(this).find("div").html(), k = "", o = $(this).find("img").data("src") || $(this).find("img").data("original") || $(this).find("img").attr("src");
		h = h.replace("\n", "");
		if (j == 0) {
			k = "active";
			button = "";
			if (b) {
				var g = $(d), m = 5, l = true;
				while (!g.find(".button-container").length) {
					if (!m) {
						l = false;
						break;
					}
					g = g.parent();
					m--;
				}
				if (l) {
					button = '<div class="button-container right" style="margin: -5px 20px 0 0;">' + g.find(".button-container").html() + "</div>";
				}
			}
			var n = "";
			if ($(d).data("border") != undefined && !$(d).data("border")) {
				n = ' class="no-borders"';
			}
			content = '<div id="screenshot-container">' + button + "<h3>" + $(this).find("h3").html() + '</h3><div class="screenshot-image-container ' + $(this).find("img").attr("class") + '"><img alt="" src="' + o + '"' + n + '></div><div class="thumbnail"><a href="#prev"><span class="icon prev inactive"></span></a><div class="thumbnail-container"><ul>[slider]</ul></div><a href="#next"><span class="icon next"></span></a><div class="thumbnail-bullets"></div></div><div class="description">' + $(this).find("div").html() + "</div></div>";
		}
		a += '<li><a href="' + o + '" data-index="' + j + '" class="' + k + '"><img alt="' + $(this).find("h3").html() + '" src="/images/shared/blank.gif"></a></li>';
	});
	content = content.replace("[slider]", a);
	$(this).on("click", {
		content: content
	}, function (g) {
		g.preventDefault();
		$.fancybox([{
			content: g.data.content
		}], {
			transitionIn: "none",
			transitionOut: "none",
			padding: 0,
			margin: 10,
			"min-top": 95,
			modal: false,
			changeSpeed: 0,
			changeFade: 0,
			onStart: function () {
				window.scrollTo(window.scrollX, 0);
			},
			onComplete: function () {
				var n = $("#screenshot-container"), l = n.find(".thumbnail > div > ul"), o = n.find("> .thumbnail").width(), m = [0], k = n.find("> .thumbnail > div.thumbnail-container");
				n.find("img").each(function () {
					if ($(this).data("src") != undefined || $(this).data("original") != undefined) {
						$(this).attr("src", $(this).data("src") || $(this).data("original"));
					}
				});
				l.find("li").each(function () {
					$(this).find("img").attr("src", $(this).find("a").attr("href"));
				});
				k.css("width", 9999);
				l.css("width", l.width());
				k.css("width", o);
				n.on("click", ".prev, .next", function (t) {
					t.preventDefault();
					if ($(this).hasClass("inactive")) {
						return false;
					}
					var p = $(this).hasClass("prev") ? -1 : 1;
					var r = 0;
					for (var q in m) {
						q = parseInt(q);
						if (m[q] == parseInt(l.css("left"))) {
							r = q + p;
							l.animate({
								left: m[r]
							}, 500, function () {
								i(r);
							});
						}
					}
				});
				function j() {
					setTimeout(function () {
						$.fancybox.resize();
						$.fancybox.center();
					}, 200);
				}

				function i(u) {
					var v = m[u], t = l.find("li:last-child"), q = l.parent(), r = q.parent().find(".prev"), p = q.parent().find(".next");
					if (v == 0) {
						r.addClass("inactive");
					}
					else {
						r.removeClass("inactive");
					}
					if (t.position().left + t.outerWidth(true) + parseInt(l.css("left")) > q.width()) {
						p.removeClass("inactive");
					}
					else {
						p.addClass("inactive");
					}
					n.find(".thumbnail-bullets").find("a span").removeClass("blue-bullet");
					n.find(".thumbnail-bullets").find("a:eq(" + u + ") span").addClass("blue-bullet");
				}

				function h() {
					var p = left = 0;
					l.find("li").each(function (r) {
						var t = $(this).position().left;
						var q = t + $(this).outerWidth(true);
						if (q + p > o) {
							left = parseInt(-1 * t);
							m.push(left);
							p = left;
						}
					});
				}

				(function () {
					h();
					if (m.length == 1) {
						if (l.find("> li").length == 1) {
							n.find("> .thumbnail").hide();
						}
						else {
							n.find(".thumbnail-bullets").hide();
							n.find("> .thumbnail").find("> a").hide();
							n.find("> .thumbnail > div.thumbnail-container").css({
								width: "100%",
								margin: "0 auto"
							});
							l.css({
								display: "block",
								margin: "0 auto"
							});
						}
					}
					else {
						var p = "";
						o = 684;
						n.find("> .thumbnail > div.thumbnail-container").css("width", o);
						m = [0];
						h();
						for (var q = 0; q < m.length; q++) {
							p = q ? "" : " blue-bullet";
							n.find(".thumbnail-bullets").append('<a href="#page' + q + '"><span class="icon grey-bullet' + p + '"></span></a>');
						}
					}
				})();
				$("body").on("keydown", function (q) {
					q.preventDefault();
					var p = n.find(".thumbnail-container a.active").parent();
					if (q.keyCode == 39 && !p.is(":last-child")) {
						p = p.next();
					}
					else {
						if (q.keyCode == 37 && !p.is(":first-child")) {
							p = p.prev();
						}
						else {
							return false;
						}
					}
					p.find("a").trigger("click");
					if (p.position().left + p.outerWidth(true) + parseInt(l.css("left")) > o) {
						n.find(".next").trigger("click");
					}
					else {
						if (p.position().left + p.outerWidth(true) + parseInt(l.css("left")) <= 0) {
							n.find(".prev").trigger("click");
						}
					}
				});
				n.find(".thumbnail-container").on("click", "a", function (q) {
					q.preventDefault();
					n.find(".thumbnail-container").find("a").removeClass("active");
					$(this).addClass("active");
					var p = $(f).find("> div:eq(" + $(this).data("index") + ")"), t = p.find("img");
					n.find("h3").html(p.find("h3").html());
					var r = t.data("src") || t.data("original") || t.attr("src");
					n.find(".screenshot-image-container").find("img").attr("src", r);
					if (t.attr("class") == "" || t.attr("class") == undefined) {
						n.find(".screenshot-image-container").removeClass("no-resize");
					}
					else {
						if (t.attr("class") == "no-resize") {
							n.find(".screenshot-image-container").addClass("no-resize");
						}
					}
					n.find(".description").html(p.find("div").html());
				});
				n.find(".thumbnail-bullets").on("click", "a", function (q) {
					var p = n.find(".thumbnail-bullets").find("a").index(this);
					l.animate({
						left: m[p]
					}, 500, function () {
						i(p);
					});
				});
			},
			onCleanup: function () {
				$("body").off("keydown");
			}
		});
	});
}

function goAllSearch() {
	var a = "?q=";
	settings = {
		inputElement: "#searchterm"
	};
	document.location.href = "/search/results/" + a + encodeURIComponent($(settings.inputElement).val());
	return false;
}

function haveProductAtoZ() {
	$("#atoz").find("a").each(function () {
		if ($("#body-container").find($(this).attr("href")).find("li").size() == 0) {
			$(this).parent().addClass("inactive");
		}
		else {
			$(this).parent().removeClass("inactive");
		}
	});
	setTimeout(function () {
		$("#products").find("ul").each(function () {
			var e = -1, c = 0, a = 0, d = this, b = $(this).find("> li");
			if (b.length > 3) {
				b.each(function (g) {
					if (g % 3 == 0) {
						e++;
					}
					if ($(this).height() > a) {
						a = $(this).height();
					}
					if (g % 3 == 2) {
						var f = g + 1, h = g - 3;
						if (h > 0) {
							$(d).find("> li:lt(" + f + "):gt(" + h + ")").css("height", a);
						}
						else {
							$(d).find("> li:lt(" + f + ")").css("height", a);
						}
						c = e;
						a = 0;
					}
				});
			}
		});
	}, 200);
}

function escapeUnicode(b) {
	var a = /\\u([\d\w]{4})/gi;
	b = unescape(b.replace(a, function (d, c) {
		return String.fromCharCode(parseInt(c, 16));
	}));
	return b;
}

function loadOoyala(b) {
	if (typeof b == "undefined") {
		b = "body";
	}
	if ($(b).find(".ooyalaplayer").length) {
		if (typeof OO == "object") {
			a();
		}
		else {
			if (typeof window.OOCreate == "function") {
				c();
			}
			else {
				$("head").append('<link rel="stylesheet" href="/static/css/video-player.min.css?' + new Date().getTime() + '">');
				$.getScript("/static/js/video-player.min.js", function () {
					c();
				});
			}
		}
	}
	function c() {
		if ($("html").hasClass("ie9") || $("html").hasClass("ie8")) {
			$.getScript("//player.ooyala.com/v3/9eba220ad98c47cda9fdf6ba82ce607a?callback=receiveOoyalaP3Event", function () {
				a();
			});
		}
		else {
			$.getScript("//player.ooyala.com/v3/9eba220ad98c47cda9fdf6ba82ce607a?platform=html5&callback=receiveOoyalaP3Event", function () {
				a();
			});
		}
	}

	function a() {
		OO.ready(function () {
			$(b).find(".ooyalaplayer").each(function (f) {
				var i = $(this).attr("id"), g = $(this).data("videoid");
				if (i === undefined) {
					i = "op-" + getRandomString(8);
					$(this).attr("id", i);
				}
				if ($(this).data("on-demand")) {
					var h = $(this).parent(), e = $(this);
					if (h.hasClass("media-player-container")) {
						e = h;
					}
					e.on("click", function () {
						if (!$("#" + i).data("loaded")) {
							var k = Math.floor($(this).width() * 9 / 16), j = "";
							if (h && h.hasClass("media-player-container")) {
								$(this).css("height", k);
								j = h.find("> img").attr("src");
								h.find("> img").remove().end().find("> .img-overlay").remove();
							}
							window["ooyala_player_handle_" + f] = OO.Player.create(i, g, {
								onCreate: function (m) {
									OOCreate(m);
									var l = setInterval(function () {
										var n = $("#" + i).find(".oo_promo");
										if (n.length && n.css("backgroundImage") != "none") {
											if (j != "") {
												n.css("backgroundImage", 'url("' + j + '")');
											}
											clearInterval(l);
										}
									}, 10);
								},
								autoplay: true,
								wmode: "transparent"
							});
							$("#" + i).data("loaded", true);
							$(this).off("click");
						}
					});
				}
				else {
					if ($(this).is(":visible") && g !== undefined) {
						if (!$("#" + i).data("loaded")) {
							var d = Math.floor($(this).width() * 9 / 16);
							if ($(this).parent().hasClass("media-player-container")) {
								$(this).css("height", d);
								$(this).parent().css("height", d);
							}
							window["ooyala_player_handle_" + f] = OO.Player.create(i, g, {
								onCreate: OOCreate,
								autoplay: false,
								wmode: "transparent"
							});
							$("#" + i).data("loaded", true);
						}
					}
				}
			});
		});
	}
}

function socialMediaBarWidget() {
	if (window.XMLHttpRequest) {
		var a = new XMLHttpRequest();
		a.open("GET", "/hidden/bitly.asmx/get?URI=" + encodeURIComponent("http://software.dell.com" + location.pathname));
		a.onreadystatechange = function () {
			if (a.readyState == 4) {
				if (a.status == 200) {
					xml = $($.parseXML(a.responseText));
					var b = jQuery.parseJSON(xml.find("string").text());
					if (typeof b.data != "undefined") {
						burl = b.data.url;
					}
				}
			}
		};
		a.send();
	}
	$(".social-media-set").on("click", "a", function (h) {
		var f = $(this).parent(), g = f.attr("class"), c = location.href, d = document.title;
		if (f.hasClass("facebook")) {
			if (typeof s == "object") {
				s.events = "event13";
				s.eVar18 = "Facebook";
				s.linkTrackVars = "events,eVar18";
				s.linkTrackEvents = "event13";
				s.tl(true, "o", "Social Media");
			}
			h.preventDefault();
			window.open("http://www.facebook.com/sharer.php?u=" + encodeURIComponent(c) + "&t=" + encodeURIComponent(d), "facebook", "width=480,height=240,toolbar=0,status=0,resizable=1");
		}
		else {
			if (f.hasClass("twitter")) {
				if (typeof s == "object") {
					s.events = "event13";
					s.eVar18 = "Twitter";
					s.linkTrackVars = "events,eVar18";
					s.linkTrackEvents = "event13";
					s.tl(true, "o", "Social Media");
				}
				if (burl == "") {
					burl = c;
				}
				h.preventDefault();
				var b = "DellSoftware";
				if ($(this).data("via") != undefined) {
					b = $(this).data("via");
				}
				window.open("http://twitter.com/share?via=" + b + "&url=" + encodeURIComponent(burl) + "&text=" + encodeURIComponent(d) + ",%20&counturl=" + encodeURIComponent(c), "twitter", "width=480,height=380,toolbar=0,status=0,resizable=1");
			}
			else {
				if (f.hasClass("linkedin")) {
					if (typeof s == "object") {
						s.events = "event13";
						s.eVar18 = "LinkedIn";
						s.linkTrackVars = "events,eVar18";
						s.linkTrackEvents = "event13";
						s.tl(true, "o", "Social Media");
					}
					h.preventDefault();
					window.open("http://www.linkedin.com/shareArticle?mini=true&url=" + encodeURIComponent(c) + "&title=" + encodeURIComponent(d), "linkedin", "width=480,height=360,toolbar=0,status=0,resizable=1");
				}
				else {
					if (f.hasClass("googleshare")) {
						if (typeof s == "object") {
							s.events = "event13";
							s.eVar18 = "Google+";
							s.linkTrackVars = "events,eVar18";
							s.linkTrackEvents = "event13";
							s.tl(true, "o", "Social Media");
						}
					}
				}
			}
		}
	});
}

function replaceURL(b) {
	var a = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
	return b.replace(a, "<a href='$1'>$1</a>");
}

function getQueryVariable(a) {
	var c = window.location.search.substring(1);
	var d = c.split("&");
	for (var b = 0; b < d.length; b++) {
		var e = d[b].split("=");
		if (e[0] == a) {
			return e[1];
		}
	}
	return false;
}