import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Grid, GridList, GridListTile, GridListTileBar, Typography, CircularProgress, IconButton } from '@material-ui/core';
import {Info} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns'

import * as Course from '../api/course';
import log from '../log';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
  },
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
  },
  loader: {
    minHeight: 250,
  },
  photo: {
    height: 250,
    width: "100%",
    objectFit: "cover",
    borderRadius: "4px",
  },
  desc: {
    fontWeight: "bold"
  },
  anchor: {
    textDecoration: "none",
  }
}));

export default function(props) {

  const classes = useStyles();
  const [data, setData] = useState(null);
  const [header, setHeader] = useState(null);

  useEffect(() => {
    if (props.header) {
      setHeader(props.header);
    }
  }, [props])

  useEffect(() => {

    const init = async function() {

      let filter = props.filter;
      let order = props.order;
      let result = null;
      let limit = 100;

      if (props.limit) {
        limit = props.limit;
      }

      try {
        result = await Course.query(filter, order, limit);
      } catch(err) {
        log.error("COURSE WIDGET:: query for courses", filter, order, err);
      }

      if (result && result.total > 0) {
        setData(result);
      }

      log.debug("COURSE WIDGET:: got result", result);
    }

    init();
  }, []);


  let headerContent = null;
  let content = (
    <Grid  className={classes.loader} container direction="row" justify="center" alignItems="center">
      <CircularProgress color="secondary" />
    </Grid>
  );

  if(header) {
    headerContent = (
      <Grid>
        <Typography className={classes.header} variant="h6">
          {header}
        </Typography>
      </Grid>
    )
  }

  if (data) {
    let items = [];

    data.data.forEach(function(course) {
      let data = {
        title: course.title,
        url: "/class/" + course.id,
        id: course.id,
      };

      if (course.photo_url) {
        data.photo_url = course.photo_url;
      }

      if (course.start_date) {
        let d = new Date(course.start_date);

        let dt = format(d, "iiii")
        let time = format(d, "h:mm a")

        data.label = "BOOK: " + dt + " @ " + time;
      }

      items.push(data);
    });

   
    content = (
      <div className={classes.root}>
        <GridList cellHeight={250} className={classes.gridList} cols={4.5} >
        {items.map(course => (
            <GridListTile key={course.id} cols={1}>
              <Link className={classes.anchor} to={course.url}>
              <Grid container>
                <img alt={course.title} className={classes.photo} src={course.photo_url} />
                <GridListTileBar
                  title={course.title}
                  subtitle={course.label}
                  className={classes.desc}
                  actionIcon={
                    <IconButton color="secondary" aria-label={`info about ${course.title}`}>
                      <Info />
                    </IconButton>
                  }
                />
              </Grid>
              </Link>
            </GridListTile>
        ))}
        </GridList>
      </div>
    );
  }

  return (
    <Grid container>
      <Grid>
        {headerContent}
      </Grid>
      <Grid container>
        {content}
      </Grid>
    </Grid>
  );
}