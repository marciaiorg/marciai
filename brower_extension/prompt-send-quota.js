import { AppPricingURL, AppSignupURL } from './config.js';

export class PromptSendQuota {
  #isMARCIPrompt;
  #quota;
  #user;
  #dateKey;
  #counterKey;
  #blockedSinceKey;
  #messagePrefix;
  #currentDate;
  #quotaMessages;
  #showModal;

  /**
   *
   * @param {boolean} isMARCIPrompt
   * @param {import("./client").Quota} quota
   * @param {import("./client").User} user
   * @param {Record<string, string>} quotaMessages
   * @param {(message: string, actionURL: string, showMessages: boolean) => void} showModal
   */
  constructor(isMARCIPrompt, quota, user, quotaMessages, showModal) {
    this.#isMARCIPrompt = isMARCIPrompt;

    this.#quota = quota;

    this.#user = user;

    // Define the keys for the localStorage items based on the prompt type
    this.#dateKey = isMARCIPrompt
      ? 'MARCI_MARCIPromptSendCounterDate'
      : 'MARCI_NONMARCIPromptSendCounterDate';

    this.#counterKey = isMARCIPrompt
      ? 'MARCI_MARCIPromptSendCounter'
      : 'MARCI_NONMARCIPromptSendCounter';

    this.#blockedSinceKey = isMARCIPrompt
      ? 'MARCI_MARCIPromptBlockedSince'
      : 'MARCI_NONMARCIPromptBlockedSince';

    // Use quota.MaxLevel as part of the blockedSinceKey to determine if the user connected/upgraded MARCI account (and is possibly unblocked)
    this.#blockedSinceKey += '.Level' + this.#quota.MaxLevel;

    // Different message prefix based on the user's account status (different call-to-action & messages)
    this.#messagePrefix = this.#user.IsLinked ? 'UPGRADE_' : 'CONNECT_';

    this.#currentDate = new Date().toISOString().split('T')[0];

    this.#quotaMessages = quotaMessages;

    this.#showModal = showModal;
  }

