import { shallowRender } from '../../tests';
import LocRequestDetails from './LocRequestDetails';

test("renders", () => {
    const tree = shallowRender(<LocRequestDetails
        request={{
            id: "1",
            ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
            description: "LOC description",
            status: "OPEN",
            createdOn: "2021-09-24T13:30:00.000",
        }}
    />);
    expect(tree).toMatchSnapshot();
});
