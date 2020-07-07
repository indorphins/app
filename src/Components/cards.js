import React from 'react';
import { connect } from 'react-redux'
import { IconButton, RadioGroup, Radio, Grid, Typography, withStyles } from '@material-ui/core';
import { Lens, Delete } from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';

import { store, actions } from '../store';
import * as Stripe from '../api/stripe';
import log from '../log';
import AddPaymentMethod from '../components/form/addPaymentMethod';
import VisaIcon from '../components/icon/visa';
import AmexIcon from '../components/icon/amex';
import MastercardIcon from '../components/icon/mastercard';
import DiscoverIcon from '../components/icon/discover';
import JCBIcon from '../components/icon/jcb';
import CCIcon from '../components/icon/cc';

const styles = {
  masked: {
    fontSize: "0.6rem",
    display: "inline",
  },
};

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
      error: null,
    };

    this.removePaymentMethod = this.removePaymentMethod.bind(this);
    this.changeDefaultPaymentMethod = this.changeDefaultPaymentMethod.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      paymentData: nextProps.paymentData,
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

  removePaymentMethod = async function(event) {
    let id = event.target.name;
    let updated;

    log.debug("event target", event.target);

    if (!id) { 
      return;
    }

    try {
      updated = await Stripe.deletePaymentMethod(id);
    } catch (err) {
      log.error("PROFILE:: update default payment method", err);
      this.setState({
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
        <Grid>
          <Typography variant="h3">Saved cards</Typography>
          {errorContent}
          <Grid container direction="column">
            <RadioGroup onChange={this.changeDefaultPaymentMethod}>
              {this.state.paymentData.methods.map(item => (
                <Grid key={item.id} item>
                  <Grid container direction="row" justify="flex-start" alignItems="center">
                    <Grid item>
                      <Radio checked={item.default} name={item.id} />
                    </Grid>
                      <Grid item style={{marginRight: "5px"}}>
                        <Grid container direction="column" justify="center" alignItems="center">
                          <Grid item>
                            <CardLogo brand={item.brand} />
                          </Grid>
                        </Grid>
                      </Grid>
                    <Grid item>
                      <Grid container direction="row" spacing={1} justify="center" alignItems="center">
                        <Grid item>
                          <Lens className={classes.masked}/>
                          <Lens className={classes.masked}/>
                          <Lens className={classes.masked}/>
                          <Lens className={classes.masked}/>
                        </Grid>
                        <Grid item>
                          <Lens className={classes.masked}/>
                          <Lens className={classes.masked}/>
                          <Lens className={classes.masked}/>
                          <Lens className={classes.masked}/>
                        </Grid>
                        <Grid item>
                          <Lens className={classes.masked}/>
                          <Lens className={classes.masked}/>
                          <Lens className={classes.masked}/>
                          <Lens className={classes.masked}/>
                        </Grid>
                        <Grid item>
                          <Typography>{item.last4}</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="subtitle2">exp: {item.exp_month}/{item.exp_year}</Typography>
                        </Grid>
                        <Grid item>
                          <IconButton name={item.id} onClick={this.removePaymentMethod}>
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </RadioGroup>
          </Grid>
        </Grid>
      );
    }
  
    return (
      <Grid>
        <AddPaymentMethod />
        {paymentMethodsContent}
      </Grid>
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