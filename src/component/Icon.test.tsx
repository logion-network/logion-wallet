import { ReactElement } from 'react';
import { shallowRender } from '../tests';
import { Icon as IconType } from './ColorTheme';

import Icon from './Icon';

test("No category icon with undefined variants", () => {
    const icon: IconType = {
        id: "iconId"
    };
    const result = renderIcon(icon);
    expect(result).toMatchSnapshot();
});

function renderIcon(icon: IconType): ReactElement {
    return shallowRender(<Icon icon={ icon } colorThemeType={ 'dark' } />);
}

test("No category icon with no variants", () => {
    const icon: IconType = {
        id: "iconId",
        hasVariants: false,
    };
    const result = renderIcon(icon);
    expect(result).toMatchSnapshot();
});

test("Simple icon with variant", () => {
    const icon: IconType = {
        id: "iconId",
        hasVariants: true
    };
    const result = renderIcon(icon);
    expect(result).toMatchSnapshot();
});

test("Category icon with undefined variant", () => {
    const icon: IconType = {
        id: "iconId",
        category: 'category',
    };
    const result = renderIcon(icon);
    expect(result).toMatchSnapshot();
});

test("Category icon without variant", () => {
    const icon: IconType = {
        id: "iconId",
        category: 'category',
        hasVariants: false
    };
    const result = renderIcon(icon);
    expect(result).toMatchSnapshot();
});

test("Category icon with variant", () => {
    const icon: IconType = {
        id: "iconId",
        category: 'category',
        hasVariants: true
    };
    const result = renderIcon(icon);
    expect(result).toMatchSnapshot();
});
