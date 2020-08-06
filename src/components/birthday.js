import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

export const Birthday = (props) => {

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} >
      <KeyboardDatePicker
        className={props.classStyle}
        disabled={props.loader}
        required
        variant="inline"
        format="MM/dd/yyyy"
        placeholder="mm/dd/yyyy"
        margin="normal"
        id="birthday-input"
        label="Birthday"
        autoComplete='bday'
        value={props.val}
        onFocus={props.focus}
        onChange={props.change}
        helperText={props.err}
        KeyboardButtonProps={{
          'aria-label': 'change date',
        }}
      />
      </MuiPickersUtilsProvider>
  )
};