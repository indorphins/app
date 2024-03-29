import React from 'react';
import PropTypes from 'prop-types';
import { Button, Grid, Typography, withStyles, ButtonGroup } from '@material-ui/core';
import { ChevronLeft, ChevronRight, TodayOutlined } from '@material-ui/icons';
import { format, endOfMonth } from 'date-fns';

import Day from './day';
import Weekdays from './weekdays';

const styles = (theme) => ({
  header: {
    width: "14.28%",
    background: theme.palette.grey[200],
    textAlign: "center",
  },
  number: {
    color: 'inherit',
    paddingLeft: theme.spacing(1),
    '@media (max-width: 600px)': {
      fontSize: '1.5rem',
      fontWeight: 300,
      paddingLeft: 0,
    },
  },
  day: {
    width: "14.28%",
    minHeight: 150,
    overflow: "hidden",
    background: theme.palette.grey[100],
    padding: 2,
    '@media (max-width: 900px)': {
      minHeight: 120,
    },
    '@media (max-width: 600px)': {
      minHeight: 60,
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  noday: {
    background: theme.palette.grey[300],
  },
  today: {
    color: theme.palette.grey[50],
    background: theme.palette.grey[400],
  },
  month: {
    background: theme.palette.grey[300],
  },
  button: {
    backgroundImage: "none",
    '@media (max-width: 600px)': {
      padding: theme.spacing(1),
    },
  },
  eventIndicator: {
    width: 8,
    height: 8,
    background: theme.palette.secondaryColor.main,
    borderRadius: "50%",
    display: "inline-block",
    position: "relative",
    bottom: 2,
  },
  eventCard: {
    padding: theme.spacing(1),
    overflow: "hidden",
    width: "100%",
  },
  eventCardSml: {
    padding: 2,
  },
  eventCardList: {
    padding: theme.spacing(1),
  },
  timeLbl: {
    fontSize: "1rem",
    fontWeight: "bold",
    '@media (max-width: 900px)': {
      fontSize: "0.9rem",
    }
  },
  timeLblSml: {
    fontSize: "0.8rem",
    '@media (max-width: 900px)': {
      fontSize: "0.7rem",
    }
  },
  titleLbl: {
    fontSize: "1.1rem",
    whiteSpace: "break-spaces",
    minWidth: 0,
    '@media (max-width: 900px)': {
      fontSize: "1rem",
    },
  },
  titleLblSml: {
    fontSize: "1rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    '@media (max-width: 900px)': {
      fontSize: "0.9rem",
    }
  },
  dateLbl: {
    padding: theme.spacing(1),
  },
  link: {
    textDecoration: "none",
    width: "100%",
  },
  agenda: {
    width: "100%",
  },
  hidden: {
    display: "none",
  },
  selected: {
    //backgroundColor: theme.palette.grey[600],
  }
});

class Calendar extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      viewDate: null,
      today: null,
      view: "month",
      events: [],
      content: null,
    }

    if (props.viewDate) {
      this.state.viewDate = new Date(props.viewDate);
    }

    if (props.events && Array.isArray(props.events)) {
      this.state.events = this.parseEvents(props.events);
    }

    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
    this.today = this.today.bind(this);
  }

  componentDidMount() {
    this.setState({today: new Date()});
    if (!this.state.viewDate) {
      this.setState({viewDate: new Date()});
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.events && this.props.events !== prevProps.events) {
      let eventList = this.parseEvents(this.props.events);
      this.setState({events: eventList});
    }
  }

  parseEvents = function(events) {
    return events.map(item => {
      let start = new Date(item.start);
      let end = new Date(item.end);
      let day = new Date(start.getFullYear(), start.getMonth(), start.getDate());

      item.startTime = format(start, "h:mmaaaaa");
      item.endTime = format(end, "h:mmaaaaa");

      item.start = start;
      item.end = end;
      item.day = day;
      return item;
    });
  }

  today = function() {
    let d = new Date(this.state.today);
    this.setState({viewDate: d});
  }

  prev = function() {
    let m = new Date(this.state.viewDate);
    m.setMonth(m.getMonth() - 1);
    this.setState({viewDate: m});
  }

  next = function() {
    let m = new Date(this.state.viewDate);
    m.setMonth(m.getMonth() + 1);
    this.setState({viewDate: m});
  }

  monthView = function() {
    const { classes } = this.props;
    let content = null;
    let first = new Date(this.state.viewDate.getFullYear(), this.state.viewDate.getMonth(), 1);
    let firstDay = first.getDay();
    let end = endOfMonth(this.state.viewDate);
    let lastDay = end.getDate();
    let i = 1;
    let t = new Date(this.state.today.getFullYear(), this.state.today.getMonth(), this.state.today.getDate());
    let days = [];

    for (let j = 0; j < firstDay; j++) {
      days.push({key: j + "noday", className: `${classes.day} ${classes.noday}`})
    }

    while (i <= lastDay) {
      let classNames = `${classes.day}`;
      const d = new Date(this.state.viewDate.getFullYear(), this.state.viewDate.getMonth(), i);

      if (d.getTime() === t.getTime()) {
        classNames = classNames + ` ${classes.today}`;
      }

      let data = {key: i, day: i, className: classNames, date: d};

      let matchedEvents = this.state.events.filter(item => {
        return item.day.getTime() === d.getTime();
      });

      data.events = matchedEvents;
      days.push(data);
      i++;
    }

    if (days.length <= 35) {
      while (days.length < 35) {
        days.push({key: days.length + 1 + "noday", className: `${classes.day} ${classes.noday}`});
      }
    } else {
      while (days.length < 42) {
        days.push({key: days.length + 1 + "noday", className: `${classes.day} ${classes.noday}`});
      }
    }

    content = (
      <Grid>
        <Weekdays classes={classes} />
        <Grid container direction="row" className={classes.month}>
          {days.map(d => (
            <Day
              id={d.key}
              key={d.key}
              className={d.className}
              classes={classes}
              day={d.day}
              date={d.date}
              events={d.events}
            />
          ))}
        </Grid>
      </Grid>
    );

    return content;
  }

  render() {
    const { classes } = this.props;
    if (!this.state.viewDate) return null;
    let content = this.monthView(this.state.events);
    let month = format(this.state.viewDate, 'MMMM, yyyy');

    let controls = (
      <Grid container direction="row">
        <Grid item>
          <ButtonGroup variant="contained" color="primary">
            <Button onClick={this.prev} title="Previous" classes={{root: classes.button}}>
              <ChevronLeft />
            </Button>
            <Button onClick={this.today} title="Today" classes={{root: classes.button}}>
              <TodayOutlined />
            </Button>
            <Button onClick={this.next} title="Next" classes={{root: classes.button}}>
              <ChevronRight />
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );


    return (
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Grid container direction="row" justify="space-between" alignItems="center" spacing={2}>
            <Grid item>
              <Typography variant="h3" align="center">{month}</Typography>
            </Grid>
            <Grid item>
              {controls}
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          {content}
        </Grid>
      </Grid>
    );
  }
}

Calendar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Calendar);