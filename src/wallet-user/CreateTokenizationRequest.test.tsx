jest.mock('./UserContext');
jest.mock('../logion-chain');
jest.mock('../RootContext');

import React from 'react';
import {DEFAULT_LEGAL_OFFICER} from "../legal-officer/Types";
import {setCreateTokenRequest} from "./UserContext";
import CreateTokenizationRequest from "./CreateTokenizationRequest";
import {shallowRender} from "../tests";
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {TEST_WALLET_USER} from "./Model.test";
import { ISO_DATETIME_PATTERN } from '../logion-chain/datetime';

test("renders", () => {
    const tree = shallowRender(<CreateTokenizationRequest onCancel={() => null} onSubmit={() => null}/>)
    expect(tree).toMatchSnapshot();
});

describe("CreateTokenizationRequest", () => {

    const cancelCallback = jest.fn();
    const submitCallback = jest.fn();
    const createTokenRequest = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
        setCreateTokenRequest(createTokenRequest);
        render(<CreateTokenizationRequest onCancel={cancelCallback} onSubmit={submitCallback}/>);
    });

    it("should display messages when an empty form is submitted", async () => {
        const button = screen.getByTestId("btnSubmit");
        fireEvent.click(button)

        await waitFor(() => expect(screen.getByTestId("tokenNameMessage").innerHTML)
            .toBe("The token name is required"));
        expect(screen.getByTestId("barsMessage").innerHTML)
            .toBe("The # of bars is required");
        expect(cancelCallback).not.toBeCalled();
        expect(submitCallback).not.toBeCalled();
    });

    it("should call submitCallback when a valid form is submitted, and not display messages", async () => {
        const tokeName = screen.getByTestId("tokenName");
        fireEvent.input(tokeName, {target: {value: 'DOT7'}})
        const bars = screen.getByTestId("bars");
        fireEvent.input(bars, {target: {value: '7'}})

        const button = screen.getByTestId("btnSubmit");
        fireEvent.click(button);

        await waitFor(() => expect(submitCallback).toBeCalled());
        expect(cancelCallback).not.toBeCalled();
        expect(screen.getByTestId("tokenNameMessage").innerHTML).toBe("");
        expect(screen.getByTestId("barsMessage").innerHTML).toBe("");
        expect(createTokenRequest).toBeCalledWith(
            expect.objectContaining({
                legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
                requesterAddress: TEST_WALLET_USER,
                requestedTokenName: 'DOT7',
                bars: 7,
                signature: expect.stringMatching(new RegExp("token-request,create," + ISO_DATETIME_PATTERN.source + "," + DEFAULT_LEGAL_OFFICER + ",DOT7,7")),
            })
        );
    });

    it("should call cancelCallback when cancel is pressed", async () => {
        const button = screen.getByTestId("btnCancel");
        fireEvent.click(button)
        await waitFor(() => expect(cancelCallback).toBeCalled());
        expect(submitCallback).not.toBeCalled();
    });

})

