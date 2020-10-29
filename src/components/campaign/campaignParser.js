import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import log from '../../log';
import * as CampaignAPI from '../../api/campaign';
import { store, actions } from '../../store';

const getUserSelector = createSelector([state => state.user.data], (user) => {
  return user;
});

const getSavedCampaigns = createSelector([state => state.user.data], (user) => {
  return user.campaigns ? user.campaigns : [];
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
  const savedCampaigns = useSelector(state => getSavedCampaigns(state));
  const schedule = useSelector(state => getScheduleSelector(state));
  const sessions = useSelector(state => getSessionHistorySelector(state));

  const [ isNew, setIsNew ] = useState(true);

  useEffect(() => {

    if (schedule.length > 0 || sessions.length > 0) {
      setIsNew(false);
    }
  }, [schedule, sessions]);

  useEffect(() => {
    
    if (campaign && campaign.active) {

      if (campaign.isNew && !isNew && user.id !== campaign.referrerId) return;

      let exists = savedCampaigns.find(item => item.campaignId === campaign.id);

      if (!exists && user.id !== campaign.referrerId) {
        getCampaignData(campaign, user);
      } else {
        if (exists.remaining > 0) {
          getCampaignData(campaign, user, exists.remaining);
        } else {
          setCampaign(null);
          store.dispatch(actions.campaign.clear());
        }
      }

    } else {

      let saved = savedCampaigns.find(item => item.remaining > 0);

      if (saved) {
        getCampaign(saved.campaignId);
      }
    }
  }, [campaign, savedCampaigns, user, isNew])

  useEffect(() => {
    if (query && query.cid) {
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

  function getCampaignData(campaign, user, /*optional*/ remaining) {
    let text;
    let amount;
    let discountRate;
    let discountAmount;
    let discountMultiplier;
    let displayData;

    if (user.id !== campaign.referrerId && (campaign.discountAmount || campaign.discountRate)) {
      discountRate = campaign.discountRate;
      discountAmount = campaign.discountAmount;
      discountMultiplier = campaign.discountMultiplier;
    }

    if (user.id === campaign.referrerId && (campaign.referrerDiscountAmount || campaign.referrerDiscountRate)) {
      discountRate = campaign.referrerDiscountRate;
      discountAmount = campaign.referrerDiscountAmount;
      discountMultiplier = campaign.referrerDiscountMultiplier;
    }
    
    displayData = {
      id: campaign.id,
    }

    if (discountRate) {
      amount = (discountRate * 100) + "%";
      displayData.discountRate = discountRate;
    }

    if (discountAmount) {
      amount = "$" + (discountAmount / 100);
      displayData.discountAmount = discountAmount;
    }

    if (amount) {

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

      displayData.multiplier = discountMultiplier;
      displayData.description = text;
    }

    store.dispatch(actions.campaign.set(displayData));
  }

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}