jest.mock("./Model");
jest.mock('../logion-chain');
jest.mock('../logion-chain/Signature');
jest.mock("../common/Model");
jest.mock("../common/CommonContext");

import { useEffect, useState } from 'react';
import { LegalOfficerContextProvider, useLegalOfficerContext } from './LegalOfficerContext';
import { render, waitFor } from '@testing-library/react';
import { rejectRequest } from './__mocks__/ModelMock';
import { setFetchRequests } from '../common/__mocks__/ModelMock';
import { ISO_DATETIME_PATTERN } from '../logion-chain/datetime';
import { setCurrentAddress, DEFAULT_LEGAL_OFFICER_ACCOUNT } from '../common/__mocks__/CommonContextMock';

beforeEach(() => {
    setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    setFetchRequests(jest.fn().mockImplementation(spec => {
        if(spec.status === "PENDING") {
            return Promise.resolve([
                {
                    id: "1",
                    legalOfficerAddress: DEFAULT_LEGAL_OFFICER_ACCOUNT.address,
                    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                    requestedTokenName: "TOKEN1",
                    bars: 1,
                    status: "PENDING"
                }
            ]);
        } else if(spec.status === "REJECTED") {
            return Promise.resolve([
                {
                    id: "2",
                    legalOfficerAddress: DEFAULT_LEGAL_OFFICER_ACCOUNT.address,
                    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                    requestedTokenName: "TOKEN2",
                    bars: 1,
                    status: "REJECTED"
                }
            ]);
        } else {
            return Promise.resolve([]);
        }
    }));
});

test("Context initially fetches requests", async () => {
    let result = render(<TestProvider reject={false} />);
    await waitFor(() => expect(result.getByTestId("pendingTokenizationRequests.length")).toHaveTextContent("1"));
    await waitFor(() => expect(result.getByTestId("rejectedTokenizationRequests.length")).toHaveTextContent("1"));
});

function TestProvider(props: TestConsumerProps) {
    return (
        <LegalOfficerContextProvider>
            <TestConsumer {...props} />
        </LegalOfficerContextProvider>
    );
}

interface TestConsumerProps {
    reject: boolean
}

function TestConsumer(props: TestConsumerProps) {
    const { pendingTokenizationRequests, rejectRequest, tokenizationRequestsHistory } = useLegalOfficerContext();
    const [rejected, setRejected] = useState<boolean>(false);

    useEffect(() => {
        if (props.reject && rejectRequest && !rejected) {
            rejectRequest("1", "because");
            setRejected(true);
        }
    });

    return (
        <div>
            <p data-testid="pendingTokenizationRequests.length">{lengthOrNull(pendingTokenizationRequests)}</p>
            <p data-testid="rejectedTokenizationRequests.length">{lengthOrNull(tokenizationRequestsHistory)}</p>
        </div>
    );
}

function lengthOrNull<T>(array: Array<T> | null) {
    return array !== null ? array.length : "null";
}

test("Context rejects properly", async () => {
    render(<TestProvider reject={true} />);
    await waitFor(() => expect(rejectRequest).toBeCalledWith(
        expect.objectContaining({
            requestId: "1",
            rejectReason: "because",
            signedOn: expect.anything(),
            signature: expect.stringMatching(new RegExp("token-request,reject," + ISO_DATETIME_PATTERN.source + ",1,because")),
        })
    ));
});
