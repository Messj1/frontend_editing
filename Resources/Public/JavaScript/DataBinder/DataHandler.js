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
define(['../Utils/Logger'], function createDataHandlerModule (Logger) {
    'use strict';

    var log = Logger('FEditing:DataBinder:DataHandler');
    log.trace('--> createDataHandlerModule');

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
        log.debug('createDataHandler', name, config);

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

                log.log('created usedComponents', usedComponents);

                return usedComponents;
            },
            init: function (components) {
                if(!setComponents(components)) {
                    log.error('Shutdown: Error occured during attach event', name);
                    return null;
                }

                if(!processEventTargets(attacheEvent)) {
                    log.error('Shutdown: Error occured during attach event', name);
                    processEventTargets(detachEvent)();
                    reset();
                    return null;
                }
                if(config.states) {
                    //TODO init config state
                }

                return function unregister () {
                    log.debug('unregister', name);

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

            log.log('setComponents', name, newComponents);

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
                log.debug('addUsedComponent', name, config.component.name);

                usedComponents[config.component.type] = config.component.name;
            }
            return true;
        }

        function addUsedStateComponent(componentKey) {
            log.debug('addUsedStateComponent', name, componentKey);

            usedComponents[componentKey] = true;
        }

        function addUsedEventComponent(event, componentKey) {
            log.debug('addUsedEventComponent', name, componentKey);

            usedComponents[componentKey] = true;
        }

        function attacheEvent(event, componentKey, eventTarget) {
            var component = components[componentKey];

            log.log('addEventListener', name, event, componentKey, eventTarget);

            config.element.addEventListener(event, component[eventTarget]);
        }

        function detachEvent(event, componentKey, eventTarget) {
            var component = components[componentKey];

            log.log('removeEventListener', name, event, componentKey, eventTarget);

            config.element.removeEventListener(event, component[eventTarget]);
        }

        function processEventTargets (process) {
            if(!config.events) {
                return true;
            }

            log.debug('processEventTargets', name, config.events);

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

            log.debug('processStatesComponents', name, config.states);

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
