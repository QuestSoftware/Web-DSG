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
	var mainNavContentElem = searchElem = userLinks = headerElem = null;

	$(document).ready(function () {
		headerElem = $('#ctl02_ctl01_header');
		mainNavContentElem = $('.custom-main-navigation');
		userLinks = headerElem.find('.user-links');

		var bodyElem = $('body');

		bodyElem.css('overflow', 'hidden');
		var w = $('html').width();
		bodyElem.css('overflow', '');

		processNavigation();

		//Bookmarks
		$('.bookmarks').html('<span class="glyphicon glyphicon-bookmark"></span>');

		if (w <= 570) {
			processMobile();
		}
		else {
			processDesktop();
		}
	});

	function processNavigation() {
		//Mobile
		$('body').append('<div id="mobile-nav-container"><div class="main-nav-section"><div class="shadow-overlay-left"></div></div></div></div>');

		mainNavContentElem.clone().appendTo('#mobile-nav-container .main-nav-section');

		//Desktop
		searchElem = headerElem.find('.search');
		mainNavContentElem.clone().insertBefore(searchElem);
	}

	function processMobile() {
		var handheldElem = $('.navigation-list').filter('.handheld');

		handheldElem.find('li:first').find('a').html('<i class="glyphicon glyphicon-menu-hamburger"></i>');

		handheldElem.find('.site').on('click', function (e) {
			e.preventDefault();

			if ($('body').hasClass('open')) {
				$('body').removeClass('open');

				setTimeout(function () {
					$(this).removeClass('active');
				}, 100);
			}
			else {
				$('body').addClass('open');
				//$(this).addClass('active');
			}
		});

		$('#footer').on('click', '.subLinks', function (e) {
			e.preventDefault();

			$(this).toggleClass('open');
		});
	}

	function processDesktop() {
		if (userLinks.find('.user').find('img').length) {
			if (userLinks.find('.user').find('img').attr('src').indexOf('anonymous.gif') > -1) {
				userLinks.find('.user').html('<i class="glyphicon glyphicon-user"><span class="badge is-logged-in"><i class="glyphicon glyphicon-ok"></i></span></i>');
			}
		}
		else {
			userLinks.find('.user').html('<i class="glyphicon glyphicon-user"><span class="badge is-logged-in"><i class="glyphicon glyphicon-ok"></i></span></i>');
		}

		userLinks.find('> ul').append('<li class="navigation-list-item"><a href="#" class="search-icon"><span class="glyphicon glyphicon-search"></span></a></li>');

		headerElem.find('.banner.site').find('>fieldset.search').wrap('<div id="masthead-search">');

		var mastheadSearch = $('#masthead-search');

		mastheadSearch.find('[type=search]').parent().append('<button class="btn"><i class="glyphicon glyphicon-search"></i></button>');

		headerElem.on('click', '.search-icon', function (e) {
			e.preventDefault();

			if (mastheadSearch.is(':visible')) {
				mastheadSearch.hide();
				$(this).removeClass('active');
			}
			else {
				mastheadSearch.show();
				$(this).addClass('active');
			}
		});

		mastheadSearch.on('click', '.btn', function (e) {
			location.href = '/community/search?q=' + mastheadSearch.find('[type=search]').val();
		});

		$(document).arrive('.popup-list.search', function () {
			$(this).parent().css({marginTop: 63});
		});
	}
})(jQuery);