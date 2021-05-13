import { useEffect, useState } from 'react';
import { LegalOfficerContextProvider, useLegalOfficerContext } from './LegalOfficerContext';
import { render, waitFor } from '@testing-library/react';
import { render as testsRender, act } from '../tests';

test("Context initially fetches requests", async () => {
    let result = render(<TestProvider reject={false} />);
    await waitFor(() => { });
    expect(result.getByTestId("pendingTokenizationRequests.length")).toHaveTextContent("2");
});

function TestProvider(props: TestConsumerProps) {
    return (
        <LegalOfficerContextProvider legalOfficerAddress="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY">
            <TestConsumer {...props} />
        </LegalOfficerContextProvider>
    );
}

interface TestConsumerProps {
    reject: boolean
}

function TestConsumer(props: TestConsumerProps) {
    const { pendingTokenizationRequests, rejectRequest } = useLegalOfficerContext();
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
});
