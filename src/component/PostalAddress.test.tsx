import PostalAddress from './PostalAddress';
import PostalAddressType from './types/PostalAddress';
import { render } from '../tests';

export const DEFAULT_ADDRESS: PostalAddressType = {
    line1: "Place de le République Française, 10",
    line2: "boite 15",
    postalCode: "4000",
    city: "Liège",
    country: "Belgium",
};

test("Context initially fetches requests", () => {
    const tree = render(<PostalAddress address={ DEFAULT_ADDRESS } />);
    expect(tree).toMatchSnapshot();
});
