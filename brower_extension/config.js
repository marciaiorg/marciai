// Change the currentEnvironment variable to switch between environments (local, test, production)
const currentEnvironment = 'production';

// Define environment-specific constants (API endpoints, etc.)
const getEnvironmentConfig = () => {
  switch (currentEnvironment) {
    case 'production':
      return {
        APIEndpoint: 'https://api.aiprm.com/api9',
        NewAPIEndpoint: "https://api.marciai.app",
        APIEndpointAPP: 'https://app.aiprm.com/api',
        AppAccountURL: 'https://app.aiprm.com/account',
        AppPricingURL: 'https://app.aiprm.com/pricing',
        AppSignupURL: 'https://app.aiprm.com/signup',
        AppTeamURL: 'https://app.aiprm.com/teams',
      };
    case 'test':
      return {
        APIEndpoint: 'https://test-api.aiprm.com/api9',
        APIEndpointAPP: 'https://test-app.aiprm.com/api',
        AppAccountURL: 'https://test-app.aiprm.com/account',
        AppPricingURL: 'https://test-app.aiprm.com/pricing',
        AppSignupURL: 'https://test-app.aiprm.com/signup',
        AppTeamURL: 'https://test-app.aiprm.com/teams',
      };
    case 'local':
      return {
        APIEndpoint: 'https://dev-api.aiprm.com/api4',
        NewAPIEndpoint: "http://127.0.0.1:8090",
        APIEndpointAPP: 'https://dev-app.aiprm.com/api',
        AppAccountURL: 'https://dev-app.aiprm.com/account',
        AppPricingURL: 'https://dev-app.aiprm.com/pricing',
        AppSignupURL: 'https://dev-app.aiprm.com/signup',
        AppTeamURL: 'https://dev-app.aiprm.com/teams',
      };
    default:
      return {
        APIEndpoint: 'https://api.aiprm.com/api7',
        APIEndpointAPP: 'https://app.aiprm.com/api',
        AppAccountURL: 'https://app.aiprm.com/account',
        AppPricingURL: 'https://app.aiprm.com/pricing',
        AppSignupURL: 'https://app.aiprm.com/signup',
        AppTeamURL: 'https://app.aiprm.com/teams',
      };
  }
};

// Get environment-specific constants
const environmentConfig = getEnvironmentConfig();

// Define global constants based on environment-specific constants
const APIEndpoint = environmentConfig.APIEndpoint;
// MarciAI_change
const NewAPIEndpoint = environmentConfig.NewAPIEndpoint;
const APIEndpointAPP = environmentConfig.APIEndpointAPP;
const AppAccountURL = environmentConfig.AppAccountURL;
const AppPricingURL = environmentConfig.AppPricingURL;
const AppSignupURL = environmentConfig.AppSignupURL;
const AppTeamURL = environmentConfig.AppTeamURL;

const RESOURCE_HOST = 'https://api.marciai.app';

// Define global constants
const PromptPlaceholder = '[PROMPT]';
const PromptPlaceholder1 = '[PROMPT1]';
const TargetLanguagePlaceholder = '[TARGETLANGUAGE]';
const CrawledTextPlaceholder = '[CRAWLEDTEXT]';
const CrawledSourcePlaceholder = '[CRAWLEDSOURCE]';
const VariablePlaceholder = '[VARIABLE{idx}]';
const VariableDefinition = /\[VARIABLE([1-6]):(.+?)(:.*?)?(:.*?)?\]/g;
const LanguageFeedURL = RESOURCE_HOST + '/csv/languages-20230119.csv?v=';
const TopicFeedURL = RESOURCE_HOST + '/csv/topics-20230123.csv?v=';
const ActivityFeedURL = RESOURCE_HOST + '/csv/activities-20230124.csv?v=';
const ToneFeedURL = RESOURCE_HOST + '/csv/tones-v2-20230216.csv?v=';
const WritingStyleFeedURL =
  RESOURCE_HOST + '/csv/writing_styles-v2-20230216.csv?v=';
const ContinueActionsFeedURL =
  RESOURCE_HOST + '/csv/continue_actions-20230216.csv?v=';
const ModelFeedURL = RESOURCE_HOST + '/csv/models-20240710.csv?v=';
const PromptBuilderFeedURL =
  RESOURCE_HOST + '/csv/prompt_builder-20230811.csv?v=';
const AppShort = 'MARCI';
const AppName = 'MARCI for ChatGPT';
const AppSlogan = 'MARCI - ChatGPT Prompts';
const AppSloganPremium = 'MARCI - ChatGPT Prompts';
const AppURL =
  'https://www.aiprm.com/?via=chatgpt&utm_campaign=powered&utm_source=chatgpt&utm_medium=navlink&utm_content=MARCIpowered';
