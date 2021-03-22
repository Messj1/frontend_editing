import React, {useEffect, useRef} from 'react';

const RightPanelWrapper = ({children}) => {
    const wrapper = useRef(null);

    useEffect(() => {
        import(
            'TYPO3/CMS/FrontendEditing/DataBinder/DataBinder'
        ).then(({default: DataBinder}) => {
            const dataBinder = DataBinder();
            const usedComponents = dataBinder.load(wrapper.current);

            console.log(usedComponents);

            import(
                'TYPO3/CMS/FrontendEditing/Component/Presentation/ToggleState'
                ).then(({default: ToggleState}) => {

                console.log(ToggleState);
                const rightPanel = ToggleState({name: 'rightPanel'});

                dataBinder.init({
                    'Panel:rightPanel': rightPanel
                })
            });
        });
    });

    return (
        <div ref={wrapper}>
            {children}
        </div>
    );
};

export default RightPanelWrapper;

