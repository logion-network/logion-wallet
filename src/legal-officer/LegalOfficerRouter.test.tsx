import { DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress } from '../common/__mocks__/CommonContextMock';
import { shallowRender } from '../tests';
import LegalOfficerRouter from './LegalOfficerRouter';

jest.mock('../common/CommonContext');

test("renders", () => {
    setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
    const tree = shallowRender(<LegalOfficerRouter />);
    expect(tree).toMatchSnapshot();
});
