import Identity from './Identity';
import IdentityType from './types/Identity';
import { render } from '../tests';

export const DEFAULT_IDENTITY: IdentityType = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@logion.network",
    phoneNumber: "+1234",
};

test("renders", () => {
    const tree = render(<Identity identity={ DEFAULT_IDENTITY } />);
    expect(tree).toMatchSnapshot();
});
