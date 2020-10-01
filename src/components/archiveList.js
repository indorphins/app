import React, { useEffect, useState } from 'react';
import { fetchArchive } from '../api/session';
import { Grid, Typography, Button, Card, makeStyles } from '@material-ui/core';
import log from '../log';

const useStyles = makeStyles((theme) => ({
  cardContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    cursor: "default",
    backgroundColor: theme.palette.grey[200],
  },
  archives: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  row: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
}));

export default function ArchiveList(props) {
  const [sessionsList, setSessionsList] = useState([]);
  const [archives, setArchives] = useState();
  const { sessions } = props;
  const classes = useStyles();

  useEffect(() => {
    setSessionsList(sessions);
  }, [sessions])

  const fetchArchiveHandler = (id) => {
    fetchArchive(id).then(archives => {
      setArchives(archives);
    }).catch(err => {
      log.warn("ERROR fetching archives ", err);
    })
  }

  let sessionsContent;

  if (sessionsList && sessionsList.length > 0) {
    sessionsContent = sessionsList.map(item => {
      const date = new Date(item.start_date);
      const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      return (
        <Grid container direction='row' alignItems='center' spacing={3} className={classes.row} key={item.session_id}>
          <Grid item>
            <Typography>{`Class: ${item.classTitle}`}</Typography>
          </Grid>
          <Grid item>
            <Typography>{`Date: ${dateStr}`}</Typography>
          </Grid>
          <Grid item>
            <Button variant='contained' onClick={() => fetchArchiveHandler(item.session_id)}>Get Archive</Button>
          </Grid>
        </Grid>
      )}
  )}

  let resultContent;

  if (archives) {
    const archiveContent = (
      archives.map(url => {
        return (
          <Grid item key={url}>
            <a href={url}>{url}</a>
          </Grid>
        )
      })
    );

    resultContent = (
      <Card className={classes.archives}>
        {archiveContent}
      </Card>
    )
  }

  return (
    <Card className={classes.cardContainer} xs={2}>
      <Grid container direction='column'>
        <Grid item>
          <Typography variant="h2">
            Archives
          </Typography>
        </Grid>
        {sessionsContent}
      </Grid>
      {resultContent}
    </Card>
  )
}