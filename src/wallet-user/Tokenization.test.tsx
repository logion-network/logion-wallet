jest.mock('./UserContext');
jest.mock('../logion-chain');
jest.mock('../logion-chain/Signature');
jest.mock('../common/CommonContext');

import React from "react";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { shallowRender } from "../tests";

import Tokenization, { State } from "./Tokenization";
import { setCreateTokenRequest } from "./__mocks__/UserContextMock";
import { DEFAULT_LEGAL_OFFICER } from "../common/types/LegalOfficer";
import { TEST_WALLET_USER } from "./TestData";

test("START: Enable button", () => {
    const tree = shallowRender(<Tokenization />)
    expect(tree).toMatchSnapshot();
});

test("REQUEST_TOKENIZATION: Disable button, Show form", () => {
    const tree = shallowRender(<Tokenization initialState={State.REQUEST_TOKENIZATION}/>)
    expect(tree).toMatchSnapshot();
});

describe("CreateTokenizationRequest", () => {

    const createTokenRequest = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
        setCreateTokenRequest(createTokenRequest);
        render(<Tokenization />);

        const createButton = screen.getByRole("button", {name: /Request/});
        userEvent.click(createButton);
    });

    it("should display messages when an empty form is submitted", async () => {
        const button = screen.getByRole('button', {name: "Submit"});
        fireEvent.click(button)

        await waitFor(() => expect(screen.getByTestId("requestedTokenNameMessage").innerHTML)
            .toBe("The token name is required"));
        expect(screen.getByTestId("barsMessage").innerHTML)
            .toBe("The # of bars is required");
    });

    it("should create a token and display no message when a valid form is submitted", async () => {
        const tokeName = screen.getByTestId("tokenName");
        fireEvent.input(tokeName, {target: {value: 'DOT7'}})
        const bars = screen.getByTestId("bars");
        fireEvent.input(bars, {target: {value: '7'}})

        const button = screen.getByRole('button', {name: "Submit"});
        fireEvent.click(button);

        expect(screen.getByTestId("requestedTokenNameMessage").innerHTML).toBe("");
        expect(screen.getByTestId("barsMessage").innerHTML).toBe("");
        await waitFor(() => expect(createTokenRequest).toBeCalledWith(
            expect.objectContaining({
                legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
                requesterAddress: TEST_WALLET_USER,
                requestedTokenName: 'DOT7',
                bars: 7,
            })
        ));
    });

    it("should close dialog and not create token when cancel is pressed", async () => {
        const dialog = screen.getByRole("dialog");
        const button = screen.getByRole('button', {name: "Cancel"});
        fireEvent.click(button)
        expect(createTokenRequest).not.toBeCalled();
        await waitFor(() => expect(dialog).not.toBeInTheDocument());
    });
})
