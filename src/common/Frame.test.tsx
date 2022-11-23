import { shallowRender } from '../tests';

import Frame from './Frame';
import { Children } from "./types/Helpers";

describe("Frame", () => {

    const children: Children = <p>Some children</p>;

    it("renders", () => {
        const result = shallowRender(
            <Frame>
                { children }
            </Frame>
        );
        expect(result).toMatchSnapshot();
    });

    it("renders with title", () => {
        const result = shallowRender(
            <Frame title="Some title">
                { children }
            </Frame>
        );
        expect(result).toMatchSnapshot();
    });


    it("renders with title and icon", () => {
        const result = shallowRender(
            <Frame title="Some title" titleIcon={ { icon: { id: "vtp-icon" } } }>
                { children }
            </Frame>
        );
        expect(result).toMatchSnapshot();
    });

})

