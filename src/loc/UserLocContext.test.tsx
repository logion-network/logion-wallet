import { UUID } from "@logion/node-api";
import { LocData, LocRequestState, LocsState } from "@logion/client";
import { shallowRender } from "src/tests";
import { setLocsState } from "src/wallet-user/__mocks__/UserContextMock";
import { useLocContext } from "./LocContext";
import { UserLocContextProvider, useUserLocContext } from "./UserLocContext";

jest.mock("../wallet-user/UserContext");

describe("UserLocContextProvider", () => {

    it("renders", () => {
        setLocsState({
            findById: () => ({
                data: () => ({
                    id: locId,
                } as unknown as LocData)
            } as unknown as LocRequestState)
        } as unknown as LocsState);
        const element = shallowRender(<UserLocContextProvider
            locId={ locId }
            backPath="/"
            detailsPath={ () => "" }
        >
            <p>Some content</p>
        </UserLocContextProvider>);
        expect(element).toMatchSnapshot();
    })

    it("uses LOC context", () => {
        expect(useUserLocContext).toBe(useLocContext);
    })
})

const locId = new UUID("274c1273-5d0e-4c81-bce4-a15518affd35");
