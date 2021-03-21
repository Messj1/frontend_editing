/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

/**
 * Module: TYPO3/CMS/FrontendEditing/Component/Presentation/WizardPanel
 */
define([
    'jquery',
    'TYPO3/CMS/FrontendEditing/Utils/Logger',
    './Panel'
], function createWizardPanelModule (
    $,
    Logger,
    Panel
) {
    'use strict';

    var log = Logger('FEditing:Component:Presentation:WizardPanel');
    log.trace('--> createWizardPanelModule');

    var pushDuration = 200;
    var pushEasing = 'linear';

    var topBarHeight = 160;
    var leftBarWidth = 280;
    var rightBarWidth = 325;
    var iconWidth = 45;

    var rightBarPosition = [-rightBarWidth, 0];
    var leftBarPosition = [-leftBarWidth, 0];
    var ckeditorBarPositionRight = [iconWidth, rightBarWidth];
    var ckeditorBarPositionLeft = [iconWidth, leftBarWidth];
    var topBarPosition = [-topBarHeight, 0];

    var storage;

    // jquery elements
    /**
     * Used to to trigger fullscreen (layout)
     */
    var $fullViewButton;
    /**
     * Used to trigger open/close bar (panel)
     */
    var $topRightTitle;
    var $topLeftTitle;

    /**
     * Used to add class on closeRightPanel and fullscreen (layout)
     */
    var $iframeWrapper;

    /**
     * Used to add class on fullscreen (layout)
     */
    var $ckeditorBarWrapper;

    /**
     * Used to toggle icons (panel)
     */
    var $leftBarOpenButton, $rightBarOpenButton;
    /**
     * Used to animate (panel)
     */
    var $rightBar, $leftBar, $topBar, $ckeditorBar;

    function init () {
        log.info('init');

        storage = F.getStorage();

        findElements();
        bindActions();

        initGuiStates();
    }

    function findElements () {
        $iframeWrapper = $('.t3-frontend-editing__iframe-wrapper');

        $rightBar = $('.t3-frontend-editing__right-bar');
        $leftBar = $('.t3-frontend-editing__left-bar');
        $topBar = $('.t3-frontend-editing__top-bar');
        $ckeditorBar = $('.t3-frontend-editing__ckeditor-bar');

        $ckeditorBarWrapper = $('.t3-frontend-editing__ckeditor-bar__wrapper');

        $topLeftTitle = $leftBar.find('.top-left-title');
        $topRightTitle = $rightBar.find('.top-right-title');

        $leftBarOpenButton = $topLeftTitle.find('.left-bar-button');
        $rightBarOpenButton = $topLeftTitle.find('.right-bar-button');

        $fullViewButton = $('.t3-frontend-editing__full-view');
    }

    var listeners = [];
    var fullscreen = false;

    function toggleFullscreen () {
        fullscreen = !fullscreen;
        trigger('fullscreen', fullscreen);
    }

    function addListener (listener) {
        listeners.push(listener);
    }

    function trigger () {
        var that = this;
        var args = arguments;
        window.setTimeout(function triggerEvents () {
            listeners.forEach(function triggerEvent(listener) {
                listener.apply(that, args);
            })
        }, 0);
    }

    function animate ($element, prop, completeCallback) {
        $element
            .stop()
            .animate(prop, pushDuration, pushEasing, completeCallback);
    }

    function bindActions () {
        var leftPanel = Panel($leftBar, $topLeftTitle, $leftBarOpenButton, leftBarPosition, 'left');
        var rightPanel = Panel($rightBar, $topRightTitle, $rightBarOpenButton, rightBarPosition, 'right');
        var rightPanel = Panel($topBar, null, $rightBarOpenButton, rightBarPosition, 'right');

        leftPanel.addListener(function (event) {
            if(event.type === 'updated') {
                updateRightPanelState();
            }
        });

        rightPanel.addListener(function (event) {
            if(event.type === 'update') {
                $iframeWrapper.toggleClass('push-toleft-iframe');
            }
        });

        // panel states t=left, y=right, u=top
        var t = 0;
        var y = 0;
        var u = 1;

        $fullViewButton.on('click', function toggleFullscreen () {
            log.info('toggle fullscreen [t, y, u]', t, y, u);

            t = ++t & 1;
            y = ++y & 1;
            u = ++u & 1;

            $iframeWrapper.toggleClass('full-view');
            $fullViewButton.toggleClass('full-view-active');
            $ckeditorBar.toggleClass('full-view-active');
            $ckeditorBarWrapper.toggleClass('full-view-active');

            animate($topBar, {
                top: topBarPosition[u]
            });

            if ($rightBar.hasClass('open')) {
                animate($rightBar, {
                    right: rightBarPosition[t]
                });
            } else {
                $rightBar.toggleClass('closed');
            }

            if ($leftBar.hasClass('open')) {
                animate($leftBar, {
                    left: leftBarPosition[y]
                });
            } else {
                $leftBar.toggleClass('closed');
            }

            storage.addItem('fullScreenState', {
                isActive: $fullViewButton.hasClass('full-view-active')
            });
        });

        //TODO: move to init state function since it is not an action binding
        animate($rightBar, {right: rightBarPosition[t]});
    }

    function initGuiStates () {
        var states = storage.getAllData();
        if (typeof states !== 'object') {
            return;
        }

        if (states.leftPanelOpen === true) {
            // Trigger open left panel
            $topLeftTitle.trigger('click');
        }

        if (states.rightPanelState ) {
            // Init right panel state
            if (states.rightPanelState.isVisible) {
                $topRightTitle.trigger('click');
            }
        }

        if (states.fullScreenState && states.fullScreenState.isActive) {
            $fullViewButton.trigger('click');
        }
    }

    function updateRightPanelState () {
        log.trace('updateRightPanelState', $rightBar);

        var rightPanelState = {
            isVisible: $rightBar.hasClass('open'),
            wizards: {}
        };

        storage.addItem('rightPanelState', rightPanelState);
    }

});
