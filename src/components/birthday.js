import React, { useState, useEffect } from 'react';
import { Grid, Typography, createMuiTheme, ThemeProvider } from '@material-ui/core';
import { subYears } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

const localTheme = createMuiTheme({
  overrides: {
    MuiPickersYearSelection: {
      container: {
        flexDirection: "column-reverse",
        display: "flex",
      },
    },
  },
});

const themeMerge = outerTheme => {
  const newTheme = { ...outerTheme };
  if (!newTheme.overrides) {
    newTheme.overrides = localTheme.overrides;
  } else {
    newTheme.overrides = { ...newTheme.overrides, ...localTheme.overrides };
  }
  return newTheme;
};

export const Birthday = (props) => {

  const [ date, setDate ] = useState(null);
  const [ minDate, setMinDate ] = useState(null);
  const [ maxDate, setMaxDate ] = useState(null);
  const [ focusYear, setFocusYear ] = useState(null);

  function handleChange(evt) {
    setDate(evt);
    if (props.onChange) {
      props.onChange(evt);
    }
  }

  useEffect(() => {
    if (props.date) {
      setDate(props.date);
      setFocusYear(props.date);
    }
  }, [props.date]);

  useEffect(() => {

    let now = new Date();
    let min = new Date(now);
    let max = new Date(now);

    min.setFullYear(min.getFullYear() - 100);
    min.setMonth(0);
    min.setDate(1);
    min.setMinutes(0);
    min.setHours(0);
    min.setSeconds(0);
    min.setMilliseconds(0);

    max = subYears(max, 18);

    setMinDate(min);
    setMaxDate(max);
    setFocusYear(max);
    
  }, []);

  return (
    <ThemeProvider theme={themeMerge}>
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <Typography variant="subtitle2">Date of birth</Typography>
        </Grid>
        <Grid item>
          <MuiPickersUtilsProvider utils={DateFnsUtils} >
            <Grid container direction="row" spacing={2}>
              <Grid item xs={4}>
                <DatePicker
                  disabled={props.loader}
                  required={props.required}
                  views={["year"]}
                  variant="inline"
                  format="yyyy"
                  label="Year"
                  value={date}
                  initialFocusedDate={focusYear}
                  onChange={handleChange}
                  inputVariant="outlined"
                  minDate={minDate}
                  maxDate={maxDate}
                  allowKeyboardControl={false}
                  disableToolbar={true}
                />
              </Grid>
              <Grid item xs={4}>
              <DatePicker
                  disabled={props.loader}
                  required={props.required}
                  views={["month"]}
                  variant="inline"
                  format="MMMM"
                  label="Month"
                  value={date}
                  onChange={handleChange}
                  inputVariant="outlined"
                  minDate={minDate}
                  maxDate={maxDate}
                  allowKeyboardControl={false}
                  disableToolbar={true}
                />
              </Grid>
              <Grid item xs={4}>
              <DatePicker
                  disabled={props.loader}
                  required={props.required}
                  views={["date"]}
                  variant="inline"
                  format="d"
                  label="Day"
                  value={date}
                  onChange={handleChange}
                  inputVariant="outlined"
                  minDate={minDate}
                  maxDate={maxDate}
                  allowKeyboardControl={false}
                  disableToolbar={true}
                />
              </Grid>
            </Grid>
          </MuiPickersUtilsProvider>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
};