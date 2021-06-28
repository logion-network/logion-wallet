import React from 'react';

import { shallowRender } from "../../tests";

import RequestActivated from './RequestActivated';
import {
    ACTIVATED_PROTECTION_REQUEST,
    PENDING_PROTECTION_REQUEST,
    ACTIVATED_RECOVERY_REQUEST, PENDING_RECOVERY_REQUEST
} from './TestData';

test("activated protection request", () => {
    const tree = shallowRender(<RequestActivated request={ ACTIVATED_PROTECTION_REQUEST }/>)
    expect(tree).toMatchSnapshot();
});

test("pending protection request", () => {
    const tree = shallowRender(<RequestActivated request={ PENDING_PROTECTION_REQUEST }/>)
    expect(tree).toMatchSnapshot();
});

test("activated recovery request", () => {
    const tree = shallowRender(<RequestActivated request={ ACTIVATED_RECOVERY_REQUEST }/>)
    expect(tree).toMatchSnapshot();
});

test("pending recovery request", () => {
    const tree = shallowRender(<RequestActivated request={ PENDING_RECOVERY_REQUEST }/>)
    expect(tree).toMatchSnapshot();
});
