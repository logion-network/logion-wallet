jest.mock('../UserContext');
jest.mock('../../RootContext');

import {shallowRender} from "../../tests";
import React from "react";
import Recovery from "./Recovery";

test("renders", () => {
    const tree = shallowRender(<Recovery />)
    expect(tree).toMatchSnapshot();
});
