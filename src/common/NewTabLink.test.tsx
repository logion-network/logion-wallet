import { render } from "../tests";
import React from "react";
import NewTabLink from "./NewTabLink";

test('renders without icon', () => {
    const tree = render(<NewTabLink href="https://logion.network">Some text</NewTabLink>);
    expect(tree).toMatchSnapshot();
});

test('renders with icon', () => {
    const tree = render(<NewTabLink href="https://logion.network" iconId="loc">Some text</NewTabLink>);
    expect(tree).toMatchSnapshot();
});
