/** @enum {string} */
const PromptTemplatesType = {
  PUBLIC: 'public',
  OWN: 'own',
  CUSTOM_LIST: 'list',
};

/** @enum {string} */
const NotificationSeverity = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

/** @enum {number} */
const PromptTypeNo = {
  UNKNOWN: 0,
  PRIVATE: 1,
  PUBLIC: 2,
  PAID: 4,
  TEAM: 16,
};

/** @enum {number} */
const SystemNo = {
  UNKNOWN: 0,
  OPENAI: 1,
};

/** @enum {number} */
const FeedbackTypeNo = {
  UNKNOWN: 0,
  GENERIC_CONCERN: 1,
  GENERIC_LEGAL_CONCERN: 2,
  LEGAL_COPYRIGHT: 10,
  LEGAL_DMCA: 11,
  LEGAL_TRADEMARK: 12,
  PERSONAL_INFO: 20,
  ABUSIVE: 21,
  ILLEGAL: 22,
  NOT_MULTILINGUAL: 51,
  NOT_GENERIC: 52,
  SPAM: 91,
  PROMPT_SUPPORT_FREE: 101,
  PROMPT_SUPPORT_PAID: 102,
  PROMPT_SUPPORT_WANT_PAID: 103,
};

/** @enum {number} */
const UsageTypeNo = {
  UNKNOWN: 0,
  CLICK: 1,
  SEND: 2,
  RECEIVED_OK: 4,
  RECEIVED_ERROR: 8,
  SAVE: 16,
  UPDATE: 32,
  DELETE: 64,
  LIVE_CRAWLING: 128,
  VIEW_SOURCE: 256,
  FORK: 512,
  EXPORT: 1024,
  CREATE_BASIC: 2048,
  CREATE_ADVANCED: 4096,
};

/** @enum {number} */
const VoteTypeNo = {
  UNKNOWN: 0,
  PROMPT_TEASER_THUMBS: 1,
  RESULT_THUMBS: 2,
  FOLLOW_UP_THUMBS: 4,
  MESSAGE_CONFIRM: 8,
  MESSAGE_LIKE: 16,
  MESSAGE_DISLIKE: 32,
};

/** @enum {number} */
const GizmoVoteTypeNo = {
  UNKNOWN: 0,
  TEASER_THUMBS: 1,
  VIEW: 2,
  USE_ONCE: 4,
  USE_MESSAGE: 8,
  USE_STARTERPROMPT: 16,
  RESULT_THUMBS: 32,
};

/** @enum {number} */
const SortModeNo = {
  //UNKNOWN: 0, // not used & not displayed in the "Sort by" dropdown
  TOP_USAGE: 8,
  TOP_VOTES_TRENDING: 2,
  TOP_VOTES_ABSOLUTE: 16,
  TOP_VIEWS: 1,
  LATEST_UPDATES: 4,
};

/** @enum {number} */
const MessageStatusNo = {
  UNKNOWN: 0,
  DELETE_MARK: 20,
  DELETE_DONE: 29,
  INACTIVE: 99,
  ACTIVE: 100,
};

/** @enum {number} */
const MessageSeverityNo = {
  UNKNOWN: 0,
  INFO: 1,
  SUCCESS: 2,
  UPDATE: 4,
  MANDATORY_MUST_CONFIRM: 8,
};

/** @enum {number} */
const MessageGroupNo = {
  UNKNOWN: 0,
  SYSTEM: 10000,
  USER: 10001,
};

/** @enum {number} */
const MessageVoteTypeNo = {
  UNKNOWN: VoteTypeNo.UNKNOWN,
  MESSAGE_LIKE: VoteTypeNo.MESSAGE_LIKE,
  MESSAGE_DISLIKE: VoteTypeNo.MESSAGE_DISLIKE,
};

