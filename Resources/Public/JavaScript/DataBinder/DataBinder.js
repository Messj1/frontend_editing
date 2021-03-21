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
    './DataHandler'
], function DataBinderModule (
    Parser,
    DataHandler
) {
    'use strict';

    return function createDataBinder() {
        var handlers;
        var components;
        var unregisters;

        reset();

        return {
            load: load,
            init: init,
            unregister: unregister,
        };

        function load (node) {
            if (handlers.length>0) {
                return null;
            }

            var parsedElements = Parser.parse(node);
            var neededComponents = [];

            Object.keys(parsedElements).forEach(function createHandler(elementName) {
                var handler = DataHandler(elementName, parsedElements[elementName]);

                handlers.push(handler);

                neededComponents.push.apply(neededComponents,
                    Object.keys(handler.getUsedComponents())
                );
            });

            return neededComponents
        }

        function init (neededComponents) {
            if (handlers.length === 0) {
                return null;
            }

            //maybe check it
            components = neededComponents;

            unregisters = handlers.map(function initHandlers (handler) {
                //maybe only pass used components
                return handler.init(components);
            });

            return handlers;
        }

        function unregister () {
            if (unregisters === null) {
                return;
            }

            unregisters.forEach(function unregisterHandler (unregister) {
                unregister();
            });

            reset();
        }

        function reset () {
            handlers = [];
            components = null;
            unregisters = null;
        }
    }
});
