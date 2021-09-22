import { shallowRender } from '../tests';
import LocIdCell from './LocIdCell';

it("renders UUID as decimal", () => {
    const tree = shallowRender(<LocIdCell
        id='6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b'
    />);
    expect(tree).toMatchSnapshot();
});
