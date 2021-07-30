jest.mock('./LegalOfficerContext');

import { shallowRender } from '../tests';
import TokenizationRequestsHistory from './TokenizationRequestsHistory';
import { setTokenizationRequestsHistory } from './__mocks__/LegalOfficerContextMock';

test("Renders null with no data", () => {
    const tree = shallowRender(<TokenizationRequestsHistory />);
    expect(tree).toMatchSnapshot();
});

test("Renders accepted requests", () => {
    setTokenizationRequestsHistory([
        {
            id: "1",
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "REJECTED"
        }
    ]);
    const tree = shallowRender(<TokenizationRequestsHistory />);
    expect(tree).toMatchSnapshot();
});
