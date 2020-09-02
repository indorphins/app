import React from 'react';
import { Grid } from '@material-ui/core';
import StarRatings from 'react-star-ratings';

import log from '../../log';

export default function CourseFeedback() {

  async function formHandler(e) {
    e.preventDefault();

    log.debug("Feedback form submitted", e);
  }

  async function changeRating(e) {
    log.debug("Rating changed", e);
  }

  return (
    <form onSubmit={formHandler}>
      <Grid container direction="column">
        <Grid item>
          <StarRatings
            rating={3}
            starRatedColor="blue"
            changeRating={changeRating}
            numberOfStars={5}
            name='rating'
          />
        </Grid>
      </Grid>
    </form>
  );
}