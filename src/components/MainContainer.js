import React, {useContext} from 'react';

import {StateContext} from '../state/StateProvider';

const MainContainer = () => {

    const {state, setters, constants, methods} = useContext(StateContext)


    console.log({state, setters, constants, methods})

    return (

        <div>
            
            {state.title}
            <br/>
            {state.username}
            <br/>
            <button onClick={
                e => {
                    methods.contrivedSetState();
                }
            }>
                Set Title
            </button>
            <br/>
            <button onClick={e => {
                setters.setUsername("Quinn")
            }}>
                Add Name
            </button>
            <br/>
            <button onClick={e => {
                setters.setTitleAndUsername()
            }}>
                Set Both
            </button>
            <br/>
            <button onClick={e => {
                methods.logThis()
            }}>
                Method
            </button>
        </div>

    )

}

export default MainContainer;