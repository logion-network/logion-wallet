import { shallowRender } from '../../tests';
import { DEFAULT_IDENTITY, DEFAULT_ADDRESS } from "../../common/TestData";
import { mockValidPolkadotAccountId } from "../../__mocks__/@logion/node-api/Mocks";
import IdentityLocRequestDetails from "./IdentityLocRequestDetails";
import { PersonalInfoProps } from './type';

test("renders", () => {
    const request: PersonalInfoProps = {
        requesterAddress: mockValidPolkadotAccountId("5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"),
        userIdentity: DEFAULT_IDENTITY,
        userPostalAddress: DEFAULT_ADDRESS,
    };
    const tree = shallowRender(<IdentityLocRequestDetails
        personalInfo={ request  }
    />);
    expect(tree).toMatchSnapshot();
});
