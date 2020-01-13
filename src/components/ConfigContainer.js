import React, { useContext } from 'react'

import { ConfigContext } from '../state/ConfigState';

const ConfigContainer = () => {
    const { state, setters } = useContext(ConfigContext)

    const { title, backgroundColor } = state;
    const { setTitle, setBackgroundColor } = setters;

    const handleClick = color => e => {
        setBackgroundColor(color)
    }


    const handleColorChange = e => {
        const userColor = document.getElementById("color-input").value
        setBackgroundColor(userColor)
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
                defaultValue={title}
                onChange={handleChange}
            />
        </div>
    )
}

export default ConfigContainer;