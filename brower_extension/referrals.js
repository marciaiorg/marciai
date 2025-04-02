import { ReactionNo } from './rxn.js';

import { css, formatDateTime, hideModal, svg } from './utils.js';

import { NotificationSeverity } from './enums.js';

/**
 * @typedef {Object} ReferralOffer
 * @property {number} PercentOff
 * @property {number} MonthsOff
 * @property {number} PercentCommission
 * @property {number} MaxRedemptions
 * @property {string} OfferEnds
 * @property {string} OfferText
 * @property {string} OfferURL
 */

/**
 * @typedef {Object} ReferralCode
 * @property {string} ReferralCode
 * @property {string} ReferralLink
 * @property {number} PercentOff
 * @property {number} MonthsOff
 * @property {number} PercentCommission
 * @property {number} Redemptions
 * @property {number} MaxRedemptions
 */

export class Referrals {
  /** @type {import('./client.js').MARCIClient} */
  client = {};

  /** @type {import('./config.js').ReferralsConfig} */
  config = {};

  showNotification = () => {};

  /**
   * @param {import('./client.js').MARCIClient} client
   * @param {import('./config.js').ReferralsConfig} config
   * @param {function} showNotification
   */
  constructor(client, config, showNotification) {
    this.client = client;
    this.config = config;
    this.showNotification = showNotification;
  }

  /**
   * @param {Element} afterElement
   */
  addSidebarButton(afterElement) {
    if (this.client.UserQuota.hasReferralsFeatureEnabled()) {
      const button = document.createElement('a');
      button.id = 'referral-button';
      button.className = css`ExportButton`;
      button.innerHTML = /*html*/ `${svg`Referral`} ${this.config.Title} ${
        this.config.NewFeatureBadge
      }`;
      button.onclick = this.show.bind(this);

      afterElement.after(button);
    }
  }

