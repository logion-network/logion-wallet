jest.mock('../../common/CommonContext');
jest.mock('../LegalOfficerContext');

import { IdentityLocType } from "@logion/node-api";
import { shallowRender, render } from '../../tests';
import OpenedLocs from './OpenedLocs';
import { setOpenedLocRequests, setOpenedIdentityLocsByType } from "../__mocks__/LegalOfficerContextMock";
import { LocData, OpenLoc, UserIdentity } from "@logion/client";
import { UUID } from "@logion/node-api";

describe("OpenedLocs", () => {

    it("renders null with no data", () => {
        const tree = shallowRender(<OpenedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });
    
    it("renders open locs", () => {
        setOpenedLocRequests([
            {
                data: () => ({
                    id: new UUID("556f4128-4fc3-4fdc-a543-74e6230911c4"),
                    ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                    description: "LOC description",
                    status: "OPEN"
                } as LocData)
            } as OpenLoc
        ]);
        const tree = shallowRender(<OpenedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });
    
    it("renders Open Polkadot Identity LOCs", () => {
        const locs: Record<IdentityLocType, any[]> = {
            "Polkadot": [ { data: () => locData("John", "Doe") } ],
            "Logion": []
        }
        setOpenedIdentityLocsByType(locs);
        const tree = render(<OpenedLocs locType="Identity" identityLocType="Polkadot" />);
        expect(tree).toMatchSnapshot();
    });
    
    it("renders Open Logion Identity LOCs", () => {
        const locs: Record<IdentityLocType, any[]> = {
            "Polkadot": [],
            "Logion": [ { data: () => locData("Scott", "Tiger") } ]
        }
        setOpenedIdentityLocsByType(locs);
        const tree = render(<OpenedLocs locType="Identity" identityLocType="Logion" />);
        expect(tree).toMatchSnapshot();
    });
    
})

function locData(firstName: string, lastName: string): LocData {
    return {
        id: new UUID("556f4128-4fc3-4fdc-a543-74e6230911c4"),
        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        description: "LOC description",
        status: "OPEN",
        userIdentity: {
            firstName,
            lastName,
        } as UserIdentity
    } as LocData
}