const ExportFilePrefix = 'MARCI-export-chatgpt-thread_';
const ExportHeaderPrefix =
  '\n```\nExported with MARCI https://www.aiprm.com by ';
const AppCommunityForumURL =
  'https://forum.aiprm.com/categories?via=chatgpt&utm_campaign=community&utm_source=chatgpt&utm_medium=navlink&utm_content=MARCIcommunity';
const QuotaMessagesURL =
  RESOURCE_HOST + '/json/quota-messages-20240619.json?v='

// MarciAI_change
const ConfigURL = RESOURCE_HOST + '/json/config-20250127.json?v=';
const AuxIndexLookupDefinition = /^\$\[(\w+::)?(\w+)(\(\d+\))?:([^\n]+)\]$/gm;
const QuickStartOnboardingURL =
  'https://api.aiprm.com/img/quick-start-onboarding.png';
const QuickStartOnboardingDarkURL =
  'https://api.aiprm.com/img/quick-start-onboarding-dark.png';
const QuickStartTutorialURL =
  'https://www.aiprm.com/tutorials/quick-start-guide/how-to-run-your-first-prompt/';
const TutorialsURL = 'https://www.aiprm.com/tutorials/';

const ValidateVariableMaxCount = 6;
const ValidateVariablePlaceholder = /\[VARIABLE([0-9]+)\]/g;
const ValidateVariableDefinition = /\[VARIABLE([0-9]+):(.+?)(:.*?)?(:.*?)?\]/g;

const MaxSeenMessages = 10;

export {
  PromptPlaceholder,
  PromptPlaceholder1,
  TargetLanguagePlaceholder,
  CrawledTextPlaceholder,
  CrawledSourcePlaceholder,
  VariablePlaceholder,
  VariableDefinition,
  LanguageFeedURL,
  AppShort,
  AppName,
  AppSlogan,
  AppSloganPremium,
  AppURL,
  ExportFilePrefix,
  ExportHeaderPrefix,
  APIEndpoint,
  NewAPIEndpoint,
  TopicFeedURL,
  ActivityFeedURL,
  ToneFeedURL,
  WritingStyleFeedURL,
  ContinueActionsFeedURL,
  ModelFeedURL,
  PromptBuilderFeedURL,
  APIEndpointAPP,
  AppAccountURL,
  AppCommunityForumURL,
  AppPricingURL,
  AppSignupURL,
  QuotaMessagesURL,
  ConfigURL,
  AppTeamURL,
  ValidateVariableMaxCount,
  ValidateVariablePlaceholder,
  ValidateVariableDefinition,
  AuxIndexLookupDefinition,
  MaxSeenMessages,
  QuickStartOnboardingURL,
  QuickStartOnboardingDarkURL,
  QuickStartTutorialURL,
  TutorialsURL,
};

/** @typedef {{Enabled: boolean, Config: {APIEndpointURL: string, MaxCharacters: number, MaxWords: number, CrawledTextPrompt: string, CrawledSourcePrompt: string}}} LiveCrawlingConfig */

/** @typedef {{Enabled: boolean, Config: {Selectors: Object.<string, string>}} WatermarkConfig */

/** @typedef {{Config: {CitationsPattern: string, CanvasRecipients: string[], DataAnalysisContentTypes: string[], ChainOfThoughtAuthorNames: string[], ContentTypeText: string, ContentTypeVideo: string}}} ExportConfig */

/**
 * @typedef {Object} SelectorConfig
 * @property {string} FirstPrompt
 * @property {string} FirstPromptButtons
 * @property {string} ChatLogContainer
 * @property {string} ConversationResponse
 * @property {string} ModelSelectorContainer
 * @property {string} ShareButton
 * @property {string} SuggestedPrompts
 * @property {string} DashboardTitle
 * @property {string} Sidebar
 * @property {string} ExportButton
 * @property {string} ExportButtonChatStarted
 * @property {string} PromptTextarea
 * @property {string} PromptSubmitButton
 * @property {string} ConversationResponseWrapper
 * @property {string} NewChatSidebar
 * @property {string} NewChatSidebarButton
 * @property {string} NewChatSidebarButtonText
 * @property {string} NewChatTopbar
 * @property {string} NewChatTopbarButton
 * @property {string} ElementAddedSidebarID1
 * @property {string} ElementAddedSidebarID2
 * @property {string} ElementAddedExportButtonDisable
 * @property {string} ElementAddedExportButtonEnable
 * @property {string} ElementAddedSavePromptAsTemplate
 * @property {string} LangWrapperSpacer
 * @property {string} SavePromptAsTemplatePromptText
 * @property {string} GizmosTitle
 * @property {number} GizmosTitleIndex
 * @property {string} GizmosContentContainer
 * @property {string} CurrentGizmoTitle
 * @property {string} CurrentGizmoPromptStarters
 * @property {string} NewComposerTextarea
 * @property {string} ReactFiberPropertyKey
 * @property {string} IgnoreElementAdditionByID
 */

