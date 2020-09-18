import React, { useState, useEffect } from 'react';
import { Grid, Typography, createMuiTheme, ThemeProvider } from '@material-ui/core';
import { subYears } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

const localTheme = createMuiTheme({
  overrides: {
    MuiPickersYearSelection: {
      container: {
        boxSizing: "border-box",
        flexDirection: "column-reverse",
        display: "flex",
      },
    },
    MuiPickersYear: {
      root: {
        minHeight: 32,
      }
    }
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

export function Birthday(props) {

  const [ date, setDate ] = useState(null);
  const [ minDate, setMinDate ] = useState(null);
  const [ maxDate, setMaxDate ] = useState(null);
  const [ focusYear, setFocusYear ] = useState(null);
  const [ err, setErr ] = useState(null);

  function handleChange(evt) {
    evt.setMinutes(0);
    evt.setHours(0);
    evt.setSeconds(0);
    evt.setMilliseconds(0);
    
    setDate(evt);
    setErr(null);
    if (props.onChange) {
      props.onChange(evt);
    }
  }

  useEffect(() => {
    if (props.date) {
      let valid;
      try {
        valid = new Date(props.date);
      } catch(e) {
        return;
      }
      setDate(valid);
      setFocusYear(valid);
    }

    if (props.error) {
      setErr(props.error);
    }
  }, [props]);

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
    max.setMinutes(0);
    max.setHours(0);
    max.setSeconds(0);
    max.setMilliseconds(0);

    setMinDate(min);
    setMaxDate(max);
    setFocusYear(max);
    
  }, []);

  let showErr = false;

  if (err) {
    showErr = true;
  }

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
                  error={showErr}
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
                  helperText={err}
                  color="primary"
                />
              </Grid>
              <Grid item xs={4}>
                <DatePicker
                  error={showErr}
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
                  helperText={err}
                  color="primary"
                />
              </Grid>
              <Grid item xs={4}>
                <DatePicker
                  error={showErr}
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
                  helperText={err}
                  color="primary"
                />
              </Grid>
            </Grid>
          </MuiPickersUtilsProvider>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}