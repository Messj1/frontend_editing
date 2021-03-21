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
 * Module: TYPO3/CMS/FrontendEditing/Component/Presentation/Panel
 */
define([
    'jquery',
    'TYPO3/CMS/FrontendEditing/Utils/Logger'
], function createPanelModule (
    $,
    Logger
) {
    'use strict';

    var log = Logger('FEditing:Component:Presentation:Bar');
    log.trace('--> createWizardPanelModule');

    var pushDuration = 200;
    var pushEasing = 'linear';

    /**
     * @param panel HTMLElement used to animate
     * @param config component configurations
     */
    return function createPanel (panel, config) {
        log.info('init');

        var $panel = $(panel);
        var panelPosition = config.panelPosition;
        var direction = config.direction;

        function animate($element, prop, completeCallback) {
            $element
                .stop()
                .animate(prop, pushDuration, pushEasing, completeCallback);
        }

        var isFullscreen = false;

        return {
            get open () {
                return isOpen();
            },
            toggleOpen: toggleOpen,
            setFullscreen: setFullscreen,
        };

        function setFullscreen(state) {
            log.info('toggle fullscreen', state);

            if (isFullscreen === state) {
                return;
            }

            isFullscreen = state;

            if (isOpen()) {
                animate($panel, {
                    [direction]: panelPosition[open]
                });
            } else {
                $panel.toggleClass('closed');
            }
        }

        function toggleOpen() {
            log.info('toggle bar open', isOpen());

            // $openIcon.toggleClass(
            //     'icon-icons-tools-settings icon-icons-arrow-double'
            // );

            $panel.toggleClass('open');

            animate($panel, {
                [direction]: rightBarPosition[isOpen() ? 0 : 1]
            });
            // animate($ckeditorBar, {
            //     [direction]: ckeditorBarPositionRight[isOpen() ? 0 : 1]
            // });
        }

        function isOpen() {
            return $panel.hasClass('open');
        }
    }
});
