import {shallowRender} from "../../tests";
import React from "react";
import TrustProtection from "./TrustProtection";

test("renders", () => {
    const tree = shallowRender(<TrustProtection />)
    expect(tree).toMatchSnapshot();
});
