var Arrive = function (window, $, undefined) {
	"use strict";
	if (!window.MutationObserver || typeof HTMLElement === "undefined") {
		return
	}
	var arriveUniqueId = 0;
	var utils = function () {
		var matches = HTMLElement.prototype.matches || HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.mozMatchesSelector || HTMLElement.prototype.msMatchesSelector;
		return {
			matchesSelector: function (elem, selector) {
				return elem instanceof HTMLElement && matches.call(elem, selector)
			}, addMethod: function (object, name, fn) {
				var old = object[name];
				object[name] = function () {
					if (fn.length == arguments.length)return fn.apply(this, arguments);
					else if (typeof old == "function")return old.apply(this, arguments)
				}
			}, callCallbacks: function (callbacksToBeCalled) {
				for (var i = 0, cb; cb = callbacksToBeCalled[i]; i++) {
					cb.callback.call(cb.elem)
				}
			}, checkChildNodesRecursively: function (nodes, registrationData, matchFunc, callbacksToBeCalled) {
				for (var i = 0, node; node = nodes[i]; i++) {
					if (matchFunc(node, registrationData, callbacksToBeCalled)) {
						callbacksToBeCalled.push({callback: registrationData.callback, elem: node})
					}
					if (node.childNodes.length > 0) {
						utils.checkChildNodesRecursively(node.childNodes, registrationData, matchFunc, callbacksToBeCalled)
					}
				}
			}, mergeArrays: function (firstArr, secondArr) {
				var options = {}, attrName;
				for (attrName in firstArr) {
					options[attrName] = firstArr[attrName]
				}
				for (attrName in secondArr) {
					options[attrName] = secondArr[attrName]
				}
				return options
			}, toElementsArray: function (elements) {
				if (typeof elements !== "undefined" && (typeof elements.length !== "number" || elements === window)) {
					elements = [elements]
				}
				return elements
			}
		}
	}();
	var EventsBucket = function () {
		var EventsBucket = function () {
			this._eventsBucket = [];
			this._beforeAdding = null;
			this._beforeRemoving = null
		};
		EventsBucket.prototype.addEvent = function (target, selector, options, callback) {
			var newEvent = {target: target, selector: selector, options: options, callback: callback, firedElems: []};
			if (this._beforeAdding) {
				this._beforeAdding(newEvent)
			}
			this._eventsBucket.push(newEvent);
			return newEvent
		};
		EventsBucket.prototype.removeEvent = function (compareFunction) {
			for (var i = this._eventsBucket.length - 1, registeredEvent; registeredEvent = this._eventsBucket[i]; i--) {
				if (compareFunction(registeredEvent)) {
					if (this._beforeRemoving) {
						this._beforeRemoving(registeredEvent)
					}
					this._eventsBucket.splice(i, 1)
				}
			}
		};
		EventsBucket.prototype.beforeAdding = function (beforeAdding) {
			this._beforeAdding = beforeAdding
		};
		EventsBucket.prototype.beforeRemoving = function (beforeRemoving) {
			this._beforeRemoving = beforeRemoving
		};
		return EventsBucket
	}();
	var MutationEvents = function (getObserverConfig, onMutation) {
		var eventsBucket = new EventsBucket, me = this;
		var defaultOptions = {fireOnAttributesModification: false};
		eventsBucket.beforeAdding(function (registrationData) {
			var target = registrationData.target, selector = registrationData.selector, callback = registrationData.callback, observer;
			if (target === window.document || target === window)target = document.getElementsByTagName("html")[0];
			observer = new MutationObserver(function (e) {
				onMutation.call(this, e, registrationData)
			});
			var config = getObserverConfig(registrationData.options);
			observer.observe(target, config);
			registrationData.observer = observer;
			registrationData.me = me
		});
		eventsBucket.beforeRemoving(function (eventData) {
			eventData.observer.disconnect()
		});
		this.bindEvent = function (selector, options, callback) {
			options = utils.mergeArrays(defaultOptions, options);
			var elements = utils.toElementsArray(this);
			for (var i = 0; i < elements.length; i++) {
				eventsBucket.addEvent(elements[i], selector, options, callback)
			}
		};
		this.unbindEvent = function () {
			var elements = utils.toElementsArray(this);
			eventsBucket.removeEvent(function (eventObj) {
				for (var i = 0; i < elements.length; i++) {
					if (this === undefined || eventObj.target === elements[i]) {
						return true
					}
				}
				return false
			})
		};
		this.unbindEventWithSelectorOrCallback = function (selector) {
			var elements = utils.toElementsArray(this), callback = selector, compareFunction;
			if (typeof selector === "function") {
				compareFunction = function (eventObj) {
					for (var i = 0; i < elements.length; i++) {
						if ((this === undefined || eventObj.target === elements[i]) && eventObj.callback === callback) {
							return true
						}
					}
					return false
				}
			}
			else {
				compareFunction = function (eventObj) {
					for (var i = 0; i < elements.length; i++) {
						if ((this === undefined || eventObj.target === elements[i]) && eventObj.selector === selector) {
							return true
						}
					}
					return false
				}
			}
			eventsBucket.removeEvent(compareFunction)
		};
		this.unbindEventWithSelectorAndCallback = function (selector, callback) {
			var elements = utils.toElementsArray(this);
			eventsBucket.removeEvent(function (eventObj) {
				for (var i = 0; i < elements.length; i++) {
					if ((this === undefined || eventObj.target === elements[i]) && eventObj.selector === selector && eventObj.callback === callback) {
						return true
					}
				}
				return false
			})
		};
		return this
	};
	var ArriveEvents = function () {
		var mutationEvents, me = this;
		var arriveDefaultOptions = {fireOnAttributesModification: false, onceOnly: false, existing: false};

		function getArriveObserverConfig(options) {
			var config = {attributes: false, childList: true, subtree: true};
			if (options.fireOnAttributesModification) {
				config.attributes = true
			}
			return config
		}

		function onArriveMutation(mutations, registrationData) {
			mutations.forEach(function (mutation) {
				var newNodes = mutation.addedNodes, targetNode = mutation.target, callbacksToBeCalled = [];
				if (newNodes !== null && newNodes.length > 0) {
					utils.checkChildNodesRecursively(newNodes, registrationData, nodeMatchFunc, callbacksToBeCalled)
				}
				else if (mutation.type === "attributes") {
					if (nodeMatchFunc(targetNode, registrationData, callbacksToBeCalled)) {
						callbacksToBeCalled.push({callback: registrationData.callback, elem: node})
					}
				}
				utils.callCallbacks(callbacksToBeCalled)
			})
		}

		function nodeMatchFunc(node, registrationData, callbacksToBeCalled) {
			if (utils.matchesSelector(node, registrationData.selector)) {
				if (node._id === undefined) {
					node._id = arriveUniqueId++
				}
				if (registrationData.firedElems.indexOf(node._id) == -1) {
					if (registrationData.options.onceOnly) {
						if (registrationData.firedElems.length === 0) {
							registrationData.me.unbindEventWithSelectorAndCallback.call(registrationData.target, registrationData.selector, registrationData.callback)
						}
						else {
							return
						}
					}
					registrationData.firedElems.push(node._id);
					callbacksToBeCalled.push({callback: registrationData.callback, elem: node})
				}
			}
		}

		arriveEvents = new MutationEvents(getArriveObserverConfig, onArriveMutation);
		var mutationBindEvent = arriveEvents.bindEvent;
		arriveEvents.bindEvent = function (selector, options, callback) {
			if (typeof callback === "undefined") {
				callback = options;
				options = arriveDefaultOptions
			}
			else {
				options = utils.mergeArrays(arriveDefaultOptions, options)
			}
			var elements = utils.toElementsArray(this);
			if (options.existing) {
				var existing = [];
				for (var i = 0; i < elements.length; i++) {
					var nodes = elements[i].querySelectorAll(selector);
					for (var j = 0; j < nodes.length; j++) {
						existing.push({callback: callback, elem: nodes[j]})
					}
				}
				if (options.onceOnly && existing.length) {
					return callback.call(existing[0].elem)
				}
				setTimeout(utils.callCallbacks, 1, existing)
			}
			mutationBindEvent.call(this, selector, options, callback)
		};
		return arriveEvents
	};
	var LeaveEvents = function () {
		var mutationEvents, me = this;
		var leaveDefaultOptions = {};

		function getLeaveObserverConfig(options) {
			var config = {childList: true, subtree: true};
			return config
		}

		function onLeaveMutation(mutations, registrationData) {
			mutations.forEach(function (mutation) {
				var removedNodes = mutation.removedNodes, targetNode = mutation.target, callbacksToBeCalled = [];
				if (removedNodes !== null && removedNodes.length > 0) {
					utils.checkChildNodesRecursively(removedNodes, registrationData, nodeMatchFunc, callbacksToBeCalled)
				}
				utils.callCallbacks(callbacksToBeCalled)
			})
		}

		function nodeMatchFunc(node, registrationData) {
			return utils.matchesSelector(node, registrationData.selector)
		}

		leaveEvents = new MutationEvents(getLeaveObserverConfig, onLeaveMutation);
		var mutationBindEvent = leaveEvents.bindEvent;
		leaveEvents.bindEvent = function (selector, options, callback) {
			if (typeof callback === "undefined") {
				callback = options;
				options = leaveDefaultOptions
			}
			else {
				options = utils.mergeArrays(leaveDefaultOptions, options)
			}
			mutationBindEvent.call(this, selector, options, callback)
		};
		return leaveEvents
	};
	var arriveEvents = new ArriveEvents, leaveEvents = new LeaveEvents;

	function exposeUnbindApi(eventObj, exposeTo, funcName) {
		utils.addMethod(exposeTo, funcName, eventObj.unbindEvent);
		utils.addMethod(exposeTo, funcName, eventObj.unbindEventWithSelectorOrCallback);
		utils.addMethod(exposeTo, funcName, eventObj.unbindEventWithSelectorAndCallback)
	}

	function exposeApi(exposeTo) {
		exposeTo.arrive = arriveEvents.bindEvent;
		exposeUnbindApi(arriveEvents, exposeTo, "unbindArrive");
		exposeTo.leave = leaveEvents.bindEvent;
		exposeUnbindApi(leaveEvents, exposeTo, "unbindLeave")
	}

	if ($) {
		exposeApi($.fn)
	}
	exposeApi(HTMLElement.prototype);
	exposeApi(NodeList.prototype);
	exposeApi(HTMLCollection.prototype);
	exposeApi(HTMLDocument.prototype);
	exposeApi(Window.prototype);
	var Arrive = {};
	exposeUnbindApi(arriveEvents, Arrive, "unbindAllArrive");
	exposeUnbindApi(leaveEvents, Arrive, "unbindAllLeave");
	return Arrive
}(window, typeof jQuery === "undefined" ? null : jQuery, undefined);

