import React, { useEffect, useState } from 'react';
import { Grid, Button, IconButton, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { isAfter } from 'date-fns'
import * as constants from '../utils/constants'
import { NavigateNext, NavigateBefore } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  pickerCtn: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap',
    paddingBottom: theme.spacing(4),
  },
  dateCtn: {
    display: 'inline-flex',
    width: 'auto',
    flexWrap: 'nowrap'
  },
  dateBtn: {
    borderRadius: 8,
    backgroundColor: theme.palette.common.background,
    color: theme.palette.common.black,
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    width: 110,
    textTransform: 'capitalize',
    boxShadow: 'none',
    '@media (max-width: 730px)': {
      marginLeft: 1,
      marginRight: 1,
      paddingLeft: 0,
      paddingRight: 0,
      width: 75
    }
  },
  dateBtnSelected: {
    borderRadius: 8,
    color: theme.palette.common.background,
    backgroundColor: theme.palette.common.black,
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    width: 110,
    textTransform: 'capitalize',
    boxShadow: 'none',
    '@media (max-width: 730px)': {
      marginLeft: 1,
      marginRight: 1,
      paddingLeft: 0,
      paddingRight: 0,
      width: 75
    }
  },
  hidden: {
    opacity: 0,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    '@media (max-width: 730px)': {
      paddingLeft: 4,
      paddingRight: 4,
    }
  },
  navBtn: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    opacity: 1,
    '@media (max-width: 730px)': {
      paddingLeft: 4,
      paddingRight: 4,
    }
  }
}))

export default function DatePicker(props) {
  const { selectDateHandler, startDate } = props;
  const small = useMediaQuery('(max-width:475px)');
  const med = useMediaQuery('(max-width:1005px)');
  const [dateIndex, setDateIndex] = useState(0);
  const [displayNumber, setDisplayNumber] = useState(7);
  const [referenceDate, setReferenceDate] = useState(startDate); // the first day in the date picker each time
  const dayZero = new Date(startDate);
  const classes = useStyles(); 

  useEffect(() => {
    if (small) {
      setDisplayNumber(3);
    } else if (med) {
      setDisplayNumber(5);
    }else {
      setDisplayNumber(7);
    }
  }, [small, med]);

  const dateClickedHandler = (index) => {
    setDateIndex(index);
    const d = new Date(referenceDate);
    d.setDate(d.getDate() + index);
    selectDateHandler(d)
  }

  const getNext = () => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() + displayNumber);

    setReferenceDate(d)
    setDateIndex(0);
    selectDateHandler(d);
  }

  const getPrev = () => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - displayNumber);

    if (isAfter(dayZero, d)) {
      setReferenceDate(dayZero)
      selectDateHandler(dayZero);
    } else {
      setReferenceDate(d)
      selectDateHandler(d);
    }
    setDateIndex(0);
  }

  const getLabel = (index) => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() + index);
    return `${constants.daysMed[d.getDay()]} ${d.getDate()}`;
  }

  const dateButtons = [];
  for (let i = 0; i < displayNumber; i++) {
    const btn = (
      <Grid item key={`dateBtn-${i}`}>
        <Button variant='contained'
          onClick={() => dateClickedHandler(i)} 
          className={dateIndex === i ? classes.dateBtnSelected : classes.dateBtn}
        >
          <Typography variant='body1'>{getLabel(i)}</Typography>
        </Button>
      </Grid>
    )
    dateButtons.push(btn);
  }

  return (
    <Grid container direction='row' className={classes.pickerCtn}>
      <Grid item>
        <IconButton onClick={getPrev} className={isAfter(referenceDate, dayZero) ? classes.navBtn : classes.hidden}>
          <NavigateBefore />
        </IconButton>
      </Grid>
      <Grid container className={classes.dateCtn} direction='row'>
        {dateButtons}
      </Grid>
      <Grid item>
        <IconButton className={classes.navBtn} onClick={getNext}>
          <NavigateNext />
        </IconButton>
      </Grid>
    </Grid>
  )
}