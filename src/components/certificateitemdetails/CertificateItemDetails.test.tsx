import { CheckHashResult, CollectionItem, ItemTokenWithRestrictedType } from "@logion/client";
import { shallowRender } from "src/tests";
import { CertificateItemDetails } from "./CertificateItemDetails";

describe("CertificateItemDetails", () => {

    it("renders item with undefined match, no token and no restricted delivery", () => {
        const item = buildItem({
            restrictedDelivery: false
        });
        renderAndTestSnapshot(item);
    });

    it("renders item with undefined match, token and restricted delivery", () => {
        const item = buildItem({
            restrictedDelivery: true,
            token: {
                type: "owner",
                id: "0x900edc98db53508e6742723988b872dd08cd09c2",
            },
        });
        renderAndTestSnapshot(item);
    });

    it("renders item with positive match, token and restricted delivery", () => {
        const item = buildItem({
            restrictedDelivery: true,
            token: {
                type: "owner",
                id: "0x900edc98db53508e6742723988b872dd08cd09c2",
            },
        });
        const result: CheckHashResult = {
            collectionItem: item,
        };
        renderAndTestSnapshot(item, result);
    });

    it("renders item with negative match, token and restricted delivery", () => {
        const item = buildItem({
            restrictedDelivery: true,
            token: {
                type: "owner",
                id: "0x900edc98db53508e6742723988b872dd08cd09c2",
            },
        });
        const result: CheckHashResult = {
            collectionItem: {
                id: "another-id",
            } as unknown as CollectionItem,
        };
        renderAndTestSnapshot(item, result);
    });
});

function buildItem(params: { restrictedDelivery: boolean, token?: ItemTokenWithRestrictedType }): CollectionItem {
    const { restrictedDelivery, token } = params;
    return {
        id: "some-id",
        description: "Some description",
        addedOn: "2022-10-12T10:13:00.000Z",
        restrictedDelivery,
        token,
    } as CollectionItem;
}

function renderAndTestSnapshot(item: CollectionItem, result?: CheckHashResult) {
    const element = shallowRender(<CertificateItemDetails item={ item } checkResult={ result } />);
    expect(element).toMatchSnapshot();
}