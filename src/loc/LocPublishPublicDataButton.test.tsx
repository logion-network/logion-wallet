jest.mock("./LocContext");
jest.mock("src/logion-chain");

import { HashString } from "@logion/client";
import { UUID, Hash } from "@logion/node-api";
import { MetadataItem } from "./LocItem";
import { shallowRender } from "../tests";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";
import { mockValidPolkadotAccountId } from 'src/__mocks__/LogionMock';

describe("LocPublishPublicDataButton", () => {

    const locId = new UUID("62e3ea0e-eee5-4295-819e-ed01b55472f0");
    const locItem = new MetadataItem(
        {
            type: "Data",
            status: "DRAFT",
            submitter: mockValidPolkadotAccountId("data-submitter"),
            timestamp: null,
            newItem: false,
            template: false,
        },
        {
            name: HashString.fromValue("data-name"),
            value: HashString.fromValue("data-value"),
        }
    );

    it("renders", () => {
        const tree = shallowRender(<LocPublishPublicDataButton locItem={ locItem } locId={ locId } />)
        expect(tree).toMatchSnapshot();
    })
})
