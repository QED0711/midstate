import React, { useContext } from 'react';

import { StateContext, msInstance } from '../state/StateProvider';
import { ConfigContext } from '../state/ConfigState';

const MainContainer = () => {

    const { state, setters } = useContext(ConfigContext)
    
    const {title, backgroundColor, titleColor} = state;
    const {setTitle, setBackgroundColor} = setters;

    msInstance.clearStateFromStorage()

    // console.log({ state, setters, constants, methods })

    return (

        <div>
            <h1 style={{backgroundColor, color: titleColor}}>{title}</h1>
        </div>

    )

}

export default MainContainer;