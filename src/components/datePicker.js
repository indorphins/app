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
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    width: 110,
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
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    width: 110,
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
  const med = useMediaQuery('(max-width:950px)');
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
    d.setDate(d.getDate() + 7);
    setReferenceDate(d)
    setDateIndex(0);
    selectDateHandler(d);
  }

  const getPrev = () => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - 7);
    setReferenceDate(d)
    setDateIndex(0);
    selectDateHandler(d);
  }

  const getLabel = (index) => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() + index);
    return `${constants.daysMed[d.getDay()]} ${d.getDate()}`;
  }


                          //    Make mobile date picker go to two rows

  const dateButtons = [];
  for (let i = 0; i < displayNumber; i++) {
    const btn = (
      <Grid item>
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
        {/* <Grid item>
          <Button variant='contained'
            onClick={() => dateClickedHandler(0)} 
            className={dateIndex === 0 ? classes.dateBtnSelected : classes.dateBtn}
          >
            <Typography variant='body1'>{getLabel(0)}</Typography>
          </Button>
        </Grid>
        <Grid item>
          <Button variant='contained'
            onClick={() => dateClickedHandler(1)} 
            className={dateIndex === 1 ? classes.dateBtnSelected : classes.dateBtn}
          >
            <Typography variant='body1'>{getLabel(1)}</Typography>
          </Button>
        </Grid>
        <Grid item>
          <Button variant='contained'
            onClick={() => dateClickedHandler(2)} 
            className={dateIndex === 2 ? classes.dateBtnSelected : classes.dateBtn}
          >
            <Typography variant='body1'>{getLabel(2)}</Typography>
          </Button>       
        </Grid>
        <Grid item>
          <Button variant='contained'
            onClick={() => dateClickedHandler(3)} 
            className={dateIndex === 3 ? classes.dateBtnSelected : classes.dateBtn}
          >
            <Typography variant='body1'>{getLabel(3)}</Typography>
          </Button>        
        </Grid>
        <Grid item>
          <Button variant='contained'
            onClick={() => dateClickedHandler(4)} 
            className={dateIndex === 4 ? classes.dateBtnSelected : classes.dateBtn}
          >
            <Typography variant='body2'>{getLabel(4)}</Typography>
          </Button>
        </Grid>
        <Grid item>
          <Button variant='contained'
            onClick={() => dateClickedHandler(5)} 
            className={dateIndex === 5 ? classes.dateBtnSelected : classes.dateBtn}
          >
            <Typography variant='body2'>{getLabel(5)}</Typography>
          </Button>
        </Grid>
        <Grid item>
          <Button variant='contained'
            onClick={() => dateClickedHandler(6)} 
            className={dateIndex === 6 ? classes.dateBtnSelected : classes.dateBtn}
          >
            <Typography variant='body2'>{getLabel(6)}</Typography>
          </Button>
        </Grid> */}
      </Grid>
      <Grid item>
        <IconButton className={classes.navBtn} onClick={getNext}>
          <NavigateNext/>
        </IconButton>
      </Grid>
    </Grid>
  )
}