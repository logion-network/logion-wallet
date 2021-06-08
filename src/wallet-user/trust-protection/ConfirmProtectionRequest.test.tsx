jest.mock('../UserContext');

import {setCreatedProtectionRequest} from "../UserContext";
import {shallowRender, render} from "../../tests";
import React from "react";
import ConfirmProtectionRequest from "./ConfirmProtectionRequest";

test("renders empty", () => {
    const tree = shallowRender(<ConfirmProtectionRequest/>)
    expect(tree).toMatchSnapshot();
});

test("renders created protection request", () => {
    setCreatedProtectionRequest({
        id: '2eb5f71c-7f31-44b5-9390-c3bf56501880',
        decisions:
            [{legalOfficerAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', status: 'PENDING'},
                {legalOfficerAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', status: 'PENDING'}]
    })
    const tree = shallowRender(<ConfirmProtectionRequest/>)
    expect(tree).toMatchSnapshot();
});
