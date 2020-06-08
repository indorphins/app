import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Grid, GridList, GridListTile, GridListTileBar, Typography, CircularProgress, IconButton, useMediaQuery } from '@material-ui/core';
import {Info} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns'

import * as Course from '../api/course';
import log from '../log';
import path from '../routes/path';
import { getNextDate } from '../utils';

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
    '@media (max-width: 600px)': {
      height: 180,
    }
  },
  desc: {
    fontWeight: "bold"
  },
  anchor: {
    textDecoration: "none",
  }
}));

export default function(props) {

  const small = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:950px)');
  const classes = useStyles();
  const [data, setData] = useState(null);
  const [header, setHeader] = useState(null);
  const [cols, setCols] = useState(4.25);
  const [spacing, setSpacing] = useState(40);
  const [height, setHeight] = useState(250);
  const [loader, setLoader] = useState(true);

  let content = null;
  let headerContent = null;
  let formContent = null;
  let loaderContent = (
    <Grid  className={classes.loader} container direction="row" justify="center" alignItems="center">
      <CircularProgress color="secondary" />
    </Grid>
  );

  useEffect(() => {
    if (props.header) {
      setHeader(props.header);
    }
  }, [props]);

  useEffect(() => {
    if (small) {
      setCols(2.25);
      setSpacing(10);
      setHeight(180)
    } else if (med) {
      setCols(3.25);
      setSpacing(20);
      setHeight(250);
    }else {
      setCols(4.5);
      setSpacing(40);
      setHeight(250);
    }
  }, [small, med]);

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
        setLoader(false);
        return log.error("COURSE WIDGET:: query for courses", filter, order, err);
      }

      if (result && result.total > 0) {
        setData(result);
      }

      setLoader(false);
      log.debug("COURSE WIDGET:: got result", result);
    }

    init();
  }, []);


  if(header) {
    headerContent = (
      <Grid>
        <Typography className={classes.header} variant="h5">
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
        url: path.courses + "/" + course.id,
        id: course.id,
      };

      if (course.photo_url) {
        data.photo_url = course.photo_url;
      }

      let now = new Date();
      let d = new Date(course.start_date);;

      if (now > d && course.recurring) {
        d = getNextDate(course.recurring, 1);
      }

      let dt = format(d, "iiii");
      let time = format(d, "h:mm a");

      if (d.getDate() - now.getDate() >= 7) {
        dt = format(d, "M/d");
      }

      data.label = "BOOK: " + dt + " @ " + time;

      items.push(data);
    });

   
    formContent = (
      <div className={classes.root}>
        <GridList cellHeight={height} className={classes.gridList} cols={cols} spacing={spacing}>
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
  } else {
    formContent = (
      <Grid className={classes.loader} container direction="row" justify="center" alignItems="center">
        <Typography variant="h5">
          No results
        </Typography>
      </Grid>
    );
  }

  content = formContent;

  if (loader) {
    content = loaderContent;
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