import React, { useEffect, useState, useRef } from 'react';
import { 
  Grid,
  Typography,
  Button,
  useMediaQuery
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { format} from 'date-fns';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useHistory } from 'react-router-dom';
import { RibbonContainer,  LeftCornerRibbon } from "react-ribbons";

import path from '../routes/path';
import { getNextDate } from '../utils';
import { store, actions } from '../store';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  container: {
    position: 'relative',
    paddingBottom: theme.spacing(4),
    width: '100%'
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
    height: 93,
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
    fontWeight: "bold",
    background: "rgb(0,0,0,0.7)",
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
    lineHeight: '1.3em',
    height: 60,
    color: "white",
    fontWeight: 300,
    '@media (max-width: 400px)': {
      height: 67,
      lineHeight: '1.1em'
    }
  },
  header: {
    paddingBottom: theme.spacing(2)
  },
  listContainer: {
    background: theme.palette.common.background,
    borderRadius: 7,
    border: '0.5px solid ' + theme.palette.common.border,
    width: 'inherit',
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
  },
  listLabel: {
    paddingBottom: theme.spacing(2),
  },
  listTile: {
    width: 'inherit',
    height: 116,
    flexWrap: 'nowrap',
    alignItems: 'center',
    borderBottom: '0.5px solid ' + theme.palette.common.border,
  },
  listTileNoBottom: {
    width: 'inherit',
    height: 116,
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  listButton: {
    background: theme.palette.secondary.contrastText,
    color: theme.palette.secondary.main,
    height: 40,
    width: 128,
    borderRadius: 2,
    marginRight: theme.spacing(3),
    marginLeft: theme.spacing(2),
    '@media (max-width: 600px)': {
      width: 50,
      height: 40,
    },
  },
  classTime: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    width: 180,
    textAlign: 'center',
    '@media (max-width: 600px)': {
      marginLeft: 0,
    },
  },
  imageCtn: {
    marginRight: theme.spacing(3),
    marginLeft: 0,
    width: 63,
    height: 93,
    '@media (max-width: 600px)': {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
  image: {
    maxWidth: 63,
    maxHeight: 93,
    borderRadius: 7,
  },
  tileTextColumn: {
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: 'inherit',
    color: theme.palette.primary.main
  },
  ribbonCtn: {
    left: 8
  }
}));

const dataSelector = createSelector([(state) => state.courseFeature], (data) => {
  return data;
});

