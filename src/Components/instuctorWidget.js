import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Grid, GridList, GridListTile, GridListTileBar, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import * as Instructor from '../api/instructor';
import log from '../log';
import path from '../routes/path';

const useStyles = makeStyles((theme) => ({
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

      let result = null;
      let limit = 100;

      if (props.limit) {
        limit = props.limit;
      }

      try {
        result = await Instructor.getAll(limit);
      } catch(err) {
        log.error("INSTRUCTOR WIDGET:: query", err);
      }

      if (result && result.total > 0) {
        setData(result);
      }

      log.debug("INSTRUCTOR WIDGET:: got result", result);
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

    data.data.forEach(function(i) {
      let info = {
        photo: i.photo_url,
        firstName: i.first_name,
        url: path.profile + "/" + i.id,
        id: i.id,
      };

      items.push(info);
    });

   
    content = (
      <GridList cellHeight={250} cols={5} >
      {items.map(instructor => (
        <GridListTile key={instructor.id} cols={1}>
          <Link className={classes.anchor} to={instructor.url}>
            <Grid container>
              <img alt={instructor.firstName} className={classes.photo} src={instructor.photo} />
              <GridListTileBar
                title={instructor.firstName}
                subtitle="See Schedule"
                className={classes.desc}
              />
            </Grid>
          </Link>
        </GridListTile>
      ))}
      </GridList>
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