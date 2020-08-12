import React, { useEffect, useState, useRef } from 'react';
import { Link } from "react-router-dom";
import { 
  Grid,
  GridList,
  GridListTile,
  GridListTileBar,
  Typography,
  CircularProgress,
  IconButton,
  Fab,
  useMediaQuery
} from '@material-ui/core';
import { InfoOutlined, ArrowForward, ArrowBack } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { format, isTomorrow, isToday, differenceInDays } from 'date-fns'

import * as Course from '../api/course';
import log from '../log';
import path from '../routes/path';
import { getNextDate } from '../utils';

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: 'hidden',
    width: "100%",
  },
  container: {
    position: 'relative',
    width: '100%,'
  },
  nextPageBtn: {
    position: 'absolute',
    width: "42px",
    height: "42px",
    right: '-20px',
    bottom: '40%',
    zIndex: '9',
    '@media (max-width: 600px)': {
      width: "36px",
      height: "36px",
      right: "-12px",
    },
    '@media (min-width:1300px)': {
      width: "56px",
      height: "56px",
      right: "-28px",
    },
  },
  prevPageBtn: {
    position: 'absolute',
    width: "42px",
    height: "42px",
    left: '-20px',
    bottom: '40%',
    zIndex: '9',
    '@media (max-width: 600px)': {
      width: "32px",
      height: "32px",
      left: "-12px",
    },
    '@media (min-width:1300px)': {
      width: "56px",
      height: "56px",
      left: "-28px",
    },
  },
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
  },
  loader: {
    minHeight: 300,
  },
  photo: {
    height: 400,
    width: "100%",
    objectFit: "cover",
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
  },
  noWrap: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    '@media (max-width: 600px)': {
      height: 50,
      wordWrap: "break-word",
      whiteSpace: "break-spaces",
      display: "-webkit-box",
      '-webkit-line-clamp': 2,
      '-webkit-box-orient': "vertical",
    },
    '@media (max-width: 400px)': {
      fontSize: "1.1rem",
    }
  },
  textWrap: {
    whiteSpace: "break-spaces",
    fontSize: "1rem",
    '@media (max-width: 400px)': {
      height: 40,
    }
  }
}));

