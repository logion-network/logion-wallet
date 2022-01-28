import { shallowRender } from '../tests';
import LegalOfficerRouter from './LegalOfficerRouter';

jest.mock('../common/CommonContext');

test("renders", () => {
    const tree = shallowRender(<LegalOfficerRouter />);
    expect(tree).toMatchSnapshot();
});
