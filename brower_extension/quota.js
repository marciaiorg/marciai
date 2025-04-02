import { AppSignupURL, AppPricingURL, QuotaMessagesURL } from './config.js';
import {
  PlanLevelNo,
  PromptTypeNo,
  ListTypeNo,
  FeatureBitset,
} from './enums.js';
import { PromptSendQuota } from './prompt-send-quota.js';

const MIN_PUBLIC_PROMPT_VOTES_THRESHOLD = 5;

// Quota messages shown in the modal when user quota is exceeded - replaced with quota-messages.json (when available)
let QuotaMessages = {
  CONNECT_ACCOUNT_ANNOUNCEMENT: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    We are excited to announce that you can now connect your OpenAI account with your MARCI account.
    <br><br>
    This will allow you to save a favorite prompt to the "Favorites" prompts list and to try more of our premium features before subscribing to a premium MARCI plan.
    <br><br>
    If you don't have an MARCI account yet, you can create one for free.
  </p>`,

  CONNECT_ACCOUNT_TO_USE_FAVORITES: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    To use the "Favorites" prompts list, you must connect your OpenAI account with your MARCI account.
    This will allow you to save a favorite prompt to the "Favorites" prompts list.
  </p>`,

  CONNECT_ACCOUNT_UPGRADE_TO_USE_HIDDEN: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    You can hide prompts immediately. To use this feature, 
    you must connect your OpenAI account with your MARCI account and subscribe to the <b>MARCI Plus</b> plan or higher.
  </p>`,

  UPGRADE_ACCOUNT_TO_USE_HIDDEN: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You can hide prompts immediately. To use this feature, please upgrade your MARCI account to the <b>MARCI Plus</b> plan or higher.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_HIDDEN_LIST_ITEMS_QUOTA_EXCEEDED: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    To hide more prompts at the same time, please upgrade your MARCI account to a plan with more prompts per prompts list.
    Alternatively, you can remove some prompts from your "Hidden" list to make space for new ones.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_UPGRADE_TO_USE_CUSTOM_LIST: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    To create a custom prompt list, you must connect your OpenAI account with your MARCI account and subscribe to the <b>MARCI Plus</b> plan or higher.
    This will allow you to save your prompts to a custom prompt list.
  </p>`,

  UPGRADE_ACCOUNT_TO_USE_CUSTOM_LIST: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    To create a custom prompt list, you need to upgrade to the <b>MARCI Plus</b> plan or higher.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_CUSTOM_LIST_QUOTA_EXCEEDED: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    To create a new custom prompt list, please upgrade your MARCI account to a plan with more prompts lists.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_LIST_QUOTA_EXCEEDED: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You have reached your maximum allowed prompts lists. To create more prompts lists, please upgrade your MARCI account.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_LIST_ITEM_QUOTA_EXCEEDED: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You have reached your maximum allowed prompts per prompts list. To add more prompts to this list, please upgrade your MARCI account.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_TO_USE_PRIVATE_PROMPTS: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    To use private prompts, you must connect your OpenAI account with your MARCI account.
    This will allow you to create a private prompt that is only visible to you.
  </p>`,

  UPGRADE_ACCOUNT_PRIVATE_PROMPTS_QUOTA_EXCEEDED: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You have exceeded the number of private prompts allowed in your account.    
    If you just deleted another private prompt, please try again in a few seconds.
    <br><br>
    To create more private prompts, please upgrade your MARCI account to a plan allowing more private prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_TO_USE_TEAM_PROMPTS: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    To use team prompts, you must connect your OpenAI account with your MARCI account.
    This will allow you to create team prompts.
  </p>`,

  UPGRADE_ACCOUNT_PUBLIC_PROMPTS_QUOTA_EXCEEDED: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    All your allowed upcoming prompts have less than ${MIN_PUBLIC_PROMPT_VOTES_THRESHOLD} upvotes.
    You can only create a new upcoming public prompts if all your public prompts have more than ${MIN_PUBLIC_PROMPT_VOTES_THRESHOLD} upvotes.
    If you just unpublished or deleted another upcoming prompt, please try again in a few seconds.
    <br><br>
    To create more upcoming prompts at once, you can upgrade to the <b>MARCI Pro</b> plan.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_PROMPT_QUOTA_EXCEEDED: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    You can only create new upcoming public prompts if all your public prompts have more than ${MIN_PUBLIC_PROMPT_VOTES_THRESHOLD} upvotes.
    You can only create new private prompts if you didn't reach the limit of the max. allowed private prompts in your account.
    <br><br>
    Connect your OpenAI account with your MARCI account to be able to create more prompts.
    <br><br>
    Then you can also upgrade your MARCI account to a plan with more private and upcoming public prompts, or purchase multiple plans of the same type.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_PROMPT_QUOTA_EXCEEDED: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You can only create new upcoming public prompts if all your public prompts have more than ${MIN_PUBLIC_PROMPT_VOTES_THRESHOLD} upvotes.
    You can only create new private prompts if you didn't reach the limit of the max. allowed private prompts in your account.
    <br><br>
    Please try again in a few seconds, if you just unpublished or deleted another upcoming public prompt, or deleted another private prompt.
    <br><br>
    To be able to create more prompts, you can upgrade your MARCI account to a plan with more private and upcoming public prompts, or purchase multiple plans of the same type.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_CUSTOM_TONE_WRITING_STYLE: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    Upgrade to the <b>MARCI Plus</b> plan to get additional Tones and Writing Styles.
    Upgrade to the <b>MARCI Pro</b> plan to even add your own custom Tones and Writing Styles.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_POWER_CONTINUE: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    Upgrade to a premium plan to activate the Power Continue feature.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_CUSTOM_TONE_WRITING_STYLE_POWER_CONTINUE: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    Upgrade to the <b>MARCI Pro</b> plan to add your own custom Tones, Writing Styles and Power Continue actions.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_UPGRADE_MARCI_VERIFIED_LIST: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    To use the "MARCI Verified Prompts" list, you must connect your OpenAI account with your MARCI account and subscribe to the <b>MARCI Pro</b> plan.
  </p>`,

  UPGRADE_ACCOUNT_MARCI_VERIFIED_LIST: /*html*/ `  
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    To use the <b>MARCI Verified Prompts</b> list, you must subscribe to the <b>MARCI Pro</b> plan or higher.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_VIEW_PROMPT_TEMPLATE_SOURCE: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    To view prompt template source, you must connect your OpenAI account with your MARCI account and subscribe to the <b>MARCI Elite</b> plan or higher.
  </p>`,

  UPGRADE_ACCOUNT_VIEW_PROMPT_TEMPLATE_SOURCE: /*html*/ `  
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    To view prompt template source, you must subscribe to the <b>MARCI Elite</b> plan or higher.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_UPGRADE_TO_USE_LIVE_CRAWLING: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    To use the Live Crawling feature, you must connect your OpenAI account with your MARCI account and subscribe to the <b>MARCI Elite</b> plan or higher.
  </p>`,

  UPGRADE_ACCOUNT_LIVE_CRAWLING: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    To use the Live Crawling feature, you must subscribe to the <b>MARCI Elite</b> plan or higher.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_UPGRADE_TO_USE_HIDE_WATERMARK: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    To use the Hide Watermark feature, you must connect your OpenAI account with your MARCI account and subscribe to the <b>MARCI Elite</b> plan or higher.
  </p>`,

  UPGRADE_ACCOUNT_HIDE_WATERMARK: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    To use the Hide Watermark feature, you must subscribe to the <b>MARCI Elite</b> plan or higher.
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_PROMPT_VARIABLE_VALUES: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    Upgrade your MARCI account to a higher plan to be able to use more prompt variable values.
  
    <br><br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_DOCUMENT_INDEX_INCORRECT_PLAN: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    You can use Custom Index feature only if you have the <b>MARCI Elite</b> plan or higher.
    <br><br>
    Connect your OpenAI account with your MARCI account to be able to use Custom Index feature.
    <br><br>
    Then you can also upgrade your MARCI account to a <b>MARCI Elite</b> plan or higher to use Custom Index feature.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_DOCUMENT_INDEX_INCORRECT_PLAN: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You can use Custom Index feature only if you have the <b>MARCI Elite</b> plan or higher.
    <br><br>
    To be able to use Custom Index feature, you can upgrade your MARCI account.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_USE_REFERRALS: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    Connect your OpenAI account with your MARCI account to be able to use Invite a Friend & Earn feature.
  </p>`,

  // Prompt send quota exceeded messages

  // MARCI prompt send quota exceeded messages - soft limit - connect account

  CONNECT_ACCOUNT_PROMPT_SEND_MARCI_QUOTA_EXCEEDED_1: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    You are nearing the maximum number of MARCI prompts you can send per day.
    <br><br>
    Connect your OpenAI account with your MARCI account to extend your prompt limit.
    <br><br>
    You can also upgrade your MARCI account to a plan that allows more MARCI prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_PROMPT_SEND_MARCI_QUOTA_EXCEEDED_2: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    You are close to reaching the maximum number of MARCI prompts you can send per day.
    <br><br>
    Connect your OpenAI account with your MARCI account to increase your daily prompt allowance.
    <br><br>
    Upgrading your MARCI account to a higher plan will allow you to send more MARCI prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_PROMPT_SEND_MARCI_QUOTA_EXCEEDED_3: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    You are about to reach the maximum number of MARCI prompts you can send per day.
    <br><br>
    Connect your OpenAI account with your MARCI account immediately to increase your prompt limit.
    <br><br>
    You can also upgrade your MARCI account to a plan that provides more MARCI prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  // MARCI prompt send quota exceeded messages - hard limit - connect account

  CONNECT_ACCOUNT_PROMPT_SEND_MARCI_QUOTA_EXCEEDED_BLOCKED: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    You have reached the maximum number of MARCI prompts you can send per day.
    <br><br>
    To continue using the service, connect your OpenAI account with your MARCI account to increase your prompt limit.
    <br><br>
    Alternatively, you can upgrade your MARCI account to a plan that allows more MARCI prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>
  <p class="MARCI__my-4">
    Please take action now or wait until $blockedUntilTime to send more MARCI prompts.
  </p>`,

  // MARCI prompt send quota exceeded messages - soft limit - upgrade account

  UPGRADE_ACCOUNT_PROMPT_SEND_MARCI_QUOTA_EXCEEDED_1: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You are nearing the maximum number of MARCI prompts you can send per day.
    <br><br>
    Upgrade your MARCI account to a plan that allows more MARCI prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_PROMPT_SEND_MARCI_QUOTA_EXCEEDED_2: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You are close to reaching the maximum number of MARCI prompts you can send per day.
    <br><br>
    Upgrading your MARCI account to a higher plan will allow you to send more MARCI prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_PROMPT_SEND_MARCI_QUOTA_EXCEEDED_3: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You are about to reach the maximum number of MARCI prompts you can send per day.
    <br><br>
    Upgrade your MARCI account to a plan that provides more MARCI prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  // MARCI prompt send quota exceeded messages - hard limit - upgrade account

  UPGRADE_ACCOUNT_PROMPT_SEND_MARCI_QUOTA_EXCEEDED_BLOCKED: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You have reached the maximum number of MARCI prompts you can send per day.
    <br><br>
    To continue using the service, upgrade your MARCI account to a plan that allows more MARCI prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>
  <p class="MARCI__my-4">
    Please take action now or wait until $blockedUntilTime to send more MARCI prompts.
  </p>`,

  // Non-MARCI prompt send quota exceeded messages - soft limit - connect account

  CONNECT_ACCOUNT_PROMPT_SEND_NONMARCI_QUOTA_EXCEEDED_1: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    You are nearing the maximum number of prompts you can send per day.
    <br><br>
    Connect your OpenAI account with your MARCI account to extend your prompt limit.
    <br><br>
    You can also upgrade your MARCI account to a plan that allows more prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_PROMPT_SEND_NONMARCI_QUOTA_EXCEEDED_2: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    You are close to reaching the maximum number of prompts you can send per day.
    <br><br>
    Connect your OpenAI account with your MARCI account to increase your daily prompt allowance.
    <br><br>
    Upgrading your MARCI account to a higher plan will allow you to send more prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  CONNECT_ACCOUNT_PROMPT_SEND_NONMARCI_QUOTA_EXCEEDED_3: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    You are about to reach the maximum number of prompts you can send per day.
    <br><br>
    Connect your OpenAI account with your MARCI account immediately to increase your prompt limit.
    <br><br>
    You can also upgrade your MARCI account to a plan that provides more prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  // Non-MARCI prompt send quota exceeded messages - hard limit - connect account

  CONNECT_ACCOUNT_PROMPT_SEND_NONMARCI_QUOTA_EXCEEDED_BLOCKED: /*html*/ `
  <h3>Connect OpenAI and MARCI Accounts</h3>

  <p class="MARCI__my-4">
    You have reached the maximum number of prompts you can send per day.
    <br><br>
    Connect your OpenAI account with your MARCI account to be able to send more prompts.
    <br><br>
    Then you can also upgrade your MARCI account to a plan that allows more prompts to be sent.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>
  <p class="MARCI__my-4">
    Please take action now or wait until $blockedUntilTime to send more prompts.
  </p>`,

  // Non-MARCI prompt send quota exceeded messages - soft limit - upgrade account

  UPGRADE_ACCOUNT_PROMPT_SEND_NONMARCI_QUOTA_EXCEEDED_1: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You are nearing the maximum number of prompts you can send per day.
    <br><br>
    Upgrade your MARCI account to a plan that allows more prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_PROMPT_SEND_NONMARCI_QUOTA_EXCEEDED_2: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You are close to reaching the maximum number of prompts you can send per day.
    <br><br>
    Upgrading your MARCI account to a higher plan will allow you to send more prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  UPGRADE_ACCOUNT_PROMPT_SEND_NONMARCI_QUOTA_EXCEEDED_3: /*html*/ `
  <h3>Upgrade MARCI Account</h3>

  <p class="MARCI__my-4">
    You are about to reach the maximum number of prompts you can send per day.
    <br><br>
    Upgrade your MARCI account to a plan that provides more prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>`,

  // Non-MARCI prompt send quota exceeded messages - hard limit - upgrade account

  UPGRADE_ACCOUNT_PROMPT_SEND_NONMARCI_QUOTA_EXCEEDED_BLOCKED: /*html*/ `
  <h3>Upgrade MARCI Account</h3>
  
  <p class="MARCI__my-4">
    You have reached the maximum number of prompts you can send per day.
    <br><br>
    To continue using the service, upgrade your MARCI account to a plan that allows more prompts.
    <br>
    <a class="MARCI__underline" href="${AppPricingURL}">View available plans here.</a>
  </p>
  <p class="MARCI__my-4">
    Please take action now or wait until $blockedUntilTime to send more prompts.
  </p>`,

  // Prompt send quota exceeded messages - hard limit - blocked

  PROMPT_SEND_QUOTA_EXCEEDED:
    'You have reached the maximum number of prompts you can send per day.',
};

// Check user quota for premium features and show modal if quota is exceeded / feature is not available
export class UserQuota {
  /** @type {import("./client").Quota} */
  #quota;

  /** @type {import("./client").User} */
  #user;

  /**
   * @param {import("./client").User} user
   * @param {import("./client").Quota} quota
   */
  constructor(user, quota) {
    this.#user = user;
    this.#quota = quota;
  }

  getMaxPlanLevelLabel() {
    if (!this.hasPaidPlan()) {
      return 'Free';
    }

    const maxPlanLevel = Object.keys(PlanLevelNo).find(
      (key) => PlanLevelNo[key] === this.#quota.MaxLevel
    );

    if (maxPlanLevel) {
      return (
        'MARCI ' +
        maxPlanLevel[0].toUpperCase() +
        maxPlanLevel.slice(1).toLowerCase()
      );
    } else {
      return 'Unknown';
    }
  }

  hasPaidPlan() {
    return this.#user.IsLinked && this.#quota.MaxLevel >= PlanLevelNo.BASIC;
  }

  // Fetch quota messages from server
  async fetchMessages() {
    try {
      // Fetch quota messages from server with cache buster
      const response = await fetch(
        QuotaMessagesURL +
          btoa(new Date().toISOString().slice(0, 16).toString())
      );

      if (!response.ok) {
        console.error('Could not fetch Quota Messages', response.statusText);
        return;
      }

      QuotaMessages = await response.json();
    } catch (error) {
      console.error('Could not fetch Quota Messages', error);
    }
  }

  /**
   * Check if user can use the "Favorites" prompts list
   * (requires OpenAI account to be connected with MARCI account & max. private list items quota not exceeded)
   *
   * @param {import('./list.js').Lists} lists
   * @returns {boolean}
   */
  canUseFavorites(lists) {
    // OpenAI account must be connected to MARCI account
    if (!this.#user.IsLinked) {
      this.showModal(
        QuotaMessages.CONNECT_ACCOUNT_TO_USE_FAVORITES,
        AppSignupURL
      );

      return false;
    }

    const favoritesList = lists.getFavorites();

    // If user has no "Favorites" list, they can create one
    if (!favoritesList) {
      return true;
    }

    // If user has a "Favorites" list, check if they can add more items to it
    if (favoritesList.Items.length >= this.#quota.MaxPrivateListItems) {
      this.listItemQuotaExceeded();

      return false;
    }

    return true;
  }

  canUseFavoritesOnlyCheck() {
    return this.#user.IsLinked;
  }

  /**
   * Check if user can use the "Hidden" prompts list
   * (requires OpenAI account to be connected with MARCI account, min. 3 private lists quota
   *  & max. private list items quota not exceeded)
   *
   * @param {import('./list.js').Lists} lists
   * @returns {boolean}
   */
  canUseHidden(lists) {
    // OpenAI account must be connected to MARCI account
    if (!this.#user.IsLinked) {
      this.showModal(
        QuotaMessages.CONNECT_ACCOUNT_UPGRADE_TO_USE_HIDDEN,
        AppSignupURL
      );

      return false;
    }

    const hiddenList = lists.getHidden();

    // If user has less than 3 private lists quota, they can't create a "Hidden" list
    if (this.#quota.TotalPrivateLists < 3) {
      this.showModal(
        QuotaMessages.UPGRADE_ACCOUNT_TO_USE_HIDDEN,
        AppPricingURL
      );

      return false;
    }

    // If user has no "Hidden" list, they can create one
    if (!hiddenList) {
      return true;
    }

    // If user has a "Hidden" list, check if they can add more items to it
    if (hiddenList.Items.length >= this.#quota.MaxPrivateListItems) {
      this.showModal(
        QuotaMessages.UPGRADE_ACCOUNT_HIDDEN_LIST_ITEMS_QUOTA_EXCEEDED,
        AppPricingURL
      );

      return false;
    }

    return true;
  }

  canUseHiddenOnlyCheck() {
    return this.#user.IsLinked && this.#quota.MaxLevel >= PlanLevelNo.PLUS;
  }

  /**
   * Check if user can use a custom prompt list
   * (requires OpenAI account to be connected with MARCI account, min. 3 private lists quota
   *  & max. private lists quota not exceeded)
   *
   * @returns {boolean}
   */
  canUseCustomList() {
    // OpenAI account must be connected to MARCI account
    if (!this.#user.IsLinked) {
      this.showModal(
        QuotaMessages.CONNECT_ACCOUNT_UPGRADE_TO_USE_CUSTOM_LIST,
        AppSignupURL
      );

      return false;
    }

    // If user has less than 3 private lists quota, they can't create a custom list
    if (this.#quota.TotalPrivateLists < 3) {
      this.showModal(
        QuotaMessages.UPGRADE_ACCOUNT_TO_USE_CUSTOM_LIST,
        AppPricingURL
      );

      return false;
    }

    return true;
  }

  canUseCustomListOnlyCheck() {
    return this.#user.IsLinked && this.#quota.MaxLevel >= PlanLevelNo.PLUS;
  }

  /**
   * Check if user can create a custom prompt list, based on their quota and existing custom lists
   *
   * @param {import('./list.js').Lists} lists
   * @returns {boolean}
   */
  canCreateCustomList(lists) {
    // Check if user can create more custom lists (2 lists are reserved for "Favorites" & "Hidden")
    if (lists.getCustomPrivate().length >= this.#quota.TotalPrivateLists - 2) {
      this.showModal(
        QuotaMessages.UPGRADE_ACCOUNT_CUSTOM_LIST_QUOTA_EXCEEDED,
        AppPricingURL
      );

      return false;
    }

    return true;
  }

  /**
   * Check if user can add a prompt to a custom list
   *
   * @param {import('./list.js').List} list
   * @returns {boolean}
   */
  canAddToCustomList(list) {
    if (list.ListTypeNo === ListTypeNo.TEAM_CUSTOM) {
      return this.hasTeamsFeatureEnabled();
    } else {
      if (list.Items.length >= this.#quota.MaxPrivateListItems) {
        this.showModal(
          QuotaMessages.UPGRADE_ACCOUNT_LIST_ITEM_QUOTA_EXCEEDED,
          AppPricingURL
        );

        return false;
      }
    }

    return true;
  }

  canUseTeamListOnlyCheck() {
    return this.#user.IsLinked && this.hasTeamsFeatureEnabled();
  }

  /**
   * Check if user can use the "MARCI Verified Prompts" list
   *
   * @param {boolean} showModal
   * @returns {boolean}
   */
  canUseMARCIVerifiedList(showModal = true) {
    // OpenAI account must be connected to MARCI account
    if (!this.#user.IsLinked) {
      showModal &&
        this.showModal(
          QuotaMessages.CONNECT_ACCOUNT_UPGRADE_MARCI_VERIFIED_LIST,
          AppSignupURL
        );

      return false;
    }

    // No access to "MARCI Verified" list if plan is lower than Pro
    if (this.#quota.MaxLevel < PlanLevelNo.PRO) {
      showModal &&
        this.showModal(
          QuotaMessages.UPGRADE_ACCOUNT_MARCI_VERIFIED_LIST,
          AppPricingURL
        );

      return false;
    }

    return true;
  }

  /**
   * Check if user can use the "View Prompt Template Source"
   *
   * @returns {boolean}
   */
  canUseViewPromptTemplateSource() {
    // OpenAI account must be connected to MARCI account
    if (!this.#user.IsLinked) {
      this.showModal(
        QuotaMessages.CONNECT_ACCOUNT_VIEW_PROMPT_TEMPLATE_SOURCE,
        AppSignupURL
      );

      return false;
    }

    // No access to "View Prompt Template Source" if plan is lower than Elite
    if (this.#quota.MaxLevel < PlanLevelNo.ELITE) {
      this.showModal(
        QuotaMessages.UPGRADE_ACCOUNT_VIEW_PROMPT_TEMPLATE_SOURCE,
        AppPricingURL
      );

      return false;
    }

    return true;
  }

  // "Quota exceeded" response from API (max. lists)
  listQuotaExceeded() {
    this.showModal(
      QuotaMessages.UPGRADE_ACCOUNT_LIST_QUOTA_EXCEEDED,
      AppPricingURL
    );
  }

  // "Quota exceeded" response from API (max. list items)
  listItemQuotaExceeded() {
    this.showModal(
      QuotaMessages.UPGRADE_ACCOUNT_LIST_ITEM_QUOTA_EXCEEDED,
      AppPricingURL
    );
  }

  /**
   * Check if user can create a private prompt template
   * (requires OpenAI account to be connected with MARCI account & max. private prompts quota not exceeded)
   *
   * @param {import('./inject.js').Prompt[]} ownPrompts
   * @returns {boolean}
   */
  canCreatePrivatePromptTemplate(ownPrompts = []) {
    // OpenAI account must be connected to MARCI account
    if (!this.#user.IsLinked) {
      return false;
    }

    // Check only own prompts with type "Private"
    const ownPrivatePrompts = ownPrompts.filter(
      (prompt) => prompt.PromptTypeNo === PromptTypeNo.PRIVATE
    );

    // Check if user can add more private prompts
    if (ownPrivatePrompts.length >= this.#quota.TotalPromptStorePrivate) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can create a public prompt template
   * (requires max. upcoming public prompts quota not exceeded)
   *
   * @param {import('./inject.js').Prompt[]} ownPrompts
   * @returns {boolean}
   */
  canCreatePublicPromptTemplate(ownPrompts = []) {
    // TODO: only users with connected OpenAI and MARCI account or all users can add public prompts?

    const ownPublicPrompts = ownPrompts.filter(
      (prompt) =>
        prompt.PromptTypeNo === PromptTypeNo.PUBLIC &&
        prompt.Votes < MIN_PUBLIC_PROMPT_VOTES_THRESHOLD
    );

    if (ownPublicPrompts.length >= this.#quota.MaxPromptPublicUpcoming) {
      return false;
    }

    return true;
  }

  /**
   * Check if user can create a team prompt template
   *
   * @param {import('./inject.js').Prompt[]} ownPrompts
   * @returns {boolean}
   */
  canCreateTeamPromptTemplate(ownPrompts = []) {
    // OpenAI account must be connected to MARCI account
    if (!this.#user.IsLinked) {
      return false;
    }

    if (!this.hasTeamsFeatureEnabled()) {
      return false;
    }

    return true;
  }

  // Exceeded max. public prompts quota
  publicPromptsQuotaExceeded() {
    this.showModal(
      QuotaMessages.UPGRADE_ACCOUNT_PUBLIC_PROMPTS_QUOTA_EXCEEDED,
      AppPricingURL
    );
  }

  // Exceeded max. private prompts quota
  privatePromptsQuotaExceeded() {
    if (!this.#user.IsLinked) {
      this.showModal(
        QuotaMessages.CONNECT_ACCOUNT_TO_USE_PRIVATE_PROMPTS,
        AppSignupURL
      );

      return;
    }

    this.showModal(
      QuotaMessages.UPGRADE_ACCOUNT_PRIVATE_PROMPTS_QUOTA_EXCEEDED,
      AppPricingURL
    );
  }

  // Exceeded max. team prompts quota
  teamPromptsQuotaExceeded() {
    if (!this.#user.IsLinked) {
      this.showModal(
        QuotaMessages.CONNECT_ACCOUNT_TO_USE_TEAM_PROMPTS,
        AppSignupURL
      );

      return;
    }
  }

  // "Quota exceeded" response from API (either max. private prompts or max. upcoming public prompts)
  promptQuotaExceeded() {
    if (!this.#user.IsLinked) {
      this.showModal(
        QuotaMessages.CONNECT_ACCOUNT_PROMPT_QUOTA_EXCEEDED,
        AppSignupURL
      );

      return;
    }

    this.showModal(
      QuotaMessages.UPGRADE_ACCOUNT_PROMPT_QUOTA_EXCEEDED,
      AppPricingURL
    );
  }

  // "Incorrect plan for document index feature" response from API
  incorrectPlanForDocumentIndexFeature() {
    if (!this.#user.IsLinked) {
      this.showModal(
        QuotaMessages.CONNECT_ACCOUNT_DOCUMENT_INDEX_INCORRECT_PLAN,
        AppSignupURL
      );

      return;
    }

    this.showModal(
      QuotaMessages.UPGRADE_ACCOUNT_DOCUMENT_INDEX_INCORRECT_PLAN,
      AppPricingURL
    );
  }

  /**
   * Check if user can use the "Referrals" feature
   *
   * @returns {boolean}
   */
  canUseReferrals() {
    if (!this.hasReferralsFeatureEnabled()) {
      return false;
    }

    // OpenAI account must be connected to MARCI account
    if (!this.#user.IsLinked) {
      this.showModal(QuotaMessages.CONNECT_ACCOUNT_USE_REFERRALS, AppSignupURL);

      return false;
    }

    return true;
  }

  /**
   * Check if user can use a custom tone
   *
   * @param {import('./inject.js').Tone} Tone
   * @returns {boolean}
   */
  canUseCustomTone(Tone = null) {
    // Plan level must be at least "Plus"
    if (this.#quota.MaxLevel >= PlanLevelNo.PLUS) {
      return true;
    }

    if (!Tone) {
      return false;
    }

    // Allow only selected Tones for all users
    return ['Emotional'].includes(Tone.Label);
  }

  // Show modal to upgrade account to use all available tones
  upgradeCustomTone() {
    this.showModal(
      QuotaMessages.UPGRADE_ACCOUNT_CUSTOM_TONE_WRITING_STYLE,
      AppPricingURL
    );
  }

  /**
   * Check if user can use a custom writing style
   *
   * @param {import('./inject.js').WritingStyle} WritingStyle
   * @returns {boolean}
   */
  canUseCustomWritingStyle(WritingStyle = null) {
    // Plan level must be at least "Plus"
    if (this.#quota.MaxLevel >= PlanLevelNo.PLUS) {
      return true;
    }

    if (!WritingStyle) {
      return false;
    }

    // Allow only selected Writing Styles for all users
    return ['Poetic'].includes(WritingStyle.Label);
  }

  // Show modal to upgrade account to use all available writing styles
  upgradeCustomWritingStyle() {
    this.showModal(
      QuotaMessages.UPGRADE_ACCOUNT_CUSTOM_TONE_WRITING_STYLE,
      AppPricingURL
    );
  }

  // Check if user can use "Power Continue" (requires certain plan level)
  canUsePowerContinue() {
    // Plan level must be at least "BASIC"
    return this.#quota.MaxLevel >= PlanLevelNo.BASIC;
  }

  // Show modal to upgrade account to use "Power Continue"
  upgradePowerContinue() {
    this.showModal(QuotaMessages.UPGRADE_ACCOUNT_POWER_CONTINUE, AppPricingURL);
  }

  canAddCustomToneWritingStylePowerContinue() {
    // Plan level must be at least "PRO"
    if (this.#quota.MaxLevel >= PlanLevelNo.PRO) {
      return true;
    }

    // Show modal to upgrade account
    this.showModal(
      QuotaMessages.UPGRADE_ACCOUNT_CUSTOM_TONE_WRITING_STYLE_POWER_CONTINUE,
      AppPricingURL
    );

    return false;
  }

  // Check if user can use "Live Crawling" (requires certain plan level)
  canUseLiveCrawling() {
    // Plan level must be at least "ELITE"
    if (this.#quota.MaxLevel >= PlanLevelNo.ELITE) {
      return true;
    }

    // Show modal to upgrade account to use "Live Crawling" (or connect OpenAI account to MARCI account and then upgrade, if not connected)
    this.showModal(
      !this.#user.IsLinked
        ? QuotaMessages.CONNECT_ACCOUNT_UPGRADE_TO_USE_LIVE_CRAWLING
        : QuotaMessages.UPGRADE_ACCOUNT_LIVE_CRAWLING,
      !this.#user.IsLinked ? AppSignupURL : AppPricingURL
    );

    return false;
  }

  // Check if user can use "Hide Watermark" (requires certain plan level)
  canUseHideWatermark(showModal = true) {
    // Plan level must be at least "ELITE"
    if (this.#quota.MaxLevel >= PlanLevelNo.ELITE) {
      return true;
    }

    if (showModal) {
      // Show modal to upgrade account to use "Hide Watermark" (or connect OpenAI account to MARCI account and then upgrade, if not connected)
      this.showModal(
        !this.#user.IsLinked
          ? QuotaMessages.CONNECT_ACCOUNT_UPGRADE_TO_USE_HIDE_WATERMARK
          : QuotaMessages.UPGRADE_ACCOUNT_HIDE_WATERMARK,
        !this.#user.IsLinked ? AppSignupURL : AppPricingURL
      );
    }

    return false;
  }

  // Check if user can use "Custom Indexes" (requires certain plan level)
  canUseCustomIndexes() {
    // Plan level must be at least "ELITE"
    if (this.#quota.MaxLevel >= PlanLevelNo.ELITE) {
      return true;
    }

    // Show modal to upgrade account to use "Custom Indexes" (or connect OpenAI account to MARCI account and then upgrade, if not connected)
    this.showModal(
      !this.#user.IsLinked
        ? QuotaMessages.CONNECT_ACCOUNT_DOCUMENT_INDEX_INCORRECT_PLAN
        : QuotaMessages.UPGRADE_ACCOUNT_DOCUMENT_INDEX_INCORRECT_PLAN,
      !this.#user.IsLinked ? AppSignupURL : AppPricingURL
    );

    return false;
  }

  /**
   * Show modal with announcement to connect OpenAI account to MARCI account
   *
   * @returns {boolean}
   */
  connectAccountAnnouncement() {
    if (this.#user.IsLinked) {
      return false;
    }

    this.showModal(
      QuotaMessages.CONNECT_ACCOUNT_ANNOUNCEMENT,
      AppSignupURL,
      true
    );

    return true;
  }

  /**
   * Show modal with message and action URL to redirect user to after clicking on "Continue" button
   *
   * @param {string} message
   * @param {string} actionURL
   * @param {boolean} showMessages
   */
  showModal(message = '', actionURL = '', showMessages = false) {
    let quotaMessageModal = document.getElementById('quotaMessageModal');

    // if modal does not exist, create it, add event listener on submit and append it to body
    if (!quotaMessageModal) {
      quotaMessageModal = document.createElement('div');
      quotaMessageModal.id = 'quotaMessageModal';

      document.body.appendChild(quotaMessageModal);
    }

    quotaMessageModal.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
        <div class="MARCI__absolute MARCI__bg-black/50 dark:MARCI__bg-black/80 MARCI__inset-0">
        </div>

        <div class="MARCI__fixed MARCI__inset-0 MARCI__overflow-y-auto">
          <div class="MARCI__flex MARCI__items-center MARCI__justify-center MARCI__min-h-full">
            <div
              class="MARCI__align-center MARCI__bg-white dark:MARCI__bg-gray-900 dark:MARCI__text-gray-200 MARCI__inline-block MARCI__overflow-hidden sm:MARCI__rounded-lg MARCI__shadow-xl sm:MARCI__align-middle sm:MARCI__max-w-lg sm:MARCI__my-8 sm:MARCI__w-full MARCI__text-left MARCI__transform MARCI__transition-all"
              role="dialog" aria-modal="true" aria-labelledby="modal-headline">

              <div class="MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__px-4 MARCI__pt-5 MARCI__pb-4 sm:MARCI__p-6 sm:MARCI__pb-4">
                ${message}
              </div>

              <div class="MARCI__bg-gray-200 dark:MARCI__bg-gray-850 MARCI__px-4 MARCI__py-3 MARCI__text-right">
                <button id="quotaMessageModalCancel" type="button" class="MARCI__bg-gray-600 hover:MARCI__bg-gray-800 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">Cancel</button>
                <button id="quotaMessageModalSubmit" class="MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">Continue</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    // add event listener to close the modal on ESC
    const keydownListener = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    // close modal and remove event listener on ESC
    const closeModal = () => {
      window.MARCI.hideModal('quotaMessageModal', showMessages);
      document.removeEventListener('keydown', keydownListener);
    };

    document.addEventListener('keydown', keydownListener);

    // add event listener for quotaMessageModalCancel button
    const quotaMessageModalCancel = document.getElementById(
      'quotaMessageModalCancel'
    );

    if (quotaMessageModalCancel) {
      quotaMessageModalCancel.addEventListener('click', closeModal);
    }

    // add event listener for quotaMessageModalSubmit button
    const quotaMessageModalSubmit = document.getElementById(
      'quotaMessageModalSubmit'
    );

    if (quotaMessageModalSubmit) {
      quotaMessageModalSubmit.addEventListener('click', () => {
        closeModal();

        // open action URL in new tab
        window.open(actionURL, '_blank');
      });
    }

    // show modal
    quotaMessageModal.style = 'display: block;';
  }

  /**
   * Returns how many prompt variable enum values can be added to the prompt and used in the prompt
   *
   * @param {boolean} showModal
   * @returns {boolean}
   */
  promptVariableEnumMaxSize() {
    // OpenAI account must be connected to MARCI account
    // and MARCI account must be at least "BASIC" plan level
    if (this.#user.IsLinked && this.#quota.MaxLevel >= PlanLevelNo.BASIC) {
      return 100;
    }

    return 3;
  }

  upgradePromptVariableEnumMaxSize() {
    this.showModal(
      QuotaMessages.UPGRADE_ACCOUNT_PROMPT_VARIABLE_VALUES,
      AppPricingURL
    );
  }

  /**
   * @param {FeatureBitset} feature
   * @returns {boolean}
   */
  hasFeatureEnabled(feature) {
    // OpenAI account must be connected to MARCI account before checking for features
    if (!this.#user.IsLinked) {
      return false;
    }

    return (this.#user.FeatureBitset & feature) === feature;
  }

  hasTeamsFeatureEnabled() {
    // MarciAI_change: temp disable team feature
    return false;

    return this.hasFeatureEnabled(FeatureBitset.TEAMS);
  }

  hasReferralsFeatureEnabled() {
    return this.hasFeatureEnabled(FeatureBitset.REFERRALS);
  }

  hasCustomIndexesFeatureEnabled() {
    return this.hasFeatureEnabled(FeatureBitset.CUSTOM_INDEXES);
  }

  /**
   * Check if the user has reached the limit of sent prompts per day (MARCI and NONMARCI prompts)
   * and show a modal if the limit is exceeded
   *
   * @param {boolean} isMARCIPrompt - MARCI prompt or NONMARCI prompt
   * @returns {boolean} Returns true if the prompt can be sent, false if the limit is exceeded
   */
  canSendPrompt(isMARCIPrompt) {
    return new PromptSendQuota(
      isMARCIPrompt,
      this.#quota,
      this.#user,
      QuotaMessages,
      this.showModal
    ).canSendPrompt();
  }

  getPromptSendQuotaExceededMessage() {
    return QuotaMessages.PROMPT_SEND_QUOTA_EXCEEDED;
  }
}
