import ComparableField from "./ComparableField";
import { COLOR_THEME } from "./TestData";
import { render, screen } from '@testing-library/react';

interface Data {
    attribute: string
}

const data: Data = {
    attribute: "attribute"
}

const sameData: Data = {
    attribute: "attribute"
}

const differentData: Data = {
    attribute: "different attribute"
}

test("renders without comparison", () => {
    const tree = render(
        <ComparableField
            id="testId1"
            data={ data }
            field={ data => data.attribute }
            colors={ COLOR_THEME.dashboard }
            label="attribute"
            squeeze={ true }
            noComparison={ true }
        />);
    expect(tree).toMatchSnapshot();
    expect(screen.getByTestId("testId1")).not.toHaveClass("is-invalid")
});

test("renders with same data", () => {
    const tree = render(
        <ComparableField
            id="testId2"
            data={ data }
            otherData={ sameData }
            field={ data => data.attribute }
            colors={ COLOR_THEME.dashboard }
            label="attribute"
            squeeze={ true }
            noComparison={ false }
        />);
    expect(tree).toMatchSnapshot();
    expect(screen.getByTestId("testId2")).not.toHaveClass("is-invalid")

});

test("renders with different data", () => {
    const tree = render(
        <ComparableField
            id="testId3"
            data={ data }
            otherData={ differentData }
            field={ data => data.attribute }
            colors={ COLOR_THEME.dashboard }
            label="attribute"
            squeeze={ true }
            noComparison={ false }
        />);
    expect(tree).toMatchSnapshot();
    expect(screen.getByTestId("testId3")).toHaveClass("is-invalid")
});
