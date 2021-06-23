import React from 'react';

import { shallowRender } from "../../tests";

import RequestActivated from './RequestActivated';
import { PROTECTION_REQUEST, RECOVERY_REQUEST } from './TestData';

test("protection request", () => {
    const tree = shallowRender(<RequestActivated request={ PROTECTION_REQUEST }/>)
    expect(tree).toMatchSnapshot();
});

test("recovery request", () => {
    const tree = shallowRender(<RequestActivated request={ RECOVERY_REQUEST }/>)
    expect(tree).toMatchSnapshot();
});
