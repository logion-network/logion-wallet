import { shallowRender } from '../tests';
import LegalOfficerRouter from './LegalOfficerRouter';

test("renders", () => {
    const tree = shallowRender(<LegalOfficerRouter />);
    expect(tree).toMatchSnapshot();
});
