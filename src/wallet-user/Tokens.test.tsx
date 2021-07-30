jest.mock('../common/CommonContext');

import React from "react";
import {shallowRender} from "../tests";
import Tokens from "./Tokens";

test("renders", () => {
    const tree = shallowRender(<Tokens/>)
    expect(tree).toMatchSnapshot();
});
