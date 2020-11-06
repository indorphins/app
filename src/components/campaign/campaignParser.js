/* eslint complexity: ["error", { "max": 13 }]*/
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import log from '../../log';
import * as CampaignAPI from '../../api/campaign';
import { store, actions } from '../../store';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const getScheduleSelector = createSelector([state => state.user.schedule], (s) => {
  return s;
});
const getSessionHistorySelector = createSelector([state => state.milestone.sessions], (s) => {
  return s;
});

export default function CampaignParser(props) {
  const { children, query } = props;
  const [ campaign, setCampaign] = useState(null);
  const user = useSelector(state => getUserSelector(state));
  const schedule = useSelector(state => getScheduleSelector(state));
  const sessions = useSelector(state => getSessionHistorySelector(state));

  const [ isNew, setIsNew ] = useState(true);

  useEffect(() => {

    if (schedule.length > 0 || sessions.length > 0) {
      setIsNew(false);
    }
  }, [schedule, sessions]);

  useEffect(() => {

    let savedCampaigns = user.campaigns ? user.campaigns : [];
    
    if (campaign && campaign.active) {

      let exists = savedCampaigns.find(item => item.campaignId === campaign.id);

      log.debug("user saved campaigns", exists);

      if (!exists && (user.id !== campaign.referrerId || !campaign.referrerId)) {

        if (campaign.newUser === true && isNew === false && user.id !== campaign.referrerId) {
          setCampaign(null);
          store.dispatch(actions.campaign.clear());
          return log.debug("campaign not valid for user");
        }

        getCampaignData(campaign, user);

      } else { 
        if (exists && exists.remaining > 0) {
          return getCampaignData(campaign, user, exists.remaining);
        }

        log.debug("clear campaign data");
        setCampaign(null);
        store.dispatch(actions.campaign.clear());
      }

    } else {

      let saved = savedCampaigns.find(item => item.remaining > 0);

      if (saved) {
        getCampaign(saved.campaignId);
      }
    }
  }, [campaign, user, isNew])

  useEffect(() => {
    if (query && query.cid) {
      log.debug("get campaigin data for id", query.cid);
      getCampaign(query.cid);
    }
  }, [query]);

  async function getCampaign(id) {
    let c;
    try {
      c = await CampaignAPI.get(id);
    } catch(err) {
      log.warn("get campaign", err);
    }

    if (c) setCampaign(c);
  }

  function makeDescription(campaign, user, amount, discountMultiplier, remaining) {
    let displayData = {};
    let text;

    if (remaining) {
      discountMultiplier = remaining;
      text = `${amount} off`;
    } else {
      text = `Book a class now for ${amount} off`;
    }

    if (discountMultiplier > 1) {
      text = `${text} your next ${discountMultiplier} classes`;
    } else {
      text = `${text} your next class`;
    }

    if (campaign.description) {
      if (campaign.referrerId && campaign.referrerId === user.id) {
        text = `Your friend booked a class using your code! ${text}.`;
      } else {
        text = `${text}, ${campaign.description}`;
      }
    }

    displayData.multiplier = discountMultiplier;
    displayData.description = text;

    return displayData;
  }

  function getCampaignData(campaign, user, /*optional*/ remaining) {
    let amount;
    let discountRate;
    let discountAmount;
    let discountMultiplier;
    
    let displayData = {
      id: campaign.id,
    }

    log.debug("campaign data", campaign)

    if (
      (user.id !== campaign.referrerId || !campaign.referrerId ) && 
      (campaign.discountAmount || campaign.discountRate)
    ) {
      log.debug("set campaign prioce");
      discountRate = campaign.discountRate;
      discountAmount = campaign.discountAmount;
      discountMultiplier = campaign.discountMultiplier;
    }

    if (user.id === campaign.referrerId && (campaign.referrerDiscountAmount || campaign.referrerDiscountRate)) {
      discountRate = campaign.referrerDiscountRate;
      discountAmount = campaign.referrerDiscountAmount;
      discountMultiplier = campaign.referrerDiscountMultiplier;
    }

    log.debug("campaign discounts", discountRate, discountAmount)

    if (discountRate) {
      amount = (discountRate * 100) + "%";
      displayData.discountRate = discountRate;
    }

    if (discountAmount) {
      amount = "$" + (discountAmount / 100).toFixed(2);
      displayData.discountAmount = discountAmount;
    }

    log.debug("campaign price", displayData);

    if (amount) {
      let desc = makeDescription(campaign, user, amount, discountMultiplier, remaining);
      log.debug("campaign description", desc);
      Object.assign(displayData, desc);
    }

    store.dispatch(actions.campaign.set(displayData));
  }

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}