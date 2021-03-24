import React, {useEffect, useRef} from 'react';

const RightPanelWrapper = ({children, localStorage, lockState, waitingState}) => {
    const wrapper = useRef(null);

    useEffect(() => {
        let shutdown = false;
        let ToggleState = null;
        let dataBinder = null;

        import(
            'TYPO3/CMS/FrontendEditing/DataBinder/DataBinder'
        ).then(({default: DataBinder}) => {
            if(shutdown) {
                return;
            }

            dataBinder = DataBinder();
            const usedComponents = dataBinder.load(wrapper.current);

            console.log(usedComponents);

            import(
                'TYPO3/CMS/FrontendEditing/Component/Presentation/ToggleState'
                ).then((importedModule) => {
                if(shutdown) {
                   return;
                }
                ToggleState = importedModule.default;

                console.log(ToggleState);
                const rightPanel = ToggleState({
                    name: 'rightPanel',
                    localStorage: localStorage,
                    lockState: lockState,
                    waitingState: waitingState,
                });

                dataBinder.init({
                    'Panel:rightPanel': rightPanel
                })
            });
        });

        return () => {
            shutdown = true;
            if(ToggleState !== null) {
                dataBinder.unregister();
            }
        }
    });

    return (
        <div ref={wrapper}>
            {children}
        </div>
    );
};

export default RightPanelWrapper;

