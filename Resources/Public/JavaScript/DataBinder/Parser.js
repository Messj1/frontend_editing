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
 * Module: TYPO3/CMS/FrontendEditing/DataBinder/Parser
 * Used to fetch data from html
 */
define(['../Utils/Logger'], function createParserModule (Logger) {
    'use strict';

    var log = Logger('FEditing:DataBinder:Parser');
    log.trace('--> createParserModule');

    var topBarHeight = 160;
    var leftBarWidth = 280;
    var rightBarWidth = 325;
    var iconWidth = 45;

    function createElementDefinition () {
        return {

            $iframeWrapper: 't3-frontend-editing__iframe-wrapper',

            $loadingScreen: 't3-frontend-editing__loading-screen',

            $itemCounter: {
                cssClass: 'top-bar-action-buttons .items-counter',
                states: {
                    editor: {
                        saveItems: {
                            text: [
                                '(',
                                {
                                    type: 'state',
                                    value: ['editor', 'saveItems']
                                },
                                ')'
                            ]
                        }
                    }
                }
            },
            saveButton: {
                // identifier
                cssClass: 't3-frontend-editing__save',
                // external event
                events: {
                    'click': {
                        // Component
                        'GUI': 'save'
                    }
                },
                // internal event
                states: {
                    // model
                    editor: {
                        properties: {
                            saveItems: [{
                                operator: '=',
                                compare: 0,
                                change: {
                                    props: {
                                        'disabled': false
                                    },
                                    removeClasses: [
                                        'btn-inactive'
                                    ]
                                }
                            }],
                        },
                        states: {
                            contentChanged: {
                                props: {
                                    'disabled': true
                                },
                                addClasses: [
                                    'btn-inactive'
                                ]
                            }
                        }
                    }
                }
            },
            discardButton: {
                cssClass: 't3-frontend-editing__discard',
                events: {
                    'click': 'discardSaveItems'
                },
                states: {
                    editor: {
                        saveItems: {
                            operator: '=',
                            compare: 0,
                            change: {
                                props: {
                                    'disabled': false
                                },
                                removeClasses: [
                                    'btn-inactive'
                                ]
                            }
                        },
                        contentChanged: {
                            props: {
                                'disabled': true
                            },
                            addClasses: [
                                'btn-inactive'
                            ]
                        }
                    }
                }
            },

            $rightPanelCheckbox: {
                id: 't3-frontend-editing__right-bar--open',
                // internal event
                states: {
                    // model
                    'Panel:rightPanel': {
                        enabled: {
                            properties: {
                                checked: false
                            }
                        },
                        disabled: {
                            properties: {
                                checked: true
                            }
                        },
                    },
                },
            },
            $rightPanel: {
                cssClass: 't3-frontend-editing__right-bar',
                component: {
                    type: 'Panel',
                    name: 'rightPanel',
                    config: {
                        position: [-rightBarWidth, 0],
                        direction: 'right',
                    },
                    // bind: [
                    //     '$rightBarOpenButton'
                    // ]
                },
            },
            $topRightTitle: {
                cssClass: 'top-right-title',
                events: {
                    'click': {
                        'Panel:rightPanel': 'toggle'
                    }
                },
            },
            $leftPanel: {
                cssClass: 't3-frontend-editing__left-bar',
                component: {
                    type: 'Panel',
                    name: 'leftPanel'
                },
            },
            $topBar: {
                cssClass: 't3-frontend-editing__top-bar',
                component: {
                    type: 'Bar',
                    name: 'topBar'
                },
            },
            $ckeditorBar: {
                cssClass: 't3-frontend-editing__ckeditor-bar',
                component: {
                    type: 'Bar',
                    name: 'ckeditorBar'
                },
            },

            $fullViewButton: 't3-frontend-editing__full-view',

            $leftBarOpenButton: 'left-bar-button',
            $rightBarOpenButton: 'right-bar-button',

            $showHiddenItemsButton: 't3-frontend-editing__show-hidden-items',

            $treeRefreshButton: 't3-frontend-editing__page-tree-refresh',
            $searchTreeInput: 'input.search-page-tree',
            $mediaDevices: 'media-devices',
            $accordions: 'accordion',
            $topBarItems: 'top-bar-items',

            $siteRootButton: 'site-root-button',
            $siteRootWrapper: 't3-frontend-editing__page-site-root-wrapper',
            $searchButton: 'search-button',
            $treeFilterWrapper: 't3-frontend-editing__page-tree-filter-wrapper',
            $ckeditorBarWrapper: 't3-frontend-editing__ckeditor-bar__wrapper',

            $tree: 't3-frontend-editing__page-tree',
            $topRightBar: 't3-frontend-editing__top-bar-right',
            $topLeftTitle: 'top-left-title',
            $topLeftBar: 't3-frontend-editing__top-bar-left',
        };
    }

    /**
     *
     * @param {HTMLElement} root
     */
    function parseElement (root) {
        var elements = [];
        var elementDefinitions = createElementDefinition();

        Object.keys(elementDefinitions).forEach(function fetchElements (name) {
            var definition = elementDefinitions[name];

            log.debug('elementDefinition', name, definition);

            if(typeof definition !== 'object') {
                return;
            }

            if(definition.id) {
                definition.element = [];
                var element = document.getElementById(definition.id);

                if (element) {
                    definition.element.push(element);
                }
            } else if(definition.cssClass) {
                definition.element = document.getElementsByClassName(definition.cssClass);
            }

            if (!definition.element || definition.element.length === 0){
               log.debug('no element found', definition.cssClass);

               return;
            }

            log.log('element', name, definition);

            elements[name] = definition;
        });

        return elements;
    }

    return {
        /**
         *
         * @param {Node} node
         */
        parse: function (node) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                // Huston we got some problems
                log.error('node type was not element', node);

                throw new TypeError('node type was not element');
            }
            if(!node instanceof HTMLElement) {
                // Huston we got some other problems with SVG or XUL
                log.error('node is not a HTMLElement', node);

                throw new TypeError('node is not a HTMLElement');
            }

            // $iframe = $iframeWrapper.find('iframe');

            log.debug('parseElement', node);
            return parseElement(node);
        }
    }
});
