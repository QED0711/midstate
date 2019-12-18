import React, {useContext} from 'react';

import {StateContext} from '../state/StateProvider';

const MainContainer = () => {

    const {state, setters, values} = useContext(StateContext)


    console.log({state, setters, values})

    return (

        <div>
            
            {state.title}
            <br/>
            {state.username}
            <br/>
            <button onClick={
                e => {
                    setters.setTitle("New Title")
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
        </div>

    )

}

export default MainContainer;