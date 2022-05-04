jest.mock('../../common/CommonContext');
import { IdentityLocType } from "logion-api/dist/Types";

import VoidLocs from "./VoidLocs";
import { shallowRender, render } from '../../tests';
import { setVoidedIdentityLocsByType } from '../../common/__mocks__/CommonContextMock';

test("Renders null with no data", () => {
    const tree = shallowRender(<VoidLocs locType="Transaction" />);
    expect(tree).toMatchSnapshot();
});

test("Renders Void Polkadot Identity LOCs", () => {
    const locs: Record<IdentityLocType, any[]> = {
        "Polkadot": [ { request: request("John", "Doe") } ],
        "Logion": []
    }
    setVoidedIdentityLocsByType(locs);
    const tree = render(<VoidLocs locType="Identity" identityLocType="Polkadot" />);
    expect(tree).toMatchSnapshot();
});

test("Renders Void Logion Identity LOCs", () => {
    const locs: Record<IdentityLocType, any[]> = {
        "Polkadot": [],
        "Logion": [ { request: request("Scott", "Tiger") } ]
    }
    setVoidedIdentityLocsByType(locs);
    const tree = render(<VoidLocs locType="Identity" identityLocType="Logion" />);
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
        },
        voidInfo: {
            reason: "deprecated"
        }
    }
}
