import { LocData } from '@logion/client';
import { shallowRender } from '../../tests';
import TransactionLocRequestDetails from './TransactionLocRequestDetails';
import { mockValidPolkadotAccountId } from 'src/__mocks__/@logion/node-api/Mocks';

test("renders", () => {
    const request = {
        id: "1",
        ownerAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        requesterAddress: mockValidPolkadotAccountId("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
        description: "LOC description",
        status: "OPEN",
        createdOn: "2021-09-24T13:30:00.000",
    } as unknown as LocData;
    const tree = shallowRender(<TransactionLocRequestDetails
        request={ request }
    />);
    expect(tree).toMatchSnapshot();
});
