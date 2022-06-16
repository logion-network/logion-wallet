import { UUID } from "@logion/node-api/dist/UUID";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "../__mocks__/@logion/node-api/dist/LogionLocMock";
import { render } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import LocItems, { LOLocItems } from "./LocItems";
import { buildLocRequest } from "./TestData";
import { setLoc, setLocId, setLocItems, setLocRequest } from "./__mocks__/LocContextMock";

jest.mock("../common/CommonContext");
jest.mock("./LocContext");
jest.mock("../logion-chain");

describe("LocItems", () => {

    it("renders empty list", () => {
        const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
        setLocId(uuid);
        setLoc(OPEN_IDENTITY_LOC);
        setLocRequest(buildLocRequest(uuid, OPEN_IDENTITY_LOC));
        const tree = render(<LOLocItems />);
        expect(tree).toMatchSnapshot();
    })

    it("renders with single draft item", () => {
        const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
        setLocId(uuid);
        setLoc(OPEN_IDENTITY_LOC);
        const request = buildLocRequest(uuid, OPEN_IDENTITY_LOC);
        request.metadata.push({
            name: "Name",
            addedOn: "2022-01-20T15:45:00.000",
            submitter: TEST_WALLET_USER,
            value: "Value"
        });
        setLocRequest(request);
        setLocItems([
            {
                name: "Name",
                newItem: false,
                status: "DRAFT",
                submitter: TEST_WALLET_USER,
                timestamp: null,
                type: "Data",
                value: "Value"
            }
        ])

        const tree = render(<LOLocItems />);

        expect(tree).toMatchSnapshot();
    })
})
