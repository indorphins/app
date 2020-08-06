import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

export const Birthday = (props) => {

  const [ date, setDate ] = useState(null);

  function handleChange(evt) {
    setDate(evt);
    if (props.onChange) {
      props.onChange(evt);
    }
  }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} >
      <Grid container direction="row" spacing={2}>
        <Grid item>
          <KeyboardDatePicker
            className={props.classStyle}
            disabled={props.loader}
            required
            views={["year"]}
            variant="inline"
            format="yyyy"
            label="Year"
            value={date}
            onChange={handleChange}
          />
        </Grid>
        <Grid item>
        <KeyboardDatePicker
            className={props.classStyle}
            disabled={props.loader}
            required
            views={["month"]}
            variant="inline"
            format="MMMM"
            label="Month"
            value={date}
            onChange={handleChange}
          />
        </Grid>
        <Grid item>
        <KeyboardDatePicker
            className={props.classStyle}
            disabled={props.loader}
            required
            //views={["day"]}
            variant="inline"
            format="d"
            label="Day"
            value={date}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
      </MuiPickersUtilsProvider>
  )
};