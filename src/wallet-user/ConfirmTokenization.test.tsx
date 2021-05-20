jest.mock('./UserContext')

import React from "react";
import {setCreatedTokenRequest} from "./UserContext";
import {render, shallowRender} from "../tests";
import ConfirmTokenization from "./ConfirmTokenization";


test("renders empty", () => {
    const tree = render(<ConfirmTokenization/>)
    expect(tree).toMatchSnapshot();
});

test("renders confirmation", () => {
    setCreatedTokenRequest({
        id: "123456",
        legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        requestedTokenName: "TOKEN1",
        bars: 1
    })
    const tree = render(<ConfirmTokenization/>)
    expect(tree).toMatchSnapshot();
})