(function ($) {
	var bannerSite = mainNavContentElem = searchElem = userLinks = null, isNewsroom = /^\/community\/news/.test(location.pathname), pageWidth = 0;
	var pageType = pageTypeLabel = '', localizedContent = [];

	$(document).ready(function () {
		bannerSite = $('.banner').filter('.site');
		mainNavContentElem = $('.custom-main-navigation');
		userLinks = bannerSite.find('.user-links');

		pageWidth = getPageProperties();

		if (isNewsroom) {
			$('body').addClass('isNewsroom');
			$.getScript('/Static/Scripts/jquery.autocomplete.min.js', function () {
				$.getScript('/viewScripts/jquery.adobe.autocomplete.js', function () {
					initQuestSearch();
				});
			});
		}

		//Reroute logo link to https://www.quest.com
		bannerSite.find('.avatar').find('a').attr('href', '/');

		mobile.init();
		desktop.init();

		processHeaderFooter();

		if ($('.social-media-toolbar').length) {
			socialMediaToolbar();
		}
	});

	$(window).resize(function () {
		pageWidth = getPageProperties();
	});

	function getPageProperties() {
		//Workaround for Google Chrome. The vertical scrollbar is not included in determining the width of the device.
		$('body').css('overflow', 'hidden');
		var w = $('html').width();

		$('body').css('overflow', '');

		//Define pageType
		if (w >= 1200) {
			pageType = 3;
			pageTypeLabel = 'lg';
		}
		else if (w >= 992) {
			pageType = 2;
			pageTypeLabel = 'md';
		}
		else if (w >= 768) {
			pageType = 1;
			pageTypeLabel = 'sm';
		}
		else {
			pageType = 0;
			pageTypeLabel = 'xs';
		}

		return w;
	}

	function socialMediaToolbar() {
		var bitlyURL = location.href;

		if ($('.g-plusone').length) {
			$('.g-plusone').attr('data-href', bitlyURL);

			//Google+
			(function () {
				var po = document.createElement('script');
				po.type = 'text/javascript';
				po.async = true;
				po.src = '//apis.google.com/js/plusone.js';
				var s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(po, s);
			})();
		}

		//Retrieve bit.ly url.
		if (window.XMLHttpRequest && location.host == 'software.dell.com' && !/\/emailcl\//.test(location.pathname)) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "/hidden/bitly.asmx/get?URI=" + encodeURIComponent(url));
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						xml = $($.parseXML(xhr.responseText));
						var obj = jQuery.parseJSON(xml.find("string").text());

						if (typeof obj.data != 'undefined') {
							bitlyURL = obj.data.url;
						}
					}
				}
			};
			xhr.send();
		}

		$('.social-media-toolbar').on('click', 'a', function (e) {
			var parent = $(this).parent(), title = document.title;

			if (parent.hasClass('facebook')) {
				e.preventDefault();
				window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(bitlyURL) + '&t=' + encodeURIComponent(title), 'facebook', 'width=480,height=240,toolbar=0,status=0,resizable=1');
			}
			else if (parent.hasClass('twitter')) {
				e.preventDefault();
				window.open('http://twitter.com/share?via=DellSoftware&url=' + encodeURIComponent(bitlyURL) + '&text=' + encodeURIComponent(title) + ',%20&counturl=' + encodeURIComponent(url), 'twitter', 'width=480,height=380,toolbar=0,status=0,resizable=1');
			}
			else if (parent.hasClass('linkedin')) {
				e.preventDefault();
				window.open('http://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(bitlyURL) + '&title=' + encodeURIComponent(title), 'linkedin', 'width=480,height=360,toolbar=0,status=0,resizable=1');
			}
			else if (parent.hasClass('googleshare')) {
				e.preventDefault();
				window.open('https://plus.google.com/share?url=' + encodeURIComponent(location.href), '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
			}
		});
	}

	function initQuestSearch() {
		var searchFieldElem = $('[type=search]');

		searchFieldElem.off('keydown input focus blur click propertychange');

		//TODO: Figure out what this does.
		var b = {};
		(function () {
			var j, l = /\+/g, k = /([^&=]+)=?([^&]*)/g, n = function (o) {
				return decodeURIComponent(o.replace(l, " "))
			}, m = window.location.search.substring(1);
			while (j = k.exec(m)) {
				b[n(j[1])] = n(j[2])
			}
		})();

		// searchFieldElem.attr('autocomplete', 'off');
		searchFieldElem.on('keypress', function (e) {
			if (e.which == 13) {
				e.preventDefault();
				goSearch($(this).val());
			}
		});

		initAdobeSearch();

		function initAdobeSearch() {
			var config = {
				account: "sp10050c33",
				searchDomain: 'http://stage.sp10050ecd.guided.ss-omtrdc.net/',
				inputElement: "[type=search]",
				//inputFormElement: "#search-form",
				delay: 300,
				minLength: 2,
				maxResults: 10,
				browserAutocomplete: false,
				queryCaseSensitive: false,
				startsWith: false,
				searchOnSelect: true,
				submitOnSelect: true,
				highlightWords: false,
				highlightWordsBegin: false
			};

			searchFieldElem.on("autocompleteopen", function (event, ui) {
				$('.ui-autocomplete').css({
					width: $(this).outerWidth(true)
				})
			});

			searchFieldElem.on("autocompleteselect", function (event, ui) {
				goSearch(searchFieldElem.val());
			});

			searchFieldElem.AdobeAutocomplete(config);
		}

		function goSearch(searchterm) {
			if (isDoubleByte(searchterm)) {
				searchterm = encodeURIComponent(searchterm);
			}
			else {
				//searchterm = encodeURIComponent(Encoder.htmlEncode(searchterm));
				searchterm = encodeURIComponent(searchterm);
			}

			location.href = "/search/results/?q=" + searchterm;

			return false;
		}

		function isDoubleByte(str) {
			for (var i = 0, n = str.length; i < n; i++) {
				if (str.charCodeAt(i) > 255) {
					return true;
				}
			}
			return false;
		}
	}

	var mobile = function () {
		function init() {
			processNavigation();
			processNavigationFlyout();
		}

		function processNavigation() {
			$('body').find('> form')
				.append('<div id="mobile-nav-container"><div class="main-nav-section"></div></div></div>');

			mainNavContentElem
				.clone().removeClass('hidden')
				.appendTo('#mobile-nav-container .main-nav-section');
		}

		function processNavigationFlyout() {
			var handheldElem = bannerSite.find('.navigation-list').filter('.handheld');

			handheldElem.find('.site').on('click', function (e) {
				e.preventDefault();

				var that = this, bodyElem = $('body');

				if (bodyElem.hasClass('open')) {
					bodyElem.removeClass('open');

					setTimeout(function () {
						$(that).removeClass('active');
					});
				}
				else {
					bodyElem.addClass('open');
				}
			});

			if (isNewsroom) {
				handheldElem.find('li:last').remove();
			}

			$('#footer').on('click', '.subLinks', function (e) {
				e.preventDefault();

				$(this).toggleClass('open');
			});

			bannerSite.find('.container').find('[type=search]').attr('placeholder', 'What can we help you find?');

			$(document).arrive('.popup-list.notifications', repositionPopup);
			$(document).arrive('.popup-list.conversations', repositionPopup);
			$(document).arrive('.popup-list.bookmarks', repositionPopup);
			$(document).arrive('.popup-list.user', repositionPopup);

			function repositionPopup() {
				var that = this;

				if ($('html').width() < 768) {
					setTimeout(function () {
						$(that).parent().css({
							marginTop: 53
						});
					});
				}
			}
		}

		return {
			init: init
		}
	}();

	var desktop = function () {
		function init() {
			processNavigation();
			// replaceUserIcon();
			processSearchBar();
			processLoggedInUser();
		}

		function processNavigation() {
			mainNavContentElem.clone().removeClass('hidden').insertBefore(bannerSite.find('> .search'));

			//mainNavContentElem.parents('.content-fragment').hide();
		}

		function replaceUserIcon() {
			if (userLinks.find('.user').find('img').length) {
				if (userLinks.find('.user').find('img').attr('src').indexOf('anonymous.gif') > -1) {
					userLinks.find('.user').html('<span class="glyphicon glyphicon-user"><span class="badge is-logged-in"><i class="glyphicon glyphicon-ok"></i></span></span>');
				}
			}
			else {
				userLinks.find('.user').html('<i class="glyphicon glyphicon-user"><span class="badge is-logged-in"><i class="glyphicon glyphicon-ok"></i></span></i>');
			}
		}

		function processSearchBar() {
			var mastheadSearch = bannerSite.find('> fieldset.search');
			var searchInputElem = mastheadSearch.find('[type=search]');
			var searchIconElem = bannerSite.find('.search-icon');

			searchInputElem.on('input focus', function () {
				var that = this,
					width = $(this).outerWidth(true),
					timeout = null,
					popup = $('.popup-list').filter('.search');

				popup.hide();

				timeout = setInterval(function() {
					popup = $('.popup-list').filter('.search');

					popup.hide();

					if(popup.length) {
						clearTimeout(timeout);

						realignPopup.call(that, popup);
					}
				}, 10);

				function realignPopup(popup) {
					if (popup.length) {
						var popupParent = popup.parent();

						if ($(this).parents('.handheld').length) {
							popupParent.css({
								marginTop: 56,
								zIndex: 2000,
								width: pageWidth
							});

							popup.find('.content-list').css({
								width: pageWidth
							});
						}
						else {
							var parentLeft = parseInt(popupParent.css('left'));
							var inputLeft = $(this).offset().left;
							var marginLeft = parentLeft - inputLeft;

							if (parentLeft < inputLeft) {
								marginLeft = inputLeft - parentLeft;
							}

							popupParent.css({
								marginTop: $(this).offset().top + $(this).outerHeight(true) - parseInt(popupParent.css('top')),
								zIndex: 2000,
								width: width,
								marginLeft: marginLeft
							});

							popup.find('.content-list').css({
								width: width
							});
						}

						popupParent.css({
							border: '1px solid #ccc'
						});

						popup.show();
					}
				}
			});

			/*bannerSite.on('mousedown', 'a', function (e) {
				e.stopImmediatePropagation();

				var that = this;

				//If search icon is not clicked then proceed to find if search icon is active. If so, deactivate it.
				if (!$(this).hasClass('search-icon')) {
					if (searchIconElem.hasClass('active')) {
						searchIconElem.removeClass('active');
						mastheadSearch.hide();
					}
				}
			});*/

			//Also affects mobile
			bannerSite.on('click', '.search-icon', function (e) {
				e.preventDefault();

				if (mastheadSearch.is(':visible')) {
					mastheadSearch.hide();
					$(this).removeClass('active');
				}
				else {
					mastheadSearch.show();
					$(this).addClass('active');

					/*if (isNewsroom && !$(this).data('init')) {
					 $(this).data('init', true);

					 initQuestSearch();
					 }*/
				}
			});

			mastheadSearch.on('click', '.btn', function (e) {
				e.preventDefault();

				if (isNewsroom) {
					location.href = '/search/results/?q=' + searchInputElem.val();
				}
				else {
					location.href = '/community/search?q=' + searchInputElem.val();
				}
			});

			$('body').on('click', function(e) {
				if(!$(e.target).hasClass('glyphicon-search') && !$(e.target).parent().hasClass('search-icon') && !$(e.target).parents('.search').length) {
					console.log('body click', searchIconElem, searchIconElem.hasClass('active'));
					console.log(e);
					if(searchIconElem.hasClass('active')) {
						searchIconElem.removeClass('active');
						mastheadSearch.hide();
					}
				}
			});
		}

		function processLoggedInUser() {
			if ($('.logged-in').length) {
				$('.is-logged-in').show();
			}
		}

		return {
			init: init
		};
	}();

	function getLocalizedContent(tags) {
		//How to call: getLocalizedContent('RegWarningMessageEmailRequired').done(function(data) { console.log(data); });
		var returnValue = {}, newTags = [], deferred = $.Deferred();

		if (typeof tags == 'string') {
			if (localizedContent[tags]) {
				return localizedContent[tags];
			}
			else {
				newTags.push(tags);
			}
		}
		else {
			$.each(tags, function (i, tag) {
				if (localizedContent[tag]) {
					returnValue[tag] = localizedContent[tag];
				}
				else {
					newTags.push(tag);
				}
			});
		}

		if (newTags.length) {
			$.ajax({
				url: (((typeof RootPath == 'undefined' || RootPath == '/') ? '' : RootPath) + '/jsonreq/event/').replace('//', '/'),
				type: 'POST',
				dataType: 'JSON',
				data: {
					type: 'localized tags',
					tags: newTags.join(',')
				}
			}).done(function (data) {
				$.each(data.data, function (i, obj) {
					returnValue[obj.id] = obj.value;
					localizedContent[obj.id] = obj.value;
				});

				deferred.resolve(returnValue);
			});
		}
		else {
			deferred.resolve(returnValue);
		}

		return deferred;
	}

	function processHeaderFooter() {
		var headerNavElem = $('.main-nav-section');

		/*
		 Get navigation via ajax. Should only be executed on non home page.

		 Note: All non home page (responsive) will use the special tag V2LayoutHeaderAjax which has a data-ajax="true" attribute.
		 V2LayoutHeaderAjaxNav contains the navigation html content.
		 */
		(function () {
			var specialTag = 'V2LayoutHeaderAjaxNav';

			if (headerNavElem.data('ajax')) {
				//If session storage is available, populate navigation. Note: if navigation has been updated when nav is already stored, it'll be one page view behind.
				if (sessionStorage.nav) {
					headerNavElem.append(sessionStorage.nav);
				}

				//Get navigation and store
				getLocalizedContent(specialTag).done(function (data) {
					//Populate navigation only if sessionStorage.nav is not present because if it is present, it would have already been populated on line 32.
					if (!sessionStorage.nav) {
						headerNavElem.append(data[specialTag]);
					}

					//Store latest navigation.
					sessionStorage.nav = data[specialTag];
				});
			}
			else {
				//Get navigation and store
				getLocalizedContent(specialTag).done(function (data) {
					//Store latest navigation.
					sessionStorage.nav = data[specialTag];
				});
			}
		})();

		//Prevent anchor tag from firing when href is set to #
		headerNavElem.find('ul.tier2').on('click', 'a[href=#]', function (e) {
			if ($('html').width() >= 768) {
				e.preventDefault();
			}
		});

		//Siamak: changed #mobile-search-button to #mobile-search-button
		$('#search-button').on('click', function (e) {
			e.preventDefault();
			e.stopPropagation();


			$('#masthead-search').toggleClass('open');
			$('#search-button').toggleClass('open');

			$('#signin-container').removeClass('open');
			headerNavElem.find('.open').removeClass('open');

			$('html').removeClass('openNav');
		});

		//Prevent anchor tag from firing when href is set to # on mobile
		$('.footer-top-section').on('click', 'a[href=#]', function (e) {
			if ($('html').width() < 768) {
				e.preventDefault();
			}
		});

		$('body')
			.on('click', function (e) {
				//Siamak : Closing all navigation when click on body (Medium to Large desktop)
				if (pageType >= 3) {
					$('.tier1').find('.open').removeClass('open');
				}
				//Siamak : Closing top search when click on body
				if (($('.search-container').hasClass('open'))) {
					if ($(e.target).is('#masthead-search *, #masthead-search')) {
						return false;
					}
					else {
						$('.search-container').removeClass('open');
						$('.search-button').removeClass('open');
					}
				}

				//Close country popup when user clicks any where on the page.
				if (pageType >= 2) { //Tablet and larger devices
					$('#country-popup').css('display', '');
				}
			})
			//To open and close footer on Mobile
			.on('click', '.menu-links > .subLinks > span', function (e) {
				//Add functionality for when user uses touch on navigation/footer.

				if ($(this).parents('#footer').length && pageWidth >= 768) {
					return false;
				}

				e.preventDefault();
				e.stopPropagation();

				var elem = $(this).parent();

				//Remove all "open" class that is a sibling to the currently touched element.
				elem.siblings()
					.find('.open').removeClass('open').end()
					.removeClass('open');

				if (elem.hasClass('open')) {
					//Remove all "open" class inside of the currently touched element.
					elem.find('.open').removeClass('open').end().removeClass('open');
				}
				else {
					elem.addClass('open');

					//fix for sonicwall height
					$('body').trigger('subnav.visible');

					if (pageType == 0) { //Mobile
						//Animate background color to notify user that they have touched that element.
						//Require: jQuery Color v2.1.2 plugin
						elem.css({backgroundColor: '#fb4f14', color: '#ffffff'});
						$('html, body').animate({scrollTop: $(this).offset().top}, function () {
							elem.css('color', '#333333');
							elem.animate({backgroundColor: "#eee"}, 500, function () {
								elem.css('backgroundColor', '');
							});
						});
					}
				}
			})
			.on('click', '.navbar-toggle', function (e) {
				e.stopPropagation();

				//Hamburger - Mobile
				//Open & Close slide out navigation.
				if (pageType < 3) {
					e.preventDefault();
					$('html').toggleClass('openNav');
					$('.utility').find('> li').removeClass('open');
					$('#masthead-search').removeClass('open');
				}
			});

		//Siamak: Open tier 3 and 4 on click
		headerNavElem.on('click', '.tier2 > li.subLinks > a, .tier3 > li.subLinks > a', function (e) {

			if (pageType >= 3) {
				return false;
			}

			var isOpen = $(this).parent().siblings().hasClass('open');
			if (isOpen) {
				$(this).parent().siblings().removeClass('open');
			}

			bgAnimate(this);

			e.preventDefault();
			$(this).parent().toggleClass('open');
		});

		//Siamak: Open tier 2 on click
		//Change bg color on Mobile and Tablet
		headerNavElem.on('click', '.tier1 > .subLinks > a', function (e) {
			e.stopPropagation();
			$('#masthead-search').removeClass('open');
			$('#search-button').removeClass('open');
			$('#signin-container').removeClass('open');
			var isOpen = $(this).parent().hasClass('open');
			//Closing all other opened navigation
			headerNavElem.find('.open').removeClass('open');
			if (!isOpen) {
				//Adding .open to target LI
				$(this).parent().toggleClass('open');
			}
			//Siamak: Change tier 1 background when click
			if (pageType < 3) {
				bgAnimate(this);
			}
		});

		//Issue with iPad Chrome where links couldn't be clicked.
		//Reason was for SiteCatalyst injecting onclick attribute to all anchor tag.
		$('footer').on('click', 'a', function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			//added this condition to open links in a new tab when needed
			if ($(this).attr('target') != undefined && $(this).attr('target') == '_blank') {
				window.open($(this).attr('href'));
			}
			else {
				location.href = $(this).attr('href');
			}
		});

		function bgAnimate(target) {
			var elm = $(target);

			elm.css({backgroundColor: '#fb4f14', color: '#ffffff'});
			elm.animate({backgroundColor: '#eeeeee', color: '#333333'}, 500, function () {
				elm.css('backgroundColor', '');
			});
		}
	}
})(jQuery);