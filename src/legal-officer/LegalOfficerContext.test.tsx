jest.mock("./Model");

import { useEffect, useState } from 'react';
import { LegalOfficerContextProvider, useLegalOfficerContext } from './LegalOfficerContext';
import { render, waitFor } from '@testing-library/react';
import { DEFAULT_LEGAL_OFFICER } from './Model';

test("Context initially fetches requests", async () => {
    let result = render(<TestProvider reject={false} />);
    await waitFor(() => { });
    expect(result.getByTestId("pendingTokenizationRequests.length")).toHaveTextContent("2");
    expect(result.getByTestId("rejectedTokenizationRequests.length")).toHaveTextContent("0");
});

function TestProvider(props: TestConsumerProps) {
    return (
        <LegalOfficerContextProvider legalOfficerAddress={ DEFAULT_LEGAL_OFFICER }>
            <TestConsumer {...props} />
        </LegalOfficerContextProvider>
    );
}

interface TestConsumerProps {
    reject: boolean
}

function TestConsumer(props: TestConsumerProps) {
    const { pendingTokenizationRequests, rejectRequest, rejectedTokenizationRequests } = useLegalOfficerContext();
    const [rejected, setRejected] = useState<boolean>(false);

    useEffect(() => {
        if (props.reject && rejectRequest && !rejected) {
            rejectRequest("1");
            setRejected(true);
        }
    });

    return (
        <div>
            <p data-testid="pendingTokenizationRequests.length">{lengthOrNull(pendingTokenizationRequests)}</p>
            <p data-testid="rejectedTokenizationRequests.length">{lengthOrNull(rejectedTokenizationRequests)}</p>
        </div>
    );
}

function lengthOrNull<T>(array: Array<T> | null) {
    return array !== null ? array.length : "null";
}

test("Context rejects properly", async () => {
    let result = render(<TestProvider reject={true} />);
    await waitFor(() => { });
    expect(result.getByTestId("pendingTokenizationRequests.length")).toHaveTextContent("1");
    expect(result.getByTestId("rejectedTokenizationRequests.length")).toHaveTextContent("1");
});
