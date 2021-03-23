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

        var attachedListeners;

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
                    processStatesComponents(attacheState);
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
            usedComponents = null;

            attachedListeners = {};
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

                const componentName = config.component.type + ':' + config.component.name;
                usedComponents[componentName] = true;
            }
            return true;
        }

        function addUsedStateComponent(componentKey) {
            log.debug('addUsedStateComponent', name, componentKey);

            usedComponents[componentKey] = true;
        }

        function attacheState(componentKey, states) {
            log.debug('attacheState', name, componentKey, states);

            var component = components[componentKey];

            var unregister = component.subscribe(function listenStateChange (newState){
                log.debug('state changed', name, newState);

                var stateConfig = states[newState.value];
                if(stateConfig) {
                    log.log('process state config', name, stateConfig);

                    processStateConfig(stateConfig.properties, setProperty);
                    processStateConfig(stateConfig.styles, setStyle);
                }
            })
        }

        function setProperty (element, key, value) {
            log.debug('setProperty', name, element, key, value);

            element[key] = value;
        }

        function setStyle(element, key, value) {
            log.debug('setStyle', name, element, key, value);

            element.style[key] = value;
            log.log('new style', name, key, element.style[key]);
        }

        function processStateConfig (processData, process) {
            if (processData) {
                each(processData, function find (name, value) {
                    config.element.forEach(function call (element) {
                        process(element, name, value);
                    })
                })
            }
        }

        function addUsedEventComponent(event, componentKey) {
            log.debug('addUsedEventComponent', name, componentKey);

            usedComponents[componentKey] = true;
        }

        function attacheEvent(event, componentKey, eventTarget) {
            var component = components[componentKey];

            log.log('addEventListener', name, event, componentKey, eventTarget);

            function changeState () {
                component.doTransition(eventTarget);
            }

            if(!attachedListeners[componentKey]) {
                attachedListeners[componentKey] = {};
            }

            attachedListeners[componentKey][event] = changeState;

            config.element.forEach(function attachListener (element) {
                element.addEventListener(event, changeState);
            })

        }

        function detachEvent(event, componentKey, eventTarget) {
            log.log('removeEventListener', name, event, componentKey, eventTarget);

            var changeState = attachedListeners[componentKey][event];

            config.element.forEach(function detachListener (element) {
                element.removeEventListener(event, changeState);
            });

            delete attachedListeners[componentKey][event];
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

        function processStatesComponentStates (process) {
            return processStatesComponents(function findStates (componentKey, states) {
                each(states, function doCall (state, config) {
                    log.debug('processStatesComponents', name, config.states);

                    process(componentKey, state, config)
                })
            });
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