/** @enum {number} */
const UserStatusNo = {
  UNKNOWN: 0,
  NORMAL: 1,
  ADMIN: 2,
  BLACKLIST_BAN: 4,
  BLACKLIST_NO_WRITE: 8,
  BLACKLIST_NO_PUBLIC: 16,
};

/** @enum {number} */
const UserLevelNo = {
  UNKNOWN: 0,
  SUPER_ADMIN: 32768,
};

/** @enum {number} */
const SubPromptTypeNo = {
  UNKNOWN: 0,
  CustomTones: 10,
  CustomStyles: 20,
  CustomContinue: 30,
  MyProfileInfo: 50,
};

/** @enum {number} */
const ListTypeNo = {
  UNKNOWN: 0,
  MARCI_VERIFIED: 1,
  FAVORITES: 4,
  HIDDEN: 8,
  CUSTOM: 32,
  TEAM_CUSTOM: 48,
};

/** @enum {number} */
const ListStatusNo = {
  UNKNOWN: 0,
  DELETE_MARK: 20,
  DELETE_DONE: 29,
  ACTIVE: 100,
  ACTIVE_HIDDEN: 101,
};

/** @enum {number} */
const ItemStatusNo = {
  UNKNOWN: 0,
  DELETE_MARK: 20,
  DELETE_DONE: 29,
  REVIEW_SCHEDULED: 81,
  REVIEWED_AND_REJECTED: 89,
  REPORTED_UNDER_INVESTIGATION: 98,
  REPORTED_HIDDEN: 99,
  ACTIVE: 100,
  ACTIVE_REPORTED_BUT_APPROVED: 101,
};

/** @enum {number} */
const PlanLevelNo = {
  FREE_ANONYMOUS: 1,
  BASIC: 100,
  PLUS: 200,
  PRO: 300,
  ELITE: 400,
  TITAN: 1000,
  TEAM: 2000,
  BUSINESS: 3000,
  ENTERPRISE: 5000,
};

/** @enum {number} */
const MemberRoleNo = {
  UNKNOWN: 0,
  OWNER: 1,
  READ_ONLY: 2,
  READ_WRITE: 4,
  ADMIN: 8,
};

/** @enum {number} */
const FeatureBitset = {
  UNKNOWN: 0,
  TEAMS: 1,
  REFERRALS: 4,
  CUSTOM_INDEXES: 8
};

/** @enum {number} */
const PromptFeatureBitset = {
  NOTHING: 0,
  LIVE_CRAWLING: 1,
};

/** @enum {number} */
const ModelStatusNo = {
  UNKNOWN: 0,
  ACTIVE: 1,
  DEPRECATED: 2,
  SPECIAL_GIZMO: 4,
  UNSUPPORTED: 8,
};

/** @enum {string} */
const LayoutChangeType = {
  GENERAL: 'General',
  PROMPT_TEMPLATES: 'PromptTemplates',
};

/** @enum {string} */
const CreatePromptMode = {
  BASIC: 'basic',
  ADVANCED: 'advanced',
};

/** @enum {number} */
const LicenseWarningLevelNo = {
  UNKNOWN: 0,
  WARNING: 1,
  ERROR: 2,
};

export {
  PromptTemplatesType,
  NotificationSeverity,
  PromptTypeNo,
  SystemNo,
  FeedbackTypeNo,
  UsageTypeNo,
  VoteTypeNo,
  GizmoVoteTypeNo,
  SortModeNo,
  MessageStatusNo,
  MessageSeverityNo,
  MessageGroupNo,
  MessageVoteTypeNo,
  UserStatusNo,
  UserLevelNo,
  SubPromptTypeNo,
  ListTypeNo,
  ListStatusNo,
  ItemStatusNo,
  PlanLevelNo,
  MemberRoleNo,
  FeatureBitset,
  PromptFeatureBitset,
  ModelStatusNo,
  LayoutChangeType,
  CreatePromptMode,
  LicenseWarningLevelNo,
};
