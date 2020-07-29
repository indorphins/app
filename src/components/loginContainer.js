import React from "react";
import { Grid, Paper, Typography, Zoom } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Legal from './legal';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.header.background,
	},
	paperContainer: {
		paddingLeft: theme.spacing(4),
		paddingRight: theme.spacing(4),
		paddingTop: theme.spacing(6),
		paddingBottom: theme.spacing(2),
		width: 500,
		'@media (max-width: 600px)': {
			paddingLeft: theme.spacing(1),
			paddingRight: theme.spacing(1),
			paddingTop: theme.spacing(3),
			width: "100%",
			borderRadius: 0,
    },
	},
	logo: {
		fontSize: "2.2rem",
    display: 'inline',
    marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
		color: theme.palette.secondary.main
  },
  logo2: {
		fontSize: "2.2rem",
    display: 'inline',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
		marginRight: theme.spacing(5),
		color: theme.palette.primary.main
  },
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
				<Zoom in={true}>
					<Paper elevation={2} className={classes.paperContainer}>
						<Grid container direction="row" justify="center">
							<Grid item>
								<Typography variant="h2" className={classes.logo}>indoor</Typography>
								<Typography variant="h2" className={classes.logo2}>phins</Typography>
							</Grid>
						</Grid>
						{props.children}
						<Grid container style={{paddingTop: 30}}>
							<Legal />
						</Grid>
					</Paper>
				</Zoom>
			</Grid>
		</Grid>
	);
}