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
 * Module: TYPO3/CMS/FrontendEditing/DataBinder/DataBinder
 * Used to create DataHandler
 */
define([
    './Parser',
    './DataHandler',
    '../Utils/Logger'
], function createDataBinderModule (
    Parser,
    DataHandler,
    Logger
) {
    'use strict';

    var log = Logger('FEditing:DataBinder:DataBinder');
    log.trace('--> createDataBinderModule');

    return function createDataBinder() {
        var handlers;
        var components;
        var unregisterListeners;

        reset();

        return {
            load: load,
            init: init,
            unregister: unregister,
        };

        function load (node) {
            if (handlers.length>0) {
                log.warn('handlers already loaded.', handlers);
                return null;
            }

            log.debug('parse.', node);
            var parsedElements = Parser.parse(node);

            var neededComponents = [];

            log.debug('create handlers', parsedElements);
            Object.keys(parsedElements).forEach(function createHandler(elementName) {
                var handler = DataHandler(elementName, parsedElements[elementName]);

                handlers.push(handler);

                neededComponents.push.apply(neededComponents,
                    Object.keys(handler.getUsedComponents())
                );

            });

            log.log('neededComponents', neededComponents);

            return neededComponents
        }

        function init (neededComponents) {
            if (handlers.length === 0) {
                log.warn('no handlers available to init.');
                return null;
            }

            log.log('set components', neededComponents);

            //maybe check it
            components = neededComponents;

            log.debug('init handlers', handlers);
            unregisterListeners = handlers.map(function initHandlers (handler) {
                //maybe only pass used components
                return handler.init(components);
            });

            return handlers;
        }

        function unregister () {
            if (unregisterListeners === null) {
                log.warn('no handlers initialized.');
                return;
            }

            log.debug('unregister handlers', unregisterListeners);
            unregisterListeners.forEach(function unregisterHandler (unregister) {
                unregister();
            });

            reset();
        }

        function reset () {
            handlers = [];
            components = null;
            unregisterListeners = null;
        }
    }
});
