import { LocRequest } from '@logion/client';

import { shallowRender } from '../../tests';
import { DEFAULT_IDENTITY, DEFAULT_ADDRESS } from "../../common/TestData";
import IdentityLocRequestDetails from "./IdentityLocRequestDetails";

test("renders", () => {
    const request: LocRequest = {
        id: "1",
        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        description: "LOC description",
        status: "OPEN",
        createdOn: "2021-09-24T13:30:00.000",
        userIdentity: DEFAULT_IDENTITY,
        userPostalAddress: DEFAULT_ADDRESS,
        locType: "Identity",
        files: [],
        metadata: [],
        links: [],
    };
    const tree = shallowRender(<IdentityLocRequestDetails
        personalInfo={ request  }
    />);
    expect(tree).toMatchSnapshot();
});
