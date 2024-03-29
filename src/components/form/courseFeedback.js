import React, { useState } from 'react';
import { Button, Grid, Typography, LinearProgress, makeStyles } from '@material-ui/core';
import Rating from '@material-ui/lab/Rating';

import * as Course from '../../api/course';
import log from '../../log';

const labels = {
  0.5: 'Useless',
  1: 'Useless',
  1.5: 'Poor',
  2: 'Poor',
  2.5: 'Ok',
  3: 'Ok',
  3.5: 'Good',
  4: 'Good',
  4.5: 'Excellent',
  5: 'Excellent',
};

const useStyles = makeStyles((theme) => ({
  comments: {
    width: "100%",
    fontSize: "1rem",
  },
  label: {
    paddingLeft: theme.spacing(1),
  }
}));

export default function CourseFeedback(props) {

  const classes = useStyles();
  const [ classRating, setClassRating ] = useState(0);
  const [ classHover, setClassHover ] = useState(-1);
  const [ instructorRating, setInstructorRating ] = useState(0);
  const [ instructorHover, setInstructorHover ] = useState(-1);
  const [ videoRating, setVideoRating ] = useState(0);
  const [ videoHover, setVideoHover ] = useState(-1);
  const [ comments, setComments ] = useState(null);
  const [loader, setLoader] = useState(false);
  const { course, sessionId } = props;

  const editorHandler = function (e) {
    setComments(e.target.value);
  }

  async function formHandler(e) {
    e.preventDefault();
    setLoader(true);

    let data = {
      instructorId: course.instructor.id,
      classRating: classRating,
      instructorRating: instructorRating,
      videoRating: videoRating,
    }

    if (comments !== "<p></p>") {
      data.comments = comments;
    }

    log.debug("Feedback form submitted", data);

    try {
      await Course.sendClassFeedback(course.id, sessionId, data);
    } catch (err) {
      log.error("Feedback submit error", err);
      setLoader(false);
      if (props.onSubmit) return props.onSubmit(err);
    }

    setLoader(false);
    if (props.onSubmit) props.onSubmit();
  }

  let classLabelText = labels[classHover] ? labels[classHover] : labels[classRating];
  let instructorLabelText = labels[instructorHover] ? labels[instructorHover] : labels[instructorRating];
  let videoLabelText = labels[videoHover] ? labels[videoHover] : labels[videoRating];

  let classLabel = (
    <Grid item className={classes.label}>
      <Typography variant="subtitle1">{classLabelText}</Typography>
    </Grid>
  );

  let instructorLabel = (
    <Grid item className={classes.label}>
      <Typography variant="subtitle1">{instructorLabelText}</Typography>
    </Grid>
  );

  let videoLabel = (
    <Grid item className={classes.label}>
      <Typography variant="subtitle1">{videoLabelText}</Typography>
    </Grid>
  );

  let progress = null;

  if (loader) {
    progress = (
      <LinearProgress color="primary" />
    );
  }

  return (
    <form onSubmit={formHandler}>
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <Typography variant="body1">How would you rate the class?</Typography>
        </Grid>
        <Grid item>
          <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center">
            <Grid item>
              <Rating
                name="course"
                value={classRating}
                size="large"
                onChange={(e, newValue) => {
                  setClassRating(newValue);
                }}
                onChangeActive={(e, newHover) => {
                  setClassHover(newHover);
                }}
              />
            </Grid>
            {classLabel}
          </Grid>
        </Grid>        
        <Grid item>
          <Typography variant="body1">How was the instructor?</Typography>
        </Grid>
        <Grid item>
          <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center">
            <Grid item>
              <Rating
                name="instructor"
                value={instructorRating}
                size="large"
                onChange={(e, newValue) => {
                  setInstructorRating(newValue);
                }}
                onChangeActive={(e, newHover) => {
                  setInstructorHover(newHover);
                }}
              />
            </Grid>
            {instructorLabel}
          </Grid>
        </Grid>
        <Grid item>
          <Typography variant="body1">How was the video quality?</Typography>
        </Grid>
        <Grid item>
          <Grid container direction="row" justify="flex-start" alignItems="center" alignContent="center">
            <Grid item>
              <Rating
                name="quality"
                value={videoRating}
                size="large"
                onChange={(e, newValue) => {
                  setVideoRating(newValue);
                }}
                onChangeActive={(e, newHover) => {
                  setVideoHover(newHover);
                }}
              />
            </Grid>
            {videoLabel}
          </Grid>
        </Grid>
        <Grid item>
          <Typography variant="body1">Additional comments</Typography>
        </Grid>
        <Grid item>
          <textarea onChange={editorHandler} rows="5" className={classes.comments} />
          {progress}
        </Grid>
        <Grid item>
          <Button variant="contained" type="submit" color="primary" style={{width:"100%"}}>Submit</Button>
        </Grid>
      </Grid>
    </form>
  );
}