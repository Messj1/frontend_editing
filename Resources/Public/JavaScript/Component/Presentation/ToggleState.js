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

    function createMachineDefinition (id) {
        return {
            id: id,
            initial: 'enabled',
            states: {
                enabled: {
                    on: {toggle: 'disabled'}
                },
                disabled: {
                    on: {toggle: 'enabled'}
                },
            },
        };
    }

    return function createToggleStateComponent (config) {
        log.info('init');

        var currentState;
        var id = config.name ? config.name : 'toggle';

        var machineDefinition = createMachineDefinition(id);
        var machine = xstate.createMachine(machineDefinition);
        var service = xstate.interpret(machine).start();

        service.subscribe((state) => {
            log.info('state toggled', id, state.value);

            currentState = state.value
        });

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
