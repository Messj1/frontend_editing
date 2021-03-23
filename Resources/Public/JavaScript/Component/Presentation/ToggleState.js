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
 * Module: TYPO3/CMS/FrontendEditing/Component/Presentation/ToggleState
 */
define([
    'TYPO3/CMS/FrontendEditing/Utils/Logger',
    'TYPO3/CMS/FrontendEditing/Contrib/xstate.fsm'
], function createToggleStateComponentModule (
    Logger,
    xstate
) {
    'use strict';

    var log = Logger('FEditing:Component:Presentation:ToggleState');
    log.trace('--> createToggleStateComponentModule');

    function createMachineDefinition (id, isEnabled=true) {
        return {
            id: id,
            initial: 'startup',
            context: { isEnabled },
            states: {
                startup: {
                    entry: [],
                    on: { start: [{
                            target: 'enabled',
                            cond: ctx => ctx.isEnabled,
                        }, {
                            target: 'disabled',
                            cond: ctx => !ctx.isEnabled,
                        }]
                    },
                    exit: [],

                },
                enabled: {
                    entry: [
                        xstate.assign({'isEnabled': () => true})
                    ],
                    on: {toggle: 'disabled'},
                    exit: [],
                },
                disabled: {
                    entry: [
                        xstate.assign({'isEnabled': () => false}),
                    ],
                    on: {toggle: 'enabled'},
                    exit: [],

                },
            },
        };
    }

    function extendDefinitionWithLocalStorageAction (definition, key) {
        // definition.initial = 'startup';
        // definition.context = { enabled: true };
        definition.states.enabled.entry.push(() => {
            localStorage.setItem(key, true);
        });
        definition.states.disabled.entry.push(() => {
            localStorage.setItem(key, false);
        });
        definition.states.startup.entry = xstate.assign({
            'isEnabled': () => {
                var isEnabled = localStorage.getItem(key);
                return isEnabled === true || isEnabled === 'true';
            }
        });
    }

    function extendDefinitionWithWaitingStates (definition) {
        definition.states.waiting = {
            on: {
                enable: definition.states.enabled.on.toggle,
                disable: definition.states.disabled.on.toggle,
            }
        };
        definition.states.locked = {
            on: {
                unlock: [{
                    target: 'enabled',
                    cond: ctx => ctx.isEnabled,
                }, {
                    target: 'disabled',
                    cond: ctx => !ctx.isEnabled,
                }],
            },
            exit: xstate.assign({
                'isLocked': false
            }),
        };
        definition.context.isLocked = false;
        definition.states.disabled.exit.push((ctx, event) => {
            console.log('states.disabled.exit', ctx, event);
        });
        definition.states.disabled.exit.push(xstate.assign({
            'isLocked': true
        }));
        definition.states.disabled.exit.push();
        // definition.states.enabled.on.toggle = 'waiting';
        definition.states.enabled.on.lock= 'locked';
        definition.states.disabled.on.toggle = 'waiting';
    }

    function registerWaitingStateHandler (service) {
        var currentState;

        return service.subscribe((state) => {
            log.debug('WaitingState handler', state);

            if(state.value === currentState) {
                return;
            }

            if (state.value === 'enabled' && state.context.isLocked) {
                log.info('change state to locked');

                window.setTimeout(() => service.send('lock'), 0);
            } else if(state.value === 'locked') {
                log.info('handle locked state', state.value);

                window.setTimeout(() => service.send('unlock'), 1000);
            } else if(state.value === 'waiting') {
                log.info('handle waiting state', state.value);

                window.setTimeout(() => service.send(
                    state.context.isEnabled ? 'enable' : 'disable'
                ), 1000);
            }

            currentState = state.value;
        });
    }

    return function createToggleStateComponent (config) {
        log.info('init');

        var currentState;
        var id = config.name ? config.name : 'toggle';

        var machineDefinition = createMachineDefinition(id);

        extendDefinitionWithLocalStorageAction(machineDefinition, 'rightPanelEnabled');
        extendDefinitionWithWaitingStates(machineDefinition);

        var machine = xstate.createMachine(machineDefinition);
        var service = xstate.interpret(machine).start();

        service.subscribe((state) => {
            if(state.value === currentState) {
                log.info('pre toggle state', id, state.value);
                return;
            }

            log.info('toggle state', id, state.value);

            if(state.value === 'startup') {
                window.setTimeout(() => service.send('start'), 0);
            }

            log.debug('currentState', currentState);
            currentState = state.value
        });

        registerWaitingStateHandler(service);

        return {
            subscribe: service.subscribe,
            get currentState () {
                return currentState;
            },
            canDoTransition: hasCurrentStateTransition,
            doTransition: service.send
        };

        function hasCurrentStateTransition (transition) {
            var transitions = Object.keys(machineDefinition.states[currentState].on);

            for (var i=0; i<transitions.length; i++) {
                if(transition === transitions[i]) {
                    return true;
                }
            }

            return false;
        }
    }
});
