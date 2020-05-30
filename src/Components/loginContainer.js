import React from "react";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.primary.main,
	},
	paperContainer: {
		paddingLeft: theme.spacing(4),
		paddingRight: theme.spacing(4),
		paddingTop: theme.spacing(6),
		paddingBottom: theme.spacing(2),
	}
}));

export default function(props) {

  const classes = useStyles();

  return (
		<Grid className={classes.root}>
			<Grid 
				container
				spacing={0}
				direction="column"
				alignItems="center"
				justify="center"
				style={{ minHeight: '100vh' }}
			>
				<Paper elevation={2} className={classes.paperContainer}>
					{props.children}
				</Paper>
			</Grid>
		</Grid>
	);
}