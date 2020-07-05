import 'date-fns';
import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import { Grid, TextField, Button, Slider, Box, Typography, InputAdornment, Switch, LinearProgress } from '@material-ui/core';
import MonetizationOnRounded from '@material-ui/icons/MonetizationOnRounded';
import { makeStyles } from '@material-ui/core/styles';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import Editor from '../editor';
import log from '../../log';
import * as Course from '../../api/course';
import * as utils from '../../utils';
import path from '../../routes/path';

const useStyles = makeStyles((theme) => ({
  root: {},
  slider: {
    width: 200,
  },
  durSlider: {
    width: 200,
  },
  title: {
    width: "100%",
  },
  type: {
    width: 200,
  },
  cost: {
    width: 200,
  },
  btn: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  }
}));

export default function (props) {

  const classes = useStyles();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [courseType, setCourseType] = useState('');
  const [cost, setCost] = useState("20.00");
  const [spots, setSpots] = useState(20);
  const [duration, setDuration] = useState(60);
  const [selectedDate, setSelectedDate] = useState(null);
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (props.courseTitle) setTitle(props.courseTitle);
    if (props.courseType) setCourseType(props.courseType);
    if (props.cost) setCost(props.cost);
    if (props.spots) setSpots(props.spots);
    if (props.selectedDate) setSelectedDate(props.date);
    if (props.recurring) setRecurring(true);
  }, [props]);

  const titleHandler = function (e) {
    setTitle(e.target.value)
  }

  const typeHandler = function (e) {
    setCourseType(e.target.value);
  }

  const costHandler = function (e) {
    setCost(e.target.value);
  }

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSpotsSlider = function (e) {
    let value = Number(e.target.innerText);

    if (value) {
      setSpots(value);
    } else {
      setSpots(20);
    }
  }

  const handleDurationSlider = function (e) {
    let value = Number(e.target.innerText);

    if (value) {
      setDuration(value);
    } else {
      setDuration(20);
    }
  }

  const editorHandler = function (e) {
    setDescription(e);
  }

  const recurringHandler = function (e) {
    if (recurring) {
      setRecurring(false);
    } else {
      setRecurring(true);
    }
  }

  const editorSaveHandler = async function (e) {
    setLoader(true);

    let data = {
      description: description,
    };

    try {
      await Course.update(data);
    } catch (err) {
      // TODO: display error
      return log.error("COURSE EDIT:: save course description", err);
    }

    setLoader(false);
  }

  const formHandler = async function (e) {
    e.preventDefault();

    if (!props.instructorId) {
      log.debug("COURSE EDIT:: no instructor set");
      return;
    }

    setLoader(true);

    let data = {
      instructor: props.instructorId,
      photo_url: props.photoUrl,
      title: title,
      description: description,
      type: courseType,
      cost: cost,
      total_spots: spots,
      duration: duration,
    }

    if (selectedDate && selectedDate.toISOString) {
      data.start_date = selectedDate.toISOString();
    }

    if (recurring) {
      let rule = utils.getWeeklyCronRule(data.start_date);
      data.recurring = rule;
    }

    if (props.courseId) {

      try {
        await Course.update(props.courseId, data)
      } catch (e) {
        setLoader(false);
        // TODO: display error
        return log.error("COURSE EDIT:: course update", e);
      }

      setLoader(false);
      history.push(path.courses + "/" + props.courseId);

    } else {

      let created;

      try {
        created = await Course.create(data)
      } catch (e) {
        setLoader(false);
        // TODO: display error
        return log.error("COURSE EDIT:: course creation", e);
      }

      setLoader(false);
      history.push(path.courses + "/" + created.data.id);
    }
  }

  let costContent = (
    <Grid item xs>
      <TextField
        disabled={loader}
        color="secondary"
        required
        id="cost"
        type="text"
        label="Cost"
        variant="outlined"
        className={classes.cost}
        value={cost}
        onChange={costHandler}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MonetizationOnRounded />
            </InputAdornment>
          ),
        }}
      />
    </Grid>
  );

  if (props.costDisabled) {
    costContent = null;
  }

  let spotsContent = (
    <Grid item xs>
      <Box>
        <Typography variant="subtitle2">{spots} spots</Typography>
      </Box>
      <Slider disabled={loader} className={classes.slider} defaultValue={20} min={5} max={20} step={1} valueLabelDisplay="auto" onChangeCommitted={handleSpotsSlider} />
    </Grid>
  );

  if (props.spotsDisabled) {
    spotsContent = null;
  }

  let loaderContent = null;

  if (loader) {
    loaderContent = (
      <Grid item xs={12}>
        <LinearProgress color="secondary" />
      </Grid>
    )
  }

  let form = (
    <Grid className={classes.root}>
      <form onSubmit={formHandler}>
        <Grid container spacing={2} justify="flex-start" alignItems="flex-end">
          <Grid item xs>
            <TextField disabled={loader} className={classes.type} color="secondary" required id="type" type="text" label="Class Type" variant="outlined" value={courseType} onChange={typeHandler} />
          </Grid>
          {costContent}
          {spotsContent}
          <Grid item xs>
            <Box>
              <Typography variant="subtitle2">{duration} minutes</Typography>
            </Box>
            <Slider disabled={loader} className={classes.durSlider} defaultValue={60} min={30} max={60} step={15} valueLabelDisplay="auto" onChangeCommitted={handleDurationSlider} />
          </Grid>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid item xs>
              <KeyboardDatePicker disabled={loader} variant="inline" format="MM/dd/yyyy" margin="normal" id="date" label="Date" value={selectedDate} onChange={handleDateChange} />
            </Grid>
            <Grid item xs>
              <KeyboardTimePicker disabled={loader} variant="inline" margin="normal" id="time" label="Time" value={selectedDate} onChange={handleDateChange} />
            </Grid>
          </MuiPickersUtilsProvider>
          <Grid item xs>
            <Switch
              checked={recurring}
              onChange={recurringHandler}
            />
            <Typography variant="subtitle2">Weekly Class</Typography>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField disabled={loader} className={classes.title} color="secondary" required id="title" type="text" label="Title" variant="outlined" value={title} onChange={titleHandler} />
          </Grid>
          <Grid item xs={12}>
            <Editor value={props.description} id="description" label="Description *" onChange={editorHandler} onSave={editorSaveHandler} />
          </Grid>
          {loaderContent}
          <Grid>
            <Button disabled={loader} className={classes.btn} type="submit" variant="contained" color="secondary">Create</Button>
          </Grid>
        </Grid>
      </form>
    </Grid>
  );

  return form;
}