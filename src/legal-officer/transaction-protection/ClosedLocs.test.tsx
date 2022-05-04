jest.mock('../../common/CommonContext');

import { IdentityLocType } from "logion-api/dist/Types";
import { shallowRender, render } from '../../tests';
import ClosedLocs from './ClosedLocs';
import { setClosedLocRequests, setClosedIdentityLocsByType } from '../../common/__mocks__/CommonContextMock';

test("Renders null with no data", () => {
    const tree = shallowRender(<ClosedLocs locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setClosedLocRequests([
        {
            request: {
                id: "1",
                ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                description: "LOC description",
                status: "CLOSED"
            }
        }
    ]);
    const tree = shallowRender(<ClosedLocs locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});

test("Renders Closed Polkadot Identity LOCs", () => {
    const locs: Record<IdentityLocType, any[]> = {
        "Polkadot": [ { request: request("John", "Doe") } ],
        "Logion": []
    }
    setClosedIdentityLocsByType(locs);
    const tree = render(<ClosedLocs locType="Identity" identityLocType="Polkadot" />);
    expect(tree).toMatchSnapshot();
});

test("Renders Closed Logion Identity LOCs", () => {
    const locs: Record<IdentityLocType, any[]> = {
        "Polkadot": [],
        "Logion": [ { request: request("Scott", "Tiger") } ]
    }
    setClosedIdentityLocsByType(locs);
    const tree = render(<ClosedLocs locType="Identity" identityLocType="Logion" />);
    expect(tree).toMatchSnapshot();
});

function request(firstName: string, lastName: string) {
    return {
        id: "556f4128-4fc3-4fdc-a543-74e6230911c4",
        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        description: "LOC description",
        status: "CLOSED",
        userIdentity: {
            firstName,
            lastName,
        }
    }
}
