import { UploadableCollectionItem } from "@logion/client";
import { AxiosInstance } from "axios";
import { shallowRender } from "src/tests";
import ItemFiles from "./ItemFiles";

describe("ItemFiles", () => {

    const item: UploadableCollectionItem = {
        id: "eff6da24-1364-4594-965a-3b31f1e1df25",
        addedOn: "2022-08-23T07:27:46.128Z",
        description: "Some item",
        files: [
            {
                contentType: "image/jpeg",
                hash: "0xa025ca5f086f3b6df1ca96c235c4daff57083bbd4c9320a3013e787849f9fffa",
                name: "programming_music.jpg",
                size: BigInt("90718"),
                uploaded: true,
            }
        ],
        restrictedDelivery: true,
        token: {
            type: "owner",
            id: "0x900edc98db53508e6742723988b872dd08cd09c2",
        }
    };

    it("renders with undefined deliveries", () => {
        const result = shallowRender(<ItemFiles
            item={ item }
            withCheck={ false }
            axiosFactory={ () => { return {} as AxiosInstance } }
            locId={ "eff6da24-1364-4594-965a-3b31f1e1df25" }
        />);
        expect(result).toMatchSnapshot();
    });

    it("renders with empty deliveries", () => {
        const result = shallowRender(<ItemFiles
            item={ item }
            deliveries={{}}
            withCheck={ false }
            axiosFactory={ () => { return {} as AxiosInstance } }
            locId={ "eff6da24-1364-4594-965a-3b31f1e1df25" }
        />);
        expect(result).toMatchSnapshot();
    });

    it("renders with delivery ", () => {
        const result = shallowRender(<ItemFiles
            item={ item }
            deliveries={{
                "0xa025ca5f086f3b6df1ca96c235c4daff57083bbd4c9320a3013e787849f9fffa": [
                    {
                        copyHash: "0x72685ddcbec5052f9db2523252407990c24bb94d43b478d1a22411e612f3b650",
                        owner: "0x900edc98db53508e6742723988b872dd08cd09c2",
                        generatedOn: "2022-08-25T07:27:46.128Z"
                    }
                ]
            }}
            withCheck={ false }
            axiosFactory={ () => { return {} as AxiosInstance } }
            locId={ "eff6da24-1364-4594-965a-3b31f1e1df25" }
        />);
        expect(result).toMatchSnapshot();
    });
});
