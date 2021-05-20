import React from "react";
import {shallowRender} from "../tests";
import Tokenization, {State} from "./Tokenization";

test("START: Enable button", () => {
    const tree = shallowRender(<Tokenization/>)
    expect(tree).toMatchSnapshot();
});

test("REQUEST_TOKENIZATION: Disable button, Show form", () => {
    const tree = shallowRender(<Tokenization initialState={State.REQUEST_TOKENIZATION}/>)
    expect(tree).toMatchSnapshot();
});
test("REQUEST_TOKENIZATION_DONE: Enable button, Show message", () => {
    const tree = shallowRender(<Tokenization initialState={State.REQUEST_TOKENIZATION_DONE}/>)
    expect(tree).toMatchSnapshot();
});
