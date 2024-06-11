jest.mock('../UserContext');
jest.mock('../../common/CommonContext');
jest.unmock('@logion/client');

import { setProtectionState } from "../__mocks__/UserContextMock";
import { shallowRender } from "../../tests";
import TrustProtection from "./TrustProtection";

test("renders empty", () => {
    setProtectionState(undefined);
    const tree = shallowRender(<TrustProtection/>)
    expect(tree).toMatchSnapshot();
});
