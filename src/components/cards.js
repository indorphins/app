import React from 'react';
import { connect } from 'react-redux'
import { 
  IconButton,
  RadioGroup,
  Card,
  Radio,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  withStyles
} from '@material-ui/core';
import { Lens, Delete, ExpandMoreOutlined } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';

import { store, actions } from '../store';
import * as Stripe from '../api/stripe';
import log from '../log';
import AddPaymentMethod from './form/addPaymentMethod';
import VisaIcon from './icon/visa';
import AmexIcon from './icon/amex';
import MastercardIcon from './icon/mastercard';
import DiscoverIcon from './icon/discover';
import JCBIcon from './icon/jcb';
import CCIcon from './icon/cc';

const styles = theme => ({
  savedCardsContent: {
    width: "100%",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    '@media (max-width: 900px)': {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
  },
  cardsContainer: {
    flexDirection: "row",
    '@media (max-width: 900px)': {
      flexDirection: "column",
    }
  },
  cardData: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.grey[700],
    borderRadius: 12,
    '@media (max-width: 600px)': {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    }
  },
  cardItem: {
    width: "50%",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    '@media (max-width: 900px)': {
      width: "100%",
    }
  },
  radioGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    '@media (max-width: 900px)': {
      flexDirection: "column",
    }
  },
  last4: {
    fontSize: "1rem",
  },
  masked: {
    fontSize: "0.6rem",
    display: "inline",
    '@media (max-width: 600px)': {
      fontSize: "0.5rem",
    }
  },
  radioBtn: {}
});

function CardLogo(props) {
  if (props.brand === 'visa') {
    return (<VisaIcon />);
  }

  if (props.brand === 'amex') {
    return (<AmexIcon />);
  }

  if (props.brand === 'mastercard') {
    return (<MastercardIcon />)
  }

  if (props.brand === 'discover') {
    return (<DiscoverIcon />);
  }

  if (props.brand === 'jcb') {
    return (<JCBIcon />);
  }

  return (<CCIcon />);
}

class Cards extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      paymentData: this.props.paymentData,
      collapseAdd: !this.props.collapseAdd,
      error: null,
    };

    this.removePaymentMethod = this.removePaymentMethod.bind(this);
    this.changeDefaultPaymentMethod = this.changeDefaultPaymentMethod.bind(this);
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      paymentData: nextProps.paymentData,
      collapseAdd: !nextProps.collapseAdd,
    };
  }

  changeDefaultPaymentMethod = async function(event) {

    let id = event.target.name;
    let oldData = JSON.parse(JSON.stringify(this.state.paymentData));
    let newData = JSON.parse(JSON.stringify(this.state.paymentData));
    let updated;

    newData.methods.map(function(item) {
      if (item.id === id) {
        item.default = true;
      } else {
        item.default = false;
      }
      return item;
    });

    this.setState({
      paymentData: newData,
      error: null,
    });

    try {
      updated = await Stripe.updatePaymentMethod(newData);
    } catch (err) {
      log.error("PROFILE:: update default payment method", err);
      this.setState({
        paymentData: oldData,
        error: err.message
      });
      return;
    }

    this.setState({
      paymentData: updated,
      error: null,
    });

    await store.dispatch(actions.user.setPaymentData(updated));
  }

  removePaymentMethod = async function(id) {
    let updated;

    if (!id) { 
      return;
    }

    let oldData = JSON.parse(JSON.stringify(this.state.paymentData));
    let newData = JSON.parse(JSON.stringify(this.state.paymentData));

    newData.methods = newData.methods.filter(item => {
      if (item.id === id) {
        return false;
      }
      return true;
    });

    log.debug("new data", newData);

    this.setState({
      paymentData: newData
    });

    try {
      updated = await Stripe.deletePaymentMethod(id);
    } catch (err) {
      log.error("PROFILE:: update default payment method", err);
      this.setState({
        paymentData: oldData,
        error: err.message,
      });
      return;
    }

    this.setState({
      paymentData: updated,
      error: null,
    });

    await store.dispatch(actions.user.setPaymentData(updated));
  }


  render() {
    const { classes } = this.props;

    let errorContent = null;

    if (this.state.error) {
      errorContent = (
        <Alert severity="error">{this.state.error}</Alert>
      );
    }

    let paymentMethodsContent = null;
    if (this.state.paymentData && this.state.paymentData.methods) {
      paymentMethodsContent = (
        <Grid container className={classes.savedCardsContent}>
          {errorContent}
          <RadioGroup onChange={this.changeDefaultPaymentMethod} className={classes.radioGroup}>
            {this.state.paymentData.methods.map(item => (
              <Grid key={item.id} item className={classes.cardItem}>
                <Grid container direction="row" alignItems="center" justify="flex-start" spacing={2}>
                  <Grid item xs={2}>
                    <Radio color="primary" checked={item.default} name={item.id} />
                  </Grid>
                  <Grid item xs={8}>
                    <Card className={classes.cardData}>
                      <Grid container direction="row" justify="flex-start" alignItems="center" spacing={2}>
                        <Grid item xs={9} container direction="row" spacing={1} justify="center" alignItems="center">
                          <Grid item>
                            <Lens className={classes.masked} />
                            <Lens className={classes.masked} />
                            <Lens className={classes.masked} />
                            <Lens className={classes.masked} />
                          </Grid>
                          <Grid item>
                            <Lens className={classes.masked} />
                            <Lens className={classes.masked} />
                            <Lens className={classes.masked} />
                            <Lens className={classes.masked} />
                          </Grid>
                          <Grid item>
                            <Lens className={classes.masked} />
                            <Lens className={classes.masked} />
                            <Lens className={classes.masked} />
                            <Lens className={classes.masked} />
                          </Grid>
                          <Grid item>
                            <Typography className={classes.last4}>{item.last4}</Typography>
                          </Grid>
                        </Grid>
                        <Grid 
                          item 
                          xs={3}
                          container
                          direciton="row"
                          justify="center"
                          alignItems="center"
                          alignContent="center"
                          spacing={2}
                        >
                          <Grid item style={{display:"flex"}}>
                            <CardLogo brand={item.brand} />
                          </Grid>
                          <Grid item>
                            <Typography variant="subtitle2">{item.exp_month}/{item.exp_year.slice(2)}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={() => {this.removePaymentMethod(item.id)}}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              ))}
          </RadioGroup>

        </Grid>
      );
    }

    let addPayment = (
      <Accordion defaultExpanded={this.state.collapseAdd}>
        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
          <Typography variant="h5">Add a new card</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AddPaymentMethod />
        </AccordionDetails>
      </Accordion>
    );
  
    return (
      <React.Fragment>
        <Grid>
          {paymentMethodsContent}
        </Grid>
        <Grid>
          {addPayment}
        </Grid>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { user } = state;
  return {
    paymentData: user.paymentData
  };
}

export default withStyles(styles)(connect(mapStateToProps)(Cards));