export default function CourseFeature(props) {

  const { id, schedule } = props;
  const classes = useStyles();
  const cached = useSelector((state) => dataSelector(state));
  const [data, setData] = useState(null);
  const [formatted, setFormatted] = useState([]);
  const [header, setHeader] = useState(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [displayData, setDisplayData] = useState([]);
  const small = useMediaQuery('(max-width:600px)');
  const history = useHistory();
  const formattedRef = useRef();
  const indexRef = useRef();


  formattedRef.current = formatted;
  indexRef.current = displayIndex;

  let content = null;
  let headerContent = null;
  let formContent = null;

  useEffect(() => {
    if (props.header) {
      setHeader(props.header);
    }

    if (props.items) {
      setData(props.items);
    }
  }, [props]);

  useEffect(() => {
    let disp = formatted.slice(displayIndex);
    setDisplayData(disp.concat([]));
  }, [formatted, displayIndex]);

  useEffect(() => {
    if (!cached.filter || formatted.length > 0) return;
    
    let c = cached.filter(item => item.id === id)[0];
    if (c && c.data && c.index) {
      setFormatted(c.data);
      setDisplayIndex(c.index);
    }
  }, [formatted, cached]);

  useEffect(() => {
    store.dispatch(actions.courseFeature.set({
      id: id,
      data: formatted,
      index: displayIndex,
    }));
  }, [formatted, displayIndex]);

  useEffect(() => {
    if (data) {
      getCourseDataItems();
    }
  }, [data, schedule]);

  function getCourseDataItems () {
    let items = []
    data.forEach(function(course) {
      let data = {
        title: course.title,
        url: path.courses + "/" + course.id,
        id: course.id,
        duration: course.duration + " minutes",
        cost: '$' + course.cost,
        type: course.type
      };

      if (course.photo_url) {
        data.photo_url = course.photo_url;
      }

      let now = new Date();
      let d = new Date(course.start_date);

      if (now > d && course.recurring) {
        d = getNextDate(course.recurring, 1);
      }

      data.date = d.getTime();

      let time = format(d, "h:mm a");
      data.time = time;

      if (course.available_spots === 0) {
        data.banner = 'SOLD OUT';
      } else if (course.available_spots <= 5) {
        data.banner = course.available_spots + ' spots left!';
      }  
      
      if (schedule.length > 0 && schedule.includes(course.id)) {
        data.banner = "You're in!";
      }

      if (course.instructor_name) {
        data.instructor = course.instructor_name;
      }

      items.push(data);
    });

    setFormatted(items.sort(function(a,b) {
      return a.date - b.date;
    }).concat([]));
  }

  function viewClassHandler(url) {
    history.push(url);
  }

  if(header) {
    headerContent = (
      <Grid>
        <Typography className={classes.header} variant="body2">
          {header}
        </Typography>
      </Grid>
    )
  }

  let courseListContent;
  if (displayData) {
    const lastClass = displayData[displayData.length - 1];
    const listContent = displayData.map(course => {

      let nameContent;
      // Only necessary while courses are starting to be created with name 3/1/21
      if (course.instructor) {
        nameContent = (
          <Typography variant='body2' noWrap={true} style={{paddingRight: 5}}>{course.instructor} </Typography> 
        );
      }
      let typeContent;
      // likely will need more logic for classes with multi types
      if (course.type) {
        typeContent = (
          <Typography variant='body1' noWrap={true}>| {course.type}</Typography>
        );
      }
      let durationContent;
      if (course.duration) {
        durationContent = (
          <Typography variant='body1' noWrap={true} style={{paddingRight: 5}}>{course.duration} </Typography>
        )
      }
      let costContent;
      if (course.cost) {
        costContent = (
          <Typography variant='body1' noWrap={true}>| {course.cost}</Typography>
        );
      }
      let timeContent, timeContentMobile;
      if (course.time) {
        if (small) {
          timeContent = null;
          timeContentMobile = (
            <Grid item className={classes.tileTextColumn}>
              <Typography variant='h4'>{course.time}</Typography>
            </Grid>
          );
        } else {
          timeContentMobile = null;
          timeContent = (
            <Grid item className={classes.classTime}>
              <Typography variant='body2'>{course.time}</Typography>
            </Grid>
          )
        }
      }
      let bannerContent;
      if (course.banner || course.label) {
        bannerContent = (
          <RibbonContainer className={classes.ribbonCtn}>
            <LeftCornerRibbon backgroundColor="#8BA173" color="#f0f0f0" fontFamily='Lato'>
              {course.banner}
            </LeftCornerRibbon>
          </RibbonContainer>
        )
      }
      const timeType = small ? 'View' : 'View Class';
      return (
        <Grid 
          container 
          className={course.id === lastClass.id ? classes.listTileNoBottom : classes.listTile} 
          key={course.id}
          onClick={() => viewClassHandler(course.url)}
        >
          {bannerContent}
          {timeContent}
          <Grid item className={classes.imageCtn}>
            <img className={classes.image} src={course.photo_url} alt='Class' />
          </Grid>
          <Grid item className={classes.tileTextColumn}> 
            <Grid container className={classes.tileTextColumn} direction='column'>
              {timeContentMobile}
              <Grid item className={classes.tileTextColumn}>
                <Typography noWrap={true} variant='h4' style={{fontWeight: '300'}}>{course.title}</Typography>
              </Grid>
              <Grid item className={classes.tileTextColumn} style={{display: 'inline-flex', alignItems: 'baseline'}}>
                {nameContent}
                {typeContent}
              </Grid>
              <Grid 
                item 
                className={classes.tileTextColumn} 
                style={{display: 'inline-flex', alignItems: 'baseline', minWidth: 0}}
              >
                {durationContent}
                {costContent}
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Button variant='contained' className={classes.listButton} onClick={() => viewClassHandler(course.url)}>
              {timeType}
            </Button>
          </Grid>
        </Grid>
      )
    });

    courseListContent = (
      <Grid item className={classes.listContainer}>
        {listContent}
      </Grid>
    )
  }

  formContent = (
    <Grid container direction="column" style={{width: "100%"}}>
      <Grid item>
        {headerContent}
      </Grid>
      {courseListContent}
    </Grid>
  );

  if (displayData && displayData.length === 0) {
    if (props.altContent) {
      formContent = props.altContent;
    } else {
      return null;
    }
  }

  content = formContent;

  return (
    <Grid container className={classes.container}>
      {content}
    </Grid>
  );
}