export default function CourseFeature(props) {

  const small = useMediaQuery('(max-width:600px)');
  const med = useMediaQuery('(max-width:950px)');
  const classes = useStyles();
  const [data, setData] = useState(null);
  const [formatted, setFormatted] = useState([]);
  const [header, setHeader] = useState(null);
  const [cols, setCols] = useState(4);
  const [spacing, setSpacing] = useState(0);
  const [height, setHeight] = useState(400);
  const [loader, setLoader] = useState(true);
  const [displayNumber, setDisplayNumber] = useState(4);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [displayData, setDisplayData] = useState([]);

  const formattedRef = useRef();
  const displayNumberRef = useRef();
  const indexRef = useRef();
  formattedRef.current = formatted;
  displayNumberRef.current = displayNumber;
  indexRef.current = displayIndex;

  let content = null;
  let headerContent = null;
  let formContent = null;
  let loaderContent = (
    <Grid  className={classes.loader} container direction="row" justify="center" alignItems="center">
      <CircularProgress color="secondary" />
    </Grid>
  );

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

  useEffect(() => {
    if (props.header) {
      setHeader(props.header);
    }
  }, [props]);

  useEffect(() => {
    if (small) {
      setCols(2);
      //setSpacing(10);
      setDisplayNumber(2);
      setHeight(275)
    } else if (med) {
      setCols(3);
      setDisplayNumber(3);
      //setSpacing(20);
      setHeight(325);
    }else {
      setCols(4);
      setSpacing(0);
      setDisplayNumber(4);
      setHeight(400);
    }
  }, [small, med]);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    let disp = formatted.slice(displayIndex, displayIndex + displayNumber);
    setDisplayData(disp.concat([]));
  }, [formatted, displayIndex, displayNumber]);


  useEffect(() => {
    if (data) {
      let items = []
      data.data.forEach(function(course) {
        let data = {
          title: course.title,
          url: path.courses + "/" + course.id,
          id: course.id,
        };

        if (course.available_spots === 0) {
          data.title = 'SOLD OUT: ' + data.title;
        }

        if (course.photo_url) {
          data.photo_url = course.photo_url;
        }

        let now = new Date();
        let d = new Date(course.start_date);

        if (now > d && course.recurring) {
          d = getNextDate(course.recurring, 1);
        }

        let dt = format(d, "iiii");
        let time = format(d, "h:mma");

        if (differenceInDays(d, now) >= 7) {
          dt = format(d, "M/d");
        }

        if (isTomorrow(d)) {
          dt = "Tomorrow";
        }
  
        if (isToday(d)) {
          dt = "Today";
        }

        data.label = dt + " @ " + time;

        items.push(data);
      });

      setFormatted(items.concat([]));
    }
  }, [data]);

  function getNext() {
    let index = indexRef.current + displayNumberRef.current;

    if (index > formatted.length - 1) {
      return;
    }

    let outer = index + displayNumberRef.current - 1;

    let display = formatted.slice(index, outer);
    if (outer > formatted.length - 1) {
      display = formatted.slice(index);
    }

    setDisplayData(display.concat([]));
    setDisplayIndex(index)
  }

  function showNext() {

    let index = indexRef.current + displayNumberRef.current - 1;

    if (formattedRef.current.length > index + 1) {
      return true;
    }

    return false;
  }

  function getPrev() {
    let index = indexRef.current - displayNumberRef.current;

    if (index < 0) {
      index = 0;
    }

    let outer = index + displayNumberRef.current;

    let display = formatted.slice(index, outer);
    if (outer > formatted.length - 1) {
      display = formatted.slice(index);
    }

    setDisplayData(display.concat([]));
    setDisplayIndex(index)
  }

  function showPrev() {
    if (indexRef.current > 0) {
      return true;
    }

    return false;
  }

  if(header) {
    headerContent = (
      <Grid>
        <Typography className={classes.header} variant="h5">
          {header}
        </Typography>
      </Grid>
    )
  }

  let nextBtn = null;

  if (showNext()) {
    nextBtn = (
      <Fab onClick={getNext} className={classes.nextPageBtn}>
        <ArrowForward />
      </Fab>
    );
  }

  let prevBtn = null;

  if (showPrev()) {
    prevBtn = (
      <Fab onClick={getPrev} className={classes.prevPageBtn}>
        <ArrowBack />
      </Fab>
    );
  }

  let infoIcon = null;

  if (!small) {
    infoIcon = (
      <IconButton color="primary">
        <InfoOutlined />
      </IconButton>
    );
  }

  formContent = (
    <Grid container style={{width: "100%"}}>
      <Grid>
        {headerContent}
      </Grid>
      <div className={classes.root}>
        {prevBtn}
        <GridList cellHeight={height} className={classes.gridList} cols={cols} spacing={spacing}>
          {displayData.map(course => (
            <GridListTile key={course.id} cols={1}>
              <Link className={classes.anchor} to={course.url}>
                <Grid container>
                  <img alt={course.title} className={classes.photo} src={course.photo_url} />
                  <GridListTileBar
                  title={course.title}
                  subtitle={course.label}
                  className={classes.desc}
                  classes={{title: classes.noWrap, subtitle: classes.textWrap}}
                  actionIcon={infoIcon}
                  />
                </Grid>
              </Link>
            </GridListTile>
        ))}
        </GridList>
        {nextBtn}
      </div>
    </Grid>
  );

  if (displayData && displayData.length === 0) {
    formContent = null;
  }

  content = formContent;

  if (loader) {
    content = loaderContent;
  }

  return (
    <Grid container className={classes.container}>
      {content}
    </Grid>
  );
}