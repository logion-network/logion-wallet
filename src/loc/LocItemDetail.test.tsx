import { shallowRender } from "src/tests";
import LocItemDetail, { DetailProps } from "./LocItemDetail";

describe("LocItemDetail", () => {

    it("shows spinner instead of children when enabled", () => {
        const props: DetailProps = {
            label: "Some label",
            spinner: true,
        };
        const element = shallowRender(<LocItemDetail { ...props } />);
        expect(element).toMatchSnapshot();
    });

    it("shows children without spinner", () => {
        const props: DetailProps = {
            label: "Some label",
            children: "Some content",
        };
        const element = shallowRender(<LocItemDetail { ...props } />);
        expect(element).toMatchSnapshot();
    });

    it("shows copy-paste button when requested", () => {
        const props: DetailProps = {
            label: "Some label",
            children: "Some content",
            copyButtonText: "Some value to copy-paste",
        };
        const element = shallowRender(<LocItemDetail { ...props } />);
        expect(element).toMatchSnapshot();
    });

    it("accepts custom class names", () => {
        const props: DetailProps = {
            label: "Some label",
            children: "Some content",
            className: "my-custom-class-name",
        };
        const element = shallowRender(<LocItemDetail { ...props } />);
        expect(element).toMatchSnapshot();
    });
});
