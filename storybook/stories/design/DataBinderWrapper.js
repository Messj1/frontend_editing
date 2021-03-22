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

            // dataBinder.init(ToggleState)
        });
    });

    return (
        <div ref={wrapper}>
            {children}
        </div>
    );
};

export default RightPanelWrapper;

