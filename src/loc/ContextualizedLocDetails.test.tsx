import { UUID } from "@logion/node-api/dist/UUID";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "../__mocks__/@logion/node-api/dist/LogionLocMock";
import { render } from "../tests"

import ContextualizedLocDetails from "./ContextualizedLocDetails"
import { buildLocRequest } from "./TestData";
import { setLoc, setLocId, setLocRequest } from "./__mocks__/LocContextMock";

jest.mock('../common/CommonContext');
jest.mock('./LocContext');
jest.mock('react-router');
jest.mock('../logion-chain');

describe("ContextualizedLocDetails", () => {
    it("renders", () => {
        const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
        setLocId(uuid);
        setLoc(OPEN_IDENTITY_LOC);
        setLocRequest(buildLocRequest(uuid, OPEN_IDENTITY_LOC));
        const tree = render(<ContextualizedLocDetails />);
        expect(tree).toMatchSnapshot();
    })
})
