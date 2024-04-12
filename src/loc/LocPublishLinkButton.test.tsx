jest.mock("./LocContext");
jest.mock("src/logion-chain");

import { LocData, HashString } from "@logion/client";
import { UUID } from "@logion/node-api";
import { LinkItem } from "./LocItem";
import { shallowRender } from "../tests";
import LocPublishLinkButton from "./LocPublishLinkButton";
import { TEST_WALLET_USER } from "src/wallet-user/TestData";

describe("LocPublishLinkButton", () => {

    const locId = new UUID("62e3ea0e-eee5-4295-819e-ed01b55472f0");
    const locItem = new LinkItem(
        {
            type: "Linked LOC",
            status: "DRAFT",
            submitter: TEST_WALLET_USER,
            timestamp: null,
            newItem: false,
            template: false,
        },
        {
            linkedLoc: {
                id: new UUID("94cec06d-dca4-4a62-83f4-a82c5425d94e")
            } as unknown as LocData,
            nature: HashString.fromValue("link-nature"),
            linkDetailsPath: "",
        }
    );

    it("renders", () => {
        const tree = shallowRender(<LocPublishLinkButton locItem={ locItem } locId={ locId } />)
        expect(tree).toMatchSnapshot();
    })
})
