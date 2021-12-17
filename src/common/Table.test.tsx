import { shallowRender } from '../tests';

import Table, { Cell, Column } from './Table';

interface Record {
    id: string,
    value: string,
}

test("renders", () => {
    const columns: Column<Record>[] = [
        {
            header: "Column 1",
            render: (value: Record) => <Cell content={ value.id }/>,
            width: "50%",
        },
        {
            header: "Column 2",
            render: (value: Record) => <Cell content={ value.id } smallText/>,
            width: "100px",
        },
        {
            header: "Column 3",
            render: (value: Record) => <Cell content={ value.id } />,
        }
    ];
    const data: Record[] = [
        {
            id: "id1",
            value: "Value 1",
        },
        {
            id: "id2",
            value: "Value 2",
        }
    ];
    const result = shallowRender(<Table<Record>
        columns={ columns }
        data={ data }
        renderEmpty={() => null}
    />);
    expect(result).toMatchSnapshot();
});
