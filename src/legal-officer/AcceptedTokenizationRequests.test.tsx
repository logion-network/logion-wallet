jest.mock('./LegalOfficerContext');

import { shallowRender } from '../tests';
import AcceptedTokenizationRequests from './AcceptedTokenizationRequests';
import { setAcceptedRequests } from './__mocks__/LegalOfficerContextMock';

test("Renders null with no data", () => {
    const tree = shallowRender(<AcceptedTokenizationRequests />);
    expect(tree).toMatchSnapshot();
});

test("Renders accepted requests", () => {
    setAcceptedRequests([
        {
            id: "1",
            legalOfficerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            requestedTokenName: "TOKEN1",
            bars: 1,
            status: "REJECTED"
        }
    ]);
    const tree = shallowRender(<AcceptedTokenizationRequests />);
    expect(tree).toMatchSnapshot();
});
