import ReactDatePicker, { DatePickerProps } from 'react-date-picker';

import './DatePicker.css';

export default function DatePicker(props: DatePickerProps) {

    return (
        <div className="DatePicker">
            <ReactDatePicker
                { ...props }
            />
        </div>
    );
}
