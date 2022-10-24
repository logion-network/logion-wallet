import { LocData } from '@logion/client';
import { shallowRender } from '../../tests';
import TransactionLocRequestDetails from './TransactionLocRequestDetails';

test("renders", () => {
    const request: unknown = {
        id: "1",
        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
        description: "LOC description",
        status: "OPEN",
        createdOn: "2021-09-24T13:30:00.000",
    };
    const tree = shallowRender(<TransactionLocRequestDetails
        request={ request as LocData }
    />);
    expect(tree).toMatchSnapshot();
});
