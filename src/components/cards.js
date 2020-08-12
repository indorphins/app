import React from 'react';
import { connect } from 'react-redux'
import { 
  IconButton,
  RadioGroup,
  Card,
  Radio,
  Grid,
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
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
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.grey[700],
    borderRadius: 12,
    '@media (max-width: 600px)': {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
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

  componentWillReceiveProps(nextProps) {
    this.setState({
      paymentData: nextProps.paymentData,
      collapseAdd: !nextProps.collapseAdd,
    });
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
                <Grid container direction="row" justify="center" alignItems="center" spacing={2}>
                  <Grid item>
                    <Radio checked={item.default} name={item.id} />
                  </Grid>
                  <Grid item>
                    <Card className={classes.cardData}>
                      <Grid container direction="column" spacing={2}>
                        <Grid item>
                          <Grid container direction="row" spacing={1} justify="center" alignItems="center">
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
                        </Grid>
                        <Grid item>
                          <Grid container direciton="row" justify="space-between">
                            <Grid item>
                              <CardLogo brand={item.brand} />
                            </Grid>
                            <Grid item>
                              <Typography variant="subtitle2">exp: {item.exp_month}/{item.exp_year}</Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                  <Grid item>
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
      <ExpansionPanel defaultExpanded={this.state.collapseAdd}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreOutlined />}>
          <Typography variant="h5">Add a new card</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <AddPaymentMethod />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  
    return (
      <React.Fragment>
        {addPayment}
        {paymentMethodsContent}
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