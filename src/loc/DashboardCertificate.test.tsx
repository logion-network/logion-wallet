import { CollectionItem } from "@logion/client";
import { shallowRender } from "src/tests";
import { setParams } from "src/__mocks__/ReactRouterMock";
import DashboardCertificate from "./DashboardCertificate";
import { setCollectionItems } from "./__mocks__/LocContextMock";

jest.mock("./LocContext");

describe("DashboardCertificate", () => {

    it("renders empty", () => {
        const element = shallowRender(<DashboardCertificate />);
        expect(element).toMatchSnapshot();
    });

    it("renders item", () => {
        const itemId = "some-id";
        setParams({ itemId });
        setCollectionItems([
            {
                id: itemId,
                files: [],
            } as unknown as CollectionItem
        ])
        const element = shallowRender(<DashboardCertificate />);
        expect(element).toMatchSnapshot();
    });
});
