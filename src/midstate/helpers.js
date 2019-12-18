

export const bindMethods = (methods, self) => {
    /* 
    takes an object of methods and binds them to a given "self"
    */
    const bound = {}
    for (let method in methods) {
        bound[method] = methods[method].bind(self)
    }
    return bound;
}


const formatStateName = (name) => {
    /* 
    Takes an object key (name) as an input, and returns that name capitalized with the word "set" prepended to it.
    If the word already starts with a capital letter (or and underscore _), returns null. 

    This functionality allows for standard key names to automatically get setters, while also allowing for users to specify key names that should not be changed or get setters. 
    */
    name = name.split("");

    if (name[0] === name[0].toUpperCase()) return null;

    name[0] = name[0].toUpperCase()
    return "set" + name.join("");
}

export const createStateSetters = (state, setters = {}) => {
    /* 
    iterates through a provided state object, and takes each key name (state value) and creates a setter method for that value. 
    Following the standard React convention, a key called "myKey" would get a setter method called "setMyKey".
    */

    let formattedName;
    for (let s in state) {
        formattedName = formatStateName(s);

        if (formattedName) {
            setters[formattedName] = function (value) {
                const stateChange = {}
                stateChange[s] = value;
                this.setState(stateChange)
            }
        }

    }
    return setters;
}