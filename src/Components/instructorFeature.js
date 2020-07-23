import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Grid, GridList, GridListTile, GridListTileBar, Typography, CircularProgress, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import * as Instructor from '../api/instructor';
import log from '../log';
import path from '../routes/path';

const useStyles = makeStyles((theme) => ({
  loader: {
    minHeight: 300,
  },
  photo: {
    height: 400,
    width: "100%",
    objectFit: "cover",
    //borderRadius: "4px",
    '@media (max-width: 600px)': {
      height: 275,
    },
    '@media (max-width:950px)': {
      height: 325,
    },
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
  const [cols, setCols] = useState(4);
  const [spacing, setSpacing] = useState(10);
  const [height, setHeight] = useState(400);
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
    setHeader(props.header);
  }, [props]);

  useEffect(() => {
    if (small) {
      setCols(2);
      setHeight(275);
      setSpacing(10);
    } else if (med) {
      setCols(3);
      setHeight(325);
      setSpacing(10);
    }else {
      setCols(4);
      setHeight(400);
      setSpacing(10);
    }
  }, [small, med]);

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
        setLoader(false);
        return log.error("INSTRUCTOR WIDGET:: query", err);
      }

      if (result && result.total > 0) {
        setData(result);
      }

      setLoader(false);
      log.debug("INSTRUCTOR WIDGET:: got result", result);
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
    let result = data.data;

    for(let i = (result.length - 1); i > 0; i--) {
      const j = Math.floor(Math.random() * i)
      const temp = result[i]
      result[i] = result[j]
      result[j] = temp
    }

    result.forEach(function(i) {
      let info = {
        photo: i.photo_url,
        firstName: i.first_name,
        url: path.profile + "/" + i.id,
        id: i.id,
      };

      items.push(info);
    });
   
    formContent = (
      <Grid>
        <Grid>
          {headerContent}
        </Grid>
        <GridList cellHeight={height} cols={cols} spacing={spacing}>
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
      </Grid>
    );
  } else {
    formContent = null;
  }

  content = formContent;

  if (loader) {
    content = loaderContent;
  }

  return (
    <Grid container>
      {content}
    </Grid>
  );
}