  async show() {
    let offer = null;
    let reactionNo = null;

    if (!this.client.UserQuota.canUseReferrals()) {
      return;
    }

    try {
      offer = await this.client.fetchReferralOffer();
    } catch (error) {
      reactionNo = error.ReactionNo;

      if (
        !reactionNo ||
        (reactionNo !== ReactionNo.RXN_MARCI_REFERRALS_NO_OFFER &&
          reactionNo !== ReactionNo.RXN_MARCI_REFERRALS_MAX_REDEMPTIONS)
      ) {
        this.showNotification(
          NotificationSeverity.ERROR,
          `Could not fetch referral offer. Please try again later.`
        );
        return;
      }
    }

    let referralModal = document.getElementById('referralModal');

    // if modal does not exist, create it, add event listener on submit and append it to body
    if (!referralModal) {
      referralModal = document.createElement('div');
      referralModal.id = 'referralModal';
      document.body.appendChild(referralModal);
    }

    referralModal.innerHTML = /*html*/ `
        <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
            <div class="MARCI__absolute MARCI__bg-black/50 dark:MARCI__bg-black/80 MARCI__inset-0">
            </div>

            <div class="MARCI__fixed MARCI__inset-0 MARCI__overflow-y-auto">
                <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
                    <div class="MARCI__flex MARCI__items-center MARCI__justify-center MARCI__min-h-full">
                        <div
                            class="MARCI__align-center MARCI__bg-white dark:MARCI__bg-gray-900 dark:MARCI__text-gray-200 MARCI__inline-block MARCI__overflow-hidden sm:MARCI__rounded-lg MARCI__shadow-xl sm:MARCI__align-middle sm:MARCI__max-w-lg sm:MARCI__my-8 sm:MARCI__w-full MARCI__text-left MARCI__transform MARCI__transition-all"
                            role="dialog" aria-modal="true" aria-labelledby="modal-headline">

                            <div class="MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__px-4 MARCI__pt-5 MARCI__pb-4 sm:MARCI__p-6 sm:MARCI__pb-4">

                                <h3 class="MARCI__m-0 MARCI__text-gray-900 dark:MARCI__text-gray-100 MARCI__text-xl MARCI__border-b MARCI__border-gray-200 dark:MARCI__border-gray-700 MARCI__my-4">${
                                  this.config.Title
                                }</h3>

                                <div>
                                    ${
                                      reactionNo
                                        ? this.showReferralReactionNo(
                                            reactionNo
                                          )
                                        : this.showReferralOffer(offer)
                                    }
                                </div>
                            </div>

                            <div class="MARCI__bg-gray-200 dark:MARCI__bg-gray-850 MARCI__px-4 MARCI__py-3 MARCI__text-right">
                                <button type="button" class="MARCI__bg-gray-600 hover:MARCI__bg-gray-800 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white"
                                        onclick="MARCI.hideModal('referralModal')"> Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

    referralModal.style = 'display: block;';

    // add event listener to close the modal on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideModal('referralModal');
      }
    });
  }

  /**
   * @param {number} reactionNo
   */
  showReferralReactionNo(reactionNo) {
    let infoText = '';
    if (reactionNo === ReactionNo.RXN_MARCI_REFERRALS_NO_OFFER) {
      infoText = this.config.NoOffer;
    } else if (reactionNo === ReactionNo.RXN_MARCI_REFERRALS_MAX_REDEMPTIONS) {
      infoText = this.config.MaxRedemptions;
    } else {
      infoText = `Could not fetch referral offer. Please try again later.`;
    }

    return infoText;
  }

  /**
   * @param {ReferralOffer} offer
   */
  showReferralOffer(offer) {
    return /*html*/ `
        <div class="MARCI__my-4 MARCI__flex MARCI__justify-center">${svg`ReferralHuge`}</div>
        
        <div>
            ${offer.OfferText}
        </div>

        <div class="MARCI__text-sm MARCI__mt-4 MARCI__text-gray-500 MARCI__text-right">
            Offer ends: ${formatDateTime(offer.OfferEnds)}
        </div>

        <div id="referralModal-code-wrapper" class="MARCI__mt-4">
            <button type="button" class="MARCI__w-full MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white"  
                    onclick="MARCI.Referrals.showReferralCode();">
                View your promotion code
            </button>
        </div>
    `;
  }

  async showReferralCode() {
    let referralCode = null;
    let reactionNo = null;

    if (!this.client.UserQuota.canUseReferrals()) {
      return;
    }

    try {
      referralCode = await this.client.fetchReferralCode();
    } catch (error) {
      reactionNo = error.ReactionNo;

      if (
        reactionNo &&
        reactionNo !== ReactionNo.RXN_MARCI_REFERRALS_NO_OFFER &&
        reactionNo !== ReactionNo.RXN_MARCI_REFERRALS_MAX_REDEMPTIONS
      ) {
        throw error;
      }
    }

    let referralCodeWrapper = document.getElementById(
      'referralModal-code-wrapper'
    );

    referralCodeWrapper.innerHTML = /* html */ `
        <div class="MARCI__border-t MARCI__border-gray-200 dark:MARCI__border-gray-700">
            <div class="MARCI__mt-4">
              Your personal promotion code:&nbsp;
              <span class="MARCI__text-2xl MARCI__font-bold">
                  ${referralCode.ReferralCode}
              </span>
            </div>
            
            <div class="MARCI__flex MARCI__grid-cols-2 MARCI__mt-4">
              <button type="button"
                  onclick="MARCI.Referrals.copyReferralCode('${referralCode.ReferralCode}', false);"
                  title="Copy your personal promotion code to clipboard"
                  class="MARCI__w-full MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">
                  Copy code
              </button>
              <button type="button"
                  onclick="MARCI.Referrals.copyReferralCode('${referralCode.ReferralLink}', true);"
                  title="Copy your invite link to clipboard"
                  class="MARCI__w-full MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">
                  Copy invite link
              </button>
            </div>
        </div>

    `;
  }

  async copyReferralCode(text, isLink) {
    navigator.clipboard.writeText(text).then(
      // successfully copied
      () => {
        this.showNotification(
          NotificationSeverity.SUCCESS,
          isLink
            ? 'The invite link with your personal promotion code was copied to your clipboard.'
            : 'Your personal promotion code was copied to your clipboard.'
        );
      },
      // error - something went wrong (permissions?)
      () => {
        this.showNotification(
          NotificationSeverity.ERROR,
          'Something went wrong. Please try again.'
        );
      }
    );
  }
}
