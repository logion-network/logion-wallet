jest.mock("./Model");
jest.mock("../logion-chain");

import moment from 'moment';
import {render, waitFor} from "@testing-library/react";

import {DEFAULT_LEGAL_OFFICER} from "../legal-officer/Model";
import {useEffect, useState} from "react";
import {UserContextProvider, useUserContext} from "./UserContext";

function TestProvider() {
    return (
        <UserContextProvider legalOfficerAddress={DEFAULT_LEGAL_OFFICER} userAddress="5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW">
            <TestConsumer/>
        </UserContextProvider>
    );
}

test("Context creates request properly", async () => {
    const result = render(<TestProvider/>);
    await waitFor(() => { });
    expect(result.getByTestId("tokenRequestId")).toHaveTextContent("TOKEN1");
})

function TestConsumer() {
    const {createTokenRequest, createdTokenRequest} = useUserContext();
    const [created, setCreated] = useState<boolean>(false);

    useEffect(() => {
        if (createTokenRequest && !created) {
            createTokenRequest({
                legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                requestedTokenName: "TOKEN1",
                bars: 1,
                signature: "signature",
                signedOn: moment(),
            });
            setCreated(true);
        }
    });

    return (
        <p data-testid="tokenRequestId">{createdTokenRequest?.requestedTokenName}</p>
    );
}