  // Reset the counter if it's a new day and remove the blockedSince key (expired blocking)
  checkAndResetIfNewDay() {
    const storedDate = localStorage.getItem(this.#dateKey);

    if (storedDate !== this.#currentDate) {
      this.debug('PromptSendQuota: New day, resetting the counter');

      localStorage.setItem(this.#counterKey, '0');
      localStorage.setItem(this.#dateKey, this.#currentDate);
      localStorage.removeItem(this.#blockedSinceKey);
    }
  }

  /**
   * Check if the user is currently blocked
   *
   * @returns boolean Whether the user is currently blocked from sending prompts (true = blocked, false = not blocked)
   */
  isCurrentlyBlocked() {
    const blockedSince = localStorage.getItem(this.#blockedSinceKey);

    if (!blockedSince) {
      this.debug('PromptSendQuota: not blockedSince');

      return false;
    }

    const blockedSinceDate = new Date(blockedSince);
    const currentDate = new Date();

    const diff = currentDate - blockedSinceDate;

    // Check if the user is still blocked (diff in milliseconds < blocking time in seconds * 1000)
    if (diff < this.#quota.QuotaPromptBlockingTime * 1000) {
      this.debug('PromptSendQuota: currently blocked');

      this.showBlockingModal(blockedSince);

      // Blocking - user has reached the hard limit of prompts per day
      return true;
    }

    this.debug('PromptSendQuota: expired blocking, resetting the counter');

    // Reset blockedSince if the blocking time has passed
    localStorage.removeItem(this.#blockedSinceKey);
    localStorage.removeItem(this.#counterKey);

    // Not blocked
    return false;
  }

  /**
   * Handle hard limits - blocking the user from sending prompts
   *
   * @returns {boolean} Whether the user has reached the hard limit of prompts per day (true = blocked, false = not blocked)
   */
  handleHardLimit() {
    const promptSendCounter =
      parseInt(localStorage.getItem(this.#counterKey)) || 0;

    let blockedSince = localStorage.getItem(this.#blockedSinceKey);

    const maxPromptSendPerDayBlocking = this.#isMARCIPrompt
      ? this.#quota.QuotaPromptSendPerDayMARCIblocking
      : this.#quota.QuotaPromptSendPerDayNONMARCIblocking;

    if (
      typeof maxPromptSendPerDayBlocking !== 'undefined' &&
      maxPromptSendPerDayBlocking !== -1 &&
      promptSendCounter >= maxPromptSendPerDayBlocking
    ) {
      this.debug('PromptSendQuota: hard limit reached');

      // Set blockedSince if it's not already set
      if (!blockedSince) {
        this.debug('PromptSendQuota: setting blockedSince');

        blockedSince = new Date().toISOString();

        try {
          localStorage.setItem(this.#blockedSinceKey, blockedSince);
        } catch (error) {
          console.error(
            'Could not set localStorage item',
            this.#blockedSinceKey,
            error
          );
        }
      }

      this.showBlockingModal(blockedSince);

      // Blocking - user has reached the hard limit of prompts per day
      return true;
    }

    // Not blocked
    return false;
  }

  /**
   * Show a modal to connect/upgrade account if the user has reached the hard limit of prompts per day
   *
   * @param {string} blockedSince The ISO string of the date when the user was blocked
   */
  showBlockingModal(blockedSince) {
    // Get the blocking time in seconds
    const blockingTime = this.#quota.QuotaPromptBlockingTime;
    const blockingTimeInMs = blockingTime * 1000;

    const blockedSinceDate = new Date(blockedSince);

    // Calculate the date until the user is blocked based on the blocking time
    const blockedUntilDate = new Date(
      blockedSinceDate.getTime() + blockingTimeInMs
    );

    // Compare blockedUntilDate with currentDate (possibly different days)
    // blockedUntilDate is tomorrow midnight max, since quota is per day
    const maxBlockedUntilDate =
      this.#currentDate !== blockedUntilDate.toISOString().split('T')[0]
        ? new Date(new Date().setHours(24, 0, 0, 0)) // Tomorrow midnight
        : blockedUntilDate;

    // Show the time until the user can send prompts again in the modal
    const blockedUntilTime = maxBlockedUntilDate.toLocaleString();

    // Show the modal to connect/upgrade account if the user has reached the hard limit
    // with different message based on the prompt type (MARCI/NONMARCI),
    // account status (linked/unlinked), and blocked until time
    this.#showModal(
      this.#quotaMessages[
        `${this.#messagePrefix}ACCOUNT_PROMPT_SEND_${
          this.#isMARCIPrompt ? 'MARCI' : 'NONMARCI'
        }_QUOTA_EXCEEDED_BLOCKED`
      ].replace(
        '$blockedUntilTime',
        // Use "tomorrow" if the QuotaPromptBlockingTime is not defined
        blockingTimeInMs ? blockedUntilTime : 'tomorrow'
      ),
      this.constructTrackingURL(true)
    );
  }

  // Handle soft limits - showing a modal to upgrade the account if the user has reached the quota
  // Modal is shown on every multiple of the quota with different message (if available)
  handleSoftLimit() {
    // Define the maximum number of prompts that can be sent per day based on the MARCI/NONMARCI
    const maxPromptSendPerDay = this.#isMARCIPrompt
      ? this.#quota.QuotaPromptSendPerDayMARCI
      : this.#quota.QuotaPromptSendPerDayNONMARCI;

    const promptSendCounter =
      parseInt(localStorage.getItem(this.#counterKey)) || 0;

    // Check if the user has reached the limit of sent prompts per day
    // - maxPromptSendPerDay = -1 means unlimited prompts per day,
    // - number of sent prompts needs to be a multiple of quota max prompts per day to show the modal
    if (
      typeof maxPromptSendPerDay !== 'undefined' &&
      maxPromptSendPerDay !== -1 &&
      promptSendCounter >= maxPromptSendPerDay &&
      promptSendCounter % maxPromptSendPerDay === 0
    ) {
      this.debug('PromptSendQuota: soft limit reached');

      // Get the available message suffixes based on the prompt send counter (e.g. 1, 2, 3, ...)
      const availableMessages = Object.keys(this.#quotaMessages)
        .filter(
          (key) =>
            key.startsWith(
              `${this.#messagePrefix}ACCOUNT_PROMPT_SEND_${
                this.#isMARCIPrompt ? 'MARCI' : 'NONMARCI'
              }_QUOTA_EXCEEDED`
            ) && key.match(/\d+$/)
        )
        .map((key) => parseInt(key.match(/\d+$/)[0]))
        .sort((a, b) => a - b);

      this.debug(
        'PromptSendQuota: soft limit - availableMessages',
        availableMessages
      );

      // Check which message suffix should be used based on the prompt send counter
      const messageSuffixCounter = Math.floor(
        promptSendCounter / maxPromptSendPerDay
      );

      // Use the next closest message suffix (smaller than the counter) if the exact message is not available
      const messageSuffix = availableMessages.includes(messageSuffixCounter)
        ? messageSuffixCounter
        : availableMessages
            .filter((message) => message < messageSuffixCounter)
            .pop();

      this.debug('PromptSendQuota: soft limit - messageSuffix', messageSuffix);

      // Show the modal to upgrade account if the user has reached the soft limit of prompts per day
      this.#showModal(
        this.#quotaMessages[
          `${this.#messagePrefix}ACCOUNT_PROMPT_SEND_${
            this.#isMARCIPrompt ? 'MARCI' : 'NONMARCI'
          }_QUOTA_EXCEEDED_${messageSuffix}`
        ],
        this.constructTrackingURL(false)
      );
    }
  }

  incrementCounter() {
    this.debug('PromptSendQuota: incrementing the counter');

    const promptSendCounter =
      parseInt(localStorage.getItem(this.#counterKey)) || 0;

    try {
      localStorage.setItem(this.#counterKey, promptSendCounter + 1);
    } catch (error) {
      console.error('Could not set localStorage item', this.#counterKey, error);
    }
  }

  /**
   * Validate if the prompt can be sent based on the user's prompt send quota (hard and soft limits)
   *
   * @returns {boolean} Whether the prompt can be sent or not
   */
  canSendPrompt() {
    this.checkAndResetIfNewDay();

    if (this.isCurrentlyBlocked()) {
      return false;
    }

    if (this.handleHardLimit()) {
      return false;
    }

    this.handleSoftLimit();

    this.incrementCounter();

    return true;
  }

  constructTrackingURL(isBlocked = false) {
    let trackingURL = !this.#user.IsLinked ? AppSignupURL : AppPricingURL;

    return `${trackingURL}?utm_source=extension&utm_medium=continuebutton&utm_campaign=QuotaPromptSend${
      this.#isMARCIPrompt ? 'MARCI' : 'NONMARCI'
    }_${isBlocked ? 'HardLimit' : 'SoftLimit'}`;
  }

  debug(...args) {
    // console.log(...args);
  }
}
