jest.mock('../../common/CommonContext');
jest.mock('../LegalOfficerContext');

import { ClosedLoc, LocData } from "@logion/client";
import { IdentityLocType } from "@logion/node-api/dist/Types";
import { shallowRender, render } from '../../tests';
import ClosedLocs from './ClosedLocs';
import { setClosedLocRequests, setClosedIdentityLocsByType } from "../__mocks__/LegalOfficerContextMock";
import { UUID } from "@logion/node-api";

describe("ClosedLocs", () => {

    it("renders null with no data", () => {
        const tree = shallowRender(<ClosedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });
    
    it("renders pending requests", () => {
        setClosedLocRequests([
            {
                data: () => ({
                    id: new UUID("556f4128-4fc3-4fdc-a543-74e6230911c4"),
                    ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
                    description: "LOC description",
                    status: "CLOSED"
                } as unknown as LocData)
            } as ClosedLoc
        ]);
        const tree = shallowRender(<ClosedLocs locType="Transaction" />);
        expect(tree).toMatchSnapshot();
    });
    
    it("renders Closed Polkadot Identity LOCs", () => {
        const locs: Record<IdentityLocType, any[]> = {
            "Polkadot": [ { data: () => locData("John", "Doe") } ],
            "Logion": []
        }
        setClosedIdentityLocsByType(locs);
        const tree = render(<ClosedLocs locType="Identity" identityLocType="Polkadot" />);
        expect(tree).toMatchSnapshot();
    });
    
    it("renders Closed Logion Identity LOCs", () => {
        const locs: Record<IdentityLocType, any[]> = {
            "Polkadot": [],
            "Logion": [ { data: () => locData("Scott", "Tiger") } ]
        }
        setClosedIdentityLocsByType(locs);
        const tree = render(<ClosedLocs locType="Identity" identityLocType="Logion" />);
        expect(tree).toMatchSnapshot();
    });    
});

function locData(firstName: string, lastName: string): LocData {
    return {
        id: new UUID("556f4128-4fc3-4fdc-a543-74e6230911c4"),
        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        description: "LOC description",
        status: "CLOSED",
        userIdentity: {
            firstName,
            lastName,
        }
    } as unknown as LocData
}
