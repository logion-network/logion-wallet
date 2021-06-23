import React from 'react';

import { shallowRender } from "../../tests";

import RequestPending from './RequestPending';
import { PROTECTION_REQUEST, RECOVERY_REQUEST } from './TestData';

test("protection request", () => {
    const tree = shallowRender(<RequestPending request={ PROTECTION_REQUEST }/>)
    expect(tree).toMatchSnapshot();
});

test("recovery request", () => {
    const tree = shallowRender(<RequestPending request={ RECOVERY_REQUEST }/>)
    expect(tree).toMatchSnapshot();
});
