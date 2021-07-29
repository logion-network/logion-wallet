jest.mock('../common/CommonContext');

import React from "react";
import {shallowRender} from "../tests";
import Account from "./Account";

test("renders", () => {
    const tree = shallowRender(<Account/>)
    expect(tree).toMatchSnapshot();
});