/** @typedef {{Selector: string, Add: string[], Remove: string[]}} LayoutChangeConfig */

/** @typedef {{PromptTemplates: LayoutChangeConfig[], General: LayoutChangeConfig[]}} LayoutChangesConfig */

/** @typedef {{Enabled: boolean, Config: {EndpointConversation: string, EndpointMessageFeedback: string, EndpointConversationChatMessages: string, FeedbackTextField: string, FeedbackRatingField: string, FeedbackThumbsDown: string, FeedbackThumbsUp: string, GizmoCodePattern: string, GizmoMagicCreatePattern: string, UnselectPromptOnURLChange: boolean, EnablePromptSendQuota: boolean, EnableConversationMessagesModification: boolean, EnableTextDecoderMessagesFilter: boolean, EnableDuplicateStylesheetMonitor: boolean, EnableExportChatV2: boolean}}} PromptTemplatesConfig */

/** @typedef {{Title: string, NoOffer: string, MaxRedemptions: string, NewFeatureBadge: string}} ReferralsConfig */

/** @typedef {{Enabled: boolean, Config: {PlaceholderText: string, TriggerKey: string}}} PromptPanelConfig */

/** @typedef {{Enabled: boolean, DismissedTimeout: number}} UserLicenseWarningConfig */

/** @typedef {{Features: {LiveCrawling: LiveCrawlingConfig, Watermark: WatermarkConfig, PromptTemplates: PromptTemplatesConfig, Referrals: ReferralsConfig, PromptPanel: PromptPanelConfig, UserLicenseWarning: UserLicenseWarningConfig, Export: ExportConfig}, EndpointGizmos: string, PatternOperatorERID: string, Selectors: SelectorConfig, LayoutChanges: LayoutChangesConfig, NewPromptDefaultText: string}} RemoteConfig */

export class Config {
  /** @type {RemoteConfig} */
  #config;

  /** @param {RemoteConfig} config */
  constructor(config) {
    this.#config = config;
  }

  /** @returns {boolean} */
  isLiveCrawlingEnabled() {
    return this.#config.Features.LiveCrawling.Enabled === true;
  }

  /** @returns {LiveCrawlingConfig['Config']} */
  getLiveCrawlingConfig() {
    return this.#config.Features.LiveCrawling.Config;
  }

  /** @returns {boolean} */
  arePromptTemplatesEnabled() {
    return this.#config.Features.PromptTemplates.Enabled === true;
  }

  /** @returns {PromptTemplatesConfig['Config']} */
  getPromptTemplatesConfig() {
    return this.#config.Features.PromptTemplates.Config;
  }

  /** @returns {boolean} */
  isWatermarkEnabled() {
    return this.#config.Features.Watermark.Enabled === true;
  }

  /** @returns {WatermarkConfig['Config']} */
  getWatermarkConfig() {
    return this.#config.Features.Watermark.Config;
  }

  /** @returns {ReferralsConfig} */
  getReferralsConfig() {
    return this.#config.Features.Referrals;
  }

  /** @returns {EndpointGizmos} */
  getEndpointGizmos() {
    return this.#config.EndpointGizmos;
  }

  /** @returns {string} */
  getPatternOperatorERID() {
    return this.#config.PatternOperatorERID;
  }

  /** @returns {SelectorConfig} */
  getSelectorConfig() {
    return this.#config.Selectors;
  }

  /** @returns {LayoutChangesConfig} */
  getLayoutChangesConfig() {
    return this.#config.LayoutChanges;
  }

  // boolean isPromptPanelEnabled() {
  /** @returns {boolean} */
  isPromptPanelEnabled() {
    return this.#config.Features.PromptPanel.Enabled === true;
  }

  /** @returns {PromptPanelConfig['Config']} */
  getPromptPanelConfig() {
    return this.#config.Features.PromptPanel.Config;
  }

  /** @returns {NewPromptDefaultText} */
  getNewPromptDefaultText() {
    return this.#config.NewPromptDefaultText;
  }

  isPromptSendQuotaEnabled() {
    return (
      this.#config.Features.PromptTemplates.Config.EnablePromptSendQuota ===
      true
    );
  }

  /** @returns {UserLicenseWarningConfig} */
  getUserLicenseWarningConfig() {
    return this.#config.Features.UserLicenseWarning;
  }

  /** @returns {ExportConfig['Config']} */
  getExportConfig() {
    return this.#config.Features.Export.Config;
  }
}
