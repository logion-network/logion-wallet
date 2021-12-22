jest.mock('../../common/CommonContext');

import { IdentityLocType } from "../../logion-chain/Types";
import { shallowRender, render } from '../../tests';
import OpenedLocs from './OpenedLocs';
import { setOpenedLocRequests, setOpenedIdentityLocsByType } from '../../common/__mocks__/CommonContextMock';

test("Renders null with no data", () => {
    const tree = shallowRender(<OpenedLocs locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});

test("Renders pending requests", () => {
    setOpenedLocRequests([
        {
            request: {
                id: "1",
                ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                description: "LOC description",
                status: "OPEN"
            }
        }
    ]);
    const tree = shallowRender(<OpenedLocs locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});

test("Renders Open Polkadot Identity LOCs", () => {
    const locs: Record<IdentityLocType, any[]> = {
        "Polkadot": [ { request: request("John", "Doe") } ],
        "Logion": []
    }
    setOpenedIdentityLocsByType(locs);
    const tree = render(<OpenedLocs locType="Identity" identityLocType="Polkadot" />);
    expect(tree).toMatchSnapshot();
});

test("Renders Open Logion Identity LOCs", () => {
    const locs: Record<IdentityLocType, any[]> = {
        "Polkadot": [],
        "Logion": [ { request: request("Scott", "Tiger") } ]
    }
    setOpenedIdentityLocsByType(locs);
    const tree = render(<OpenedLocs locType="Identity" identityLocType="Logion" />);
    expect(tree).toMatchSnapshot();
});

function request(firstName: string, lastName: string) {
    return {
        id: "556f4128-4fc3-4fdc-a543-74e6230911c4",
        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        description: "LOC description",
        status: "OPEN",
        userIdentity: {
            firstName,
            lastName,
        }
    }
}
