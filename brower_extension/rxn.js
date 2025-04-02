/** @enum {number} */
const ReactionNo = {
  RXN_MARCI_ACCESS_FORBIDDEN: 70005,

  RXN_MARCI_OVER_LIMIT_PROMPTS: 70009,
  RXN_MARCI_QUOTA_EXCEEDED: 70010,
  RXN_MARCI_PROMPT_NOT_FOUND: 70002,
  RXN_MARCI_INVALID_ID: 70003,

  RXN_MARCI_INVALID_PROMPT_TITLE_LANG: 70100,
  RXN_MARCI_INVALID_PROMPT_TEASER_LANG: 70101,
  RXN_MARCI_INVALID_PROMPT_HINT_LANG: 70102,
  RXN_MARCI_INVALID_PROMPT_TITLE_UPPERCASE: 70103,
  RXN_MARCI_INVALID_PROMPT_TITLE_WORD_COUNT: 70104,
  RXN_MARCI_INVALID_PROMPT_TEASER_UPPERCASE: 70105,
  RXN_MARCI_INVALID_PROMPT_HINT_UPPERCASE: 70106,

  RXN_MARCI_LIST_NOT_FOUND: 70301,

  RXN_MARCI_REFERRALS_NO_OFFER: 74001,
  RXN_MARCI_REFERRALS_MAX_REDEMPTIONS: 74002,

  RXN_MARCI_DOCUMENT_INDEX_NOT_FOUND: 80001,
  RXN_MARCI_DOCUMENT_INDEX_INCORRECT_PLAN: 80005,
};

/** @enum {string} */
const ReactionMessage = {
  [ReactionNo.RXN_MARCI_ACCESS_FORBIDDEN]:
    'The requested action is not allowed.',

  [ReactionNo.RXN_MARCI_OVER_LIMIT_PROMPTS]:
    "You can only create new public prompts if all your public prompts have more than 5 upvotes.<br><br>You can only create new private prompts if you didn't reach the limit of max. allowed private prompts. <br><br> Please try again in a few seconds, in case you just unpublished or deleted another public prompt, or deleted another private prompt.",

  [ReactionNo.RXN_MARCI_QUOTA_EXCEEDED]:
    'Quota exceeded - please upgrade your account.',

  [ReactionNo.RXN_MARCI_INVALID_PROMPT_TITLE_LANG]:
    'The prompt title is not in English.',
  [ReactionNo.RXN_MARCI_INVALID_PROMPT_TEASER_LANG]:
    'The prompt teaser is not in English.',
  [ReactionNo.RXN_MARCI_INVALID_PROMPT_HINT_LANG]:
    'The prompt hint is not in English.',
  [ReactionNo.RXN_MARCI_INVALID_PROMPT_TITLE_UPPERCASE]:
    'The prompt title has too many uppercase letters.',
  [ReactionNo.RXN_MARCI_INVALID_PROMPT_TITLE_WORD_COUNT]:
    'The prompt title is too long.',
  [ReactionNo.RXN_MARCI_INVALID_PROMPT_TEASER_UPPERCASE]:
    'The prompt teaser has too many uppercase letters.',
  [ReactionNo.RXN_MARCI_INVALID_PROMPT_HINT_UPPERCASE]:
    'The prompt hint has too many uppercase letters.',

  [ReactionNo.RXN_MARCI_LIST_NOT_FOUND]: 'The list was not found.',

  [ReactionNo.RXN_MARCI_DOCUMENT_INDEX_NOT_FOUND]:
    'Document Index does not exist.',

  [ReactionNo.RXN_MARCI_DOCUMENT_INDEX_INCORRECT_PLAN]:
    'Incorrect subscription plan for Custom Index feature.',
};

class Reaction extends Error {
  /** @type {string} - mapped reaction message shown to user */
  message = '';

  /** @type {ReactionNo} - reaction number */
  ReactionNo;

  /** @param {string} message */
  constructor(message, ReactionNo) {
    super(message);

    this.message = message;
    this.ReactionNo = ReactionNo;
  }

  /**
   * Maps a ReactionNo to a ReactionMessage and returns a new Reaction
   *
   * @param {ReactionNo} currentReactionNo
   * @returns {Reaction}
   */
  static mapReactionNo(currentReactionNo) {
    return new Reaction(
      ReactionMessage[currentReactionNo]
        ? ReactionMessage[currentReactionNo]
        : 'Something went wrong, please try again later.',
      currentReactionNo
    );
  }
}

export { Reaction, ReactionNo, ReactionMessage };
