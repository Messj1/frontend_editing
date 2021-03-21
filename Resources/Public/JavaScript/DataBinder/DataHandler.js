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
 * Module: TYPO3/CMS/FrontendEditing/DataBinder/DataHandler
 * Used to create DataHandler
 */
define(function DataHandlerModule () {
    'use strict';

    /**
     * States:
     *
     * start -> create (0) -> unregistered (1) <-> init (2) -> end
     *
     *  |0|1|2|
     * 0|  X  |
     * 1|    X|
     * 2|  X  |
     */
    return function createDataHandler (name, config) {
        var components;
        var usedComponents;

        reset();

        return {
            getUsedComponents: function () {
                if(usedComponents !== null) {
                    return usedComponents;
                }

                usedComponents = {};

                processEventTargets(addUsedEventComponent);

                processStatesComponents(addUsedStateComponent);

                addUsedComponent();

                return usedComponents;
            },
            init: function (components) {
                if(!setComponents(components)) {
                    return;
                }

                if(!processEventTargets(attacheEvent)) {
                    processEventTargets(detachEvent)();
                    reset();
                    return;
                }
                if(config.states) {
                    //TODO init config state
                }

                return function unregister () {
                    processEventTargets(detachEvent);
                    if(config.states) {
                        //TODO unregister config state
                    }

                    reset();
                };
            },
        };

        function reset() {
            components = null;
            usedComponents = null
        }

        function setComponents (newComponents) {
            if (components !== null) {
                return false;
            }

            components = newComponents;

            return true;
        }

        /**
         * Set the used html based component
         * TODO: find better name for this component
         * @return {boolean}
         */
        function setUsedComponent() {
            if (!config.component) {
                return true;
            }

            usedComponents[config.component.name] = true;
            return true;
        }

        /**
         * Add the used html based component
         * TODO: find better name for this component
         * @return {boolean}
         */
        function addUsedComponent() {
            if (config.component) {
                usedComponents[config.component.type] = config.component.name;
            }
            return true;
        }

        function addUsedStateComponent(componentKey) {
            usedComponents[componentKey] = true;
        }

        function addUsedEventComponent(event, componentKey) {
            usedComponents[componentKey] = true;
        }

        function attacheEvent(event, componentKey, eventTarget) {
            var component = components[componentKey];

            config.element.addEventListener(event, component[eventTarget]);
        }

        function detachEvent(event, componentKey, eventTarget) {
            var component = components[componentKey];

            config.element.removeEventListener(event, component[eventTarget]);
        }

        function processEventTargets (process) {
            if(!config.events) {
                return true;
            }

            each(config.events, function findComponents(event, eventTargets) {
                each(eventTargets, function doCall (componentKey, eventTarget) {
                    process(event, componentKey, eventTarget);
                });
            });

            return true;
        }

        function processStatesComponents (process) {
            if(!config.states) {
                return true;
            }

            each(config.states, process);

            return true;
        }

        function each (object, process) {
            Object.keys(object).forEach(function prepareProcess (key) {
                var value = object[key];
                process(key, value);
            });
        }
    };
});
