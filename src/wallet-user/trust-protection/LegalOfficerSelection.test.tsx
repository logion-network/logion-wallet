import React from "react";
import {shallowRender} from "../../tests";
import LegalOfficerSelection, {State} from "./LegalOfficerSelection";

test("START: Show form", () => {
    const tree = shallowRender(<LegalOfficerSelection/>)
    expect(tree).toMatchSnapshot();
});

test("REQUEST_PROTECTION_DONE: Show message", () => {
    const tree = shallowRender(<LegalOfficerSelection initialState={State.REQUEST_PROTECTION_DONE}/>)
    expect(tree).toMatchSnapshot();
});
