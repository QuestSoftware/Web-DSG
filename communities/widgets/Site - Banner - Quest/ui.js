(function ($, global, undef) {
	var openHeaderListContext = null;
	var activateMessage = 'telligent.evolution.widgets.siteBanner.activate';
	var deactivateMessage = 'telligent.evolution.widgets.siteBanner.deactivate';

	function supportsTouch() {
		return 'ontouchstart' in window;
	}

	var util = {
		throttle: function (fn, limit) {
			var lastRanAt, timeout;
			return function () {
				var scope = this,
					attemptAt = (new Date().getTime()),
					args = arguments;
				if (lastRanAt && (lastRanAt + (limit || 50)) > attemptAt) {
					global.clearTimeout(timeout);
					timeout = global.setTimeout(function () {
						lastRanAt = attemptAt;
						fn.apply(scope, args);
					}, (limit || 50));
				}
				else {
					lastRanAt = attemptAt;
					fn.apply(scope, args);
				}
			};
		}
	};

	// UI which can render endlessly-scrolling items in a popup.
	// Supports defining filters
	// Updating site-wide bubble counts
	var HeaderList = (function ($) {
		// private static members of a HeaderList
		var titleCount = /^\([0-9]+\)\s+/,
			totalTitleCount = 0, // title bar count which multiple instances can contribute to
			mask,
			defaults = {
				key: '',
				activationLink: null,
				activationInput: null,
				initialUnreadCount: 0,
				footerContent: null,
				showCount: true,
				endlessScroll: false,
				cssClass: '',
				template: '',
				loading: false,
				titleCount: false,
				titleCountClass: '',
				previousCount: 0,
				wrapper: null,
				unreadCountMessageSingular: 'You have {0} unread item',
				unreadCountMessagePlural: 'You have {0} unread items',
				onShowLoadingIndicator: function () {
					return true;
				},
				onLoad: function (pageIndex, shouldRefreshUnreadCount, filter, complete) {
					// load more items
					// for each item loaded, marks it as read
					// after items loaded and marks as read, gets new unread count and updates via updateUnreadCount via refreshUnreadCount
					// complete(contentToShow)
					complete('');
				},
				onRefreshUnreadCount: function (complete) {
					// get new unread count
					// update it via complete()
					complete(5);
				},
				onBuildFilter: null, // function(filtered) {
				// when defined, returns a DOM node to be inserted at the top which presentes a filtering UI
				// filtered(filter) can be called to raise a filter
				// }
				onShow: function (activator, complete) { // deferred display options
					// calls complete with display options to use when displaying
					// complete({
					//width: 280
					//maxHeight: 300
					//attachTo: activator
					//})
					complete({});
				},
				onHide: function () {

				},
				onSelect: function (item) {
					var url = $(item).data('contenturl');
					if (url) {
						window.location = url;
					}
				}
			},
			defaultShowSettings = {
				attachTo: null,
				width: 280,
				maxHeight: 300,
				cssClass: null
			};

		function updateTitle(context) {
			if (totalTitleCount <= 0) {
				context.handheldBannerLinksCount.hide();
				document.title = document.title.replace(titleCount, '');
			}
			else {
				context.handheldBannerLinksCount.html(totalTitleCount).show();
				document.title = '(' + totalTitleCount + ') ' + document.title.replace(titleCount, '');
			}
		}

		function blockWindowScrolling(context) {
			if ($('body').hasClass('stop-scrolling'))
				return;

			// block window scrolling not in the popup, or popup scrolling at its boundaries
			context.popupContentList.on('DOMMouseScroll mousewheel', function (e) {
				var e = e || window.event,
					originalEvent = e.originalEvent || e,
					delta = 0,
					scrollTop = context.popupContentList.get(0).scrollTop,
					scrollHeight = context.popupContentList.get(0).scrollHeight,
					height = context.popupContentList.height();

				if (originalEvent.wheelDelta)
					delta = originalEvent.wheelDelta / 120;
				if (originalEvent.detail)
					delta = -originalEvent.detail / 3;

				if ((scrollTop === (scrollHeight - height) && delta < 0) ||
					(scrollTop === 0 && delta > 0)) {
					if (e.preventDefault)
						e.preventDefault();
					e.returnValue = false;
				}
			});

			// block touch scrolling
			var lastY;
			$('body').addClass('stop-scrolling')
				.on('pointerstart.scrollfix', function (e) {
					lastY = e.pointers[0].pageY;
				})
				.on('pointerend.scrollfix', function (e) {
					lastY = null;
				})
				.on('pointermove.scrollfix', function (e) {
					if (!e.pointers || e.pointers.length == 0)
						return;

					var isDirectionDown = e.pointers[0].pageY - lastY > 0;

					var list = $(e.target).closest('.popup-list ul.content-list.content');
					if (!list || list.length == 0) {
						e.preventDefault();
						return false;
					}

					var ul = context.popupContentList.get(0),
						ulScrollTop = ul.scrollTop,
						ulScrollHeight = ul.scrollHeight,
						ulHeight = ul.offsetHeight;

					if (ulHeight == 0 || ulScrollHeight == 0)
						return;

					// list isn't scrollable, so block scrolling
					if (ulScrollHeight - ulHeight <= 0) {
						e.preventDefault()
						return false;
					}

					// list is scrollable and at the top
					if (ulScrollTop == 0 && isDirectionDown) {
						e.preventDefault();
						return false;
					}
					// list is scrollable and at end
					if ((ulScrollTop + ulHeight >= ulScrollHeight) && !isDirectionDown) {
						e.preventDefault();
						return false;
					}
				});

			if (!mask)
				mask = $('<div></div>')
					.addClass('mask')
					.appendTo('body')
					.css({opacity: 0.01, zIndex: 1})
					.evolutionTransform({opacity: 0.7}, {duration: 150})
					.on('click', function () {
						api.hideCurrent();
					});

			preventBodyBounce($('body').children().first());
		}

		function unblockWindowScrolling(context) {
			if (!$('body').hasClass('stop-scrolling'))
				return

			$('body').removeClass('stop-scrolling').off('.scrollfix');

			if (context.popupContentList)
				context.popupContentList.off('DOMMouseScroll mousewheel');

			if (mask) {
				setTimeout(function () {
					if (mask) {
						if (!$('body').hasClass('stop-scrolling')) {
							mask.evolutionTransform({opacity: 0.01}, {duration: 100});
							setTimeout(function () {
								if (mask)
									mask.remove();
								mask = null;
							}, 100);
						}
					}
				}, 100);
			}

			allowBodyBounce($('body').children().first());
		}

		function allowBodyBounce(selection) {
			selection.off('.scrollfix');
		}

		function preventBodyBounce(selection) {
			var originalScrollTop,
				elem = selection.get(0);
			selection.on('pointerstart.scrollfix', function (e) {
				originalScrollTop = elem.scrollTop;

				if (originalScrollTop <= 0)
					elem.scrollTop = 1;

				if (originalScrollTop + elem.offsetHeight >= elem.scrollHeight)
					elem.scrollTop = elem.scrollHeight - elem.offsetHeight - 1;

				originalScrollLeft = elem.scrollLeft;

				if (originalScrollLeft <= 0)
					elem.scrollLeft = 1;

				if (originalScrollLeft + elem.offsetWidth >= elem.scrollWidth)
					elem.scrollLeft = elem.scrollWidth - elem.offsetWidth - 1;
			});
		}

		function buildCountBubble(context) {
			/*var wrapper = context.activationLink.wrap('<span></span>').parent('span').css({
			 position: 'relative'
			 });*/
			var wrapper = context.activationLink.parent();
			var count = $('<a href="#" class="popup-list-count ' + context.titleCountClass + '"></a>');
			count.appendTo(wrapper).hide().on('click', function (e) {
				e.preventDefault();
				context.activationLink.click();
			});
			return count;
		}

		function buildUnreadCountMessage(context, count) {
			count = count || 0;
			if (count === 1) {
				return context.unreadCountMessageSingular.replace(/\{0\}/gi, count);
			}
			else {
				return context.unreadCountMessagePlural.replace(/\{0\}/gi, count);
			}
		}

		function showUnreadCount(context, count) {
			if (!context.showCount)
				return;
			var difference = count - context.previousCount;
			context.previousCount = count;
			if (context.titleCount) {
				totalTitleCount += difference;
				updateTitle(context);
			}
			var unreadCountMessage = buildUnreadCountMessage(context, count);
			if (count <= 0) {
				// remove bubble ui
				if (context.count)
					context.count.fadeOut(200);
				context.activationLink.attr('data-tip', unreadCountMessage).attr('title', unreadCountMessage);
			}
			else {
				// add bubble ui if not there
				context.count = context.count || buildCountBubble(context);
				// set the count and display it
				context.count
					.html((context.limitCount && context.limitCount < count) ? context.limitCount + "+" : count)
					.attr('title', unreadCountMessage)
					.fadeIn(200);
				context.activationLink.attr('data-tip', unreadCountMessage).attr('title', unreadCountMessage);
			}
		}

		function loadShowSettings(activator, context) {
			return $.Deferred(function (dfd) {
				context.onShow(activator, function (settings) {
					dfd.resolve($.extend({}, defaultShowSettings, settings || {}));
				});
			}).promise();
		}

		function loadContent(context, pageIndex, shouldRefreshUnreadCount) {
			context.loading = true;
			// call the injected loading method, and return a promise
			// which, when done, provides the content from the loading method
			return $.Deferred(function (dfd) {
				if (context.onShowLoadingIndicator()) {
					showLoading(context, (pageIndex > 0));
				}
				context.onLoad(pageIndex, shouldRefreshUnreadCount, context.filter || '', function (content) {
					if (content === null || content === undef) {
						dfd.reject();
					}
					else {
						if (context.onShowLoadingIndicator())
							hideLoading(context, (pageIndex > 0));
						dfd.resolve(content);
					}
				});
			}).promise();
		}

		function buildPopUp(context) {
			context.compiledTemplate = context.compiledTemplate || $.telligent.evolution.template.compile(context.template);

			context.popup = $(context.compiledTemplate(context));
			context.loadingIndicator = context.popup.find('.loading').hide();
			context.popupContentList = context.popup.find('.content-list');
			context.footer = context.popup.find('.content-list-footer');
			context.popup.glowPopUpPanel({
				cssClass: 'popup-list ' + context.cssClass,
				hideOnDocumentClick: false,
				hideOnResize: (supportsTouch() ? false : true),
				position: 'down',
				zIndex: 1000
			}).on('glowPopUpPanelHidden', function () {
				(context.activator).parent().removeClass('active');
				context.onHide();
				unblockWindowScrolling(context);
			});
			$(document).on('click', function () {
				context.popup.glowPopUpPanel('hide');
			});
			if (context.onBuildFilter !== null) {
				var filter = context.onBuildFilter(function (result) {
					if (!isOpenOrOpening(context))
						return;
					context.filter = result;
					context.currentPageIndex = 0;
					loadContent(context, context.currentPageIndex, true).then(function (content) {
						appendToPopup(context, content, true);
					});
				});
				if (filter) {
					$(filter).insertBefore(context.popupContentList);
				}
			}
		}

		function showLoading(context, append) {
			if (append) {
				context.loadingIndicator.show();
			}
			else {
				setTimeout(function () {
					if (!context.loading)
						return;
					if (openHeaderListContext) {
						hidePopup(openHeaderListContext);
					}
					openHeaderListContext = context;
					context.popup.glowPopUpPanel('show', (context.showSettings.attachTo || context.activator), true);
					context.loadingIndicator.show();
					(context.activator).parent().addClass('active');
					blockWindowScrolling(context);
				}, 20);
			}
		}

		function hideLoading(context, append) {
			context.loadingIndicator.hide().remove();
		}

		function showPopup(context, content, showSettings) {
			if (openHeaderListContext) {
				hidePopup(openHeaderListContext);
			}
			openHeaderListContext = context;
			context.popupContentList.html(content);
			context.popup.glowPopUpPanel('show', (showSettings.attachTo || context.activator), true);
			context.loading = false;
			context.hasMore = context.popupContentList.children('li:last').data('hasmore') ? true : false;
			(context.activator).parent().addClass('active');
			context.popupContent = context.popupContentList.closest('.popup-list');
			context.popupContainer = context.popupContent.parent();
			context.popupContainer.css({height: context.popupContent.outerHeight()});
			context.popupContent.find('.ui-viewhtml').on('rendered', function () {
				global.setTimeout(function () {
					context.popupContainer.css({height: context.popupContent.outerHeight()});
				}, 250);
			});
			blockWindowScrolling(context);
			context.currentItemIndex = null;
			$.telligent.evolution.messaging.publish(activateMessage, {key: context.key});
		}

		function hidePopup(context) {
			context.popup.glowPopUpPanel('hide');
			unblockWindowScrolling(context);
			$.telligent.evolution.messaging.publish(deactivateMessage, {key: context.key});
		}

		function appendToPopup(context, content, shouldReplace) {
			if (content === null)
				return;
			if (shouldReplace) {
				context.popupContentList.html(content);
			}
			else {
				context.popupContentList.append(content);
			}
			context.loading = false;
			context.hasMore = context.popupContentList.children('li:last').data('hasmore') ? true : false;
			context.popupContent = context.popupContentList.closest('.popup-list');
			context.popupContainer = context.popupContent.parent();
			context.popupContainer.css({height: context.popupContent.outerHeight()});
			context.popupContent.find('.ui-viewhtml').on('rendered', function () {
				global.setTimeout(function () {
					context.popupContainer.css({height: context.popupContent.outerHeight()});
				}, 250);
			});
		}

		function deactivate(context) {
			hidePopup(context);
		}

		function activate(activator, context) {
			context.currentPageIndex = 0;
			context.hasMore = true;
			activator.parent().addClass('active');
			loadShowSettings(activator, context).then(function (showSettings) {
				context.showSettings = showSettings;
				context.popupContentList.css({
					width: showSettings.width,
					maxHeight: showSettings.maxHeight
				});
				loadContent(context, context.currentPageIndex, true).then(function (content) {
					showPopup(context, content, showSettings);
					context.popupContainer.removeClass().addClass(showSettings.containerCssClass);
				});
			});
		}

		function handlePopoupOpenerClick(link, context) {
			if (context.popup.glowPopUpPanel('isOpening')) {
				return;
			}
			else if (context.popup.glowPopUpPanel('isShown')) {
				hidePopup(context);
				deactivate(context);
			}
			else {
				activate(link, context);
			}
		}

		function isOpenOrOpening(context) {
			return context.popup.glowPopUpPanel('isOpening') ||
				context.popup.glowPopUpPanel('isShown');
		}

		function move(context, direction, handler) {
			var availableItems = $(context.popupContentList.children('li.content-item'));
			if (availableItems.length == 0)
				return;

			availableItems.removeClass('selected');

			if (context.currentItemIndex === null) {
				context.currentItemIndex = 0;
			}
			else if (direction == 'down') {
				context.currentItemIndex++;
				if (context.currentItemIndex >= availableItems.length)
					context.currentItemIndex = 0;
			}
			else if (direction == 'up') {
				context.currentItemIndex--;
				if (context.currentItemIndex < 0)
					context.currentItemIndex = (availableItems.length - 1);
			}

			// get item to scroll to
			var selectedItem = $(availableItems[context.currentItemIndex]);
			if (!selectedItem)
				return;

			// scroll to it
			context.popupContentList.animate({
				scrollTop: (context.popupContentList.scrollTop() -
				context.popupContentList.offset().top +
				selectedItem.offset().top -
				selectedItem.height())
			}, 100);

			// highlight it
			selectedItem.addClass('selected');

			// inform calling code of selection
			handler(selectedItem);
		}

		function handleEvents(context) {
			context.activationLink.on('click', function (e) {
				e.preventDefault();
				handlePopoupOpenerClick(context.activationLink, context);
				return false;
			});
			// go ahead and immeidately handle, as handleEvents is only
			// first called from a deferred click
			// handlePopoupOpenerClick(context.activationLink, context);

			context.activationInput.on({
				focus: function (e) {
					e.preventDefault();

					var val = $.trim(context.activationInput.val());
					if (!isOpenOrOpening(context) && val.length >= 3) {
						activate($(e.target), context);
					}

					return false;
				},
				blur: function (e) {
				},
				'input propertychange': function (e) {
					e.preventDefault();

					if (e.type == 'propertychange' && e.originalEvent.propertyName != "value")
						return false;

					var val = $.trim(context.activationInput.val());
					if (!isOpenOrOpening(context) && val.length >= 3) {
						activate($(e.target), context);
					}
					else if (isOpenOrOpening(context) && val.length < 3) {
						deactivate(context);
					}

					return false;
				}


			});
			// handle endless scrolling if enabled
			if (context.endlessScroll) {
				context.popupContentList.on('scrollend', function () {
					if (!context.hasMore) {
						return false;
					}
					if (context.loading) {
						return false;
					}
					context.currentPageIndex++;
					loadContent(context, context.currentPageIndex, true).done(function (content) {
						appendToPopup(context, content);
					});
					return false;
				});
			}

			context.popupContentList.on('click', '.content-item', function (e) {
				e.preventDefault();
				context.onSelect(this);
			});
			context.popupContentList.on('click', 'a', function (e) {
				e.stopPropagation();
			});
		}

		function initContext(context) {
			context.activationLink = $(context.activationLink);
			context.activationInput = $(context.activationInput);
			context.activator = context.activationLink.length > 0 ? context.activationLink : context.activationInput;
		}

		function api(options) {
			// private instance members of a HeaderList
			var context = $.extend({}, defaults, options || {});
			initContext(context);
			var inited = false;

			function init() {
				if (inited)
					return;
				inited = true;
				buildPopUp(context);
				handleEvents(context);
			}

			// lazy-setup until clicked
			context.activationLink.one('click', function (e) {
				e.preventDefault();
				init();
				context.activationLink.click();
			});
			context.activationInput.one('focus', function (e) {
				init();
				context.activationInput.focus();
			});
			showUnreadCount(context, context.initialUnreadCount);

			// public instance members of a HeaderList
			return {
				refreshUnreadCount: function () {
					return context.onRefreshUnreadCount(function (newCount) {
						showUnreadCount(context, newCount);
						setTimeout(function () {
							if (context.popupContainer)
								context.popupContainer.css({height: context.popupContent.outerHeight()});
						}, 110)
					});
				},
				refreshContent: function () {
					// refreshing content only has an effect if already shown
					if (context.popup && context.popup.glowPopUpPanel('isShown')) {
						context.currentPageIndex = 0;
						loadContent(context, context.currentPageIndex, false).then(function (content) {
							appendToPopup(context, content, true);
						});
					}
				},
				content: function () {
					return context.popupContentList;
				},
				footer: function () {
					return context.footer;
				},
				activate: function () {
					init();
					activate($(context.activationInput || context.activationLink), context);
				},
				deactivate: function () {
					deactivate(context);
				},
				moveUp: function (handler) {
					move(context, 'up', handler);
				},
				moveDown: function (handler) {
					move(context, 'down', handler);
				}
			};
		}

		// public static members of a HeaderList
		api.hideCurrent = function () {
			if (openHeaderListContext) {
				hidePopup(openHeaderListContext);
			}
		};

		return api;

	})($);

	function initNotificationList(context) {
		var debouncedNotificationReadTimeout;
		var suppressNotificationsReadMessage = false;
		var suppressNotificationsReadMessageTimeout;
		var currentTotalCount = 0;

		function displayNotificationPreference(context, notificationItem) {
			// set the notification list size during preference-displaying so that it does not resize out of the bounds of the popup
			context.notificationList = context.notificationList || notificationItem.closest('ul');
			context.notificationList.css({
				height: context.notificationList.height()
			});
			if (context.preferenceUi) {
				hideNotificationPreference(context, context.preferenceUi);
				context.preferenceUi = null;
			}
			context.preferenceTemplate = context.preferenceTemplate || $.telligent.evolution.template.compile(context.notificationPreferenceTemplate);
			context.preferenceUi = $(context.preferenceTemplate({
				notificationTypeName: notificationItem.data('notificationtypename'),
				notificationTypeId: notificationItem.data('notificationtypeid')
			}))
				.hide()
				.appendTo(notificationItem);
			context.preferenceUi.css({
				position: 'absolute',
				top: 0,
				left: 0,
				zIndex: 2000
			});

			notificationItem.addClass('with-preference');
			notificationItem.data('originalHeight', notificationItem.outerHeight());
			notificationItem.animate({height: context.preferenceUi.height()}, 150);

			context.preferenceUi.fadeTo(150, 0.98);
		}

		function hideNotificationPreference(context, preferenceItem) {
			context.notificationList.css({height: 'auto'});
			if (preferenceItem) {
				var notificationItem = preferenceItem.parent();
				notificationItem.animate({height: notificationItem.data('originalHeight')}, 150);
				preferenceItem.fadeOut(150, function () {
					notificationItem.removeClass('with-preference');
					preferenceItem.remove();
				});
			}
		}

		function disableNotificationType(context, notificationTypeId) {
			return $.telligent.evolution.put({
				url: $.telligent.evolution.site.getBaseUrl() + 'api.ashx/v2/notificationpreference.json',
				data: {
					NotificationTypeId: notificationTypeId,
					IsEnabled: false
				},
				dataType: 'json'
			});
		}

		function initNotificationItemHandlers() {
			// mark individual notifications as read
			context.notificationsList.content().on('click', '.mark a', function (e) {
				e.preventDefault();
				var markLink = $(e.target);
				var notificationLineItem = $(this).closest('li');
				var notificationId = notificationLineItem.data('notificationid');
				markNotificationAsRead(notificationId).then(function () {
					markLink.hide();
					notificationLineItem.removeClass('unread');
					context.notificationsList.refreshUnreadCount()
				});
				return false;
			});

			// display preference change ui on 'x' click
			context.notificationsList.content().on('click', '.preference a', function (e) {
				e.preventDefault();
				displayNotificationPreference(context, $(this).closest('li'));
				return false;
			});

			// handle cancels of preference change when clicking 'cancel'
			context.notificationsList.content().on('click', '.notification-preference .cancel', function (e) {
				e.preventDefault();
				e.stopPropagation();
				hideNotificationPreference(context, $(this).closest('.notification-preference'));
				context.preferenceUi = null;
				return false;
			});

			// handle cancels of preference change by clicking anything other than 'turn off'
			context.notificationsList.content().on('click', '.notification-preference', function (e) {
				e.preventDefault();
				e.stopPropagation();
				hideNotificationPreference(context, $(this));
				context.preferenceUi = null;
				return false;
			});

			// handle confirmed preference changes
			context.notificationsList.content().on('click', '.notification-preference .confirm', function (e) {
				e.preventDefault();
				var notificationPreference = $(this).closest('.notification-preference'),
					notificationItem = notificationPreference.closest('li');
				disableNotificationType(context, $(this).data('notificationtypeid')).then(function () {
					notificationItem.fadeOut(200, function () {
						notificationPreference.remove();
						notificationItem.remove();
					});
					context.preferenceUi = null;
				});
				return false;
			});
		}

		function markNotificationAsRead(notificationId) {
			clearTimeout(suppressNotificationsReadMessageTimeout);
			suppressNotificationsReadMessage = true;
			var markNotificationPromise = $.telligent.evolution.put({
				url: $.telligent.evolution.site.getBaseUrl() + 'api.ashx/v2/notification/{NotificationId}.json',
				data: {
					NotificationId: notificationId,
					MarkAsRead: true
				}
			});
			markNotificationPromise.done(function () {
				suppressNotificationsReadMessageTimeout = setTimeout(function () {
					suppressNotificationsReadMessage = false;
				}, 5000);
			});
			return markNotificationPromise;
		}

		function markAllAsRead() {
			var unreadItems = context.notificationsList.content().find('> li.unread');
			// remove unread UI state immediately before waiting for server change
			unreadItems.removeClass('unread');
			clearTimeout(suppressNotificationsReadMessageTimeout);
			suppressNotificationsReadMessage = true;
			$.telligent.evolution.batch(function () {
				// loop through all of the currently visible unread notification items
				unreadItems.each(function () {
					// and mark the notificaiton as read
					markNotificationAsRead($(this).data('notificationid'));
				});
			}).then(function () {
				context.notificationsList.refreshContent();
				context.notificationsList.refreshUnreadCount()
				suppressNotificationsReadMessageTimeout = setTimeout(function () {
					suppressNotificationsReadMessage = false;
				}, 5000);
			});
		}

		context.notificationsList = HeaderList({
			key: 'notifications',
			footerContent: context.notificationListFooterContent,
			initialUnreadCount: context.notificationsUnread,
			activationLink: context.notificationsLink,
			endlessScroll: true,
			titleCount: true,
			limitCount: 99,
			cssClass: 'notifications',
			unreadCountMessageSingular: context.notificationssUnreadCountMessageSingular,
			unreadCountMessagePlural: context.notificationssUnreadCountMessagePlural,
			wrapper: context.banner,
			handheldBannerLinksCount: context.handheldBannerLinksCount,
			onLoad: function (pageIndex, shouldRefreshUnreadCount, filter, complete) {
				if (!context.isInited) {
					context.isInited = true;
					initNotificationItemHandlers();
				}
				if (context.notificationList) {
					context.notificationList.css({height: 'auto'});
				}
				$.telligent.evolution.get({
					url: context.notificationsUrl,
					data: {
						w_pageIndex: pageIndex,
						w_filter: (currentTotalCount > 0 ? (filter || 'all') : 'all')
					},
					success: function (response) {
						// show response
						complete(response);
						// update count
						if (shouldRefreshUnreadCount)
							context.notificationsList.refreshUnreadCount();
					}
				});
			},
			onRefreshUnreadCount: function (complete) {
				// find the mark as read link if not already found
				if (!context.notificationMarkAsReadLink && context.notificationsList) {
					var footer = context.notificationsList.footer();
					if (footer) {
						context.notificationMarkAsReadLink = footer.find('a.mark-read').on('click', function (e) {
							e.preventDefault();
							markAllAsRead();
							return false;
						});
					}
				}
				var query = {
					IsRead: false,
					PageSize: 1,
					PageIndex: 0
				};
				// exclude conversation notifications
				query['_Filters_' + context.conversationNotificationTypeId] = 'Exclude';
				return $.telligent.evolution.get({
					url: $.telligent.evolution.site.getBaseUrl() + 'api.ashx/v2/notifications.json',
					cache: false,
					data: query,
					success: function (response) {
						complete(response.TotalCount);
						if (context.notificationMarkAsReadLink) {
							currentTotalCount = response.TotalCount;
							if (response.TotalCount > 0) {
								context.notificationMarkAsReadLink.show();
								context.notificationsFilter.slideDown(100);
							}
							else {
								context.notificationMarkAsReadLink.hide();
								context.notificationsFilter.slideUp(100);
							}
						}
					},
					error: {}
				});
			},
			template: context.notificationsTemplate,
			onShow: function (activator, complete) {
				complete(buildShowSettings(context, activator, {}));

				modifyPopup();
			},
			onSelect: function (item) {
				item = $(item);
				var notificationId = item.data('notificationid'),
					contentUrl = item.data('contenturl');

				if (item.hasClass('unread')) {
					// mark as read
					markNotificationAsRead(notificationId).then(function () {
						// then navigate to it if different or just refresh the unread count
						if (window.location.href != contentUrl) {
							window.location.href = contentUrl;
						}
						else {
							context.notificationsList.refreshUnreadCount();
						}
					});
				}
				else {
					window.location.href = contentUrl;
				}
			},
			onBuildFilter: function (filtered) {
				var filterTemplate = $.telligent.evolution.template.compile(context.notificationsFilterTemplate);
				context.notificationsFilter = $(filterTemplate({}));
				context.notificationsFilter.find('a:first').addClass('selected');
				context.notificationsFilter.on('click', 'a', function (e) {
					e.preventDefault();
					e.stopPropagation();
					var target = $(e.target);
					target.closest('ul').find('a').removeClass('selected');
					target.addClass('selected');
					filtered(target.data('filter'));
				});

				return context.notificationsFilter.hide();
			}
		});

		// update the notification list's count when a new notification is received which isn't a conversation type
		$.telligent.evolution.messaging.subscribe('notification.raised', function (notification) {
			if (notification.typeId !== context.conversationNotificationTypeId) {
				context.notificationsList.refreshUnreadCount().then(function () {
					context.notificationsList.refreshContent();
				});
			}
		});

		// update the notification list's count when a new notification is received which isn't a conversation type
		$.telligent.evolution.messaging.subscribe('notification.read', function (notification) {
			if (notification.typeId !== context.conversationNotificationTypeId) {
				// wait until a gap in notification.read events, in case many have just been received
				clearTimeout(debouncedNotificationReadTimeout);
				debouncedNotificationReadTimeout = setTimeout(function () {
					if (suppressNotificationsReadMessage) {
						return;
					}
					context.notificationsList.refreshUnreadCount().then(function () {
						context.notificationsList.refreshContent();
					});
				}, 100);
			}
		});

		return context.notificationsList;
	}

	function initConversationList(context) {

		context.conversationsList = HeaderList({
			key: 'conversations',
			footerContent: context.conversationListFooterContent,
			initialUnreadCount: context.conversationsUnread,
			activationLink: context.conversationsLink,
			endlessScroll: true,
			titleCount: true,
			cssClass: 'conversations',
			unreadCountMessageSingular: context.conversationsUnreadCountMessageSingular,
			unreadCountMessagePlural: context.conversationsUnreadCountMessagePlural,
			wrapper: context.banner,
			handheldBannerLinksCount: context.handheldBannerLinksCount,
			onLoad: function (pageIndex, shouldRefreshUnreadCount, filter, complete) {
				$.telligent.evolution.get({
					url: context.conversationsUrl,
					data: {
						w_pageIndex: pageIndex
					},
					success: function (response) {
						// show response
						complete(response);
						// update count
						if (shouldRefreshUnreadCount)
							context.conversationsList.refreshUnreadCount();
					}
				});
			},
			onRefreshUnreadCount: function (complete) {
				return $.telligent.evolution.get({
					url: $.telligent.evolution.site.getBaseUrl() + 'api.ashx/v2/conversations.json',
					cache: false,
					data: {
						ReadStatus: 'Unread'
					},
					success: function (response) {
						complete(response.TotalCount);
					},
					error: {}
				});
			},
			template: context.conversationsTemplate,
			onShow: function (activator, complete) {
				complete(buildShowSettings(context, activator, {}));

				modifyPopup();
			}
		});

		// update the message list's count when a new notification is received which is a conversation type
		$.telligent.evolution.messaging.subscribe('notification.raised', function (notification) {
			if (notification.typeId === context.conversationNotificationTypeId) {
				context.conversationsList.refreshUnreadCount().then(function () {
					context.conversationsList.refreshContent();
				});
			}
		});

		// update the message list's count when a message was read on the conversation list
		$.telligent.evolution.messaging.subscribe('ui.messageread', function (notification) {
			context.conversationsList.refreshUnreadCount();
		});

		$.telligent.evolution.messaging.subscribe(context.messagePrefix + 'startconversation', function () {
			$.glowModal(context.conversationNewConversationModalUrl, {
				width: 550,
				height: 360
			});
		});

		return context.conversationsList;
	}

	function initBookmarksList(context) {
		// gets all selected content types from the content type filter
		function getCurrentContentTypes(bookmarkFilter) {
			var contentTypes = [];
			var selectedFilters = context.bookmarkFilter.find('a.selected').each(function () {
				contentTypes.push($(this).data('contenttypeids'));
			});
			return contentTypes.join(',');
		}

		context.bookmarksList = HeaderList({
			key: 'bookmarks',
			footerContent: context.bookmarksListFooterContent,
			activationLink: context.bookmarksLink,
			endlessScroll: true,
			initialUnreadCount: context.bookmarksIsBookmarked ? 1 : 0,
			titleCount: false,
			showCount: false,
			cssClass: 'bookmarks',
			wrapper: context.banner,
			handheldBannerLinksCount: context.handheldBannerLinksCount,
			unreadCountMessageSingular: context.bookmarksBookmarks,
			unreadCountMessagePlural: context.bookmarksBookmarks,
			onLoad: function (pageIndex, shouldRefreshUnreadCount, filter, complete) {
				var filteredContentTypeIds = filter || getCurrentContentTypes(context.bookmarkFilter);
				$.telligent.evolution.get({
					url: context.bookmarksUrl,
					data: {
						w_pageIndex: pageIndex,
						w_contentTypeIds: filteredContentTypeIds
					},
					success: function (response) {
						if (filteredContentTypeIds && filteredContentTypeIds.length > 0 && getCurrentContentTypes(context.bookmarkFilter) !== filteredContentTypeIds)
							return;
						// show response
						complete(response);
						// update count
						if (shouldRefreshUnreadCount)
							context.bookmarksList.refreshUnreadCount();
					}
				});
			},
			onRefreshUnreadCount: function (complete) {
				complete(context.bookmarksIsBookmarked ? 1 : 0);
			},
			onBuildFilter: function (filtered) {
				var filterTemplate = $.telligent.evolution.template.compile(context.bookmarksFilterTemplate),
					filterTemplateData = {
						contentTypeIds: '',
						applicationContentTypeIds: '',
						containerTypes: []
					};
				if (context.bookmarksContentTypes.length > 0)
					filterTemplateData.contentTypeIds = context.bookmarksContentTypes.substr(0, context.bookmarksContentTypes.length - 1)
				if (context.bookmarksApplicationContentTypes.length > 0)
					filterTemplateData.applicationContentTypeIds = context.bookmarksApplicationContentTypes.substr(0, context.bookmarksApplicationContentTypes.length - 1)
				if (context.bookmarksContainerContentTypes.length > 0) {
					var rawContainers = context.bookmarksContainerContentTypes.split(',');
					$.each(rawContainers, function (i, rawContainer) {
						if (rawContainer && rawContainer.length > 0) {
							var containerComponents = rawContainer.split(':', 2);
							if (containerComponents.length === 2) {
								filterTemplateData.containerTypes.push({
									name: containerComponents[1],
									id: containerComponents[0]
								});
							}
						}
					});
				}

				context.bookmarkFilter = $(filterTemplate(filterTemplateData));
				context.bookmarkFilter.find('a:first').addClass('selected');
				context.bookmarkFilter.on('click', 'a', function (e) {
					e.preventDefault();
					e.stopPropagation();
					var target = $(e.target);
					target.closest('ul').find('a').removeClass('selected');
					target.addClass('selected');
					filtered(getCurrentContentTypes(context.bookmarkFilter));
				});

				return context.bookmarkFilter;
			},
			template: context.bookmarksTemplate,
			onShow: function (activator, complete) {
				complete(buildShowSettings(context, activator, {}));

				modifyPopup();
			}
		});

		// refresh content when bookmarks are added/removed
		$.telligent.evolution.messaging.subscribe('ui.bookmark', function (data) {
			// if this represents a change in bookmark state of current content,
			// track that
			if (data.contentId == context.bookmarksCurrentContentId) {
				context.bookmarksIsBookmarked = data.bookmarked;
				context.bookmarksList.refreshUnreadCount();
				if (data.bookmarked) {
					context.bookmarksLink.addClass('bookmarked');
					$.telligent.evolution.notifications.show(context.bookmarkAdded, {
						id: 'bookmark-' + data.contentId
					});
				}
				else {
					context.bookmarksLink.removeClass('bookmarked');
					$.telligent.evolution.notifications.show(context.bookmarkRemoved, {
						id: 'bookmark-' + data.contentId
					});
				}
			}
			context.bookmarksList.refreshContent();
		});

		if (context.bookmarksIsBookmarked)
			context.bookmarksLink.addClass('bookmarked');

		return context.bookmarksList;
	}

	function initUserPopup(context) {
		var userContent = $($.telligent.evolution.template.compile(context.userContentTemplate)());

		context.userPopup = HeaderList({
			key: 'user',
			activationLink: context.userLink,
			endlessScroll: false,
			titleCount: false,
			cssClass: 'user',
			showCount: false,
			wrapper: context.banner,
			handheldBannerLinksCount: context.handheldBannerLinksCount,
			onLoad: function (pageIndex, shouldRefreshUnreadCount, filter, complete) {
				global.setTimeout(function () {
					complete(userContent)
				}, 10)
			},
			template: context.userPopupTemplate,
			onShow: function (activator, complete) {
				complete(buildShowSettings(context, activator, {}));

				modifyPopup();
			}
		});

		return context.userPopup;
	}

	function initSearchPopup(context) {
		// gets all selected content types from the content type filter
		function getCurrentSearchFilters(context) {
			var selectedPlace = context.searchFilter.find('a.place.selected');
			var selectedType = context.searchFilter.find('a.type.selected');
			var filters = {
				placeKey: selectedPlace.data('key') || 'anywhere',
				placeValue: selectedPlace.data('value') || 'anywhere',
				type: selectedType.data('key'),
				query: $.trim(context.searchInput.val()),
				searchParameter: selectedPlace.data('searchparam'),
				searchValue: selectedPlace.data('searchvalue')
			};

			var t = $.grep(context.searchFilters, function (e) {
				return e.key == selectedType.data('key');
			})[0];
			if (t && t.advancedSearchUrl) {
				filters.advancedSearchUrl = t.advancedSearchUrl;
			}

			return filters;
		}

		function loadSearchPlaces(context) {
			var places = [];

			if (context.searchPlaceApplicationId) {
				places.push({
					key: 'application',
					value: context.searchPlaceApplicationId,
					name: context.searchPlaceApplicationName,
					searchParameter: 'group',
					searchValue: context.searchPlaceGroupLocalId
				});
			}

			if (context.searchPlaceGroupId) {
				places.push({
					key: 'group',
					value: context.searchPlaceGroupId,
					name: context.searchPlaceGroupName,
					searchParameter: 'group',
					searchValue: context.searchPlaceGroupLocalId
				});
			}

			if (places.length > 0) {
				places.push({
					key: 'anywhere',
					value: 'anywhere',
					name: context.searchPlaceAnywhereName,
					searchParameter: '',
					searchValue: ''
				});
			}

			context.searchPlaces = places;
		}

		function loadSearchFilters(context, scope) {
			var filters = [];

			// build first party filters first
			filters.push({
				key: 'content',
				name: context.searchFilterContentName,
				searchParameter: '',
				searchValue: ''
			});

			if (scope.key == 'anywhere' || scope.key == 'group') {
				filters.push({
					key: 'groups',
					name: context.searchFilterGroupsName,
					searchParameter: '',
					searchValue: ''
				});
			}

			if (scope.key == 'anywhere' && context.searchShowPeople) {
				filters.push({
					key: 'users',
					name: context.searchFilterPeopleName,
					advancedSearchUrl: function (query) {
						var params = {q: query};
						return context.searchAdvancedUserUrl
							.replace(/\{0\}/gi, $.param(params))
							.replace(/\+/gi, '%20')
							.replace(/'/gi, '%27');
					}
				});
			}

			// add custom filters
			var i = 1;
			$.telligent.evolution.messaging.publish('search.registerFilters', {
				scope: scope,
				register: function (settings) {
					filters.push($.extend(
						{
							name: '',
							query: function (queryData, complete) {
							},
							advancedSearchUrl: function (queryText) {
								return null;
							},
							isDefault: false,
							searchParameter: '',
							searchValue: ''
						},
						settings,
						{
							key: 'custom' + (i++)
						}
					));
				}
			});

			context.searchFilters = filters;
		}

		function setDefaultAdvancedSearchUrl(context) {

			var filter = getCurrentSearchFilters(context);

			var query = $.trim(filter.query);
			if (query && query.length > 0) {
				var params = {q: query};

				if (filter.searchParameter && filter.searchValue) {
					params[filter.searchParameter] = filter.searchValue;
				}

				context.currentAdvancedSearchUrl = context.searchAdvancedUrl
					.replace(/\{0\}/gi, $.param(params))
					.replace(/\+/gi, '%20')
					.replace(/'/gi, '%27');
				$('#' + context.advancedSearchId).css('visibility', 'visible');
			}
			else {
				$('#' + context.advancedSearchId).css('visibility', 'hidden');
			}
		}

		// default to supporting inlineSearch though search.ready can override it
		context.supportsInlineSearch = true;

		setTimeout(function () {
			$.telligent.evolution.messaging.publish('search.ready', {
				init: function (settings) {
					var injectedSettings = $.extend({
						customResultRendering: false,
						initialQuery: ''
					}, settings);
					context.supportsInlineSearch = !injectedSettings.customResultRendering;
					if (injectedSettings.initialQuery !== null) {
						context.searchInput.val(injectedSettings.initialQuery);
					}
				}
			});
		}, 50);

		function buildSearchDataFromEffectiveQuery(pageIndex, effectiveSearchFilter) {
			return {
				w_pageIndex: pageIndex,
				w_query: effectiveSearchFilter.query,
				w_placeKey: effectiveSearchFilter.placeKey,
				w_placeValue: effectiveSearchFilter.placeValue,
				w_type: effectiveSearchFilter.type
			};
		}

		context.searchPopup = HeaderList({
			key: 'search',
			footerContent: context.searchFooterContent,
			activationInput: context.searchInput,
			endlessScroll: true,
			titleCount: false,
			showCount: false,
			cssClass: 'search',
			wrapper: context.banner,
			handheldBannerLinksCount: context.handheldBannerLinksCount,
			onShowLoadingIndicator: function () {
				return context.supportsInlineSearch;
			},
			onLoad: function (pageIndex, shouldRefreshUnreadCount, filter, complete) {
				if (!context.supportsInlineSearch)
					return;

				var effectiveSearchFilter = filter || getCurrentSearchFilters(context);

				// prevent empty searches
				if (!effectiveSearchFilter.query || effectiveSearchFilter.query.length == 0) {
					complete('');
					return;
				}

				var filter = $.grep(context.searchFilters, function (e) {
					return e.key == effectiveSearchFilter.type
				})[0];
				if (filter && filter.query) {
					filter.query({
						pageIndex: pageIndex,
						query: effectiveSearchFilter.query
					}, function (response) {
						complete(response);
						context.searchInput.addClass('with-results');

						if (!context.currentAdvancedSearchUrl) {
							$('#' + context.advancedSearchId).css('visibility', 'hidden');
						}
						else {
							$('#' + context.advancedSearchId).css('visibility', 'visible');
						}
					});
				}
				else {
					var queryData = buildSearchDataFromEffectiveQuery(pageIndex, effectiveSearchFilter)

					$.telligent.evolution.get({
						url: context.searchUrl,
						data: queryData,
						success: function (response) {
							// after results return, make sure the current search parameters
							// would still match the request that made this query
							// If not, ignore the results
							var currentEffectiveSearchFilter = getCurrentSearchFilters(context);
							if (!currentEffectiveSearchFilter || !currentEffectiveSearchFilter.query || currentEffectiveSearchFilter.query.length == 0) {
								complete(null);
								return;
							}
							var currentQueryData = buildSearchDataFromEffectiveQuery(pageIndex, currentEffectiveSearchFilter);
							if ($.telligent.evolution.url.serializeQuery(currentQueryData) !=
								$.telligent.evolution.url.serializeQuery(queryData)) {
								complete(null);
								return;
							}

							// show response
							complete(response);
							context.searchInput.addClass('with-results');
						}
					});
				}
			},
			onRefreshUnreadCount: function (complete) {
				complete(0);
			},
			onBuildFilter: function (filtered) {
				loadSearchPlaces(context);
				loadSearchFilters(context, context.searchPlaces.length > 0 ? context.searchPlaces[0] : {key: 'anywhere', value: 'anywhere'});

				var filterTemplate = $.telligent.evolution.template.compile(context.searchFilterTemplate),
					filterTemplateData = {
						contentTypeIds: '',
						applicationContentTypeIds: '',
						containerTypes: [],
						filters: context.searchFilters,
						places: context.searchPlaces
					};

				context.searchFilter = $('<div></div>').hide().appendTo('body');
				$(filterTemplate(filterTemplateData)).appendTo(context.searchFilter);

				var filter = $.grep(context.searchFilters, function (e) {
					return e.isDefault;
				})[0];
				if (filter) {
					context.searchFilter.find('a.type[data-key="' + filter.key + '"]').addClass('selected');
				}
				else {
					context.searchFilter.find('a.type:first').addClass('selected');
				}
				context.searchFilter.find('a.place:first').addClass('selected');
				context.searchFilter.on('click', 'a', function (e) {
					e.preventDefault();
					e.stopPropagation();
					var target = $(e.target);
					target.closest('ul').find('a').removeClass('selected');
					target.addClass('selected');

					if (target.hasClass('place')) {
						var key = target.data('key'), value = target.data('value');

						loadSearchFilters(context, {key: key, value: value});
						context.searchFilter.empty().append($(filterTemplate({
							contentTypeIds: '',
							applicationContentTypeIds: '',
							containerTypes: [],
							filters: context.searchFilters,
							places: context.searchPlaces
						})));

						var filter = $.grep(context.searchFilters, function (e) {
							return e.isDefault;
						})[0];
						if (filter) {
							context.searchFilter.find('a.type[data-key="' + filter.key + '"]').addClass('selected');
						}
						else {
							context.searchFilter.find('a.type:first').addClass('selected');
						}
						context.searchFilter.find('a.place[data-key="' + key + '"][data-value="' + value + '"]').addClass('selected');
					}

					filtered(getCurrentSearchFilters(context));

					var filter = getCurrentSearchFilters(context);
					if (filter && filter.advancedSearchUrl)
						context.currentAdvancedSearchUrl = filter.advancedSearchUrl(filter.query);
					else
						setDefaultAdvancedSearchUrl(context);
				});

				var lastQuery = null;
				context.searchInput.on({
					input: util.throttle(function (e) {
						var filter = getCurrentSearchFilters(context);
						if (filter.query == lastQuery) {
							e.preventDefault()
							return false;
						}
						lastQuery = filter.query;
						filtered(filter);
						$.telligent.evolution.messaging.publish('search.query', {
							value: $.trim(context.searchInput.val())
						});
					}, 500),
					click: function (e) {
						if (!supportsTouch())
							return false;
					}
				});
				context.searchInput.on({
					input: function (e) {
						var filter = getCurrentSearchFilters(context);
						if (filter && filter.advancedSearchUrl)
							context.currentAdvancedSearchUrl = filter.advancedSearchUrl(filter.query);
						else
							setDefaultAdvancedSearchUrl(context);
					}
				});

				return context.searchFilter.show();
			},
			template: context.searchTemplate,
			onShow: function (activator, complete) {
				var config = {
					attachTo: context.searchInput,
					width: context.searchInput.outerWidth() - 1,
					maxHeight: ($(global).height() * .7),
					cssClass: 'search-container'
				};

				if ($(window).width() <= 570) {
					config = {
						attachTo: context.searchFields,
						width: context.banner.width(),
						maxHeight: $(global).height() / 2,
						containerCssClass: ''
					};
				}

				//var settings = buildShowSettings(context, activator, config);

				// make search open 100% wide, and 70% of the height of the viewport
				complete(config);

				modifyPopup();
			},
			onHide: function () {
				context.searchInput.removeClass('with-results');
			}
		});

		// advanced search
		function redirectToAdvancedSearch() {
			if (context.supportsInlineSearch && !context.currentAdvancedSearchUrl)
				setDefaultAdvancedSearchUrl(context);
			if (context.currentAdvancedSearchUrl)
				window.location = context.currentAdvancedSearchUrl;
		}

		$.telligent.evolution.messaging.subscribe(context.messagePrefix + 'advancedsearch', redirectToAdvancedSearch);

		// if not touch, support enter to use advanced search
		$(context.searchInput).on('keydown', function (e) {
			if (e.which === 13) {
				if (!context.supportsInlineSearch || !$('body').hasClass('touch')) {
					e.preventDefault();
					e.stopPropagation();
					// if there's a selected item, redirect to it, otherwise redirect to advanced search
					var selectedItem = context.searchPopup.content().children('li.content-item.selected');
					if (selectedItem.length > 0) {
						selectedItem.click();
					}
					else {
						redirectToAdvancedSearch();
					}
					if ($('body').hasClass('touch')) {
						context.searchInput.blur();
					}
					return false;
				}
				else {
					context.searchInput.blur();
					e.preventDefault();
					e.stopImmediatePropagation();
					return false;
				}
			}
		});

		return context.searchPopup;
	}

	function modifyPopup() {
		setTimeout(function () {
			$('.popup-list').parent().css({
				overflow: 'visible'
			});
		}, 250);

		var utilitySectionWrapperElem = $('.utility-section-wrapper');

		//Hide search dropdown.
		if (utilitySectionWrapperElem.hasClass('open-search')) {
			utilitySectionWrapperElem.removeClass('open-search');
		}
	}

	// returns show settings to use for header popups
	function buildShowSettings(context, activator, settings) {
		if ($(window).width() <= 570) {
			return {
				//attachTo: context.banner,
				attachTo: context.utilityDropdown,
				width: context.banner.width(),
				maxHeight: $(global).height() / 2,
				containerCssClass: settings.containerCssClass
			};
		}
		else {
			settings.width = 350;

			return settings;
		}
	}

	function initSiteNavigation(context) {
		context.siteNavigationList = HeaderList({
			key: 'site',
			activationLink: context.siteNavigationLink,
			endlessScroll: true,
			titleCount: false,
			cssClass: ('site ' + (context.siteNavigationType === 'my_groups' ? 'group' : context.siteNavigationType) + ' ' + (context.siteNavigationType == 'custom' ? 'without-avatar' : '')),
			wrapper: context.banner,
			unreadCountMessagePlural: context.siteNavigationTitle,
			unreadCountMessageSingular: context.siteNavigationTitle,
			onLoad: function (pageIndex, shouldRefreshUnreadCount, filter, complete) {
				$.telligent.evolution.get({
					url: context.siteNavigationUrl,
					data: {
						w_siteNavigationType: context.siteNavigationType,
						w_pageIndex: pageIndex
					},
					success: function (response) {
						complete(response);
					}
				});
			},
			onRefreshUnreadCount: function (complete) {
				complete(0);
			},
			template: context.siteNavigationTemplate,
			onShow: function (activator, complete) {
				complete(buildShowSettings(context, activator, {}));
			}
		});

		if (context.siteNavigationCustomItems &&
			context.siteNavigationCustomItems.length > 0) {
			setTimeout(function () {
				$.telligent.evolution.messaging.publish('navigation.siteNavigationContent', {
					items: context.siteNavigationCustomItems
				});
			}, 100);
		}

		return context.siteNavigationList;
	}

	function initHandheldLinks(context) {
		var openHandheldContainer = null, activeLink, open = false;

		function registerHandheldLink(link, container, onShow, onHide) {
			link.on('click', function (e) {
				e.preventDefault();

				if (openHandheldContainer && openHandheldContainer == container) {
					if (activeLink) {
						activeLink.removeClass('active');
					}
					onHide();
					open = false;
					if (openHandheldContainer) {
						openHandheldContainer.hide();
					}
					openHandheldContainer = null;
				}
				else if (openHandheldContainer) {
					if (activeLink) {
						activeLink.removeClass('active');
					}
					onHide();
					open = false;
					if (openHandheldContainer) {
						openHandheldContainer.hide();
					}
					openHandheldContainer = container;
				}
				else {
					openHandheldContainer = container;
				}

				if (openHandheldContainer !== null) {
					openHandheldContainer.show();
					onShow();
					open = true;
					if (activeLink) {
						activeLink.removeClass('active');
					}
					activeLink = link.parents('li').addClass('active');
				}
				else {
					onShow();
					open = false;
					if (activeLink) {
						activeLink.removeClass('active');
					}

					if (activeLink.get(0) === link.parents('li').get(0)) {
						activeLink = link.parents('li');
					}
					else {
						activeLink = link.parents('li').addClass('active');
					}
				}
			});
		}

		registerHandheldLink(context.handheldBannerLinksLink, context.handheldBannerLinks,
			function () {
				context.bannerLinks.contents().appendTo(context.handheldBannerLinks.find('> ul'));
			},
			function () {
				context.handheldBannerLinks.find('> ul').contents().appendTo(context.bannerLinks);
			});

		registerHandheldLink(jQuery('.utility.mobile .search-button a'), context.searchFields,
			function () {
			},
			function () {
			}
		);
	}

	var popupList = [];
	var popups = {};

	function registerPopup(popup, key) {
		var index = popupList.length;
		popupList.push(popup);
		popups[key] = {
			popup: popup,
			index: index
		};
	}

	function initKeyboardEvents(context) {
		var isActive = false;
		var currentIndex = null;

		$.telligent.evolution.messaging.subscribe(activateMessage, function (data) {
			isActive = true;
			currentIndex = popups[data.key].index;
			if (data.key == 'search') {
				setTimeout(function () {
					context.searchInput.focus();
				}, 10)
			}
		});
		$.telligent.evolution.messaging.subscribe(deactivateMessage, function (data) {
			if (data.key != 'search') {
				isActive = false;
			}
			clearInterval(testInterval);
		});

		var body = document.body,
			doc = document,
			win = window,
			currentSelection = null;

		var keys = {
			enter: 13,
			esc: 27,

			slash: 191,

			up: 38,
			p: 80,
			k: 75,

			down: 40,
			n: 78,
			j: 74,

			left: 37,
			right: 39,
			h: 72,
			l: 76
		};

		function blockKey(e) {
			e.preventDefault();
			e.stopPropagation();
		}

		function getCaret(el) {
			if (el.selectionStart) {
				return el.selectionStart;
			}
			else if (document.selection) {
				el.focus();
				var r = document.selection.createRange();
				if (r == null) {
					return 0;
				}
				var re = el.createTextRange(),
					rc = re.duplicate();
				re.moveToBookmark(r.getBookmark());
				rc.setEndPoint('EndToStart', re);
				return rc.text.length;
			}
			return 0;
		}

		$('body').on('click', function (e) {
			var isBannerTarget = $(e.target).closest(context.wrapper + ', .popup-list').length > 0;
			if (!isBannerTarget) {
				var currentPopup = popupList[currentIndex];
				isActive = false;
				if (currentPopup)
					currentPopup.deactivate();
				context.searchInput.blur();
				currentSelection = null;
			}
		});

		$(document).on('keydown', function (e) {
			var isWindowEvent = (e.target == body || e.target == doc || e.target == win);
			var isBannerEvent = $(e.target).closest(context.wrapper + ', .popup-list').length > 0;

			//var isBannerTarget = e.target
			// slash opens search
			if (!isActive && isWindowEvent && e.which == keys.slash) {
				blockKey(e);
				context.searchInput.focus();
				isActive = true;
				currentIndex = popups['search'].index;
			}
			else if (isActive) {
				var currentPopup = popupList[currentIndex];

				if (!isBannerEvent && !isWindowEvent) {
					isActive = false;
					if (currentPopup)
						currentPopup.deactivate();
					context.searchInput.blur();
					currentSelection = null;
					return true;
				}

				if (!currentPopup) {
					return true;
				}

				var isCursorInStart = context.searchInput.is(":not(:focus)") || getCaret(context.searchInput[0]) == 0;
				var isCursorInEnd = context.searchInput.is(":not(:focus)") || getCaret(context.searchInput[0]) == context.searchInput.val().length;

				// hide on esc or slash in non input
				if (e.which == keys.esc || (e.which == keys.slash && isWindowEvent)) {
					blockKey(e);
					currentPopup.deactivate();
					context.searchInput.blur();
					isActive = false;
					currentSelection = null;
				}

				// left/right to change current open popup
				else if ((e.which == keys.left && isCursorInStart && !(e.ctrlKey || e.metaKey)) ||
					(e.which == keys.h && currentPopup !== context.searchPopup)) {
					blockKey(e);
					currentPopup.deactivate();
					context.searchInput.blur();
					currentIndex--;
					if (currentIndex < 0) {
						currentIndex = popupList.length - 1;
					}

					currentPopup = popupList[currentIndex];
					currentPopup.activate();
				}
				else if ((e.which == keys.right && isCursorInEnd && !(e.ctrlKey || e.metaKey)) ||
					(e.which == keys.l && currentPopup !== context.searchPopup)) {
					blockKey(e);
					currentPopup.deactivate();
					context.searchInput.blur();
					currentIndex++;
					if (currentIndex >= popupList.length) {
						currentIndex = 0;
					}

					currentPopup = popupList[currentIndex];
					currentPopup.activate();
				}

				// up
				else if (e.which == keys.up ||
					((e.which == keys.p || e.which == keys.k) && (currentPopup !== context.searchPopup))) {
					blockKey(e);
					currentPopup.moveUp(function (item) {
						currentSelection = item;
					});
				}

				// down
				else if (e.which == keys.down ||
					((e.which == keys.n || e.which == keys.j) && (currentPopup !== context.searchPopup))) {
					blockKey(e);
					currentPopup.moveDown(function (item) {
						currentSelection = item;
					});
				}

				// select
				else if (e.which == keys.enter) {
					blockKey(e);
					if (currentSelection) {
						currentSelection.click();
					}
				}

			}
		});
	}

	var api = {
		register: function (context) {
			if (context.siteNavigationType == "quest") {
				getQuestNavigation();
			}
			else if (context.siteNavigationLink && context.siteNavigationLink.length > 0) {
				registerPopup(initSiteNavigation(context), 'site');
			}

			if (context.useQuestFooter == 'True' && !$('#footer').length) {
				getQuestFooter();
			}

			if (context.searchInput.length > 0) {
				if (context.searchType == "Default") {
					registerPopup(initSearchPopup(context), 'search');
					postProcessDefaultSearch(context.searchFields, context.searchInput);
				}
				else {
					initQuestSearch(context.searchFields, context.searchInput);
				}
			}

			if (context.notificationsLink.length > 0)
				registerPopup(initNotificationList(context), 'notifications');

			if (context.conversationsLink.length > 0)
				registerPopup(initConversationList(context), 'conversations');

			if (context.bookmarksLink.length > 0)
				registerPopup(initBookmarksList(context), 'bookmarks');

			if (context.userLink.length > 0)
				registerPopup(initUserPopup(context), 'user');

			initHandheldLinks(context);

			initKeyboardEvents(context);
		}
	};

	$.telligent = $.telligent || {};
	$.telligent.evolution = $.telligent.evolution || {};
	$.telligent.evolution.widgets = $.telligent.evolution.widgets || {};
	$.telligent.evolution.widgets.siteBanner = api;

	//Custom

	var localizedContent = [], pageType = '', pageWidth = 0;
	var RootPath = RootPath || '';

	$(document).ready(function () {
		pageWidth = getPageProperties();

		processHeaderFooter();

		$('body').on('click', function (e) {
			if (!$(e.target).parents('header').length) {
				setTimeout(function () {
					$('.utility').find('.active').find('> a').trigger('click');
				}, 100);
			}
		});
	});

	$(window).resize(function () {
		pageWidth = getPageProperties();
	});

	function postProcessDefaultSearch(searchContainer, searchInputElem) {
		searchContainer.on('click', '.btn', function (e) {
			e.preventDefault();
			location.href = '/community/search?q=' + searchInputElem.val();
		});

		postProcessAllSearch(searchContainer);
	}

	function initQuestSearch(searchContainer, searchFieldElem) {
		$.getScript('/Static/Scripts/jquery.autocomplete.min.js', function () {
			$.getScript('/viewScripts/jquery.adobe.autocomplete.js', function () {
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

				searchContainer.on('click', '.btn', function (e) {
					e.preventDefault();

					location.href = '/search/results/?q=' + searchFieldElem.val();
				});

				initAdobeSearch();
				postProcessAllSearch(searchContainer);
			});
		});

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

	function postProcessAllSearch(searchContainer) {
		//Utility section. Desktop
		$('body').on('click', '.utility.desktop .search-button > a', function () {
			$(this).parents('.utility-section-wrapper').toggleClass('open-search');
		});
	}

	/*
	 Get navigation via ajax. Should only be executed on non home page.

	 Note: All non home page (responsive) will use the special tag V2LayoutHeaderAjax which has a data-ajax="true" attribute.
	 V2LayoutHeaderAjaxNav contains the navigation html content.
	 */
	function getQuestNavigation() {
		var headerNavElem = $('.main-nav-section'),
			specialTag = ['V2LayoutHeaderAjaxNav'],
			sessionNavName = 'nav-' + RootPath.replace(/\//g, '');

		if (headerNavElem.data('ajax')) {
			//If session storage is available, populate navigation. Note: if navigation has been updated when nav is already stored, it'll be one page view behind.
			if (sessionStorage[sessionNavName]) {
				headerNavElem.append(sessionStorage[sessionNavName]);
				bindNavigationEvents();
			}

			//Get navigation and store
			getLocalizedContent(specialTag).done(function (data) {
				//Populate navigation only if sessionStorage.nav is not present because if it is present, it would have already been populated on line 32.
				if (!sessionStorage[sessionNavName]) {
					headerNavElem.append(data[specialTag[0]]);
					bindNavigationEvents();
				}

				//Store latest navigation.
				sessionStorage.setItem(sessionNavName, data[specialTag[0]]);
			});
		}
		else {
			//Get navigation and store
			getLocalizedContent(specialTag).done(function (data) {
				//Store latest navigation.
				sessionStorage.setItem(sessionNavName, data[specialTag[0]]);
			});
		}

		function bindNavigationEvents() {
			//Prevent anchor tag from firing when href is set to #
			headerNavElem.find('.tier2').on('click', 'a[href=#]', function (e) {
				if (pageType == 3) {
					e.preventDefault();
				}
			});

			//Mobile only.
			headerNavElem.on('click', '.tier2 > li.subLinks > a, .tier3 > li.subLinks > a', function (e) {
				if (pageType == 3) {
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
			headerNavElem.find('.tier1').on('click', '> .subLinks > a', function (e) {
				e.preventDefault();
				e.stopPropagation();

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

			$('body').on('click', function (e) {
				//Closing all navigation when click on body (Large desktop)
				if (pageType == 3) {
					$('.tier1').find('.open').removeClass('open');
				}
			});
		}
	}

	function getQuestFooter() {
		var specialTag = ['V2LayoutFooterTop', 'V2LayoutFooterBottom'],
			sessionFooterTopName = 'ft-' + RootPath.replace(/\//g, ''),
			sessionFooterBottomName = 'fb-' + RootPath.replace(/\//g, '');

		//If session storage is available, populate navigation. Note: if navigation has been updated when nav is already stored, it'll be one page view behind.
		if (sessionStorage[sessionFooterTopName]) {
			$('body').append('<footer class="footer" id="footer">' + sessionStorage[sessionFooterTopName] + sessionStorage[sessionFooterBottomName] + '</footer>');
			bindNavigationEvents();
		}

		//Get navigation and store
		getLocalizedContent(specialTag).done(function (data) {
			//Populate navigation only if sessionStorage.nav is not present because if it is present, it would have already been populated on line 32.
			if (!sessionStorage[sessionFooterTopName]) {
				$('body').append('<footer class="footer" id="footer">' + data[specialTag[0]] + data[specialTag[1]] + '</footer>');
				bindNavigationEvents();
			}

			//Store latest navigation.
			sessionStorage.setItem(sessionFooterTopName, data[specialTag[0]]);
			sessionStorage.setItem(sessionFooterBottomName, data[specialTag[1]]);
		});

		function bindNavigationEvents() {
			//Prevent anchor tag from firing when href is set to # on mobile
			$('.footer-top-section').on('click', 'a[href=#]', function (e) {
				if ($('html').width() < 768) {
					e.preventDefault();
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

			//To open and close footer on Mobile
			$('body').on('click', '.menu-links > .subLinks > span', function (e) {
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
			});

			/* Country Dropdown */
			$('#current-country').on('click', function (e) {
				if (pageWidth > 767) {
					e.stopPropagation();
					e.preventDefault();
					//$('#country-popup').toggle();
					$(this).parents('li').toggleClass('open');
				}
			});
		}
	}

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

	function bgAnimate(target) {
		var elm = $(target);

		elm.css({backgroundColor: '#fb4f14', color: '#ffffff'});
		elm.animate({backgroundColor: '#eeeeee', color: '#333333'}, 500, function () {
			elm.css({
				'backgroundColor': '',
				'color': ''
			});
		});
	}

	function getPageProperties() {
		//Workaround for Google Chrome. The vertical scrollbar is not included in determining the width of the device.
		$('body').css('overflow', 'hidden');
		var w = $('html').width();

		$('body').css('overflow', '');

		//Define pageType
		if (w >= 1200) {
			pageType = 3;
		}
		else if (w >= 992) {
			pageType = 2;
		}
		else if (w >= 768) {
			pageType = 1;
		}
		else {
			pageType = 0;
		}

		return w;
	}

	function processHeaderFooter() {
		$('body')
			.on('click', function (e) {
				//Closing top search when click on body
				if ($('.open-search').length) {
					if (!$(e.target).is('.search-container *, .search-container, .search-button, .search-button *')) {
						$('.open-search').removeClass('open-search');
					}
				}

				var countrySelectorElem = $('#country-selector');

				if (countrySelectorElem.hasClass('open')) {
					countrySelectorElem.removeClass('open');
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
				}
			});
	}

}(jQuery, window));