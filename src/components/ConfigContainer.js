import React, { useContext } from 'react'

import { ConfigContext } from '../state/ConfigState';

const ConfigContainer = () => {
    const { state, setters, reducers } = useContext(ConfigContext)

    const { title, titleColor, backgroundColor } = state;
    const { setTitle, setBackgroundColor, setTitleColor } = setters;
    const { stateReducer } = reducers


    const handleClick = color => async e => {
        // by default, setters will use the adjusted setState and will return promises for asynchronous execution
        const state = await setBackgroundColor(color)
        // console.log({state})

        stateReducer.dispatch(state, {type: "CHANGE_TITLE", payload: {title: "SOME TITLE FROM REDUCER"}})
    }


    const handleColorChange = e => {
        const userColor = document.getElementById("color-input").value
        setBackgroundColor(userColor)
    }

    const handleTitleColorChange = e => {
        const titleColor = document.getElementById("title-color-input").value
        setTitleColor(titleColor)
    }

    const handleChange = e => {
        const userTitle = document.getElementById("title-input").value;
        setTitle(userTitle);
    }

    return (
        <div id="config-container">
            <h1>Config Window</h1>
            <button onClick={handleClick("red")}>red</button>
            <button onClick={handleClick("blue")}>blue</button>
            <button onClick={handleClick("green")}>green</button>

            <input
                id="color-input"
                type="text"
                defaultValue={backgroundColor}
                onChange={handleColorChange}
            />

            <input
                id="title-input"
                type="text"
                value={title}
                onChange={handleChange}
            />

            <input
                id="title-color-input"
                type="text"
                defaultValue={titleColor}
                onChange={handleTitleColorChange}
            />
        </div>
    )
}

export default ConfigContainer;