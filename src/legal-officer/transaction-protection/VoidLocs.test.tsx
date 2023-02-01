jest.mock('../LegalOfficerContext');
jest.mock('../../logion-chain');
import { IdentityLocType } from "@logion/node-api";

import VoidLocs from "./VoidLocs";
import { shallowRender, render } from '../../tests';
import { setVoidedIdentityLocsByType } from "../__mocks__/LegalOfficerContextMock";
import { UUID } from "@logion/node-api";
import { LocData } from "@logion/client";

describe("VoidLocs", () => {

    it("renders null with no data", () => {
        const tree = shallowRender(<VoidLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });
    
    it("renders Void Polkadot Identity LOCs", () => {
        const locs: Record<IdentityLocType, any[]> = {
            "Polkadot": [ { data: () => locData("John", "Doe") } ],
            "Logion": []
        }
        setVoidedIdentityLocsByType(locs);
        const tree = render(<VoidLocs locType="Identity" identityLocType="Polkadot" />);
        expect(tree).toMatchSnapshot();
    });
    
    it("renders Void Logion Identity LOCs", () => {
        const locs: Record<IdentityLocType, any[]> = {
            "Polkadot": [],
            "Logion": [ { data: () => locData("Scott", "Tiger") } ]
        }
        setVoidedIdentityLocsByType(locs);
        const tree = render(<VoidLocs locType="Identity" identityLocType="Logion" />);
        expect(tree).toMatchSnapshot();
    });
});

function locData(firstName: string, lastName: string): LocData {
    return {
        id: new UUID("556f4128-4fc3-4fdc-a543-74e6230911c4"),
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
    } as LocData
}
