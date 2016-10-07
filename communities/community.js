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
	var bannerSite = mainNavContentElem = searchElem = userLinks = null, isNewsroom = /^\/community\/newsroom/.test(location.pathname);

	$(document).ready(function () {
		bannerSite = $('.banner').filter('.site');
		mainNavContentElem = $('.custom-main-navigation');
		userLinks = bannerSite.find('.user-links');

		if (isNewsroom) {
			$('body').addClass('isNewsroom');
		}

		/*var bodyElem = $('body');

		 bodyElem.css('overflow', 'hidden');
		 var w = $('html').width();
		 bodyElem.css('overflow', '');*/

		//Reroute logo link to https://www.quest.com
		bannerSite.find('.avatar').find('a').attr('href', '/');

		mobile.init();
		desktop.init();

		if ($('.social-media-toolbar').length) {
			socialMediaToolbar();
		}
	});

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

	var mobile = function () {
		function init() {
			processNavigation();
			processNavigationFlyout();
		}

		function processNavigation() {
			$('body').find('> form').append('<div id="mobile-nav-container"><div class="main-nav-section"></div></div></div>');

			mainNavContentElem.clone().removeClass('hidden').appendTo('#mobile-nav-container .main-nav-section');
		}

		function processNavigationFlyout() {
			var handheldElem = bannerSite.find('.navigation-list').filter('.handheld');

			//handheldElem.find('li:first').find('a').html('<i class="glyphicon glyphicon-menu-hamburger"></i>');

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
			replaceUserIcon();
			processSearchBar();
			processLoggedInUser();
		}

		function processNavigation() {
			mainNavContentElem.clone().removeClass('hidden').insertBefore(bannerSite.find('> .search'));

			mainNavContentElem.parents('.content-fragment').hide();
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
			bannerSite.find('>fieldset.search').wrap('<div id="masthead-search">');

			var mastheadSearch = $('#masthead-search');
			var searchInputElem = mastheadSearch.find('[type=search]');

			if (!bannerSite.find('> .user-links').length) {
				$('<div class="navigation-list user-links"><ul></ul></div>').insertAfter(mastheadSearch);
				bannerSite.find('> .user-links').find('> ul').append('<li class="navigation-list-item"><a href="#" class="search-icon"><span class="glyphicon glyphicon-search"></span></a></li>');
			}
			else {
				userLinks.find('> ul').append('<li class="navigation-list-item"><a href="#" class="search-icon"><span class="glyphicon glyphicon-search"></span></a></li>');
			}

			searchInputElem.attr('placeholder', 'What can we help you find?')
				.parent().append('<button class="btn"><i class="glyphicon glyphicon-search"></i></button>');

			searchInputElem.on('input', function () {
				var width = $(this).outerWidth(true);

				setTimeout(function () {
					realignPopup();

					setTimeout(function () {
						realignPopup();
					}, 250);
				}, 100);

				function realignPopup() {
					var popup = $('.popup-list').filter('.search');

					if (popup.length) {
						var popupParent = popup.parent();

						popupParent.css({
							marginTop: 56,
							zIndex: 2000,
							width: width,
							marginLeft: searchInputElem.offset().left - parseInt(popupParent.css('left')) - 1
						});

						popup.find('.content-list').css({
							width: width
						});
					}
				}
			});

			bannerSite.on('mousedown', 'a', function (e) {
				var that = this;

				//If search icon is not clicked then proceed to find if search icon is active. If so, deactivate it.
				if (!$(this).hasClass('search-icon')) {
					if (userLinks.find('.search-icon').hasClass('active')) {
						userLinks.find('.search-icon').removeClass('active');
						mastheadSearch.hide();
					}
				}
			});

			bannerSite.on('click', '.search-icon', function (e) {
				e.preventDefault();

				if (mastheadSearch.is(':visible')) {
					mastheadSearch.hide();
					$(this).removeClass('active');
				}
				else {
					mastheadSearch.show();
					$(this).addClass('active');

					if (isNewsroom && !$(this).data('init')) {
						$(this).data('init', true);

						$('[type=search]')
							.off('keydown input focus blur click propertychange')
							.on('keydown', function (e) {
								if (e.which === 13) {
									location.href = '/search/results/?q=' + searchInputElem.val();
								}
							});
					}
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
})(jQuery);