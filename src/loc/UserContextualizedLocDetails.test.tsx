import { UUID } from "@logion/node-api/dist/UUID";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "../__mocks__/@logion/node-api/dist/LogionLocMock";
import { shallowRender } from "../tests";

import UserContextualizedLocDetails from "./UserContextualizedLocDetails"
import { buildLocRequest } from "./TestData";
import { setLoc, setLocId } from "./__mocks__/UserLocContextMock";

jest.mock("../logion-chain/");
jest.mock("./UserLocContext");

describe("UserContextualizedLocDetails", () => {

    it("renders", () => {
        const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
        setLocId(uuid);
        setLoc(buildLocRequest(uuid, OPEN_IDENTITY_LOC));
        const tree = shallowRender(<UserContextualizedLocDetails />);
        expect(tree).toMatchSnapshot();
    })
})
