import { UUID } from "@logion/node-api";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "../__mocks__/LogionMock";
import { shallowRender } from "../tests";

import UserContextualizedLocDetails from "./UserContextualizedLocDetails"
import { buildLocRequest } from "./TestData";
import { setLoc, setLocId } from "./__mocks__/UserLocContextMock";

jest.mock("../logion-chain/");
jest.mock("./UserLocContext");

describe("UserContextualizedLocDetails", () => {

    it("renders for requester", () => {
        const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
        setLocId(uuid);
        setLoc(buildLocRequest(uuid, OPEN_IDENTITY_LOC));
        const tree = shallowRender(<UserContextualizedLocDetails contributionMode="Requester" />);
        expect(tree).toMatchSnapshot();
    })

    it("renders for VTP", () => {
        const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
        setLocId(uuid);
        setLoc(buildLocRequest(uuid, OPEN_IDENTITY_LOC));
        const tree = shallowRender(<UserContextualizedLocDetails contributionMode="VTP" />);
        expect(tree).toMatchSnapshot();
    })
})
