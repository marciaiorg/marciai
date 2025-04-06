import { MARCIClient, Reaction } from './client.js';

import {
  ActivityFeedURL,
  AppAccountURL,
  AppCommunityForumURL,
  AppName,
  AppURL,
  AppSlogan,
  AppSloganPremium,
  Config,
  ConfigURL,
  ContinueActionsFeedURL,
  ModelFeedURL,
  CrawledSourcePlaceholder,
  CrawledTextPlaceholder,
  LanguageFeedURL,
  PromptPlaceholder,
  PromptPlaceholder1,
  TargetLanguagePlaceholder,
  VariablePlaceholder,
  VariableDefinition,
  ToneFeedURL,
  TopicFeedURL,
  WritingStyleFeedURL,
  AppTeamURL,
  AppPricingURL,
  PromptBuilderFeedURL,
  ValidateVariableMaxCount,
  ValidateVariablePlaceholder,
  ValidateVariableDefinition,
  AuxIndexLookupDefinition,
  MaxSeenMessages,
  NewAPIEndpoint,
} from './config.js';

/* eslint-disable no-unused-vars */
import {
  ListTypeNo,
  MessageVoteTypeNo,
  NotificationSeverity,
  PromptTemplatesType,
  PromptTypeNo,
  SortModeNo,
  SubPromptTypeNo,
  UsageTypeNo,
  UserLevelNo,
  ItemStatusNo,
  PromptFeatureBitset,
  SystemNo,
  ModelStatusNo,
  LayoutChangeType,
  CreatePromptMode,
  LicenseWarningLevelNo,
  GizmoVoteTypeNo,
} from './enums.js';
/* eslint-enable */

import { createReportPromptModal } from './feedback.js';
import { List, Lists } from './list.js';
import { showMessage } from './messages.js';
import { ReactionNo } from './rxn.js';

import {
  capitalizeWords,
  css,
  formatDateTime,
  formatAgo,
  formatHumanReadableNumber,
  hideModal,
  sanitizeInput,
  svg,
  hasFeature,
  getUserOpenAI,
} from './utils.js';

import { MultiselectDropdown } from './multiselect-dropdown.js';
import { PromptBuilder } from './prompt-builder.js';
import { Referrals } from './referrals.js';
import { VERSION } from './version.js';
import { showOnboarding } from './onboarding.js';
import { PromptPanel } from './prompt-panel.js';
import { Exporter } from './export.js';

/**
 * @typedef {Object} PromptVariable
 * @property {number} ID
 * @property {string} Label
 * @property {string} DefaultValue
 * @property {string[]} EnumS
 */

/** @typedef {PromptVariable & {Value: string}} PromptVariableWithValue */

/**
 * @typedef {Object} Prompt
 * @property {string} ID
 * @property {string} Activity - Activity of the prompt (e.g. "Writing")
 * @property {string} Topic - Topic of the prompt (e.g. "SEO")
 * @property {string} Prompt - The prompt text
 * @property {string} PromptHint - The prompt hint text (placeholder)
 * @property {PromptTypeNo} PromptTypeNo - public, private or paid prompt
 * @property {string} Title
 * @property {string} Help
 * @property {string} Teaser
 * @property {boolean} OwnPrompt - Whether the prompt is owned by the current user
 * @property {string} RevisionTime
 * @property {string} AuthorName
 * @property {string} AuthorURL
 * @property {string} [ForkedFromPromptID]
 * @property {number} Usages
 * @property {number} Views
 * @property {number} Votes
 * @property {boolean} [IsFavorite]
 * @property {boolean} [IsHidden]
 * @property {boolean} [IsVerified]
 * @property {PromptVariable[]} [PromptVariables]
 * @property {string[]} [ModelS]
 * @property {string[]} [GizmoCodeS]
 * @property {boolean} [IsGizmoStarterPrompt]
 */

/** @typedef {{langcode: string, languageEnglish: string, languageLabel: string}} Language */

/** @typedef {{ID: string, Label: string}} Topic */

/** @typedef {{ID: string, TopicID: string, Label: string}} Activity */

/** @typedef {{ID: number, Label: string}} Tone */

/** @typedef {{ID: number, Label: string}} WritingStyle */

/** @typedef {{ID: number, Label: string, Prompt: string}} ContinueAction */

/** @typedef {{ID: number, Label: string, Info: string}} MyProfileInfo */

/** @typedef {{ID: string, LabelUser: string, LabelAuthor: string, StatusNo: ModelStatusNo}} Model */

/** @typedef {{EnumMaxSizeError: boolean, Errors: string[]}} ValidatePromptVariablesResult */

/**
 * @typedef {Object} Gizmo
 * @property {string} GizmoID
 * @property {string} GizmoCode
 * @property {string} Title
 * @property {string} Description
 * @property {string} LogoURL
 * @property {string} ShortURL
 * @property {string} ShareRecipient
 * @property {string} AuthorDisplayName
 * @property {string} AuthorDisplayNo
 * @property {string} AuthorVerifiedNo
 * @property {string} ModelCode
 * @property {string} ModelSlug
 * @property {string[]} CategoryAuto
 * @property {string[]} CategoryS
 * @property {string[]} PromptStarterS
 * @property {string[]} TagS
 * @property {string[]} ToolsEnabledS
 * @property {number} CountUses
 * @property {number} CountViews
 * @property {number} CountVotes
 */

/**
 * @typedef {Object} CurrentGizmo
 * @property {string} GizmoCode
 * @property {string} Title
 * @property {Prompt[]} PromptStarterS
 */

const DefaultPromptActivity = 'all';
const DefaultPromptTopic = 'all';
const DefaultTargetLanguage = 'English*';
const DefaultPromptModel = 'all';

const lastPromptTopicKey = 'lastPromptTopic';
const lastPromptModelKey = 'lastPromptModel';
const lastTargetLanguageKey = 'lastTargetLanguage';
const lastPageSizeKey = 'lastPageSize';
const lastGizmoPageSizeKey = 'lastGizmoPageSize';
const lastPromptTemplateTypeKey = 'lastPromptTemplateType';
const lastListIDKey = 'lastListID';
const lastCreatePromptModeKey = 'lastCreatePromptMode';

const myProfileMessageKey = 'myProfileMessageMARCI';
const hideWatermarkKey = 'MARCI_hideWatermark';
const newPromptDefaultTextKey = 'MARCI_newPromptDefaultText';
const selectedMyProfileInfoKey = 'MARCI_selectedMyProfileInfoKey';
const licenseWarningDismissedKey = 'MARCI_licenseWarningDismissed';
const lastSeenStaticMessageKey = 'MARCI_lastSeenStaticMessage';
const seenMessagesKey = 'MARCI_seenMessages';

const queryParamPromptID = 'MARCI_PromptID';
const queryParamVariable = 'MARCI_VARIABLE';
const queryParamPrompt = 'MARCI_Prompt';
const queryParamSearchTerm = 'MARCI_Search';

// The number of prompts per page in the prompt templates section
const pageSizeOptions = [4, 8, 12, 16, 20];
const pageSizeDefault = 12;

const editPromptTemplateEvent = 'editPromptTemplate';
const forkPromptTemplateEvent = 'forkPromptTemplate';
const clonePromptTemplateEvent = 'clonePromptTemplate';

const variableWrapperID = 'MARCI__variable-wrapper';
const variableIDPrefix = 'MARCI__VARIABLE';

const headerRegexPattern = /# Prompt by MARCI, Corp\.[\s\S]*?---\n/;

const modelMultiselectOptions = {
  style: { width: '100%' },
  placeholder: 'Not specific',
  txtSelected: 'Models Selected',
  classPrefix: 'MARCI__',
  height: '12rem',
  optionModifier: (o, op) => {
    var modelStatusNo = o.attributes['MARCIModelStatusNo']?.value;

    if (modelStatusNo == ModelStatusNo.ACTIVE) {
      op.title = 'Active';
    } else if (modelStatusNo == ModelStatusNo.UNSUPPORTED) {
      op.classList.add('MARCI__line-through');
      op.title = 'Unsupported by this platform';
    } else {
      op.classList.add('MARCI__line-through');
      op.title = 'Deprecated';
    }
  },
  optionSelectedModifier: (o, op) => {
    var modelStatusNo = o.attributes['MARCIModelStatusNo']?.value;

    if (modelStatusNo != ModelStatusNo.ACTIVE) {
      op.classList.add('MARCI__line-through');
    }
  },
  selectedTitleModifier: (sels, div) => {
    var title = 'This prompt is not optimized for specific model';

    if (sels.length > 0) {
      title = sels
        .map((o) => {
          var t = o.text;

          var modelStatusNo = o.attributes['MARCIModelStatusNo']?.value;
          if (modelStatusNo == ModelStatusNo.ACTIVE) {
            // no change
          } else if (modelStatusNo == ModelStatusNo.UNSUPPORTED) {
            t = t + ' (Unsupported by this platform)';
          } else {
            t = t + ' (Deprecated)';
          }

          return t;
        })
        .join(', ');
    }

    div.setAttribute('title', title);
  },
};

window.MARCI = {
  StylesheetURL: null,

  // Save a reference to the original fetch function
  fetch: (window._fetch = window._fetch || window.fetch.bind(window)),

  CacheBuster: btoa(new Date().toISOString().slice(0, 16).toString()),

  Client: MARCIClient,

  /** @type {Config} */
  Config: null,

  // Set default TargetLanguage based on last used language or default to English
  TargetLanguage:
    localStorage.getItem(lastTargetLanguageKey) === null
      ? DefaultTargetLanguage
      : localStorage.getItem(lastTargetLanguageKey),

  // Set default Tone
  Tone: null,

  // Set default WritingStyle
  WritingStyle: null,

  // Set default topic
  PromptTopic: localStorage.getItem(lastPromptTopicKey) || DefaultPromptTopic,

  // Set default activity
  PromptActivity: DefaultPromptActivity,

  // Set default sort mode
  /** @type {SortModeNo} */
  PromptSortMode: SortModeNo.TOP_VOTES_TRENDING,

  /** @type {SortModeNo} */
  GizmoSortMode: SortModeNo.TOP_VOTES_TRENDING,

  // Set default model
  PromptModel: localStorage.getItem(lastPromptModelKey) || DefaultPromptModel,

  // Set default search query
  PromptSearch: '',

  // Set default gizmo search query
  GizmoSearch: '',

  // Set default prompt templates type
  /** @type {PromptTemplatesType} */
  PromptTemplatesType: PromptTemplatesType.PUBLIC,

  /**
   * Set default prompt templates list
   *
   * @type {import('./client.js').List['ID']}
   */
  PromptTemplatesList: null,

  /** @type {Prompt[]} */
  PromptTemplates: [],

  /** @type {Gizmo[]} */
  Gizmos: [],

  /** @type {Prompt[]} */
  OwnPrompts: [],

  /** @type {Prompt[]} */
  TeamPrompts: [],

  /** @type {Language[]} */
  Languages: [],

  /** @type {Tone[]} */
  Tones: [],

  /** @type {WritingStyle[]} */
  WritingStyles: [],

  /** @type {ContinueAction[]} */
  ContinueActions: [],

  /** @type {MyProfileInfo[]} */
  MyProfileInfos: [],

  /** @type {Model[]} */
  Models: [],

  /** @type {Model[]} */
  ModelsActive: [],

  /** @type {string[]} */
  SpecialGizmos: [],

  /** @type {PromptBuilder} */
  PromptBuilder: null,

  /** @type {import('./prompt-builder.js').PromptBuilderOptions} */
  PromptBuilderOptions: {},

  /** @type {Lists} */
  Lists: new Lists(),

  /** @type {Topic[]} */
  Topics: [],

  /** @type {Activity[]} */
  Activities: [],

  // true if admin mode is enabled
  AdminMode: false,

  // This object contains properties for the prompt templates section
  PromptTemplateSection: {
    currentPage: 0, // The current page number
    pageSize: +localStorage.getItem(lastPageSizeKey) || pageSizeDefault, // The number of prompts per page
  },

  // This object contains properties for the gizmo section
  GizmoSection: {
    currentPage: 0, // The current page number
    pageSize: +localStorage.getItem(lastGizmoPageSizeKey) || pageSizeDefault, // The number of prompts per page
  },

  /** @type {?Prompt} */
  SelectedPromptTemplate: null,

  /** @type {string} */
  SelectedContinueActionPrompt: null,

  /** @type {import('./client.js').Message[]} */
  Messages: [],

  /** @type {import('./client.js').Message[]} */
  StaticMessages: [],

  isMessageShown: false,

  // Selected my profile info to include in the submitted prompt
  IncludeMyProfileMessage: false,
  SelectedMyProfileInfoID:
    +localStorage.getItem(selectedMyProfileInfoKey) || null,

  // Prefill prompt via event
  PrefillPrompt: null,

  /** @type {?CurrentGizmo} */
  CurrentGizmo: null,

  /** @type {Referrals} */
  Referrals: null,

  /** @type {{[ID: number]: PromptVariableWithValue}} */
  PromptVariables: {},

  // Check version using version server
  async checkVersion() {
    try {
      const response = await this.fetch(
        NewAPIEndpoint + `/check/${VERSION}?v=${this.CacheBuster}`
      );

      if (!response.ok) {
        throw new Error('Could not check for updates');
      }

      const versionCheck = await response.json();

      if (!versionCheck?.IsOutdated) {
        return;
      }

      // Version is outdated - display a warning message
      const elementID = 'MARCI-VersionWarning';
      let element = document.getElementById(elementID);

      // If the warning doesn't exist, create it
      if (!element) {
        element = document.createElement('div');
        element.id = elementID;
      }

      element.innerHTML = /*html*/ `
          <div class="MARCI__fixed MARCI__flex MARCI__justify-center MARCI__w-full MARCI__top-0 MARCI__z-50 MARCI__pointer-events-none">
            <div class="MARCI__bg-red-500 MARCI__w-full MARCI__justify-center  MARCI__flex MARCI__flex-row MARCI__pointer-events-auto MARCI__px-6 MARCI__py-6 MARCI__text-white" role="alert">
              <div class="MARCI__flex MARCI__gap-4">
                <div>
                  <p class="MARCI__max-w-2xl" style="overflow-wrap: anywhere;">
                    ${versionCheck.Message}
                  </p>
                </div>
                <button>${svg('Cross')}</button>
              </div>
            </div>
          </div>
        `;

      // Remove the warning from the DOM on click
      element.querySelector('button').addEventListener('click', () => {
        element.remove();
      });

      document.body.appendChild(element);
    } catch (error) {
      // Display fallback information
      this.showNotification(
        NotificationSeverity.ERROR,
        'Could not check for updates.'
      );
    }
  },

  // Fetch static static messages from remote JSON file
  async fetchStaticMessages() {
    try {
      const response = await this.fetch(
        NewAPIEndpoint + `/${VERSION}/messages.json?v=${this.CacheBuster}`
      );

      if (!response.ok) {
        throw new Error('Could not load static messages');
      }

      /** @type {import('./client.js').Message[]} */
      let messages = await response.json();

      this.StaticMessages = messages?.length > 0 ? messages : [];

      // no new messages
      if (!this.getUnseenStaticMessages().length) {
        return;
      }

      this.showMessages();
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Could not fetch static messages.'
      );
    }
  },

  // Get the last seen static message ID from local storage and filter out messages before this ID (including this ID)
  getUnseenStaticMessages() {
    // skip messages before the last seen message
    const lastSeenStaticMessage = +localStorage.getItem(
      lastSeenStaticMessageKey
    );

    this.StaticMessages = !lastSeenStaticMessage
      ? this.StaticMessages
      : this.StaticMessages.filter(
          (message) => message.MessageID > lastSeenStaticMessage
        );

    return this.StaticMessages;
  },

  /**
   * Get seen message IDs from local storage
   *
   * @returns {string[]}
   */
  getSeenMessageIDs() {
    let seenMessageIDs;

    try {
      // get the list of seen message IDs from local storage
      seenMessageIDs = JSON.parse(
        localStorage.getItem(seenMessagesKey) || '[]'
      );
    } catch (error) {
      console.error('Could not get seen messages from local storage', error);
    }

    // initialize the list of seen message IDs if it doesn't exist
    if (!seenMessageIDs?.length) {
      seenMessageIDs = [];
    }

    return seenMessageIDs;
  },

  // Filter messages based on the list of seen message IDs from local storage
  getUnseenMessages() {
    // get the list of seen message IDs from local storage
    const seenMessageIDs = this.getSeenMessageIDs();

    // no seen messages
    if (!seenMessageIDs?.length) {
      return this.Messages;
    }

    // filter out seen messages
    this.Messages = this.Messages.filter(
      (message) => !seenMessageIDs.includes(message.MessageID)
    );

    // only new messages
    return this.Messages;
  },

  async init() {
    console.log('MARCI init');

    // check version before initializing
    await this.checkVersion();

    // fetch static system messages
    await this.fetchStaticMessages();

    // listen for MARCI.prompt event from content script
    document.addEventListener('MARCI.prompt', (event) => {
      this.PrefillPrompt = event.detail.prompt;

      // try to prefill prompt input, if the loading of config is already done
      // (and we have tried to prefill prompt input already in the meantime)
      if (this.Config) {
        this.prefillPromptInput();
      }
    });

    // Bind event handler for arrow keys
    this.boundHandleArrowKey = this.handleArrowKey.bind(this);

    let clientInitialized = false;

    // initialize user based on page props
    const userOpenAI = getUserOpenAI();

    if (userOpenAI?.id) {
      this.Client.User = {
        OperatorERID: userOpenAI.id,
        SystemNo: SystemNo.OPENAI,
        UserFootprint: '',
        IsLinked: false,
      };
    } else {
      // wait to initialize client - we don't have user ID, yet
      await this.Client.init();

      clientInitialized = true;
    }

    /**
     * Wait for prompt templates, lists, topics, activities, config from remote JSON file,
     * languages, messages, gizmos and optional client initialization (if not initialized yet)
     */
    await Promise.all([
      // MarciAI_change
      this.fetchPromptTemplates(false),
      this.fetchLists(),
      this.fetchTopics(),
      this.fetchActivities(),
      this.fetchConfig(),
      this.fetchLanguages(),
      this.fetchMessages(false),
      this.fetchModels(),
      this.fetchPromptBuilderConfig(),
      // MarciAI_change
      // this.fetchGizmos(false),
      clientInitialized ? Promise.resolve() : this.Client.init(),
    ]);

    // Sort lists after fetching of UserTeamM
    this.Lists.sort();

    this.replaceTextDecoder();

    this.replaceFetch();

    // Initialize Referrals before observer to add button to the sidebar
    this.Referrals = new Referrals(
      this.Client,
      this.Config.getReferralsConfig(),
      this.showNotification
    );

    this.createObserver();

    if (
      !this.isMessageShown &&
      !showOnboarding(lastPromptTemplateTypeKey, this.CacheBuster) &&
      (!this.Client.User.OperatorERID.match(
        this.Config.getPatternOperatorERID()
      ) ||
        !this.Client.UserQuota.connectAccountAnnouncement())
    ) {
      this.showMessages();
    }

    // Preset default CreatePromptMode based on existing or new user
    this.setDefaultCreatePromptMode();

    this.loadPromptTemplateTypeAndListFromLocalStorage();

    this.initSearchTermFromParam();

    this.extractCurrentGizmoInformation();

    this.insertPromptTemplatesSection();

    this.insertGizmosSection();

    // Wait for tones, writing styles and continue actions
    await Promise.all([
      this.fetchTones(),
      this.fetchWritingStyles(),
      this.fetchContinueActions(),
      this.fetchMyProfileInfos(),
    ]);

    await this.storeMyProfileInfoFromLocalStorage();

    this.insertLanguageToneWritingStyleContinueActions();
    this.insertIncludeMyProfileInfo();
    this.insertVariablesInputWrapper();
    this.insertPromptPanel();

    this.setupSidebar();

    this.fetchPromptFromDeepLink();
    this.prefillPromptInput();

    // on state change (e.g. back button) fetch the prompt from the deep link
    window.addEventListener('popstate', () => {
      this.fetchPromptFromDeepLink();
    });

    // on history push state, unset the selected prompt if the URL doesn't contain MARCI_PromptID
    if (this.Config.getPromptTemplatesConfig().UnselectPromptOnURLChange) {
      // unset selected prompt if the URL doesn't contain MARCI_PromptID
      const unselectPrompt = (url) => {
        if (
          !url?.toString()?.includes(queryParamPromptID) &&
          window.MARCI.SelectedPromptTemplate
        ) {
          window.MARCI.selectPromptTemplateByIndex(null);
        }
      };

      // replace the pushState
      const originalPushState = history.pushState;

      history.pushState = function (state, title, url) {
        // call original pushState
        originalPushState.call(history, state, title, url);

        // unset selected prompt if the URL doesn't contain MARCI_PromptID
        unselectPrompt(url);
      };

      // replace also the replaceState
      const originalReplaceState = history.replaceState;

      history.replaceState = function (state, title, url) {
        // call original replaceState
        originalReplaceState.call(history, state, title, url);

        // unset selected prompt if the URL doesn't contain MARCI_PromptID
        unselectPrompt(url);
      };
    }

    // listen for MARCI.tokens event from MARCI APP
    document.addEventListener('MARCI.tokens', async (event) => {
      this.handleTokensEvent(event);
    });

    try {
      // reset hide watermark if user cannot longer use this feature
      if (!this.Client.UserQuota.canUseHideWatermark(false)) {
        localStorage.setItem(hideWatermarkKey, '');
      }
    } catch (error) {
      console.error(error);
    }

    this.addWatermark();

    this.setupFavoritePromptsContextMenu();

    this.addLicenseWarning();

    this.getStylesheetURL();

    // Ask content script for prefillPrompt (returned via MARCI.prompt event) after initialization
    window.postMessage({
      from: 'MARCI',
      data: { type: 'MARCI.prefillPrompt' },
    });
  },

  // send MARCI.getStylesheet message to content script and listen for response
  getStylesheetURL() {
    window.addEventListener('message', (event) => {
      if (
        event?.data?.from === 'MARCI' &&
        event?.data?.type === 'MARCI.stylesheetURL' &&
        event?.data?.url
      ) {
        this.StylesheetURL = event.data.url;

        this.monitorStylesheet();
      }
    });

    window.postMessage({
      from: 'MARCI',
      data: {
        type: 'MARCI.getStylesheetURL',
      },
    });
  },

  // Set textarea placeholder to hint about prompt panel (if enabled)
  setPromptPanelHintPlaceholder(inputField) {
    if (!this.Config.isPromptPanelEnabled()) {
      return;
    }

    // do not overwrite existing placeholder if there is selected prompt
    if (this.SelectedPromptTemplate) {
      return;
    }

    this.updatePromptTextareaPlaceholder(
      inputField,
      this.Config.getPromptPanelConfig().PlaceholderText
    );
  },

  /**
   * Update the placeholder text of the prompt textarea
   * (using CSS variable or textarea placeholder attribute)
   *
   * @param {Element} inputField
   * @param {string} placeholderText
   * @returns
   */
  updatePromptTextareaPlaceholder(inputField, placeholderText) {
    const placeholderElement = inputField;

    // fallback for textarea
    if (placeholderElement.tagName === 'TEXTAREA') {
      placeholderElement.placeholder = placeholderText;

      return;
    }

    // update the placeholder text using CSS variable
    placeholderElement.style.setProperty(
      '--placeholder-text',
      `"${placeholderText.replace(/'/g, "\\'").replace(/"/g, '\\"')}"`
    );

    placeholderElement.title = placeholderText;
  },

  insertPromptPanel() {
    if (!this.Config.isPromptPanelEnabled()) {
      return;
    }

    const inputField = document.querySelector(
      this.Config.getSelectorConfig().PromptTextarea
    );

    if (!inputField) {
      return;
    }

    this.setPromptPanelHintPlaceholder(inputField);

    new PromptPanel(
      inputField,
      this.Lists,
      this.Client.UserQuota,
      this.getAllPromptTemplates.bind(this),
      this.selectPromptTemplate.bind(this),
      this.Config.getPromptPanelConfig().TriggerKey
    );
  },

  // Combine all the prompt templates into a single array
  getAllPromptTemplates() {
    return [
      ...new Map(
        [...this.PromptTemplates, ...this.OwnPrompts, ...this.TeamPrompts].map(
          (item) => [item.ID, item]
        )
      ).values(),
    ];
  },

  /**
   * Extract current Gizmo basic information
   */
  extractCurrentGizmoInformation() {
    const config = this.Config.getPromptTemplatesConfig();
    const GizmoCode = window.location.href.match(config.GizmoCodePattern);

    if (GizmoCode?.[1]) {
      const selectorConfig = this.Config.getSelectorConfig();
      const title = document.querySelector(selectorConfig.CurrentGizmoTitle);

      this.CurrentGizmo = {
        GizmoCode: GizmoCode[1],
        Title: title?.textContent || '',
      };

      this.CurrentGizmo.PromptStarterS = this.createGizmoStarterPrompts();

      // try to extract prompt starter, if we do not have Gizmo in directory
      if (
        !this.CurrentGizmo.PromptStarterS ||
        this.CurrentGizmo.PromptStarterS.length === 0
      ) {
        const promptStarterButtons = document.querySelectorAll(
          this.Config.getSelectorConfig().CurrentGizmoPromptStarters
        );

        if (promptStarterButtons) {
          for (let i = 0; i < promptStarterButtons.length; i++) {
            const promptText = promptStarterButtons[i].textContent;

            if (promptText && promptText.length > 0) {
              this.CurrentGizmo.PromptStarterS.push({
                ID: 'g-' + i, // we need to have unique ID for each PromptStarter - also different from normal MARCI prompts
                Title: this.CurrentGizmo.Title + ' starter prompt',
                Prompt: promptText,
                IsGizmoStarterPrompt: true,
              });
            }
          }
        }
      }

      if (this.SpecialGizmos.includes(this.CurrentGizmo.GizmoCode)) {
        this.PromptModel = DefaultPromptModel;
      } else {
        this.PromptModel = this.CurrentGizmo.GizmoCode;
      }

      localStorage.setItem(lastPromptModelKey, this.PromptModel);
    } else {
      this.CurrentGizmo = null;

      // if PromptModel is set to a specific Gizmo, then we need to reset it
      if (
        this.PromptModel !== DefaultPromptModel &&
        !this.ModelsActive?.find((model) => model.ID === this.PromptModel)
      ) {
        this.PromptModel = DefaultPromptModel;
        localStorage.setItem(lastPromptModelKey, this.PromptModel);
      }
    }
  },

  addLicenseWarning() {
    if (!this.Client.User.LicenseWarning) {
      return;
    }

    const config = this.Config.getUserLicenseWarningConfig();
    if (!config || !config.Enabled) {
      return;
    }

    const licenseWarningDismissed = localStorage.getItem(
      licenseWarningDismissedKey
    );

    if (licenseWarningDismissed) {
      const now = new Date();
      if (
        Number(licenseWarningDismissed) + config.DismissedTimeout >
        now.getTime()
      ) {
        return;
      }
    }

    const elementID = 'MARCI-LicenseWarning';
    let element = document.getElementById(elementID);

    // if notification doesn't exist, create it
    if (!element) {
      element = document.createElement('div');
      element.id = elementID;
    }

    const severityClassName = {
      [LicenseWarningLevelNo.WARNING]: 'MARCI__bg-orange-500',
      [LicenseWarningLevelNo.ERROR]: 'MARCI__bg-red-500',
    };

    element.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__flex MARCI__justify-center MARCI__w-full MARCI__top-0 MARCI__z-50 MARCI__pointer-events-none">
        <div class="${
          severityClassName[this.Client.User.LicenseWarning.WarningLevelNo]
        } MARCI__w-full MARCI__justify-center  MARCI__flex MARCI__flex-row MARCI__pointer-events-auto MARCI__px-6 MARCI__py-6 MARCI__text-white" role="alert">
          <div class="MARCI__flex MARCI__gap-4">
            <div>
              <p class="MARCI__max-w-2xl" style="overflow-wrap: anywhere;">${
                this.Client.User.LicenseWarning.Message
              }</p>
            </div>
            <button>${svg('Cross')}</button>
          </div>
        </div>
      </div>
    `;

    // remove element from DOM on click
    element.querySelector('button').addEventListener('click', () => {
      const now = new Date();
      localStorage.setItem(licenseWarningDismissedKey, now.getTime());

      element.remove();
    });

    document.body.appendChild(element);
  },

  // Preset default create prompt mode based on existing (advanced) or new user (basic)
  setDefaultCreatePromptMode() {
    // Check if the lastPromptTemplateType is set in localStorage
    const lastPromptTemplateType = localStorage.getItem(
      lastPromptTemplateTypeKey
    );

    // If it's not set, then we default to simple mode (new user)
    if (!lastPromptTemplateType || lastPromptTemplateType === '') {
      return;
    }

    // Get the last create prompt mode
    const lastCreatePromptMode = localStorage.getItem(lastCreatePromptModeKey);

    // If it's set and not empty, then we won't change it
    if (lastCreatePromptMode && lastCreatePromptMode !== '') {
      return;
    }

    // If it's not set or it's empty, then we default to advanced mode (existing user)
    localStorage.setItem(lastCreatePromptModeKey, CreatePromptMode.ADVANCED);
  },

  // add prompts from "Favorites" Prompts to context menu
  async setupFavoritePromptsContextMenu() {
    // sync needed also with no prompt IDs to remove favorites from context menu
    const favoritePromptIDs =
      (await this.Lists.getFavorites()?.getPromptIDS()) || [];

    // find favorite prompts
    const favoritePrompts =
      favoritePromptIDs.length === 0
        ? []
        : [
            ...this.PromptTemplates,
            ...this.OwnPrompts,
            ...this.TeamPrompts,
          ].filter((prompt) => favoritePromptIDs.includes(prompt.ID));

    // unique favorite prompts by ID
    let uniqueFavoritePrompts =
      favoritePrompts.length === 0
        ? []
        : favoritePrompts.reduce((acc, prompt) => {
            if (!acc.find((p) => p.ID === prompt.ID)) {
              acc.push(prompt);
            }

            return acc;
          }, []);

    // add _LIVE suffix to ID for context menu actions if template supports live crawling
    uniqueFavoritePrompts = uniqueFavoritePrompts.map((prompt) => ({
      ...prompt,
      ID: this.templateRequiresLiveCrawling(prompt)
        ? `${prompt.ID}_LIVE`
        : prompt.ID,
    }));

    // sort by Title
    uniqueFavoritePrompts.sort((a, b) => a.Title.localeCompare(b.Title));

    // send favorite prompts to content script
    window.postMessage({
      from: 'MARCI',
      data: {
        type: 'MARCI.favoritePrompts',
        favoritePrompts: uniqueFavoritePrompts,
      },
    });
  },

  // fetch config from remote JSON file
  async fetchConfig() {
    try {
      const response = await this.fetch(ConfigURL + this.CacheBuster);

      if (!response.ok) {
        throw new Error('Could not fetch config');
      }

      const config = await response.json();

      this.Config = new Config(config);

      // try to prefill prompt input, if the loading of config is already done
      // (and we have tried to prefill prompt input already in the meantime)
      if (this.PrefillPrompt) {
        this.prefillPromptInput();
      }
    } catch (error) {
      console.error(error);
    }
  },

  /**
   * Replace CRAWLEDTEXT/CRAWLEDSOURCE placeholder with live crawled content
   *
   * @param {string} sourceURL - The prompt text (should be URL)
   * @param {string} message - The prompt message with replacement placeholder
   * @returns {Promise<string>} - The prompt message with injected live crawled content
   */
  async injectLiveCrawlingResult(sourceURL, message) {
    // check if message contains CRAWLEDTEXT/CRAWLEDSOURCE placeholder
    if (
      !message.includes(CrawledTextPlaceholder) &&
      !message.includes(CrawledSourcePlaceholder)
    ) {
      return message;
    }

    if (this.SelectedPromptTemplate?.ID) {
      this.Client.usePrompt(
        this.SelectedPromptTemplate.ID,
        UsageTypeNo.LIVE_CRAWLING,
        this.CurrentGizmo?.GizmoCode
      );
    }

    // check if live crawling is enabled
    if (!this.Config.isLiveCrawlingEnabled()) {
      this.showNotification(
        NotificationSeverity.WARNING,
        'Live Crawling is currently disabled. Please try again later.'
      );

      // remove CRAWLEDTEXT/CRAWLEDSOURCE placeholder from message (let ChatGPT to guess at least using the URL)
      return message
        .replace(CrawledTextPlaceholder, '')
        .replace(CrawledSourcePlaceholder, '');
    }

    // check if user can use live crawling
    if (!this.Client.UserQuota.canUseLiveCrawling()) {
      return;
    }

    // trim the whitespace from the URL
    sourceURL = sourceURL ? sourceURL.trim() : sourceURL;

    const content = await this.fetchContent(sourceURL);

    if (!content) {
      throw new Error('No crawled content found');
    }

    // generate GUID using crypto API used to identify the crawled content in the message and prevent prompt injection
    const GUID = crypto.randomUUID();

    // replace CRAWLEDTEXT placeholder with parsed crawled text
    if (message.includes(CrawledTextPlaceholder)) {
      let crawledText = this.parseCrawledText(content, sourceURL);

      crawledText = this.Config.getLiveCrawlingConfig()
        .CrawledTextPrompt.replaceAll('[GUID]', GUID)
        .replaceAll(CrawledTextPlaceholder, crawledText);

      return message.replaceAll(CrawledTextPlaceholder, crawledText);
    }

    // replace CRAWLEDSOURCE placeholder with crawled source
    if (message.includes(CrawledSourcePlaceholder)) {
      const crawledSource = this.limitTextLength(
        content,
        this.Config.getLiveCrawlingConfig().MaxWords,
        this.Config.getLiveCrawlingConfig().MaxCharacters
      );

      this.showNotification(
        NotificationSeverity.SUCCESS,
        `Live Crawling of "${sanitizeInput(
          sourceURL
        )}" finished - submitting prompt ...`
      );

      return message.replaceAll(
        CrawledSourcePlaceholder,
        this.Config.getLiveCrawlingConfig()
          .CrawledSourcePrompt.replaceAll('[GUID]', GUID)
          .replaceAll(CrawledSourcePlaceholder, crawledSource)
      );
    }

    return message;
  },

  /**
   * Parse the HTML content and return the title, excerpt and text content
   *
   * @param {string} content
   * @param {string} URL
   * @returns string
   */
  parseCrawledText(content, URL) {
    // Parse the HTML content
    let doc = new DOMParser().parseFromString(content, 'text/html');

    // Parse the title and excerpt from the HTML content
    let parsed = new window.Readability(doc).parse();

    if (!parsed || !parsed.title || !parsed.excerpt) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Live Crawling of "${sanitizeInput(
          URL
        )}" failed - could not parse content.`
      );

      return;
    }

    // remove excessive new lines and whitespace from textContent and shorten it to max. words & characters with ellipsis
    const textContent =
      this.limitTextLength(
        parsed.textContent,
        this.Config.getLiveCrawlingConfig().MaxWords,
        this.Config.getLiveCrawlingConfig().MaxCharacters
      ) + ' ...';

    this.showNotification(
      NotificationSeverity.SUCCESS,
      `Live Crawling of "${sanitizeInput(
        URL
      )}" finished - submitting prompt ...`
    );

    return `
${parsed.title}

${parsed.excerpt}

${textContent}
`;
  },

  // remove excessive new lines/whitespace and limit the number of words and characters in the text
  limitTextLength(text = '', maxWords = 0, maxCharacters = 0) {
    const words = text
      .replace(/\n{2,}/g, '\n')
      .replace(/\s{2,}/g, ' ')
      .split(/\s+/);

    const limitedWords = words.slice(0, maxWords);

    return limitedWords.join(' ').slice(0, maxCharacters);
  },

  // try to fetch and parse the title and excerpt from the URL using CORS proxy and Readability library
  async fetchContent(sourceURL) {
    if (!sourceURL) {
      this.showNotification(
        NotificationSeverity.WARNING,
        'No URL was found for Live Crawling.'
      );

      return;
    }

    // validate if URL is valid using URL parser
    try {
      new URL(sourceURL);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'No valid URL was found for Live Crawling.'
      );

      return;
    }

    // doesn't look like a URL
    if (!sourceURL.match(/^(https?:\/\/)/)) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'No valid URL was found for Live Crawling.'
      );

      return;
    }

    let res;

    // Fetch content from the URL
    try {
      this.showNotification(
        NotificationSeverity.INFO,
        `Live Crawling of "${sanitizeInput(sourceURL)}" started ...`,
        false
      );

      res = await fetch(
        this.Config.getLiveCrawlingConfig().APIEndpointURL +
          encodeURIComponent(sourceURL)
      );
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Live Crawling of "${sanitizeInput(
          sourceURL
        )}" failed. Please try again later.`
      );

      return;
    }

    if (!res.ok) {
      console.error('Live Crawling failed', res.status);

      this.showNotification(
        NotificationSeverity.ERROR,
        `Live Crawling of "${sanitizeInput(
          sourceURL
        )}" failed. Please try again later.`
      );

      return;
    }

    this.showNotification(
      NotificationSeverity.INFO,
      `Live Crawling of "${sanitizeInput(
        sourceURL
      )}" finished - parsing content ...`,
      false
    );

    // Get the response text
    return res.text();
  },

  /**
   * Check if the prompt contains placeholders for live crawling
   *
   * @param {Prompt['Prompt']} prompt
   * @returns {boolean}
   */
  promptRequiresLiveCrawling(prompt) {
    return (
      prompt.includes(CrawledTextPlaceholder) ||
      prompt.includes(CrawledSourcePlaceholder)
    );
  },

  /**
   * Check if the prompt contains placeholders for custom indexes
   *
   * @param {Prompt['Prompt']} prompt
   * @returns {boolean}
   */
  promptRequiresCustomIndexes(prompt) {
    return prompt.match(AuxIndexLookupDefinition);
  },

  /**
   * Check if the template supports live crawling
   *
   * @param {Prompt} template
   * @returns {boolean}
   */
  templateRequiresLiveCrawling(template) {
    return hasFeature(
      template.PromptFeatureBitset,
      PromptFeatureBitset.LIVE_CRAWLING
    );
  },

  // handle MARCI.tokens event from MARCI APP
  async handleTokensEvent(event) {
    // check if user has OpenAI account - no linking possible for anonymous users (based on OperatorERID)
    if (
      !this.Client.User.OperatorERID.match(this.Config.getPatternOperatorERID())
    ) {
      this.showNotification(
        NotificationSeverity.WARNING,
        'Please log in or sign up for a ChatGPT (OpenAI) account first.',
        false
      );

      return;
    }

    // store tokens in local storage
    this.Client.storeTokens(event.detail.tokens);

    // link OpenAI user to MARCI user and account
    try {
      await this.Client.linkUser();
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Could not connect your OpenAI account to MARCI, please try again later.',
        false
      );

      return;
    }

    try {
      // refresh MARCI user profile and quota
      await this.Client.checkUserStatus();

      // show notification if connection status is not updated, yet
      if (!this.Client.User.IsLinked) {
        this.showNotification(
          NotificationSeverity.INFO,
          'Connecting your OpenAI account to MARCI, please wait...',
          false
        );
      }

      // wait for CheckUserStatus to update the connection status, quotas and user profile
      while (!this.Client.User.IsLinked) {
        // poll checkUserStatus every 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));

        await this.Client.checkUserStatus();
      }
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Could not get your MARCI user profile, please try again later.',
        false
      );

      return;
    }

    // show notification if user is logged in using MARCI account
    if (this.Client.AppUser) {
      this.showNotification(
        NotificationSeverity.SUCCESS,
        `You are now logged in using MARCI account "${sanitizeInput(
          this.Client.AppUser.FullName
        )} (${sanitizeInput(this.Client.AppUser.UserEmail)})"`,
        false
      );
    }

    // refresh the prompt templates section to show link to MARCI account
    await this.insertPromptTemplatesSection();
  },

  // get the prompt ID from the URL and select the prompt template
  async fetchPromptFromDeepLink() {
    // Get the prompt ID from the URL (MARCI_PromptID)
    const params = new URLSearchParams(window.location.search);
    const promptID = params.get(queryParamPromptID);

    if (!promptID) {
      // If there is no prompt ID in the URL - deselect the prompt template
      await this.selectPromptTemplateByIndex(null);

      return;
    }

    // If the prompt is already selected, do nothing
    if (
      this.SelectedPromptTemplate &&
      this.SelectedPromptTemplate.ID === promptID
    ) {
      return;
    }

    let prompt;

    // for correct deep linking of team prompts, use existing team prompt
    const teamPrompt = this.TeamPrompts.find((p) => p.ID === promptID);
    if (teamPrompt) {
      prompt = teamPrompt;
    } else {
      try {
        // Fetch the prompt using the MARCI API client
        prompt = await this.Client.getPrompt(promptID);
      } catch (error) {
        if (
          error instanceof Reaction &&
          (error.ReactionNo === ReactionNo.RXN_MARCI_PROMPT_NOT_FOUND ||
            error.ReactionNo === ReactionNo.RXN_MARCI_INVALID_ID)
        ) {
          this.showNotification(
            NotificationSeverity.WARNING,
            `Requested prompt does not exist.<br><br>Please use the search function to find the prompt you are looking for.`
          );
        } else {
          this.showNotification(
            NotificationSeverity.ERROR,
            'Something went wrong. Please try again.'
          );
        }
        return;
      }
    }

    if (!prompt) {
      return;
    }

    // Select the prompt template
    await this.selectPromptTemplate(prompt);

    // Pre-fill the prompt variables from the URL
    if (prompt.PromptVariables) {
      prompt.PromptVariables.forEach((promptVariable) => {
        const param = params.get(queryParamVariable + promptVariable.ID);
        if (param) {
          const variableElement = document.querySelector(
            '#' + variableIDPrefix + promptVariable.ID
          );

          if (variableElement) {
            variableElement.value = param;
          }

          this.PromptVariables[promptVariable.ID].Value = param;
        }
      });
    }
  },

  // get the search term from the URL and select the prompt template
  async initSearchTermFromParam() {
    const params = new URLSearchParams(window.location.search);
    const paramSearchTerm = params.get(queryParamSearchTerm);

    if (paramSearchTerm) {
      if (window.location.href.match(this.Config.getEndpointGizmos())) {
        this.GizmoSearch = paramSearchTerm;
      } else {
        this.PromptSearch = paramSearchTerm;
      }
    }
  },

  // Fetch the list of messages from the server
  async fetchMessages(render = true) {
    try {
      this.Messages = await this.Client.getMessages(
        this.PromptTopic === DefaultPromptTopic ? '' : this.PromptTopic
      );
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not load messages. ${
          error instanceof Reaction ? error.message : ''
        }`
      );
      return;
    }

    if (render) {
      this.showMessages();
    }
  },

  /**
   * Display one of the messages
   *
   * @returns {boolean} true if message is shown, false if not
   */
  showMessages() {
    if (this.isMessageShown) {
      return;
    }

    this.isMessageShown = showMessage(
      this.getUnseenStaticMessages(),
      this.getUnseenMessages(),
      this.confirmMessage.bind(this),
      this.voteForMessage.bind(this),
      this.updateLastSeenStaticMessage.bind(this)
    );
  },

  /**
   * Update list of seen message IDs in local storage
   *
   * @param {string} MessageID
   */
  addSeenMessageID(MessageID) {
    const seenMessageIDs = this.getSeenMessageIDs();

    // limit the number of seen messages based on config var
    if (seenMessageIDs.length >= MaxSeenMessages) {
      seenMessageIDs.shift();
    }

    // add the message ID to the list of seen message IDs
    seenMessageIDs.push(MessageID);

    try {
      localStorage.setItem(seenMessagesKey, JSON.stringify(seenMessageIDs));
    } catch (error) {
      console.error('Could not update seen messages in local storage', error);
    }
  },

  /**
   * Confirm a message using the MARCI API client
   *
   * @param {string} MessageID
   * @returns {Promise<boolean>} Whether the message was confirmed successfully
   */
  async confirmMessage(MessageID) {
    try {
      await this.Client.confirmMessage(MessageID);

      this.addSeenMessageID(MessageID);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Something went wrong. Please try again.'
      );
      return false;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      'Thanks for the confirmation!'
    );

    this.isMessageShown = false;

    return true;
  },

  /**
   * Vote for a message using the MARCI API client
   *
   * @param {string} MessageID
   * @param {MessageVoteTypeNo} VoteTypeNo
   * @returns boolean Whether the message was voted for successfully
   */
  async voteForMessage(MessageID, VoteTypeNo) {
    try {
      await this.Client.voteForMessage(MessageID, VoteTypeNo);

      this.addSeenMessageID(MessageID);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Something went wrong. Please try again.'
      );
      return false;
    }

    this.isMessageShown = false;

    return true;
  },

  /**
   * Update last seen static message using localStorage
   *
   * @param {string} MessageID
   * @returns boolean Whether the last seen static message was updated successfully
   */
  updateLastSeenStaticMessage(MessageID) {
    try {
      localStorage.setItem(lastSeenStaticMessageKey, MessageID);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Something went wrong. Please try again.'
      );
      return false;
    }

    this.isMessageShown = false;

    return true;
  },

  // This function sets up the chat sidebar by adding an "Export Button" and modifying
  // the "New Chat" buttons to clear the selected prompt template when clicked
  setupSidebar() {
    // Add the "Export Button" to the sidebar
    this.addExportButton();
    // Get the "New Chat" buttons
    const buttons = this.getNewChatButtons();
    // Set the onclick event for each button to clear the selected prompt template
    buttons.forEach((button) => {
      button.onclick = async () => {
        await this.selectPromptTemplateByIndex(null);

        // Hide the "Continue Writing" button (no prompt selected/new chat)
        this.hideContinueActionsButton();
      };
    });
  },

  // Fetch the lists using the MARCI API client
  async fetchLists() {
    try {
      const lists = await this.Client.getAllListsWithDetails();

      this.Lists = new Lists(
        lists.map((list) => {
          return new List(this.Client, list);
        })
      );
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not load the prompts lists. ${
          error instanceof Reaction ? error.message : ''
        }`
      );
      return;
    }
  },

  // Fetch the list of topics from a remote CSV file
  async fetchTopics() {
    return (
      this.fetch(TopicFeedURL + this.CacheBuster)
        // Convert the response to text
        .then((res) => res.text())
        // Convert the CSV text to an array of records
        .then((csv) => this.CSVToArray(csv))
        // Map the records to topic objects with properties 'ID' and 'Label'
        .then((records) => {
          return (
            records
              .map(([ID, Label]) => {
                return { ID, Label };
              })
              // Filter out records that do not have an ID, or it is the header row (with "ID" as its title)
              .filter(({ ID }) => ID && ID !== 'ID')
          );
        })
        .then((topics) => {
          // Sort and save the topics
          this.Topics = topics.sort((a, b) => a.Label.localeCompare(b.Label));
        })
    );
  },

  // Fetch the list of activities from a remote CSV file
  async fetchActivities() {
    return (
      this.fetch(ActivityFeedURL + this.CacheBuster)
        // Convert the response to text
        .then((res) => res.text())
        // Convert the CSV text to an array of records
        .then((csv) => this.CSVToArray(csv))
        // Map the records to activity objects with properties 'TopicID', 'ID', and 'Label'
        .then((records) => {
          return (
            records
              .map(([TopicID, ID, Label]) => {
                return { TopicID, ID, Label };
              })
              // Filter out records that do not have an ID, or it is the header row (with "ID" as its title)
              .filter(({ ID }) => ID && ID !== 'ID')
          );
        })
        .then((activities) => {
          // Sort and save the array of activities
          this.Activities = activities.sort((a, b) =>
            a.Label.localeCompare(b.Label)
          );
        })
    );
  },

  fetchLanguages() {
    // Fetch the list of languages from a remote CSV file
    return (
      this.fetch(LanguageFeedURL + this.CacheBuster)
        // Convert the response to text
        .then((res) => res.text())
        // Convert the CSV text to an array of records
        .then((csv) => this.CSVToArray(csv))
        // Map the records to language objects with properties 'langcode', 'languageEnglish' and 'languageLabel'
        .then((records) => {
          return (
            records
              .map(([langcode, languageEnglish, languageLabel]) => {
                return { langcode, languageEnglish, languageLabel };
              })
              // Filter out records that do not have a language code, or it is the header row (with "langcode" as its title)
              .filter(({ langcode }) => langcode && langcode !== 'langcode')
          );
        })
        .then((languages) => {
          // Save the array of languages to a global variable
          this.Languages = languages;
        })
    );
  },

  // Fetch list of tones from a remote CSV file
  fetchTones() {
    // use custom tones from AccountSubPrompts
    /** @type {Tone[]} */
    const customTones = this.Client.AccountSubPrompts
      // filter out prompts that are not custom tones
      .filter((prompt) => prompt.TypeNo === SubPromptTypeNo.CustomTones)
      // map the prompts to tones
      .map((prompt) => {
        return {
          ID: parseInt(prompt.PromptID),
          Label: prompt.Label,
        };
      });

    // if there are custom tones, combine them with the default tones
    if (customTones.length > 0) {
      this.Tones = customTones;
    }

    return (
      this.fetch(ToneFeedURL + this.CacheBuster)
        // Convert the response to text
        .then((res) => res.text())
        // Convert the CSV text to an array of records
        .then((csv) => this.CSVToArray(csv))
        // Map the records to tone objects with properties 'ID' and 'Label'
        .then((records) => {
          return (
            records
              .map(([ID, Label]) => {
                return { ID: parseInt(ID), Label };
              })
              // Filter out records that do not have an ID, or it is the header row (with "ID" as its title)
              .filter(({ ID }) => ID && ID !== 'ID')
          );
        })
        .then((tones) => {
          // Append the default tones to the custom tones and sort the tones by Label
          this.Tones = [...this.Tones, ...tones].sort((a, b) =>
            a.Label.localeCompare(b.Label)
          );
        })
    );
  },

  // Fetch list of writing styles from a remote CSV file
  fetchWritingStyles() {
    // use custom writing styles from AccountSubPrompts
    /** @type {WritingStyle[]} */
    const customWritingStyles = this.Client.AccountSubPrompts
      // filter out prompts that are not custom writing styles
      .filter((prompt) => prompt.TypeNo === SubPromptTypeNo.CustomStyles)
      // map the prompts to writing styles
      .map((prompt) => {
        return {
          ID: parseInt(prompt.PromptID),
          Label: prompt.Label,
        };
      });

    // if there are custom writing styles, combine them with the default writing styles
    if (customWritingStyles.length > 0) {
      this.WritingStyles = customWritingStyles;
    }

    return (
      this.fetch(WritingStyleFeedURL + this.CacheBuster)
        // Convert the response to text
        .then((res) => res.text())
        // Convert the CSV text to an array of records
        .then((csv) => this.CSVToArray(csv))
        // Map the records to writing style objects with properties 'ID' and 'Label'
        .then((records) => {
          return (
            records
              .map(([ID, Label]) => {
                return { ID: parseInt(ID), Label };
              })
              // Filter out records that do not have an ID, or it is the header row (with "ID" as its title)
              .filter(({ ID }) => ID && ID !== 'ID')
          );
        })
        .then((writingStyles) => {
          // Append the default writing styles to the custom writing styles and sort the writing styles by Label
          this.WritingStyles = [...this.WritingStyles, ...writingStyles].sort(
            (a, b) => a.Label.localeCompare(b.Label)
          );
        })
    );
  },

  // Fetch list of continue actions from a remote CSV file
  fetchContinueActions() {
    // use custom continue actions from AccountSubPrompts
    /** @type {ContinueAction[]} */
    const customContinueActions = this.Client.AccountSubPrompts
      // filter out prompts that are not custom continue actions
      .filter((prompt) => prompt.TypeNo === SubPromptTypeNo.CustomContinue)
      // map the prompts to continue actions
      .map((prompt) => {
        return {
          ID: parseInt(prompt.PromptID),
          Label: prompt.Label,
          Prompt: prompt.Prompt,
        };
      });

    // if there are custom continue actions, combine them with the default continue actions
    if (customContinueActions.length > 0) {
      this.ContinueActions = customContinueActions;
    }

    return (
      this.fetch(ContinueActionsFeedURL + this.CacheBuster)
        // Convert the response to text
        .then((res) => res.text())
        // Convert the CSV text to an array of records
        .then((csv) => this.CSVToArray(csv))
        // Map the records to continue action objects with properties 'ID', 'Label, and 'Prompt'
        .then((records) => {
          return (
            records
              .map(([ID, Label, Prompt]) => {
                return { ID: parseInt(ID), Label, Prompt };
              })
              // Filter out records that do not have an ID, or it is the header row (with "ID" as its title)
              .filter(({ ID }) => ID && ID !== 'ID')
          );
        })
        .then((continueActions) => {
          // Append the default continue actions to the custom continue actions and sort the continue actions by Label
          this.ContinueActions = [
            ...this.ContinueActions,
            ...continueActions,
          ].sort((a, b) => a.Label.localeCompare(b.Label));
        })
    );
  },

  // Fetch list of my profile infos from AccountSubPrompts
  fetchMyProfileInfos() {
    /** @type {MyProfileInfo[]} */
    this.MyProfileInfos = this.Client.AccountSubPrompts
      // filter out prompts that are not MyProfileInfo
      .filter((prompt) => prompt.TypeNo === SubPromptTypeNo.MyProfileInfo)
      // map the prompts to MyProfileInfos
      .map((prompt) => {
        return {
          ID: parseInt(prompt.PromptID),
          Label: prompt.Label,
          Info: prompt.Prompt,
        };
      })
      // sort the MyProfileInfos by Label
      .sort((a, b) => a.Label.localeCompare(b.Label));

    // reset includeMyProfileInfo if there are no custom MyProfileInfos
    if (this.MyProfileInfos.length === 0) {
      this.resetIncludeMyProfileInfo();
    }
  },

  // If MyProfileInfo is store in local storage, then store it in backend and remove it from local storage
  async storeMyProfileInfoFromLocalStorage() {
    // cannot store MyProfileInfo if user is not linked
    if (!this.Client.User.IsLinked) {
      return;
    }

    try {
      const myProfileInfo = localStorage.getItem(myProfileMessageKey);

      // if there is no myProfileInfo in local storage, then return
      if (!myProfileInfo) {
        return;
      }

      // create MyProfileInfo
      const subPrompt = await this.Client.createMyProfileInfo(myProfileInfo);

      // add created MyProfileInfo to this.MyProfileInfos
      this.MyProfileInfos.push({
        ID: parseInt(subPrompt.PromptID),
        Label: subPrompt.Label,
        Info: subPrompt.Prompt,
      });

      // remove the old myProfileInfo from local storage
      localStorage.removeItem(myProfileMessageKey);
    } catch (error) {
      // user has reached the limit of max. MyProfileInfos quota
      if (
        error instanceof Reaction &&
        error.ReactionNo === ReactionNo.RXN_MARCI_QUOTA_EXCEEDED
      ) {
        // remove the old myProfileInfo from local storage
        localStorage.removeItem(myProfileMessageKey);

        return;
      }

      console.error(error);
    }
  },

  // Fetch list of models from a remote CSV file
  fetchModels() {
    return (
      this.fetch(ModelFeedURL + this.CacheBuster)
        // Convert the response to text
        .then((res) => res.text())
        // Convert the CSV text to an array of records
        .then((csv) => this.CSVToArray(csv))
        // Map the records to model objects with properties 'ID' and 'Label'
        .then((records) => {
          return (
            records
              .map(([ID, LabelUser, LabelAuthor, StatusNo]) => {
                return {
                  ID: ID,
                  LabelUser,
                  LabelAuthor,
                  StatusNo: parseInt(StatusNo),
                };
              })
              // Filter out records that do not have an ID, or it is the header row (with "ID" as its title)
              .filter(({ ID }) => ID && ID !== 'ID')
          );
        })
        .then((models) => {
          // filter out special gizmos and sort the models by Label
          this.Models = models
            .filter((model) => model.StatusNo !== ModelStatusNo.SPECIAL_GIZMO)
            .sort((a, b) => a.LabelAuthor.localeCompare(b.LabelAuthor));

          // filter out models that are not active
          this.ModelsActive = this.Models.filter(
            (model) => model.StatusNo === ModelStatusNo.ACTIVE
          );

          // collect special gizmo codes
          this.SpecialGizmos = models
            .filter((model) => model.StatusNo === ModelStatusNo.SPECIAL_GIZMO)
            .map((model) => model.ID);
        })
    );
  },

  // Fetch list roles, tasks, constraints and contexts for prompt builder config from a remote CSV file
  fetchPromptBuilderConfig() {
    const options = {
      roles: [],
      tasks: [],
      constraints: [],
      contexts: [],
    };

    return (
      this.fetch(PromptBuilderFeedURL + this.CacheBuster)
        // Convert the response to text
        .then((res) => res.text())
        // Convert the CSV text to an array of records
        .then((csv) => this.CSVToArray(csv))
        // Map the records to prompt builder options (roles, tasks, constraints and contexts) - ignore header "Type","Label"
        .then((records) => {
          return (
            records
              .map(([Type, Label]) => {
                return { Type, Label };
              })
              // Filter out records that do not have a Type, or it is the header row (with "Type" as its title)
              .filter(({ Type }) => Type && Type !== 'Type')
          );
        })
        .then((promptBuilderOptions) => {
          // collect prompt builder options (roles, tasks, constraints and contexts)
          promptBuilderOptions.forEach((option) => {
            switch (option.Type) {
              case 'role':
                options.roles.push(option.Label);
                break;
              case 'task':
                options.tasks.push(option.Label);
                break;
              case 'constraint':
                options.constraints.push(option.Label);
                break;
              case 'context':
                options.contexts.push(option.Label);
                break;
            }
          });
        })
        .then(() => {
          // sort the prompt builder options (roles, tasks, constraints and contexts) by Label in a case-insensitive manner
          options.roles.sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
          );
          options.tasks.sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
          );
          options.constraints.sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
          );
          options.contexts.sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
          );
        })
        .then(() => {
          // save the prompt builder options (roles, tasks, constraints and contexts)
          this.PromptBuilderOptions = options;
        })
    );
  },

  // Load Prompt Templates type and list ID from local storage
  loadPromptTemplateTypeAndListFromLocalStorage() {
    const lastPromptTemplateType = localStorage.getItem(
      lastPromptTemplateTypeKey
    );
    const lastListID = localStorage.getItem(lastListIDKey);

    let matched = false;

    switch (lastPromptTemplateType) {
      // Public or Own Prompt Templates
      case PromptTemplatesType.PUBLIC:
      case PromptTemplatesType.OWN:
        matched = true;
        this.PromptTemplatesType = lastPromptTemplateType;
        this.PromptTemplatesList = null;
        break;

      // Custom List Prompt Templates
      case PromptTemplatesType.CUSTOM_LIST:
        // Check if the last list ID is valid, exists and the user can use it
        if (
          lastListID &&
          // Hidden List
          ((lastListID == this.Lists.getHidden()?.ID &&
            this.Client.UserQuota.canUseHiddenOnlyCheck()) ||
            // Favorites List
            (lastListID == this.Lists.getFavorites()?.ID &&
              this.Client.UserQuota.canUseFavoritesOnlyCheck()) ||
            // MARCI Verified List
            (lastListID == this.Lists.getMARCIVerified()?.ID &&
              this.Client.UserQuota.canUseMARCIVerifiedList(false)) ||
            // Custom List
            (this.Lists.withIDAndType(lastListID, ListTypeNo.CUSTOM) &&
              this.Client.UserQuota.canUseCustomListOnlyCheck()) ||
            // Team List
            (this.Lists.withIDAndType(lastListID, ListTypeNo.TEAM_CUSTOM) &&
              this.Client.UserQuota.canUseTeamListOnlyCheck()))
        ) {
          matched = true;
          this.PromptTemplatesType = PromptTemplatesType.CUSTOM_LIST;
          this.PromptTemplatesList = lastListID;
        }
        break;
    }

    if (!matched) {
      this.PromptTemplatesType = PromptTemplatesType.PUBLIC;
      this.PromptTemplatesList = null;

      localStorage.setItem(lastPromptTemplateTypeKey, this.PromptTemplatesType);
      localStorage.setItem(lastListIDKey, this.PromptTemplatesList);
    }
  },

  async fetchPromptTemplates(render = true) {
    let templates;

    try {
      /** @type {Prompt[]} */
      templates = await this.Client.getPrompts(
        this.PromptTopic === DefaultPromptTopic ? '' : this.PromptTopic,
        this.PromptSortMode
      );
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not load prompt templates. ${
          error instanceof Reaction ? error.message : ''
        }`
      );
      return;
    }

    // split templates into public, own and team
    [this.PromptTemplates, this.OwnPrompts, this.TeamPrompts] =
      templates.reduce(
        (publicPrivateTeamPrompts, template) => {
          // Public template
          if (
            template.PromptTypeNo === PromptTypeNo.PUBLIC &&
            (this.PromptTopic === DefaultPromptTopic ||
              template.Topic === this.PromptTopic)
          ) {
            publicPrivateTeamPrompts[0].push(template);
          }

          // Private, Team or Public template owned by current user
          if (
            template.OwnPrompt &&
            (this.PromptTopic === DefaultPromptTopic ||
              template.Topic === this.PromptTopic)
          ) {
            publicPrivateTeamPrompts[1].push(template);
          }

          // Team templates - we need to have all TeamPrompts in this array
          if (template.PromptTypeNo === PromptTypeNo.TEAM) {
            publicPrivateTeamPrompts[2].push(template);
          }

          return publicPrivateTeamPrompts;
        },
        [[], [], []]
      );

    if (render) {
      await this.insertPromptTemplatesSection();
    }
  },

  // Fetch gizmos using the MARCI API client
  async fetchGizmos(render = true) {
    try {
      this.Gizmos = await this.Client.getGizmos(this.GizmoSortMode);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not load GPTs. ${error instanceof Reaction ? error.message : ''}`
      );
      return;
    }

    if (render) {
      this.insertGizmosSection();
    }
  },

  /**
   * Check if a template is for Model or Gizmo
   *
   * @param {Prompt} template
   * @param {string} modelOrGizmoCode
   * @returns {boolean}
   */
  isTemplateForModelOrGizmo(template, modelOrGizmoCode) {
    if (template.ModelS?.find((model) => model === modelOrGizmoCode)) {
      return true;
    } else if (
      this.CurrentGizmo &&
      template.GizmoCodeS?.find((code) => code === modelOrGizmoCode)
    ) {
      return true;
    } else {
      return false;
    }
  },

  createObserver() {
    // Create a new observer for the chat sidebar to watch for changes to the document body
    const observer = new MutationObserver((mutations) => {
      // For each mutation (change) to the document body
      mutations.forEach(async (mutation) => {
        // If the mutation is not a change to the list of child nodes, skip it
        if (mutation.type !== 'childList')
          if (mutation.addedNodes.length == 0)
            // If no new nodes were added, skip this mutation
            return;
        // Get the first added node
        const node = mutation.addedNodes[0];
        // If the node is not an element or does not have a `querySelector` method, skip it
        if (!node || !node.querySelector) return;
        // Call the `handleElementAdded` function with the added node
        await this.handleElementAdded(node);
      });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { subtree: true, childList: true });
  },

  // Find the message part index in parts array (skip image for multimodal_text content type)
  findMessagePartIndex(message) {
    // default message part index is 0 for the first prompt
    if (message?.content?.content_type !== 'multimodal_text') {
      return 0;
    }

    // find the message part index for multimodal_text content type (skip one or multiple images)
    for (let i = 0; i < message?.content?.parts?.length; i++) {
      // if the value is not object, then return the index
      if (typeof message?.content?.parts[i] !== 'object') {
        return i;
      }
    }

    // if the message part is not found show an error
    this.showNotification(
      NotificationSeverity.ERROR,
      'Could not modify prompt - no message part found'
    );

    throw new Error('Could not modify prompt - no message part found');
  },

  // Replace text decoder to modify conversation chat messages to not show prompt templates
  replaceTextDecoder() {
    // Skip if modification of conversation chat messages is disabled
    if (
      !this.Config.getPromptTemplatesConfig().EnableTextDecoderMessagesFilter
    ) {
      return;
    }

    // Store original TextDecoder
    const OriginalTextDecoder = window.TextDecoder;

    // Create proxy for TextDecoder
    window.TextDecoder = function (label = 'utf-8', options = {}) {
      const decoder = new OriginalTextDecoder(label, options);
      const originalDecode = decoder.decode;

      decoder.decode = function (input, options = {}) {
        const text = originalDecode.call(decoder, input, options);

        // If starts with { and it's possibly user message (try to parse JSON)
        if (!text.startsWith('{') || !text.includes('"user"')) {
          return text;
        }

        try {
          const message = JSON.parse(text);
          const msg = message?.message || message?.v?.message;

          // Only the first message from the user
          if (msg?.author?.role === 'user') {
            return '';
          }
        } catch (err) {
          // If JSON parsing fails, return original text
        }

        return text;
      };

      return decoder;
    };

    // Copy over properties
    window.TextDecoder.prototype = OriginalTextDecoder.prototype;
    window.TextDecoder.prototype.constructor = window.TextDecoder;
  },

  replaceFetch() {
    window.fetch = async (...t) => {
      // Switch to the original fetch function if prompt templates are disabled
      if (!this.Config.arePromptTemplatesEnabled()) {
        return this.fetch(...t);
      }

      const config = this.Config.getPromptTemplatesConfig();

      // Cannot proceed without request URL to match known endpoints
      if (!t?.[0]?.match) {
        return this.fetch(...t);
      }

      // If the request is for the message feedback API, track the message feedback
      if (t?.[0].match(config.EndpointMessageFeedback)) {
        // Only track the message feedback if the current page URL contains Gizmo code

        // TODO: This doesn't work properly with inline tagging of GPTs
        // (conversation possibly includes multiple GPTs, but the GizmoCode is not included in the message feedback request)
        const GizmoCode = window.location.href.match(config.GizmoCodePattern);

        if (!GizmoCode?.[1]) {
          // Use the original fetch function to make the request since we know it is not for the chat backend API
          return this.fetch(...t);
        }

        try {
          // Parse the request body from JSON
          const body = JSON.parse(t[1].body);

          // Do not track duplicate votes with additional text feedback
          if (body[config.FeedbackTextField]) {
            return this.fetch(...t);
          }

          // Unknown feedback type
          if (
            !body[config.FeedbackRatingField] ||
            ![config.FeedbackThumbsUp, config.FeedbackThumbsDown].includes(
              body[config.FeedbackRatingField]
            )
          ) {
            return this.fetch(...t);
          }

          // Track the message feedback
          this.Client.voteForGizmo(
            GizmoCode[1],
            GizmoVoteTypeNo.RESULT_THUMBS,
            body[config.FeedbackRatingField] &&
              body[config.FeedbackRatingField] === config.FeedbackThumbsDown
              ? -1
              : 1
          );
        } catch (err) {
          // If there was an error parsing the request body or tracking the message feedback,
          // just use the original fetch function
          console.error(
            'replaceFetch: Error parsing request body or tracking message feedback',
            err
          );
        }

        // Use the original fetch function to make the request since we know it is not for the chat backend API
        return this.fetch(...t);
      }

      // Modify the conversation chat messages request for the current conversation to hide prompt templates
      if (config.EnableConversationMessagesModification) {
        const conversationID = t?.[0].match(
          config.EndpointConversationChatMessages
        )?.[2];

        if (
          conversationID &&
          window.location.pathname.includes(conversationID)
        ) {
          // console.log(
          //   'replaceFetch: current conversation - modifying messages',
          //   conversationID
          // );

          return this.modifyConversationMessages(async () => this.fetch(...t));
        }
      }

      // Get the endpoint pattern for the chat backend API
      const EndpointConversation = config.EndpointConversation;

      // If the request is not for the chat backend API, just use the original fetch function
      if (!t[0] || !t[0].match(EndpointConversation)) {
        return this.fetch(...t);
      }

      // Do not modify requests when using Gizmo Magic Create (GPT Builder)
      if (window.location.href.match(config.GizmoMagicCreatePattern)) {
        return this.fetch(...t);
      }

      // Options object for the request
      let options;

      // Request body
      let body;

      // Index of the message part in the request body
      let messagePartIndex;

      // Prompt from the request body
      let prompt;

      // Use custom index lookup for prompt or not
      let useAuxIndexLookup;

      // Check if message contains placeholders to augment prompt
      try {
        // Get the options object for the request, which includes the request body
        options = t[1];

        // Parse the request body from JSON
        body = JSON.parse(options.body);

        // Track Gizmo usage
        if (body?.conversation_mode?.gizmo_id) {
          // The first message in the conversation
          if (!body?.conversation_id) {
            this.Client.useGizmo(
              body.conversation_mode.gizmo_id,
              GizmoVoteTypeNo.USE_ONCE,
              {
                conversation_mode: body.conversation_mode,
                model: body.model,
              }
            );

            // Auto-submit the Gizmo with the first message
            this.storeGPT(body.conversation_mode.gizmo_id, false);
          }

          // All other messages in the conversation
          this.Client.useGizmo(
            body.conversation_mode.gizmo_id,
            GizmoVoteTypeNo.USE_MESSAGE
          );
        }

        // Check if the user has reached the soft/hard limit of max. sent prompts
        if (this.Config.isPromptSendQuotaEnabled()) {
          const isAIRPMPrompt =
            this.SelectedPromptTemplate || this.SelectedContinueActionPrompt;

          // Reset the last selected continue action prompt
          this.SelectedContinueActionPrompt = null;

          if (!this.Client.UserQuota.canSendPrompt(isAIRPMPrompt)) {
            return Promise.reject(
              new Error(
                this.Client.UserQuota.getPromptSendQuotaExceededMessage()
              )
            );
          }
        }

        // Get the index of the message part in the request body
        messagePartIndex = this.findMessagePartIndex(body.messages[0]);

        // Get the prompt from the request body
        prompt = body.messages[0].content.parts[messagePartIndex];

        // Check if prompt contains reference for custom index lookup
        // $[<NAMESPACE>::]<IndexCode>[(Max Count of Chunks Returned)]:<Query>
        // namespace, namespace delimiter and max count of chunks returned are optional

        // TODO: move to remote config for hotfixes
        useAuxIndexLookup =
          this.Client.UserQuota.hasCustomIndexesFeatureEnabled() &&
          prompt.match(AuxIndexLookupDefinition);

        // console.log('replaceFetch: useAuxIndexLookup', !!useAuxIndexLookup);
      } catch (error) {
        console.error('replaceFetch: Error parsing request body', error);
        return this.fetch(...t);
      }

      // If no prompt template, tone, writing style or target language has been selected,
      // use only the profile message or the original fetch function if the profile message is not needed
      if (
        !this.SelectedPromptTemplate &&
        !this.Tone &&
        !this.WritingStyle &&
        !this.TargetLanguage &&
        !useAuxIndexLookup
      ) {
        // Track send (prompt ID = 0, no prompt template is selected),
        // but do not track continue actions twice (already tracked)
        if (!this.SelectedContinueActionPrompt) {
          this.Client.usePrompt(
            0,
            UsageTypeNo.SEND,
            this.CurrentGizmo?.GizmoCode
          );
        }

        // Reset the last selected continue action prompt
        this.SelectedContinueActionPrompt = null;

        // Use profile message if needed - otherwise, use the original fetch function
        if (!this.IncludeMyProfileMessage || !this.SelectedMyProfileInfoID) {
          // Reset the includeMyProfileInfo
          this.resetIncludeMyProfileInfo();

          return this.fetch(...t);
        }

        try {
          const myProfileInfo = this.MyProfileInfos
            ? this.MyProfileInfos.find(
                (myProfileInfo) =>
                  myProfileInfo.ID === this.SelectedMyProfileInfoID
              )
            : null;

          if (myProfileInfo) {
            // Add the profile message to the request body
            body.messages[0].content.parts[
              messagePartIndex
            ] += `\n\n${myProfileInfo.Info}`;
          }

          // Reset the includeMyProfileInfo
          this.resetIncludeMyProfileInfo();

          // Stringify the modified request body and update the options object
          options.body = JSON.stringify(body);

          // Use the modified fetch function to make the request
          return this.fetch(t[0], options);
        } catch (err) {
          console.error('Error modifying request body', err);

          // If there was an error parsing the request body or modifying the request,
          // just use the original fetch function
          return this.fetch(...t);
        }
      }

      // Get the selected prompt template
      const template = this.SelectedPromptTemplate;

      // Track send (prompt ID or 0 if no prompt template is selected),
      // but do not track continue actions twice (already tracked)
      if (template || !this.SelectedContinueActionPrompt) {
        this.Client.usePrompt(
          template ? template.ID : 0,
          UsageTypeNo.SEND,
          this.CurrentGizmo?.GizmoCode
        );
      }

      // Reset the last selected continue action prompt
      this.SelectedContinueActionPrompt = null;

      // Allow the user to use continue actions after sending a prompt
      this.showContinueActionsButton();

      // Collect variable values and names for custom index lookup
      let variableValues = [];
      let variableNames = [];

      try {
        if (template) {
          // Use the default target language if no target language has been selected
          const targetLanguage = (
            this.TargetLanguage ? this.TargetLanguage : DefaultTargetLanguage
          ).replace('*', '');

          // Replace the prompt in the request body with the selected prompt template,
          // inserting the original prompt into the template and replacing the target language placeholder
          let promptTextUpdated1 = template.Prompt.replaceAll(
            PromptPlaceholder,
            prompt
          ).replaceAll(TargetLanguagePlaceholder, targetLanguage);

          // create a 1 liner from prompt by replacing all the \n with spaces
          let prompt1 = prompt.replaceAll('\n', ' ');

          let promptTextUpdated = promptTextUpdated1
            .replaceAll(PromptPlaceholder1, prompt1)
            .replaceAll(TargetLanguagePlaceholder, targetLanguage);

          // Replace variables with values
          if (template.PromptVariables) {
            template.PromptVariables.forEach((promptVariable) => {
              // Prompt variables are already removed from DOM at this point with the new composer
              const v = this.PromptVariables[promptVariable.ID];

              if (v) {
                promptTextUpdated = promptTextUpdated.replaceAll(
                  VariablePlaceholder.replace('{idx}', promptVariable.ID),
                  v.Value
                );

                variableValues.push(v.Value);
                variableNames.push(`VARIABLE${promptVariable.ID}`);
              }
            });
          }

          // Remove variable definitions from prompt text
          promptTextUpdated = promptTextUpdated.replaceAll(
            VariableDefinition,
            ''
          );

          body.messages[0].content.parts[messagePartIndex] = promptTextUpdated;

          // Replace Live Crawling placeholders with the Live Crawling result
          body.messages[0].content.parts[messagePartIndex] =
            await this.injectLiveCrawlingResult(
              prompt,
              body.messages[0].content.parts[messagePartIndex]
            );
        }

        /** @type {string[]} */
        const toneWritingStyleLanguagePrompt = [];

        // If the user has selected a tone, add it to the request body
        const tone = this.Tone
          ? this.Tones.find((tone) => tone.ID === this.Tone)
          : null;

        if (tone) {
          toneWritingStyleLanguagePrompt.push(
            `${tone.Label.toLowerCase()} tone`
          );

          // Track the tone usage
          this.Client.usePrompt(
            `${tone.ID}`,
            UsageTypeNo.SEND,
            this.CurrentGizmo?.GizmoCode
          );
        }

        // If the user has selected a writing style, add it to the request body
        const writingStyle = this.WritingStyle
          ? this.WritingStyles.find(
              (writingStyle) => writingStyle.ID === this.WritingStyle
            )
          : null;

        if (writingStyle) {
          toneWritingStyleLanguagePrompt.push(
            `${writingStyle.Label.toLowerCase()} writing style`
          );

          // Track the writing style usage
          this.Client.usePrompt(
            `${writingStyle.ID}`,
            UsageTypeNo.SEND,
            this.CurrentGizmo?.GizmoCode
          );
        }

        // If the user has selected a target language, add it to the request body
        if (!template && this.TargetLanguage) {
          toneWritingStyleLanguagePrompt.push(
            `${this.TargetLanguage.replace('*', '')} language`
          );
        }

        // Inject profile message into the request body if available
        if (this.IncludeMyProfileMessage && this.SelectedMyProfileInfoID) {
          const myProfileInfo = this.MyProfileInfos
            ? this.MyProfileInfos.find(
                (myProfileInfo) =>
                  myProfileInfo.ID === this.SelectedMyProfileInfoID
              )
            : null;

          if (myProfileInfo) {
            body.messages[0].content.parts[
              messagePartIndex
            ] += `\n\n${myProfileInfo.Info}`;
          }

          // Reset the includeMyProfileInfo
          this.resetIncludeMyProfileInfo();
        }

        // If the user has selected a tone, writing style or target language, add a prompt to the request body
        if (toneWritingStyleLanguagePrompt.length > 0) {
          body.messages[0].content.parts[
            messagePartIndex
          ] += `\n\nPlease write in ${toneWritingStyleLanguagePrompt.join(
            ', '
          )}.`;
        }

        // Clear the selected prompt template
        await this.selectPromptTemplateByIndex(null);

        // console.log('prompt: ', prompt);

        // console.log(
        //   'promptPrepared: ',
        //   body.messages[0].content.parts[messagePartIndex]
        // );

        // TODO: Custom index lookup could be also specified as a prompt template variable value?
        // TODO: YES
        // 2nd check for custom index lookup
        useAuxIndexLookup =
          this.Client.UserQuota.hasCustomIndexesFeatureEnabled() &&
          body.messages[0].content.parts[messagePartIndex].match(
            AuxIndexLookupDefinition
          );

        // Augment prompt with custom index lookup
        if (useAuxIndexLookup) {
          // Show notification that custom index lookup is started
          this.showNotification(
            NotificationSeverity.INFO,
            `Custom index lookup started ...`,
            false
          );

          let augmentedPrompt;
          let augmentPromptRequestError;

          try {
            // Send request to custom index lookup endpoint to augment prompt
            augmentedPrompt = await this.Client.augmentPrompt(
              prompt,
              body.messages[0].content.parts[messagePartIndex],
              body.model,
              variableNames,
              variableValues,
              template ? template.ID : null
            );
          } catch (error) {
            if (
              error instanceof Reaction &&
              error.ReactionNo ===
                ReactionNo.RXN_MARCI_DOCUMENT_INDEX_INCORRECT_PLAN
            ) {
              this.Client.UserQuota.incorrectPlanForDocumentIndexFeature();

              this.showNotification(
                NotificationSeverity.INFO,
                `Custom index lookup failed - feature not supported in current plan - submitting prompt ...`
              );

              augmentPromptRequestError = error;
            } else {
              console.error('Error augmenting prompt', error);

              this.showNotification(
                NotificationSeverity.ERROR,
                'Custom index lookup failed - ' +
                  (error instanceof Reaction
                    ? error.message
                    : 'Something went wrong.') +
                  ' Submitting prompt ...'
              );

              augmentPromptRequestError = error;
            }
          }

          // No prompt returned from custom index lookup
          if (!augmentedPrompt?.Prompt) {
            console.error('Error augmenting prompt - no prompt returned');

            // Show error notification only if request didn't fail
            // (otherwise there is no prompt, because request failed and error notification was already shown)
            if (!augmentPromptRequestError) {
              this.showNotification(
                NotificationSeverity.ERROR,
                'Custom index lookup failed - no prompt returned - submitting prompt ...'
              );
            }
          } else {
            // Replace the prompt in the request body with the augmented prompt
            body.messages[0].content.parts[messagePartIndex] =
              augmentedPrompt.Prompt;

            this.showNotification(
              NotificationSeverity.SUCCESS,
              'Custom index lookup finished - submitting prompt ...'
            );
          }
        }

        // Stringify the modified request body and update the options object
        options.body = JSON.stringify(body);
        // Use the modified fetch function to make the request
        return this.fetch(t[0], options);
      } catch (err) {
        console.error('Error modifying request body', err);

        // If there was an error parsing the request body or modifying the request,
        // just use the original fetch function
        return this.fetch(...t);
      }
    };
  },

  // Add MARCI watermark to conversation responses
  addWatermark() {
    // no config available or watermark is not enabled or watermark is hidden by user settings
    if (
      !this.Config ||
      !this.Config.isWatermarkEnabled() ||
      this.getHideWatermark()
    ) {
      return;
    }

    const watermarkConfig = this.Config.getWatermarkConfig();

    // add watermark class to all configured selectors, if it's not set, yet
    Object.keys(watermarkConfig.Selectors).forEach((watermarkClass) => {
      document
        .querySelectorAll(
          `${
            watermarkConfig.Selectors[watermarkClass]
          }:not(.${watermarkClass.replace(/:/g, '\\:')})`
        )
        .forEach((element) => {
          element.classList.add(watermarkClass);
        });
    });
  },

  // This function is called for each new element added to the document body
  async handleElementAdded(e) {
    const selectorConfig = this.Config.getSelectorConfig();

    // Ignore changes in the prompt textarea to prevent performance issues when pasting large texts
    if (
      e.parentElement?.id &&
      e.parentElement?.id === selectorConfig.IgnoreElementAdditionByID
    ) {
      return;
    }

    // If watermark is enabled, add corresponding classes
    this.addWatermark();

    // If the element added is the root element for the chat sidebar, set up the sidebar
    if (
      e.id === selectorConfig.ElementAddedSidebarID1 ||
      e.id === selectorConfig.ElementAddedSidebarID2
    ) {
      this.setupSidebar();
      return;
    }

    // "Explore GPTs" or "My GPTs" page - setup sidebar and hide "Export Button", but continue with other actions
    if (
      e.className &&
      e.className === selectorConfig.GizmosContentContainer &&
      window.location.href.match(this.Config.getEndpointGizmos())
    ) {
      this.setupSidebar();

      // No export possible on these pages
      const button = document.getElementById('export-button');
      if (button) button.style = 'pointer-events: none;opacity: 0.5';
    }

    // Disable "Export Button" when no chat were started.
    // Insert "Prompt Templates" section to the main page.
    // Insert language select and continue button above the prompt textarea input
    if (e.querySelector(selectorConfig.ElementAddedExportButtonDisable)) {
      this.extractCurrentGizmoInformation();

      // reset current page, so prompt templates are shown from start
      this.PromptTemplateSection.currentPage = 0;

      await this.insertPromptTemplatesSection();

      const button = document.getElementById('export-button');
      if (button) button.style = 'pointer-events: none;opacity: 0.5';

      this.insertLanguageToneWritingStyleContinueActions();
      this.insertIncludeMyProfileInfo();
      this.insertPromptPanel();
    }

    // Enable "Export Button" when a new chat started.
    // Insert language select and continue button above the prompt textarea input
    if (document.querySelector(selectorConfig.ElementAddedExportButtonEnable)) {
      const button = document.getElementById('export-button');
      if (button) button.style = '';

      this.insertLanguageToneWritingStyleContinueActions();
      this.insertIncludeMyProfileInfo();
      this.insertPromptPanel();
    }

    // Add "Save prompt as template" button, if new prompt was added
    if (
      document.querySelector(selectorConfig.ElementAddedSavePromptAsTemplate)
    ) {
      this.insertSavePromptAsTemplateButton();

      this.insertPromptTemplatesSidebar();
    }

    // Hide suggested prompts conflicting with prompt templates
    this.hideSuggestedPrompts();

    // Apply general layout changes based on config
    this.applyLayoutChanges();

    // Add GPTs
    if (e.querySelector(selectorConfig.GizmosTitle)) {
      this.insertGizmosSection();
    }
  },

  // Insert GPTs
  insertGizmosSection() {
    const selectorConfig = this.Config.getSelectorConfig();

    const titles = document.querySelectorAll(selectorConfig.GizmosTitle);

    // if there are no titles, then return (not GPTs page)
    if (!titles || titles.length <= selectorConfig.GizmosTitleIndex) {
      return;
    }

    // Use the second title as the reference element
    const firstElement = titles[selectorConfig.GizmosTitleIndex];

    // find parent of container and add GPTs before it
    const parent = firstElement.parentElement;

    if (!parent) {
      return;
    }

    // find GPTs container
    let gptsContainer = document.getElementById('MARCI__gpts-container');

    // create GPTs container if it doesn't exist
    if (!gptsContainer) {
      gptsContainer = document.createElement('div');
      gptsContainer.id = 'MARCI__gpts-container';
      gptsContainer.className = '';

      // add GPTs container before parent
      parent.insertBefore(gptsContainer, firstElement);
    }

    // Get the current page number and page size
    const { currentPage, pageSize } = this.GizmoSection;

    let gizmos = this.filterGizmos(this.Gizmos);

    // Calculate the start and end indices of the current page of GPTs
    const start = pageSize * currentPage;
    const end = Math.min(pageSize * (currentPage + 1), gizmos.length);

    // Get the GPTs for the current page
    const gptsForPage = gizmos.slice(start, end);

    const paginationContainer = /*html*/ `
      <div class="MARCI__flex MARCI__flex-1 MARCI__gap-3.5 MARCI__justify-between MARCI__items-center MARCI__flex-col sm:MARCI__flex-row MARCI__mt-10 MARCI__my-4">
        <div class="MARCI__text-left" style="margin-top: -1rem;">
          <label class="MARCI__block MARCI__text-sm MARCI__font-medium" title="The number of GPTs per page">GPTs per Page</label>
          <select class="MARCI__bg-gray-100 MARCI__border-0 MARCI__text-sm MARCI__rounded MARCI__block MARCI__w-full dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200 focus:MARCI__ring-0 dark:hover:MARCI__bg-gray-800 gizmosPageSizeSelect">
            ${pageSizeOptions
              .map(
                (pageSize) => /*html*/ `
                  <option value="${pageSize}" ${
                  pageSize === this.GizmoSection.pageSize ? 'selected' : ''
                }>${pageSize}</option>`
              )
              .join('')}
          </select>
        </div>
        
        <span class="${css`paginationText`}">
          Showing <span class="${css`paginationNumber`}">${
      start + 1
    }</span> to <span class="${css`paginationNumber`}">${end}</span> of <span class="${css`paginationNumber`}">${
      gizmos.length
    } GPTs</span>
        </span>
        <div class="${css`paginationButtonGroup`}">
          <button onclick="MARCI.prevGizmosPage()" class="${css`paginationButton`} MARCI__text-sm" style="border-radius: 6px 0 0 6px">Prev</button>
          <button onclick="MARCI.nextGizmosPage()" class="${css`paginationButton`} MARCI__border-0 MARCI__border-l MARCI__border-gray-500 dark:MARCI__border-gray-700 MARCI__text-sm" style="border-radius: 0 6px 6px 0">Next</button>
        </div>
      </div>`;

    // add GPTs to GPTs container
    gptsContainer.innerHTML = /*html*/ `
      <div class="MARCI__text-2xl MARCI__font-bold">MARCI Community GPTs</div>
           
      <div class="MARCI__grid MARCI__grid-cols-2 lg:MARCI__flex MARCI__flex-row MARCI__gap-3 MARCI__items-end MARCI__justify-between MARCI__mt-3 MARCI__w-full md:last:MARCI__mb-6 MARCI__pt-2 MARCI__stretch MARCI__text-left MARCI__text-sm">
        <div>
          <label for="gizmoSortBySelect" class="MARCI__block MARCI__text-sm MARCI__font-medium">Sort by</label>
      
          <select id="gizmoSortBySelect" class="MARCI__bg-gray-100 MARCI__border-0 MARCI__text-sm MARCI__rounded MARCI__block MARCI__w-full dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200 focus:MARCI__ring-0 dark:hover:MARCI__bg-gray-800">
            ${Object.keys(SortModeNo)
              .map(
                (sortMode) => /*html*/ `
                <option value="${SortModeNo[sortMode]}" ${
                  this.GizmoSortMode === SortModeNo[sortMode] ? 'selected' : ''
                }>${capitalizeWords(sortMode.replaceAll('_', ' '))}</option>`
              )
              .join('')}
          </select>
        </div>
        
        <div class="MARCI__whitespace-nowrap MARCI__flex">
          <button title="Submit a new GPT" 
            onclick="event.preventDefault(); MARCI.submitNewGPT()" 
            class="MARCI__rounded MARCI__justify-center MARCI__items-center MARCI__hidden lg:MARCI__inline-block MARCI__mr-1 MARCI__p-2 MARCI__px-2.5 MARCI__font-medium MARCI__text-gray-800 MARCI__bg-gray-100 hover:MARCI__bg-gray-200 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__text-gray-400 dark:hover:MARCI__text-white dark:hover:MARCI__bg-gray-800">
            ${svg('Plus')}
          </button>
          <input id="gizmoSearchInput" type="search" class="MARCI__bg-gray-100 MARCI__border-0 MARCI__text-sm MARCI__rounded MARCI__inline-block MARCI__w-full dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200 focus:MARCI__ring-0 lg:MARCI__w-[260px] dark:hover:MARCI__bg-gray-800" placeholder="Search" 
            value="${sanitizeInput(
              this.GizmoSearch
            )}" onfocus="this.value = this.value">          
        </div>

        <div class="lg:MARCI__hidden MARCI__col-start-2">
          <button title="Submit a new GPT" 
            onclick="event.preventDefault(); MARCI.submitNewGPT()" 
            class="MARCI__text-sm MARCI__rounded MARCI__w-full MARCI__flex MARCI__justify-center MARCI__items-center MARCI__p-2 MARCI__font-medium MARCI__text-gray-800 MARCI__bg-gray-100 hover:MARCI__bg-gray-200 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__text-gray-400 dark:hover:MARCI__text-white dark:hover:MARCI__bg-gray-800">
            ${svg('Plus')} &nbsp; Submit a new GPT
          </button>
        </div>
      </div>
      
      <div class="MARCI__mb-10 MARCI__mt-4">        

        ${gizmos.length > this.GizmoSection.pageSize ? paginationContainer : ''}
        
        ${
          gizmos.length === 0
            ? /*html*/ `
              <div class="MARCI__w-full MARCI__my-8 MARCI__text-center">
                <div class="MARCI__font-semibold MARCI__text-xl">No GPTs found for your current filter.</div>
                <div class="MARCI__text-sm">Please reset your filters to view all GPTs.</div>
                <a class="MARCI__underline MARCI__text-sm" href="#" title="Reset filters" onclick="event.stopPropagation(); MARCI.resetGizmoFilters();">Click here to reset filters</a>
              </div>
            `
            : ''
        }

        <ul class="MARCI__gap-3.5 MARCI__grid MARCI__grid-cols-1 lg:MARCI__grid-cols-2 MARCI__mb-4">
          ${gptsForPage
            .map((gpt) => {
              return /*html*/ `
                <button class="MARCI__flex MARCI__flex-col MARCI__gap-2 MARCI__w-full MARCI__bg-gray-50 dark:MARCI__bg-white/5 MARCI__p-4 MARCI__rounded-md hover:MARCI__bg-gray-200 dark:hover:MARCI__bg-gray-800 MARCI__text-left MARCI__relative MARCI__group" onclick="MARCI.selectGizmo('${sanitizeInput(
                  gpt.GizmoCode
                )}')">
                  <div class="flex MARCI__gap-6 MARCI__w-full MARCI__justify-between">
                    <div class="MARCI__w-4/5 MARCI__min-w-0">
                      <h3 class="MARCI__m-0 MARCI__text-gray-900 dark:MARCI__text-gray-100 MARCI__text-xl" style="overflow-wrap: anywhere;">
                        ${sanitizeInput(gpt.Title)}
                      </h3>

                      <div class="MARCI__text-gray-500 MARCI__text-xs MARCI__flex MARCI__pb-1 MARCI__max-w-full">
                          by <span class="MARCI__mx-1 MARCI__overflow-hidden MARCI__text-ellipsis MARCI__flex-1 MARCI__whitespace-nowrap" title="Created by ${sanitizeInput(
                            gpt.AuthorDisplayName || 'Anonymous'
                          )}">
                            ${sanitizeInput(
                              gpt.AuthorDisplayName || 'Anonymous'
                            )}
                          </span>
                      </div>

                      <p class="MARCI__m-0 MARCI__text-gray-500 MARCI__text-gray-600 dark:MARCI__text-gray-200 MARCI__overflow-hidden MARCI__text-ellipsis text-sm MARCI__mt-2" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow-wrap: anywhere;" title="${sanitizeInput(
                        gpt.Description
                      )}">
                        ${sanitizeInput(gpt.Description)}
                      </p>
                    </div>

                    <div>
                      <div class="MARCI__h-[96px] MARCI__w-[96px] MARCI__flex-shrink-0">
                        <div class="gizmo-shadow-stroke MARCI__overflow-hidden MARCI__rounded-full MARCI__flex MARCI__items-center MARCI__justify-center MARCI__h-full">
                        <img
                            src="${sanitizeInput(
                              gpt.LogoURL
                            )}" onerror="this.src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDE2MSAxODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM6c2VyaWY9Imh0dHA6Ly93d3cuc2VyaWYuY29tLyIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoyOyI+CiAgICA8ZyB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwxLC00NDkuODYzLC0zNTg1OC44KSI+CiAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMS40MTkzNCwwLDAsMS40MTkzNCwtMTg4LjQ2OSwzNTMxOCkiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjU4MzkyMSwwLDAsMC41ODM5MjEsLTQ5My42NzQsLTE0My44MTgpIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNjQxLjcyLDEwMzEuMTJMMTYyNi42OSwxMDY5LjI1TDE2NzEuNDcsMTA5NS4yN0wxNjYzLjA5LDEwNDMuMjJMMTY0MS43MiwxMDMxLjEyWiIgc3R5bGU9ImZpbGw6d2hpdGU7Ii8+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTAuNTgzOTIxLDAsMCwwLjU4MzkyMSwxNTA2LjM5LC0xNDMuODE4KSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTY0MS43MiwxMDMxLjEyTDE2MjYuNjksMTA2OS4yNUwxNjcxLjQ3LDEwOTUuMjdMMTY2My4wOSwxMDQzLjIyTDE2NDEuNzIsMTAzMS4xMloiIHN0eWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNTgzOTIxLDAsMCwwLjU4MzkyMSwtNDk0LjA5LC0xNDMuMjIxKSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTYxNi4zNiwxMDE3LjE3TDE2MTYuMzYsMTA2Mi4yOEwxNjMxLjQ4LDEwMjUuMTRMMTYxNi4zNiwxMDE3LjE3WiIgc3R5bGU9ImZpbGw6d2hpdGU7Ii8+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTAuNTgzOTIxLDAsMCwwLjU4MzkyMSwxNTA2LjgxLC0xNDMuMjIxKSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTYxNi4zNiwxMDE3LjE3TDE2MTYuMzYsMTA2Mi4yOEwxNjMxLjQ4LDEwMjUuMTRMMTYxNi4zNiwxMDE3LjE3WiIgc3R5bGU9ImZpbGw6d2hpdGU7Ii8+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC41MDg5NjEsMCwwLDAuNTgzOTIxLC0zNjguMDA4LC0yMTUuNDYpIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNjg5LjUyLDEwMzEuOThMMTcxMC4xOSwxMDIxLjUzTDE3MTAuMTksMTExNi4yNkwxNjg5LjI3LDExMDQuOTFMMTY4OS41MiwxMDMxLjk4WiIgc3R5bGU9ImZpbGw6d2hpdGU7Ii8+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTAuNTA4OTYxLDAsMCwwLjU4MzkyMSwxMzgwLjczLC0yMTUuNDYpIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNjg5LjUyLDEwMzEuOThMMTcxMC4xOSwxMDIxLjUzTDE3MTAuMTksMTExNi4yNkwxNjg5LjI3LDExMDQuOTFMMTY4OS41MiwxMDMxLjk4WiIgc3R5bGU9ImZpbGw6d2hpdGU7Ii8+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC43MTMzLDAsMCwwLjU4MzkyMSwtNzE3LjQ2NiwtMTQ0LjQ1MykiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE2ODkuNSwxMDM5LjY3TDE2ODkuNjEsMTAzOS41OUwxNzEwLjE5LDEwMjEuNTNMMTcxMC4xOSwxMTE2LjM3TDE2ODkuMjgsMTEwMS42MkwxNjg5LjUsMTAzOS42N1oiIHN0eWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KC0wLjcxMzMsMCwwLDAuNTgzOTIxLDE3MzAuMTgsLTE0NC40NTMpIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNjg5LjUsMTAzOS42N0wxNjg5LjYxLDEwMzkuNTlMMTcxMC4xOSwxMDIxLjUzTDE3MTAuMTksMTExNi4zN0wxNjg5LjI4LDExMDEuNjJMMTY4OS41LDEwMzkuNjdaIiBzdHlsZT0iZmlsbDp3aGl0ZTsiLz4KICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjU4MzkyMSwwLDAsMC41ODM5MjEsLTQ5Ny4wMTIsLTE0My40NzgpIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNjg1LjA0LDkxNC4xMjJMMTYzNC4xLDk0Mi4yODFMMTY3Ny4xOCw5NjYuMzE0TDE2ODUuMDQsOTE0LjEyMloiIHN0eWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KC0wLjU4MzkyMSwwLDAsMC41ODM5MjEsMTUwOS43MywtMTQzLjQ3OCkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE2ODUuMDQsOTE0LjEyMkwxNjM0LjEsOTQyLjI4MUwxNjc3LjE4LDk2Ni4zMTRMMTY4NS4wNCw5MTQuMTIyWiIgc3R5bGU9ImZpbGw6d2hpdGU7Ii8+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC41ODM4OTYsMC4wMDUzNTcwNiwtMC4wMDUzNTcwNiwwLjU4Mzg5NiwtNDkxLjA0OSwtMTUxLjUxKSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTYxOS45OCw5NDkuMjM3TDE3MDguNzcsOTk5LjAxM0wxNjk0LjAyLDEwMTAuNDNMMTYyMC4xMiw5NjkuNjEyTDE2MTkuOTgsOTQ5LjIzN1oiIHN0eWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KC0wLjU4Mzg5NiwwLjAwNTM1NzA2LDAuMDA1MzU3MDYsMC41ODM4OTYsMTUwMy43NywtMTUxLjUxKSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTYxOS45OCw5NDkuMjM3TDE3MDguNzcsOTk5LjAxM0wxNjk0LjAyLDEwMTAuNDNMMTYyMC4xMiw5NjkuNjEyTDE2MTkuOTgsOTQ5LjIzN1oiIHN0eWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNTgzODk2LDAuMDA1MzU3MDYsLTAuMDA1MzU3MDYsMC41ODM4OTYsLTQ5MS4wNDksLTEzMS45NjgpIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNjE5Ljk4LDk0OS4yMzdMMTY4OS45MSw5ODguNTMxTDE2NzUuMjgsOTk5Ljk1NEwxNjIwLjEyLDk2OS42MTJMMTYxOS45OCw5NDkuMjM3WiIgc3R5bGU9ImZpbGw6d2hpdGU7Ii8+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoLTAuNTgzODk2LDAuMDA1MzU3MDYsMC4wMDUzNTcwNiwwLjU4Mzg5NiwxNTAzLjc3LC0xMzEuOTY4KSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTYxOS45OCw5NDkuMjM3TDE2ODkuOTEsOTg4LjUzMUwxNjc1LjI4LDk5OS45NTRMMTYyMC4xMiw5NjkuNjEyTDE2MTkuOTgsOTQ5LjIzN1oiIHN0eWxlPSJmaWxsOndoaXRlOyIvPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4K'; this.classList.remove('MARCI__h-full'); this.classList.remove('MARCI__w-full'); this.classList.add('MARCI__w-2/3'); this.classList.add('MARCI__h-2/3'); this.parentElement.classList.add('MARCI__bg-black');"
                            class="MARCI__h-full MARCI__w-full" alt="GPT" width="96" height="96">
                        </div>
                      </div>
                    </div>

                  </div>

                  <div class="MARCI__text-gray-500 MARCI__text-xs MARCI__flex MARCI__pt-3 MARCI__w-full MARCI__justify-between MARCI__mt-auto MARCI__gap-2">
                    <span class="MARCI__flex MARCI__items-center MARCI__truncate" title="Views (${
                      gpt.CountViews || 0
                    })">
                      <span class="MARCI__p-1">${svg(
                        'Eye'
                      )}</span> &nbsp; <span class="MARCI__truncate">${formatHumanReadableNumber(
                gpt.CountViews || 0
              )}</span>
                    </span>

                    <span class="MARCI__flex MARCI__items-center MARCI__truncate" title="Usages (${
                      gpt.CountUses || 0
                    })">
                      <span class="MARCI__p-1">${svg(
                        'Quote'
                      )}</span> &nbsp; <span class="MARCI__truncate">${formatHumanReadableNumber(
                gpt.CountUses || 0
              )}</span>
                    </span>

                    <span class="MARCI__flex MARCI__items-center MARCI__truncate" title="Votes (${
                      gpt.CountVotes || 0
                    })">
                      <a title="Votes (${
                        gpt.CountVotes || 0
                      }) - Vote for this GPT with thumbs up"
                          class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); MARCI.voteGizmoThumbsUp('${sanitizeInput(
                            gpt.GizmoCode
                          )}')">${svg('ThumbUp')}</a>
                      &nbsp; <span class="MARCI__truncate">${formatHumanReadableNumber(
                        gpt.CountVotes || 0
                      )}</span>

                      &nbsp; <a title="Votes (${
                        gpt.CountVotes
                      }) - Vote for this GPT with thumbs down"
                            class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); MARCI.voteGizmoThumbsDown('${sanitizeInput(
                              gpt.GizmoCode
                            )}')">${svg('ThumbDown')}</a>
                    </span>

                    <span class="MARCI__flex MARCI__items-center" title="Copy link to this GPT">
                      <a class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" 
                      onclick="event.stopPropagation(); MARCI.copyGizmoDeepLink('https://chat.openai.com/g/${sanitizeInput(
                        gpt.ShortURL
                      )}')" title="Copy link to this GPT">
                      ${svg('Link')}
                      </a>
                    </span>
                  </div>
                </button>`;
            })
            .join('')}          
        </ul>

        ${gizmos.length > this.GizmoSection.pageSize ? paginationContainer : ''}

        <div class="MARCI__h-px MARCI__bg-gray-100 dark:MARCI__bg-gray-850"></div>
      </div>
    `;

    gptsContainer
      .querySelector('#gizmoSortBySelect')
      .addEventListener('change', this.changeGizmoSortBy.bind(this));

    gptsContainer
      ?.querySelector('#gizmoSearchInput')
      ?.addEventListener(
        'input',
        this.debounce(this.changeGizmoSearch.bind(this), 300).bind(this)
      );

    const pageSizeSelectElements = gptsContainer.querySelectorAll(
      'select.gizmosPageSizeSelect'
    );

    // Add event listener for the pagination buttons and page size select elements
    if (pageSizeSelectElements.length > 0) {
      pageSizeSelectElements.forEach((select) => {
        select.addEventListener('change', this.changeGizmoPageSize.bind(this));
      });
    }
  },

  // Apply layout changes based on config and type (general or specific only)
  applyLayoutChanges(type = LayoutChangeType.GENERAL) {
    const layoutChanges = this.Config.getLayoutChangesConfig()?.[type] || [];

    // Apply layout changes (query using "Selector" property, "Remove" to remove classes, "Add" to add classes)
    layoutChanges.forEach((layoutChange) => {
      const elements = document.querySelectorAll(layoutChange.Selector);

      elements.forEach((element) => {
        if (layoutChange.Remove?.length > 0) {
          element.classList.remove(...layoutChange.Remove);
        }

        if (layoutChange.Add?.length > 0) {
          element.classList.add(...layoutChange.Add);
        }
      });
    });

    this.monitorStylesheet();
  },

  // Monitor if the MARCI stylesheet is still present in head and add it again if needed
  monitorStylesheet() {
    if (!this.StylesheetURL) {
      return;
    }

    // Get all existing stylesheets
    if (
      this.Config.getPromptTemplatesConfig().EnableDuplicateStylesheetMonitor
    ) {
      try {
        const existingStylesheets = [
          ...document.querySelectorAll('head link[rel="stylesheet"]'),
        ];

        const uniqueStylesheetHrefs = new Set();

        // Process existing stylesheets
        existingStylesheets?.forEach((stylesheet) => {
          if (stylesheet.href && !uniqueStylesheetHrefs.has(stylesheet.href)) {
            uniqueStylesheetHrefs.add(stylesheet.href);
            return;
          }

          if (stylesheet.href) {
            // Remove duplicate stylesheet
            stylesheet.parentNode.removeChild(stylesheet);
          }
        });
      } catch (error) {
        console.error('Error monitoring duplicate stylesheets:', error);
      }
    }

    // Return if the stylesheet is already present
    if (document.querySelector('link[href="' + this.StylesheetURL + '"]')) {
      return;
    }

    // Re-add the stylesheet
    const link = document.createElement('link');
    link.href = this.StylesheetURL;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    document.head.appendChild(link);
  },

  // Check if the there are suggested prompts and hide them
  hideSuggestedPrompts() {
    const selectorConfig = this.Config.getSelectorConfig();

    const suggestedPrompts = document.querySelector(
      selectorConfig.SuggestedPrompts
    );

    // No suggested prompts found
    if (!suggestedPrompts) {
      return;
    }

    // Check if it's conversation page, because otherwise the "Regenerate" button would be hidden, too
    const isConversationPage =
      document.querySelector(selectorConfig.ConversationResponse) ||
      document.querySelector(selectorConfig.FirstPrompt);

    // Add class MARCI__hidden to the suggested prompts in case it's not conversation page, otherwise remove it
    isConversationPage
      ? suggestedPrompts.classList.remove('MARCI__hidden')
      : suggestedPrompts.classList.add('MARCI__hidden');
  },

  // Add MARCI sidebar icon and sidebar with prompt templates
  insertPromptTemplatesSidebar() {
    // Add icon for sidebar if not present, yet
    let sidebarIcon = document.getElementById('MARCI__sidebar-icon');

    // Add sidebar icon and sidebar if not present, yet
    if (sidebarIcon) {
      return;
    }

    this.updateShareButton();

    // Display sidebar icon only in new and existing conversations
    const selectorConfig = this.Config.getSelectorConfig();

    if (
      !document.querySelector(selectorConfig.ConversationResponse) &&
      !document.querySelector(selectorConfig.FirstPrompt)
    ) {
      return;
    }

    sidebarIcon = document.createElement('div');
    sidebarIcon.id = 'MARCI__sidebar-icon';

    sidebarIcon.className =
      'MARCI__p-2 MARCI__top-12 md:MARCI__top-2 MARCI__p-2 MARCI__items-center MARCI__transition-colors MARCI__duration-200 MARCI__cursor-pointer MARCI__text-sm MARCI__rounded-md MARCI__border MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__border-black/10 dark:MARCI__border-white/20 hover:MARCI__bg-gray-50 dark:hover:MARCI__bg-gray-850 MARCI__cursor-pointer MARCI__fixed MARCI__right-4 MARCI__z-30';

    sidebarIcon.title = 'Open MARCI sidebar';

    sidebarIcon.innerHTML =
      /*html*/ '<div class="MARCI__invert dark:MARCI__filter-none MARCI__sidebar-icon MARCI__w-12 MARCI__h-12"></div>';

    // Add click event listener to open/close sidebar
    sidebarIcon.addEventListener('click', () => {
      const sidebar = document.getElementById('MARCI__sidebar');
      const sidebarOpen = sidebar.classList.contains('MARCI__translate-x-0');

      // hide icon when sidebar is open
      !sidebarOpen
        ? sidebarIcon.classList.add('MARCI__hidden')
        : sidebarIcon.classList.remove('MARCI__hidden');

      // animate opening and closing of sidebar
      sidebar.classList.toggle('MARCI__translate-x-0');
      sidebar.classList.toggle('MARCI__translate-x-full');

      // add prompt templates section to sidebar
      this.insertPromptTemplatesSection();
    });

    // Prepare sidebar element with sidebar icon and prompt templates section
    const sidebar = document.createElement('div');
    sidebar.id = 'MARCI__sidebar';

    sidebar.className =
      '2xl:MARCI__w-7/12 lg:MARCI__w-3/4 md:MARCI__w-11/12 MARCI__w-full MARCI__h-full MARCI__bg-white MARCI__text-gray-700 MARCI__shadow-lg MARCI__absolute MARCI__right-0 MARCI__overflow-auto MARCI__z-20 dark:MARCI__bg-gray-900 dark:MARCI__text-white MARCI__ease-in-out MARCI__duration-300 MARCI__translate-x-full dark:MARCI__shadow-gray-600/50';

    sidebar.innerHTML = /*html*/ `
          <div class="MARCI__relative" title="Close MARCI sidebar" id="MARCI__sidebar-container">
            <div class="MARCI__p-2 MARCI__items-center MARCI__transition-colors MARCI__duration-200 MARCI__cursor-pointer MARCI__text-sm MARCI__rounded-md MARCI__border MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__border-black/10 dark:MARCI__border-white/20 hover:MARCI__bg-gray-50 dark:hover:MARCI__bg-gray-850 MARCI__absolute MARCI__top-0 MARCI__left-4 MARCI__z-30" onclick="document.getElementById('MARCI__sidebar-icon').click()">
              <div class="MARCI__invert dark:MARCI__filter-none MARCI__sidebar-icon MARCI__w-12 MARCI__h-12"></div>
            </div>

            <h1 style="display: none;" class="text-4xl"></h1>
          </div>
        `;

    // Add sidebar icon and sidebar to the page
    document.querySelector(selectorConfig.Sidebar)?.appendChild(sidebarIcon);
    document.querySelector(selectorConfig.Sidebar)?.appendChild(sidebar);
  },

  updateShareButton() {
    const shareButtonSection = document.querySelector(
      this.Config.getSelectorConfig().ShareButton
    );

    if (!shareButtonSection) {
      return;
    }

    shareButtonSection.classList.add('MARCI__share-button');
  },

  // Add "Save prompt as template" button to the user prompt container next to the "Edit" button
  insertSavePromptAsTemplateButton() {
    const selectorConfig = this.Config.getSelectorConfig();

    // get the first prompt
    const firstPrompt = document.querySelector(selectorConfig.FirstPrompt);

    if (!firstPrompt) {
      return;
    }

    // get parent element of the first prompt to find the "Edit" button
    // select only buttons that do not contain image with alt "Uploaded image"
    const buttons = firstPrompt.parentElement.parentElement.querySelectorAll(
      selectorConfig.FirstPromptButtons
    );

    if (!buttons || buttons.length === 0) {
      return;
    }

    // get the "Edit" button (last button in the list)
    const button = buttons[buttons.length - 1];

    if (!button) {
      return;
    }

    // Allow user to continue writing from chat history
    this.showContinueActionsButton();

    let saveButton = button.parentElement.querySelector('.save-prompt-button');

    // if button already exists, skip
    if (saveButton) {
      return;
    }

    saveButton = document.createElement('button');
    saveButton.className =
      'save-prompt-button MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400 md:MARCI__invisible md:group-hover:MARCI__visible md:group-hover:visible';
    saveButton.title = 'Save prompt as template';
    saveButton.addEventListener('click', this.createNewPrompt.bind(this));
    saveButton.innerHTML = svg('Save');

    // add HTML before children in button.parentElement
    button.parentElement.prepend(saveButton);
  },

  // get all available activities for the selected topic
  getActivities(TopicID = DefaultPromptTopic) {
    const currentActivities = this.Activities.filter(
      (activity) =>
        !TopicID ||
        TopicID === DefaultPromptTopic ||
        activity.TopicID === TopicID
    );

    // keep only unique activity.Label and extract activity.ID and activity.Label
    return [
      ...new Set(currentActivities.map((activity) => activity.Label)),
    ].map((label) => ({
      ID: this.Activities.find((activity) => activity.Label === label).ID,
      Label: label,
    }));
  },

  /**
   * Validate prompt template before saving
   *
   * @param {Prompt} prompt
   * @param {CreatePromptMode} currentCreatePromptMode
   * @returns {boolean} true if prompt is valid
   */
  validatePrompt(prompt, currentCreatePromptMode) {
    const errors = [];

    // find existing prompt based on ID in PromptTemplates or OwnPrompts
    const existingPrompt = [...this.PromptTemplates, ...this.OwnPrompts].find(
      (p) => p.ID === prompt.ID
    );

    // prompt type was changed between public and private
    const promptTypeChanged =
      existingPrompt && existingPrompt.PromptTypeNo !== prompt.PromptTypeNo;

    // current user cannot create any prompt template, but can edit existing prompt
    if (!this.canCreatePromptTemplate() && !existingPrompt) {
      this.Client.UserQuota.promptQuotaExceeded();

      return;
    }

    // current user cannot create public prompt template, but can edit existing public prompt template
    if (
      prompt.PromptTypeNo === PromptTypeNo.PUBLIC &&
      !this.canCreatePublicPromptTemplate() &&
      (!existingPrompt || promptTypeChanged)
    ) {
      this.Client.UserQuota.publicPromptsQuotaExceeded();

      return;
    }

    // current user cannot create private prompt template, but can edit existing private prompt template
    if (
      prompt.PromptTypeNo === PromptTypeNo.PRIVATE &&
      !this.canCreatePrivatePromptTemplate() &&
      (!existingPrompt || promptTypeChanged)
    ) {
      this.Client.UserQuota.privatePromptsQuotaExceeded();

      return;
    }

    // current user cannot create team prompt template, but can edit existing team prompt template
    if (
      prompt.PromptTypeNo === PromptTypeNo.TEAM &&
      !this.canCreateTeamPromptTemplate() &&
      (!existingPrompt || promptTypeChanged)
    ) {
      this.Client.UserQuota.teamPromptsQuotaExceeded();

      return;
    }

    // validate prompt variables
    let validateVariablesResult = this.validatePromptVariables(prompt);
    if (validateVariablesResult.EnumMaxSizeError) {
      this.Client.UserQuota.upgradePromptVariableEnumMaxSize();
      return;
    } else if (validateVariablesResult.Errors?.length > 0) {
      let errorMessage = validateVariablesResult.Errors.join('<br>');
      errorMessage +=
        '<br><a class="MARCI__underline" href="https://www.aiprm.com/tutorials/how-to-use-variables-in-prompts/#title-how-to-use-variables-in-prompts-0" target="_blank" rel="noopener noreferrer">Learn more about prompt variables</a>.';

      errors.push(errorMessage);
    }

    // reset prompt variables to undefined to avoid sending them
    prompt.PromptVariables = undefined;

    // require AuthorName and AuthorURL if prompt is public
    if (
      prompt.PromptTypeNo === PromptTypeNo.PUBLIC &&
      (!prompt.AuthorName.trim() || !prompt.AuthorURL.trim())
    ) {
      errors.push(
        'Please identify with Author Name and URL to publish a prompt template as public.'
      );
    }

    // require AuthorName if prompt is Team
    if (
      prompt.PromptTypeNo === PromptTypeNo.TEAM &&
      !prompt.AuthorName.trim()
    ) {
      errors.push(
        'Please identify with Author Name to publish a prompt template as Team prompt.'
      );
    }

    const missingPlaceholders = [];

    // require usage of target language placeholder if prompt is public
    if (
      prompt.PromptTypeNo === PromptTypeNo.PUBLIC &&
      !prompt.Prompt.includes(TargetLanguagePlaceholder)
    ) {
      missingPlaceholders.push(TargetLanguagePlaceholder);
    }

    // require usage of prompt placeholder in prompt template
    if (!prompt.Prompt.includes(PromptPlaceholder)) {
      missingPlaceholders.push(PromptPlaceholder);
    }

    // there is at least one missing placeholder
    if (missingPlaceholders.length > 0) {
      errors.push(
        currentCreatePromptMode === CreatePromptMode.BASIC
          ? `
          Please fill out all colored fields to create a prompt template.
          `
          : `
          Make sure you follow the Prompt Template guidelines. <br>
          You must use ${missingPlaceholders.join(' and ')} correctly. <br><br>
          Learn more <a class="MARCI__underline" href="https://lrt.li/aiprmpromptguide" target="_blank" rel="noopener noreferrer">here</a>.
        `
      );
    }

    // show error notification if there are any errors
    if (errors.length > 0) {
      const errorMessage = /*html*/ `
        <div>
          <strong>Please fix the following errors:</strong> <br><br>
          ${errors.join('<br><br>')}
        </div>
      `;

      this.showNotification(NotificationSeverity.WARNING, errorMessage, false);
    }

    return errors.length === 0;
  },

  /**
   * Validates basic mode inputs
   *
   * @returns {boolean} true if inputs are valid
   */
  validateBasicModeInputs() {
    if (this.PromptBuilder.validate()) {
      return true;
    }

    const errorMessage = /*html*/ `
      <div>
        <strong>Please fix the following errors:</strong> <br><br>
        Please fill out all colored fields to create a prompt template.
      </div>
    `;

    this.showNotification(NotificationSeverity.WARNING, errorMessage, false);

    return false;
  },

  // save prompt template via API and update client state
  async savePromptAsTemplate(promptPlugins = undefined, e) {
    e.preventDefault();

    // if it's basic mode -> build prompt template first (input with name createPromptMode in savePromptForm)
    const currentCreatePromptMode = document.querySelector(
      'input[name="createPromptMode"]:checked'
    ).value;

    if (currentCreatePromptMode === CreatePromptMode.BASIC) {
      if (!this.validateBasicModeInputs()) {
        return;
      }

      this.buildBasicPrompt();
    }

    /** @type Prompt */
    const prompt = {
      ModelS: [],
    };

    if (promptPlugins) {
      prompt.GizmoCodeS = promptPlugins;
    }

    const formData = new FormData(e.target);

    for (const [key, value] of formData) {
      if (key === 'ModelS') {
        prompt[key] = [...prompt.ModelS, value];
      } else {
        prompt[key] = value;
      }
    }

    prompt.PromptTypeNo = parseInt(prompt.PromptTypeNo);

    if (this.promptRequiresLiveCrawling(prompt.Prompt)) {
      prompt.PromptFeatureBitset |= PromptFeatureBitset.LIVE_CRAWLING;
    }

    const selectedGizmos = prompt.ModelS?.filter(
      (modelID) => !this.Models.find((model) => model.ID === modelID)
    );

    // remove unselected Gizmos from GizmoCodeS, but leave private Gizmos
    prompt.GizmoCodeS = prompt.GizmoCodeS?.filter((code) => {
      const gizmo = this.Gizmos.find((gizmo) => gizmo.GizmoCode === code);
      if (!gizmo) {
        return true;
      }

      return selectedGizmos?.includes(gizmo.GizmoCode);
    });

    // add CurrentGizmo if selected
    if (this.CurrentGizmo) {
      const currentGizmoSelected = selectedGizmos?.includes(
        this.CurrentGizmo.GizmoCode
      );

      if (currentGizmoSelected) {
        if (prompt.GizmoCodeS == null) {
          prompt.GizmoCodeS = [this.CurrentGizmo.GizmoCode];
        } else if (!prompt.GizmoCodeS.includes(this.CurrentGizmo.GizmoCode)) {
          prompt.GizmoCodeS.push(this.CurrentGizmo.GizmoCode);
        }
      }
    }

    // remove Gizmos from Models
    prompt.ModelS = prompt.ModelS?.filter((modelID) =>
      this.Models.find((model) => model.ID === modelID)
    );

    // re-check user status
    await this.Client.checkUserStatus();

    if (!this.validatePrompt(prompt, currentCreatePromptMode)) {
      return;
    }

    try {
      const addToListID = await this.getAddToListIDForTeamPrompt(prompt);

      const savedPrompt = await this.Client.savePrompt(prompt, addToListID);

      // Update revision time to current time
      prompt.RevisionTime = new Date().toISOString();

      // track usage (creation of new prompt template)
      if (!prompt.ID) {
        this.Client.usePrompt(
          savedPrompt.ID,
          currentCreatePromptMode === CreatePromptMode.BASIC
            ? UsageTypeNo.CREATE_BASIC
            : UsageTypeNo.CREATE_ADVANCED,
          this.CurrentGizmo?.GizmoCode
        );
      }

      // Update existing prompt template
      if (prompt.ID) {
        this.updatePromptsState(prompt);
      }
      // Add new prompt template to client state if it belongs to the current topic
      else if (
        this.PromptTopic === DefaultPromptTopic ||
        prompt.Topic === this.PromptTopic
      ) {
        // New prompt template was created, set the ID
        prompt.ID = savedPrompt.ID;

        this.OwnPrompts.push(prompt);

        // Add prompt to public prompt templates if it is public
        if (prompt.Public) {
          this.PromptTemplates.push(prompt);
        }
      }
    } catch (error) {
      // user has reached the limit of public/private prompt templates
      if (
        error instanceof Reaction &&
        error.ReactionNo === ReactionNo.RXN_MARCI_OVER_LIMIT_PROMPTS
      ) {
        this.Client.UserQuota.promptQuotaExceeded();

        return;
      }

      // switch to advanced mode if there was an error and the current mode is basic,
      // to allow the user to fix the error
      if (currentCreatePromptMode === CreatePromptMode.BASIC) {
        const advancedModeInput = document.getElementById(
          'createPromptModeAdvanced'
        );
        advancedModeInput.checked = true;

        // trigger the onchange event on the radio button to switch to advanced mode
        advancedModeInput.dispatchEvent(new Event('change'));
      }

      this.showNotification(
        NotificationSeverity.ERROR,
        error instanceof Reaction
          ? error.message
          : 'Something went wrong. Please try again.'
      );
      return;
    }

    this.hideSavePromptModal();

    await this.processSavePromptResult(prompt);

    await this.insertPromptTemplatesSection();

    // re-select prompt template if it was selected before to update the UI if prompt variable definitions were changed
    if (
      this.SelectedPromptTemplate != null &&
      prompt.ID == this.SelectedPromptTemplate.ID
    ) {
      await this.selectPromptTemplate(prompt);
    }
  },

  async getAddToListIDForTeamPrompt(prompt) {
    if (
      prompt.PromptTypeNo === PromptTypeNo.TEAM &&
      this.Client.UserQuota?.hasTeamsFeatureEnabled()
    ) {
      const ownTeamLists = this.Lists.lists.filter(
        (list) =>
          list.ListTypeNo == ListTypeNo.TEAM_CUSTOM &&
          list.HasWriteAccessForTeamMember(this.Client.UserTeamM)
      );

      if (ownTeamLists.length == 1) {
        const isInOwnTeamList = await this.isPromptInAtLeastOneList(
          prompt,
          ownTeamLists
        );

        if (!isInOwnTeamList) {
          return ownTeamLists[0].ID;
        }
      }
    }
  },

  async processSavePromptResult(prompt) {
    try {
      // Add to team list if team prompt
      if (
        prompt.PromptTypeNo === PromptTypeNo.TEAM &&
        this.Client.UserQuota?.hasTeamsFeatureEnabled()
      ) {
        let list;

        if (this.Client.OwnTeamS?.length == 0) {
          // create team and team list
          list = await this.Lists.create(
            this.Client,
            ListTypeNo.TEAM_CUSTOM,
            'My Team List',
            {
              PromptID: prompt.ID,
              Comment: '',
            },
            'NEW'
          );

          this.showNotification(
            NotificationSeverity.SUCCESS,
            'Prompt template now visible in Team List "' +
              sanitizeInput(list.Comment) +
              '" for Team "My First Team".'
          );
        } else {
          const ownTeamLists = this.Lists.lists.filter(
            (list) =>
              list.ListTypeNo == ListTypeNo.TEAM_CUSTOM &&
              list.HasWriteAccessForTeamMember(this.Client.UserTeamM)
          );

          const isInOwnTeamList = await this.isPromptInAtLeastOneList(
            prompt,
            ownTeamLists
          );

          if (ownTeamLists.length == 0) {
            //create team list
            list = await this.Lists.create(
              this.Client,
              ListTypeNo.TEAM_CUSTOM,
              'My Team List',
              {
                PromptID: prompt.ID,
                Comment: '',
              },
              this.Client.OwnTeamS[0].TeamID
            );

            this.showNotification(
              NotificationSeverity.SUCCESS,
              'Prompt template now visible in Team List "' +
                sanitizeInput(list.Comment) +
                '" for Team "' +
                sanitizeInput(
                  this.Client.UserTeamM?.get(list.ForTeamID)?.TeamName
                ) +
                '".'
            );
          } else if (ownTeamLists.length == 1) {
            if (isInOwnTeamList) {
              this.showNotification(
                NotificationSeverity.SUCCESS,
                'Prompt template was saved successfully.'
              );
            } else {
              list = ownTeamLists[0];

              const creationTime = new Date();

              list.list.Items.push({
                Comment: '',
                CreationTime: creationTime.toISOString(),
                ItemOrder: 0,
                ItemStatusNo: ItemStatusNo.ACTIVE,
                ListID: list.ID,
                PromptID: prompt.ID,
                RevisionTime: creationTime.toISOString(),
              });

              // add to TeamList is handled in savePrompt for this case
              this.showNotification(
                NotificationSeverity.SUCCESS,
                'Prompt template now visible in Team List "' +
                  sanitizeInput(list.Comment) +
                  '" for Team "' +
                  sanitizeInput(
                    this.Client.UserTeamM?.get(list.ForTeamID)?.TeamName
                  ) +
                  '".'
              );
            }
          } else {
            this.showNotification(
              NotificationSeverity.SUCCESS,
              'Prompt template was saved successfully.'
            );

            if (!isInOwnTeamList) {
              // show modal to pick team list
              this.showListSelectionModal(ownTeamLists, prompt, true);
            }
          }
        }
      } else if (
        prompt.PromptTypeNo === PromptTypeNo.PRIVATE &&
        this.PromptTemplatesList &&
        this.Lists.withIDAndType(this.PromptTemplatesList, ListTypeNo.CUSTOM)
      ) {
        const ownPrivateLists = this.Lists.lists.filter(
          (list) => list.ListTypeNo == ListTypeNo.CUSTOM
        );

        const isInOwnPrivateList = await this.isPromptInAtLeastOneList(
          prompt,
          ownPrivateLists
        );

        if (ownPrivateLists.length == 0) {
          this.showNotification(
            NotificationSeverity.SUCCESS,
            'Prompt template was saved successfully.'
          );
        } else if (ownPrivateLists.length == 1) {
          if (isInOwnPrivateList) {
            this.showNotification(
              NotificationSeverity.SUCCESS,
              'Prompt template was saved successfully.'
            );
          } else {
            const list = ownPrivateLists[0];

            if (
              !this.isAdminMode() &&
              !this.Client.UserQuota.canAddToCustomList(list)
            ) {
              return;
            }

            await list.add({ ID: prompt.ID });

            this.showNotification(
              NotificationSeverity.SUCCESS,
              'Prompt template now visible in List "' +
                sanitizeInput(list.Comment) +
                '".'
            );
          }
        } else {
          this.showNotification(
            NotificationSeverity.SUCCESS,
            'Prompt template was saved successfully.'
          );

          if (!isInOwnPrivateList) {
            // show modal to pick list
            this.showListSelectionModal(
              this.Lists.getCustomWithWriteAccess(
                this.Client.UserQuota,
                this.Client.UserTeamM
              ),
              prompt,
              false
            );
          }
        }
      } else {
        this.showNotification(
          NotificationSeverity.SUCCESS,
          'Prompt template was saved successfully.'
        );
      }
    } catch (error) {
      // user has reached the limit of list items
      if (
        error instanceof Reaction &&
        error.ReactionNo === ReactionNo.RXN_MARCI_QUOTA_EXCEEDED
      ) {
        this.Client.UserQuota.listItemQuotaExceeded();
        return;
      }

      this.showNotification(
        NotificationSeverity.ERROR,
        error instanceof Reaction
          ? error.message
          : 'Something went wrong. Please try again.'
      );
      return;
    }
  },

  /**
   * Checks if prompt is in at least one of the lists
   *
   * @param {Prompt} prompt
   * @param {List[]} lists
   * @returns {Promise<boolean>}
   */
  async isPromptInAtLeastOneList(prompt, lists) {
    if (lists.length == 0) {
      return false;
    }

    for (const list of lists) {
      if (await list.has(prompt)) {
        return true;
      }
    }

    return false;
  },

  /**
   * Update prompt templates in client state
   *
   * @param {Prompt} prompt
   */
  updatePromptsState(prompt) {
    // if topic doesn't match, remove prompt from PromptTemplates and OwnPrompts
    if (
      prompt.Topic !== this.PromptTopic &&
      this.PromptTopic !== DefaultPromptTopic
    ) {
      this.PromptTemplates = this.PromptTemplates.filter(
        (template) => template.ID !== prompt.ID
      );

      this.OwnPrompts = this.OwnPrompts.filter(
        (ownPrompt) => ownPrompt.ID !== prompt.ID
      );

      return;
    }

    // remove template using ID from Team lists
    if (prompt.PromptTypeNo === PromptTypeNo.PRIVATE) {
      this.Lists.removeItemByPromptIDFromListsByType(
        prompt.ID,
        ListTypeNo.TEAM_CUSTOM
      );
    }

    // find prompt in OwnPrompts by ID and update it
    this.OwnPrompts = this.OwnPrompts.map((ownPrompt) =>
      ownPrompt.ID === prompt.ID ? prompt : ownPrompt
    );

    // find prompt in TeamPrompts by ID and update it
    this.TeamPrompts = this.TeamPrompts.map((teamPrompt) =>
      teamPrompt.ID === prompt.ID ? prompt : teamPrompt
    );

    // find the prompt in PromptTemplates by ID
    const promptTemplate = this.PromptTemplates.find(
      (template) => template.ID === prompt.ID
    );

    const isPublicPrompt = prompt.PromptTypeNo === PromptTypeNo.PUBLIC;

    // if prompt is not public and it is in PromptTemplates, remove it
    if (!isPublicPrompt && promptTemplate) {
      this.PromptTemplates = this.PromptTemplates.filter(
        (template) => template.ID !== prompt.ID
      );

      return;
    }

    // if prompt is public and it is not in PromptTemplates, add it
    if (isPublicPrompt && !promptTemplate) {
      this.PromptTemplates.push(prompt);

      return;
    }

    // if prompt is public and it is in PromptTemplates, update it
    if (isPublicPrompt && promptTemplate) {
      this.PromptTemplates = this.PromptTemplates.map((template) =>
        template.ID === prompt.ID ? prompt : template
      );
    }
  },

  /**
   * Simple notification based on ChatGPT "high demand" notification
   *
   * @param {NotificationSeverity} severity
   * @param {string} message
   * @param {boolean} autoHide
   */
  showNotification(
    severity = NotificationSeverity.SUCCESS,
    message = '',
    autoHide = true
  ) {
    const notificationElementID = 'MARCI-Notification';

    let notificationElement = document.getElementById(notificationElementID);

    // if notification doesn't exist, create it
    if (!notificationElement) {
      notificationElement = document.createElement('div');
      notificationElement.id = notificationElementID;
    }

    const severityClassName = {
      [NotificationSeverity.INFO]: 'MARCI__bg-gray-500',
      [NotificationSeverity.SUCCESS]: 'MARCI__bg-green-500',
      [NotificationSeverity.WARNING]: 'MARCI__bg-orange-500',
      [NotificationSeverity.ERROR]: 'MARCI__bg-red-500',
    };

    notificationElement.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__flex MARCI__justify-center MARCI__w-full MARCI__top-2 MARCI__px-2 MARCI__z-50 MARCI__pointer-events-none">
        <div class="${
          severityClassName[severity]
        } MARCI__flex MARCI__flex-row MARCI__inline-flex MARCI__pointer-events-auto MARCI__px-6 MARCI__py-3 MARCI__rounded-md MARCI__text-white" role="alert">
          <div class="MARCI__flex MARCI__gap-4">
            <div>
              <p class="MARCI__max-w-md" style="overflow-wrap: anywhere;">${message}</p>
              ${
                severity === NotificationSeverity.ERROR
                  ? /*html*/ `<br/><p class="MARCI__max-w-md MARCI__font-semibold" style="overflow-wrap: anywhere;">If this issue persists, please check <a href="https://github.com/marciaiorg/marciai/discussions" target="_blank" class="MARCI__underline">https://github.com/marciaiorg/marciai</a> and <a href="https://github.com/marciaiorg/marciai/issues" target="_blank" class="MARCI__underline">https://github.com/marciaiorg/marciai/issues</a> for updates.</p>`
                  : ''
              }
            </div>
            <button>${svg('Cross')}</button>
          </div>
        </div>
      </div>
    `;

    // remove notificationElement from DOM on click
    notificationElement
      .querySelector('button')
      .addEventListener('click', () => {
        notificationElement.remove();
      });

    // or remove notificationElement from DOM after 5 seconds
    if (autoHide) {
      setTimeout(() => {
        notificationElement.remove();
      }, 5000);
    }

    document.body.appendChild(notificationElement);
  },

  hideModal,

  hideSavePromptModal() {
    this.hideModal('savePromptModal');
  },

  // show modal to report prompt
  async showReportPromptModal(PromptIndex) {
    const prompt = (await this.getCurrentPromptTemplates())[PromptIndex];

    createReportPromptModal(prompt, this.reportPrompt.bind(this));
  },

  async createNewPrompt(e) {
    await this.showSavePromptModal(e);

    const form = document.getElementById('savePromptForm');

    // There is no form to prepare if user cannot create new prompt (e.g. exceeded quota)
    if (!form) {
      return;
    }

    form.elements['AuthorName'].value =
      this.Client.AppUser?.FullName ||
      window?.__NEXT_DATA__?.props?.pageProps?.user?.name ||
      '';

    if (
      this.getNewPromptDefaultText() === 'true' &&
      this.Config.getNewPromptDefaultText() &&
      !form.elements['Prompt']?.value
    ) {
      form.elements['Prompt'].value = this.Config.getNewPromptDefaultText();
    }

    this.prepareModelsMultiselect({}, form);
  },

  /**
   * Show modal to save prompt as template
   *
   * @param {Event|null} e
   * @param {string[]|null} promptPlugins
   */
  async showSavePromptModal(e, promptPlugins) {
    let promptTemplate = '';

    const isEditPromptEvent = e && e.type === editPromptTemplateEvent;

    // re-check user status in case it's not editing of existing prompt template
    if (!isEditPromptEvent) {
      await this.Client.checkUserStatus();
    }

    // cannot add new prompt template, but still can edit existing one
    if (!this.canCreatePromptTemplate() && !isEditPromptEvent) {
      this.Client.UserQuota.promptQuotaExceeded();

      return;
    }

    // get the prompt template from current chat log if showSavePromptModal was called from "Save prompt as template" button (with event)
    if (
      e &&
      ![
        editPromptTemplateEvent,
        forkPromptTemplateEvent,
        clonePromptTemplateEvent,
      ].includes(e.type)
    ) {
      // get the element that triggered this onclick event
      const button = e.target.closest('button');

      // get the parent element of the button (the prompt container)
      const prompt =
        button.parentElement.parentElement.parentElement.querySelector(
          this.Config.getSelectorConfig().SavePromptAsTemplatePromptText
        );

      if (prompt) {
        promptTemplate = prompt.textContent;
      } else {
        console.error('showSavePromptModal: No prompt text found');
      }
    }

    let savePromptModal = document.getElementById('savePromptModal');

    // if modal does not exist, create it, add event listener on submit and append it to body
    if (!savePromptModal) {
      savePromptModal = document.createElement('div');
      savePromptModal.id = 'savePromptModal';

      savePromptModal.addEventListener(
        'submit',
        this.savePromptAsTemplate.bind(this, promptPlugins)
      );

      document.body.appendChild(savePromptModal);
    }

    let lastCreatePromptMode = localStorage.getItem(lastCreatePromptModeKey);

    // last create prompt mode from localStorage or default to basic
    lastCreatePromptMode =
      lastCreatePromptMode &&
      [CreatePromptMode.BASIC, CreatePromptMode.ADVANCED].includes(
        lastCreatePromptMode
      )
        ? lastCreatePromptMode
        : CreatePromptMode.BASIC;

    // if it's edit, clone or fork prompt event, use advanced mode otherwise use last create prompt mode
    const currentCreatePromptMode = e
      ? CreatePromptMode.ADVANCED
      : lastCreatePromptMode;

    const isAdvancedMode =
      currentCreatePromptMode === CreatePromptMode.ADVANCED;

    // Prompt Builder
    this.PromptBuilder = new PromptBuilder(this.PromptBuilderOptions);

    savePromptModal.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
        <div class="MARCI__absolute MARCI__bg-black/50 dark:MARCI__bg-black/80 MARCI__inset-0">
        </div>

        <div class="MARCI__fixed MARCI__inset-0 MARCI__overflow-y-auto">
          <div class="MARCI__flex MARCI__justify-center MARCI__min-h-full">

            <form id="savePromptForm">
              <div
                class="MARCI__align-center MARCI__bg-white dark:MARCI__bg-gray-900 dark:MARCI__text-gray-200 MARCI__inline-block MARCI__overflow-hidden sm:MARCI__rounded-lg MARCI__shadow-xl sm:MARCI__align-middle sm:MARCI__max-w-lg sm:MARCI__my-8 sm:MARCI__w-full MARCI__text-left MARCI__transform MARCI__transition-all"
                role="dialog" aria-modal="true" aria-labelledby="modal-headline">

                <div
                  class="MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__px-4 MARCI__pt-5 MARCI__pb-4 sm:MARCI__p-6 sm:MARCI__pb-4 MARCI__overflow-y-auto">

                  <div class="MARCI__flex MARCI__justify-end MARCI__mb-2 ${
                    e ? 'MARCI__hidden' : ''
                  }">
                    <ul
                      class="MARCI__bg-gray-100 dark:MARCI__bg-gray-850 MARCI__flex MARCI__gap-1 MARCI__list-none MARCI__p-1 MARCI__relative MARCI__rounded-xl MARCI__text-gray-900 MARCI__text-sm">
                      <li>
                        <input class="MARCI__hidden" type="radio" name="createPromptMode" id="createPromptModeBasic"
                          value="${CreatePromptMode.BASIC}" ${
      !isAdvancedMode ? 'checked' : ''
    } hidden
                          onchange="MARCI.toggleCreatePromptMode(event)" />

                        <label for="createPromptModeBasic" class="MARCI__cursor-pointer MARCI__border MARCI__flex MARCI__gap-1 MARCI__items-center MARCI__justify-center md:MARCI__gap-2 MARCI__outline-none MARCI__px-5 MARCI__py-1 MARCI__relative MARCI__rounded-lg sm:MARCI__w-auto MARCI__w-full ${
                          !isAdvancedMode
                            ? 'MARCI__toggle-button--active'
                            : 'MARCI__toggle-button--inactive'
                        }">Basic</label>
                      </li>
                      <li>
                        <input class="MARCI__hidden" type="radio" name="createPromptMode" id="createPromptModeAdvanced"
                          value="${CreatePromptMode.ADVANCED}" ${
      isAdvancedMode ? 'checked' : ''
    } hidden
                          onchange="MARCI.toggleCreatePromptMode(event)" />

                        <label for="createPromptModeAdvanced" class="MARCI__cursor-pointer MARCI__border MARCI__flex MARCI__gap-1 MARCI__items-center MARCI__justify-center md:MARCI__gap-2 MARCI__outline-none MARCI__px-5 MARCI__py-1 MARCI__relative MARCI__rounded-lg sm:MARCI__w-auto MARCI__w-full ${
                          isAdvancedMode
                            ? 'MARCI__toggle-button--active'
                            : 'MARCI__toggle-button--inactive'
                        }">Advanced</label>
                      </li>
                    </ul>
                  </div>

                  <div id="MARCI__PromptBuilder" class="${
                    isAdvancedMode ? 'MARCI__hidden' : ''
                  }">
                    ${this.PromptBuilder.render()}
                  </div>

                  <div id="MARCI__PromptForm" class="${
                    !isAdvancedMode ? 'MARCI__hidden' : ''
                  }">
                    <input type="hidden" name="ID" />
                    <input type="hidden" name="OwnPrompt" value="true" />
                    <input type="hidden" name="Views" value="0" />
                    <input type="hidden" name="Usages" value="0" />
                    <input type="hidden" name="Votes" value="0" />
                    <input type="hidden" name="ForkedFromPromptID" />

                    <label>Prompt Template</label>
                    <textarea name="Prompt"
                      class="MARCI__w-full MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__p-2 MARCI__mt-2 MARCI__mb-3"
                      style="height: 120px;" ${
                        isAdvancedMode ? ' required ' : ''
                      }
                      placeholder="Prompt text including placeholders [TARGETLANGUAGE], [PROMPT], [VARIABLE1], [VARIABLE2] and [VARIABLE3] replaced automagically by MARCI.&#10;&#10;[VARIABLE1], [VARIABLE2] and [VARIABLE3] require title with optional default value and available values.&#10;&#10;Example: Example [PROMPT] in [TARGETLANGUAGE] with [VARIABLE1], [VARIABLE2] and [VARIABLE3].&#10;[VARIABLE1:Title] [VARIABLE2:Title:Default Value] [VARIABLE3:Title:Default Value:Available Value 1|Available Value 2|Available Value 3].&#10;&#10;[VARIABLE1], [VARIABLE2] and [VARIABLE3] will be pre-filled using URL parameters MARCI_VARIABLE1, MARCI_VARIABLE2 and MARCI_VARIABLE3."
                      title="Prompt text including placeholders [TARGETLANGUAGE], [PROMPT], [VARIABLE1], [VARIABLE2] and [VARIABLE3] replaced automagically by MARCI. [VARIABLE1], [VARIABLE2] and [VARIABLE3] require title with optional default value and available values. Example: Example [PROMPT] in [TARGETLANGUAGE] with [VARIABLE1], [VARIABLE2] and [VARIABLE3]. [VARIABLE1:Title] [VARIABLE2:Title:Default Value] [VARIABLE3:Title:Default Value:Available Value 1|Available Value 2|Available Value 3]. [VARIABLE1], [VARIABLE2] and [VARIABLE3] will be pre-filled using URL parameters MARCI_VARIABLE1, MARCI_VARIABLE2 and MARCI_VARIABLE3.">${sanitizeInput(
                        promptTemplate
                      )}</textarea>

                    <label>Teaser</label>
                    <textarea name="Teaser" ${
                      isAdvancedMode ? ' required ' : ''
                    }
                      title="Short teaser for this prompt template, e.g. 'Create a keyword strategy and SEO content plan from 1 [KEYWORD]'"
                      class="MARCI__w-full MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__p-2 MARCI__mt-2 MARCI__mb-3"
                      style="height: 71px;"
                      placeholder="Create a keyword strategy and SEO content plan from 1 [KEYWORD]"></textarea>

                    <label>Prompt Hint</label>
                    <input name="PromptHint" ${
                      isAdvancedMode ? 'required' : ''
                    } type="text"
                      title="Prompt hint for this prompt template, e.g. '[KEYWORD]' or '[your list of keywords, maximum ca. 8000]"
                      class="MARCI__w-full MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__p-2 MARCI__mt-2 MARCI__mb-3"
                      placeholder="[KEYWORD] or [your list of keywords, maximum ca. 8000]" />

                    <label>Title</label>
                    <input name="Title" type="text" title="Short title for this prompt template, e.g. 'Keyword Strategy'"
                      ${
                        isAdvancedMode ? 'required' : ''
                      } placeholder="Keyword Strategy"
                      class="MARCI__w-full MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__mb-3 MARCI__mt-2 MARCI__p-2" />

                    <div class="MARCI__flex">
                      <div class="MARCI__mr-4 MARCI__w-full">
                        <label>Topic</label>
                        <select name="Topic"
                          class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full"
                          ${isAdvancedMode ? ' required ' : ''}>
                          ${this.Topics.map(
                            (topic) => /*html*/ `
                          <option value="${sanitizeInput(topic.ID)}" ${
                              topic.ID === this.PromptTopic ? 'selected' : ''
                            }>
                            ${sanitizeInput(topic.Label)}</option>`
                          ).join('')}
                        </select>
                      </div>

                      <div class="MARCI__w-full">
                        <label>Activity</label>
                        <select name="Activity"
                          class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full"
                          ${isAdvancedMode ? ' required ' : ''}>
                          ${this.getActivities(
                            this.PromptTopic === DefaultPromptTopic
                              ? this.Topics[0].ID
                              : this.PromptTopic
                          )
                            .map(
                              (activity) => /*html*/ `
                          <option value="${sanitizeInput(
                            activity.ID
                          )}">${sanitizeInput(activity.Label)}</option>`
                            )
                            .join('')}
                        </select>
                      </div>
                    </div>

                    <div class="MARCI__flex">
                      <div class="MARCI__mr-4 MARCI__w-full">
                        <label>Who can see this?</label>
                        <select name="PromptTypeNo"
                          class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full"
                          ${isAdvancedMode ? ' required ' : ''}>
                          <option value="${
                            PromptTypeNo.PRIVATE
                          }">Only me (Private)</option>
                          ${
                            this.Client.UserQuota?.hasTeamsFeatureEnabled()
                              ? /* html */ `<option value="${PromptTypeNo.TEAM}">My Team</option>`
                              : ''
                          }
                          <option id="PromptTypeNo-public" value="${
                            PromptTypeNo.PUBLIC
                          }">Everyone (Public)</option>
                        </select>
                      </div>
                      <div class="MARCI__w-full">
                        <label>Made for</label>
                        <select multiple multiselect-max-items="1" multiselect-hide-x="true" name="ModelS"
                          class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full">
                          
                          ${
                            this.CurrentGizmo
                              ? /*html*/ `
                              <option value="${sanitizeInput(
                                this.CurrentGizmo.GizmoCode
                              )}" MARCIModelStatusNo="1" ${
                                  isEditPromptEvent ? '' : 'selected'
                                }>${sanitizeInput(
                                  this.CurrentGizmo.Title
                                )}</option>
                              `
                              : ''
                          }

                          ${this.addPluginsToMadeForDropdown(promptPlugins)}

                          ${this.Models.map(
                            (model) => /*html*/ `
                          <option value="${sanitizeInput(
                            model.ID
                          )}" MARCIModelStatusNo="${
                              model.StatusNo
                            }">${sanitizeInput(model.LabelAuthor)}</option>`
                          ).join('')}
                        </select>
                      </div>
                    </div>

                    <div class="MARCI__block">
                      <div class="MARCI__flex MARCI__justify-between MARCI__mt-4">
                        <div class="MARCI__mr-4 MARCI__w-full"><label>Author Name</label>
                          <input name="AuthorName" type="text" title="Author Name visible for all users"
                            placeholder="Author Name"
                            class="MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__mb-3 MARCI__mt-2 MARCI__p-2 MARCI__w-full" />
                        </div>

                        <div class="MARCI__w-full"><label>Author URL</label>
                          <input name="AuthorURL" type="url" title="Author URL visible for all users"
                            placeholder="https://www.example.com/"
                            class="MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__mb-3 MARCI__mt-2 MARCI__p-2 MARCI__w-full" />
                        </div>
                      </div>

                      <a class="MARCI__mt-4 MARCI__text-sm MARCI__underline MARCI__hidden" id="savePromptForm-forked-from"
                        href="https:/app.aiprm.com/prompt/" rel="noopener noreferrer" target="_blank">
                        Forked From
                      </a>
                    </div>

                    <p class="MARCI__mt-6 MARCI__text-[10px]" id="savePromptForm-public-disclaimer">Please be mindful of what
                      you share, and do not include any confidential information, as we are not responsible for
                      any actions taken by others with the information you choose to share.</p>
                  </div>

                </div>

                <div class="MARCI__bg-gray-200 dark:MARCI__bg-gray-850 MARCI__px-4 MARCI__py-3 MARCI__text-right">
                  <button type="button"
                    class="MARCI__bg-gray-600 hover:MARCI__bg-gray-800 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white"
                    onclick="MARCI.hideSavePromptModal()"> Cancel
                  </button>
                  <button id="MARCI__cloneButton" type="button"
                    class="MARCI__hidden MARCI__bg-blue-600 hover:MARCI__bg-blue-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">Clone
                  </button>
                  <button type="submit"
                    class="MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">Save
                    Prompt
                  </button>
                </div>
                
              </div>
            </form>

          </div>
        </div>

      </div>
    `;

    const form = document.getElementById('savePromptForm');

    // set PromptTypeNo based on from where the modal was opened
    if (!isEditPromptEvent) {
      if (this.PromptTemplatesType === PromptTemplatesType.PUBLIC) {
        form.elements['PromptTypeNo'].value = PromptTypeNo.PUBLIC;
      } else if (this.PromptTemplatesType === PromptTemplatesType.OWN) {
        form.elements['PromptTypeNo'].value = PromptTypeNo.PRIVATE;
      } else {
        const selectedList = this.Lists.withID(this.PromptTemplatesList);
        if (selectedList.ListTypeNo === ListTypeNo.TEAM_CUSTOM) {
          form.elements['PromptTypeNo'].value = PromptTypeNo.TEAM;
        } else {
          form.elements['PromptTypeNo'].value = PromptTypeNo.PRIVATE;
        }
      }
    }

    // add onchange event listener to select[name="Topic"] to update the activities
    savePromptModal.querySelector('select[name="Topic"]').onchange = (
      event
    ) => {
      // replace select[name="Activity"] with new activities
      savePromptModal.querySelector('select[name="Activity"]').innerHTML =
        this.getActivities(event.target.value)
          .map(
            (activity) => /*html*/ `
            <option value="${sanitizeInput(activity.ID)}">${sanitizeInput(
              activity.Label
            )}</option>`
          )
          .join('');
    };

    savePromptModal.style = 'display: block;';

    // add event listener to close the modal on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideSavePromptModal();
      }
    });
  },

  /**
   * @param {string[] | undefined} plugins
   */
  addPluginsToMadeForDropdown(plugins = undefined) {
    if (!plugins) {
      return '';
    }

    return plugins
      .map((plugin) => {
        if (plugin === this.CurrentGizmo?.GizmoCode) {
          //CurrentGizmo is handled separately
          return '';
        }

        const gizmo = this.Gizmos.find((gizmo) => gizmo.GizmoCode === plugin);
        if (!gizmo) {
          return '';
        }

        return /*html*/ `
        <option value="${sanitizeInput(
          gizmo.GizmoCode
        )}" MARCIModelStatusNo="1" selected>
          ${sanitizeInput(gizmo.Title)}
        </option>`;
      })
      .join('');
  },

  /**
   * @param {string[] | undefined} plugins
   */
  addPluginsToPromptCard(plugins = undefined) {
    if (!plugins) {
      return '';
    }

    return plugins
      .map((plugin) => {
        if (plugin === this.CurrentGizmo?.GizmoCode) {
          //CurrentGizmo is handled separately
          return '';
        }

        const gizmo = this.Gizmos.find((gizmo) => gizmo.GizmoCode === plugin);
        if (!gizmo) {
          return '';
        }

        return /*html*/ `
        <span class="MARCI__bg-green-100 MARCI__text-green-800 MARCI__text-xs MARCI__font-medium MARCI__mr-1 MARCI__px-1.5 MARCI__py-0.5 MARCI__rounded dark:MARCI__bg-green-900 dark:MARCI__text-green-300" title="This prompt is optimized for Custom GPT: ${sanitizeInput(
          gizmo.Title
        )}">${sanitizeInput(gizmo.Title)}</span>
      `;
      })
      .join('');
  },

  /**
   *
   * Toggle between the "Basic" and "Advanced" mode
   * and the "Prompt Builder" and "Save Prompt Form"
   *
   * @param {Event} event
   */
  toggleCreatePromptMode(event) {
    // update last create prompt mode in localStorage
    localStorage.setItem(lastCreatePromptModeKey, event.currentTarget.value);

    // toggle the "Basic" and "Advanced" switch
    event.currentTarget.parentElement.parentElement
      .querySelectorAll('label')
      .forEach((element) => {
        [
          'MARCI__toggle-button--active',
          'MARCI__toggle-button--inactive',
        ].forEach((className) => {
          element.classList.toggle(className);
        });
      });

    // toggle the "Prompt Builder" and "Save Prompt Form"
    document
      .querySelectorAll('#MARCI__PromptBuilder, #MARCI__PromptForm')
      .forEach((element) => {
        element.classList.toggle('MARCI__hidden');
      });

    // toggle the required attribute on the inputs ("An invalid form control with ... is not focusable.")
    // if advanced mode -> add required attribute, else remove it
    document
      .querySelectorAll(
        '#MARCI__PromptForm textarea[name="Prompt"], #MARCI__PromptForm textarea[name="Teaser"], #MARCI__PromptForm input[name="PromptHint"], #MARCI__PromptForm input[name="Title"], #MARCI__PromptForm select[name="Topic"], #MARCI__PromptForm select[name="Activity"], #MARCI__PromptForm select[name="PromptTypeNo"]'
      )
      .forEach((element) => {
        element.toggleAttribute('required');
      });

    this.buildBasicPrompt();
  },

  // Build prompt using PromptBuilder and update the form
  buildBasicPrompt() {
    this.PromptBuilder.build();

    const prompt = this.PromptBuilder.get();

    if (!prompt.Prompt) {
      return;
    }

    const form = document.getElementById('savePromptForm');

    const currentPromptTypeNo = +form.elements['PromptTypeNo'].value;

    // Set AuthorName if current PromptTypeNo is TEAM (required)

    if (currentPromptTypeNo === PromptTypeNo.TEAM) {
      // Use MARCI user full name if available, otherwise OpenAI user name as fallback
      form.elements['AuthorName'].value =
        this.Client.AppUser?.FullName ||
        window?.__NEXT_DATA__?.props?.pageProps?.user?.name ||
        '';
    }
    // Otherwise set PromptTypeNo to PRIVATE (PUBLIC requires AuthorURL)
    else {
      form.elements['PromptTypeNo'].value = PromptTypeNo.PRIVATE;
    }

    form.elements['Prompt'].value = prompt.Prompt;
    form.elements['Teaser'].value = prompt.Teaser;
    form.elements['PromptHint'].value = prompt.PromptHint;
    form.elements['Title'].value = prompt.Title;
  },

  // This function adds an "Export Button" to the sidebar
  addExportButton() {
    const selectorConfig = this.Config.getSelectorConfig();

    // Get the nav element in the sidebar
    const nav = document.querySelector(selectorConfig.ExportButton);
    // If there is no nav element or the "Export Button" already exists, skip
    if (!nav || nav.querySelector('#export-button')) return;

    // Create the "Export Button" element
    const button = document.createElement('a');
    button.id = 'export-button';
    button.className = css`ExportButton`;
    button.innerHTML = /*html*/ `${svg`Export`} Export Chat`;
    button.onclick = this.exportCurrentChat.bind(this);

    // If there is no chat started, disable the button
    if (document.querySelector(selectorConfig.ExportButtonChatStarted)) {
      button.style = 'pointer-events: none;opacity: 0.5';
    }

    // Get the Log out button as a reference
    const colorModeButton = [...nav.children].find((child) =>
      child.innerText.includes('Log out')
    );
    // Insert the "Export Button" before the "Color Mode" button
    nav.insertBefore(button, colorModeButton);

    // Create and insert the "Referral Button" element
    this.Referrals.addSidebarButton(button);

    // Create the "Version" element
    const version = document.createElement('a');
    version.id = 'AppName';
    version.className = css`VersionInfo`;
    version.innerHTML = /*html*/ `${svg`Rocket`}` + AppName + ' powered';
    //version.onclick = exportCurrentChat
    version.href = AppURL;
    version.target = '_blank';

    // Get the Log out button as a reference
    const colorModeButton2 = [...nav.children].find((child) =>
      child.innerText.includes('Log out')
    );
    // Insert the "Export Button" before the "Color Mode" button

    // MarciAI_change
    // nav.insertBefore(version, colorModeButton2);

    // Create the "MARCI Community Forum" element
    const forum = document.createElement('a');
    forum.className = css('VersionInfo');
    forum.innerHTML = `${svg('Topic')} MARCI Community Forum`;
    forum.href = AppCommunityForumURL;
    forum.target = '_blank';

    nav.insertBefore(forum, colorModeButton);
  },

  // This function gets the "New Chat" buttons
  getNewChatButtons() {
    const selectorConfig = this.Config.getSelectorConfig();

    // Get the sidebar and topbar elements
    const sidebar = document.querySelector(selectorConfig.NewChatSidebar);
    const topbar = document.querySelector(selectorConfig.NewChatTopbar);
    // Get the "New Chat" button in the sidebar
    const newChatButton = [
      ...(sidebar?.querySelectorAll(selectorConfig.NewChatSidebarButton) ?? []),
    ].find((e) => e.innerText === selectorConfig.NewChatSidebarButtonText);
    // Get the "Plus" button in the topbar
    const AddButton = topbar?.querySelector(selectorConfig.NewChatTopbarButton);
    // Return an array containing the buttons, filtering out any null elements
    return [newChatButton, AddButton].filter((button) => button);
  },

  /**
   * Return current prompt templates based on selected prompt templates type and prompt list
   *
   * @returns {Promise<Prompt[]>}
   */
  async getCurrentPromptTemplates() {
    if (this.PromptTemplatesType !== PromptTemplatesType.CUSTOM_LIST) {
      return this.PromptTemplatesType === PromptTemplatesType.OWN
        ? this.OwnPrompts
        : this.PromptTemplates.filter(
            // filter out forked public prompts from "Public" tab
            (template) => !template.ForkedFromPromptID
          );
    }

    // find all prompts which are in current list
    const list = this.Lists.withID(this.PromptTemplatesList);

    if (!list) {
      console.error(
        'getCurrentPromptTemplates: No list found for ID',
        this.PromptTemplatesList
      );
      return [];
    }

    const listPromptIDS = await list.getPromptIDS();

    if (!listPromptIDS) {
      return [];
    }

    // if list has items, return prompts which are in list and are from selected topic
    const templates = [
      ...this.PromptTemplates,
      ...this.OwnPrompts,
      ...this.TeamPrompts,
    ].filter(
      (prompt) =>
        listPromptIDS.includes(prompt.ID) &&
        (this.PromptTopic === DefaultPromptTopic ||
          prompt.Topic === this.PromptTopic)
    );

    // make sure templates are unique based on ID
    return [...new Map(templates.map((item) => [item.ID, item])).values()];
  },

  /**
   * Filter templates based on selected activity, model and search query
   *
   * @param {Prompt[]} templates
   * @returns {Promise<Prompt[]>} filtered templates
   */
  async filterPromptTemplates(templates) {
    const hiddenList = this.Lists.getHidden();

    return templates.filter((template) => {
      // If the template is hidden and the user is not in the hidden list, skip it
      if (
        template.IsHidden &&
        (this.PromptTemplatesType !== PromptTemplatesType.CUSTOM_LIST ||
          this.PromptTemplatesList !== hiddenList?.ID)
      ) {
        return false;
      }

      return (
        (this.PromptActivity === DefaultPromptActivity ||
          template.Activity === this.PromptActivity) &&
        (this.PromptModel === DefaultPromptModel ||
          this.isTemplateForModelOrGizmo(template, this.PromptModel)) &&
        (!this.PromptSearch ||
          template.Teaser.toLowerCase().includes(
            this.PromptSearch.toLowerCase()
          ) ||
          template.Title.toLowerCase().includes(
            this.PromptSearch.toLowerCase()
          ) ||
          template.AuthorName.toLowerCase().includes(
            this.PromptSearch.toLowerCase()
          ) ||
          template.ID == this.PromptSearch ||
          template?._ID == this.PromptSearch)
      );
    });
  },

  /**
   * Filter gizmos based on search query
   *
   * @param {Gizmo[]} gizmos
   * @returns {Gizmo[]} filtered gizmos
   */
  filterGizmos(gizmos) {
    return gizmos.filter((gizmo) => {
      return (
        !this.GizmoSearch ||
        gizmo.Title.toLowerCase().includes(this.GizmoSearch.toLowerCase()) ||
        gizmo.Description.toLowerCase().includes(
          this.GizmoSearch.toLowerCase()
        ) ||
        gizmo.AuthorDisplayName.toLowerCase().includes(
          this.GizmoSearch.toLowerCase()
        ) ||
        gizmo.ShortURL.toLowerCase().includes(this.GizmoSearch.toLowerCase())
      );
    });
  },

  // This function inserts a section containing a list of prompt templates into the chat interface
  async insertPromptTemplatesSection() {
    // If there are no topics or activities do not insert the section, yet
    if (!this.Topics.length || !this.Activities.length) {
      console.error(
        'insertPromptTemplatesSection: No topics or activities found, skipping prompt templates'
      );
      return;
    }

    const selectorConfig = this.Config.getSelectorConfig();

    // Get the title element (as a reference point and also for some alteration)
    const title = document.querySelector(selectorConfig.DashboardTitle);

    // If there is no title element, return
    if (!title) {
      console.error(
        'insertPromptTemplatesSection: No title element found, skipping prompt templates'
      );
      return;
    }

    // Hide the title element and examples
    title.classList.add('MARCI__hidden');

    // Make sure the model selector is not sticky (to avoid overlapping with the prompt templates)
    const modelSelector = document.querySelector(
      selectorConfig.ModelSelectorContainer || null
    );

    if (modelSelector) {
      modelSelector.classList.remove('sticky');
    }

    // Get the list of prompt templates
    let templates = this.PromptTemplates;

    // If there are no templates, skip
    if (!templates) {
      console.error(
        'insertPromptTemplatesSection: No prompt templates found, skipping prompt templates'
      );
      return;
    }

    templates = await this.getCurrentPromptTemplates();

    // Use index as ID for each template actions
    templates = await Promise.all(
      templates.map(async (template, index) => ({
        ...template,
        _ID: template.ID,
        ID: index,
        IsHidden: await this.isHidden(template),
      }))
    );

    // Filter templates based on selected activity and search query
    templates = await this.filterPromptTemplates(templates);

    // Get the parent element of the title element (main page)
    const parent = title.parentElement;

    // If there is no parent element, skip
    if (!parent) {
      console.error(
        'insertPromptTemplatesSection: No parent element found, skipping prompt templates'
      );
      return;
    }

    // Apply prompt templates specific layout changes
    this.applyLayoutChanges(LayoutChangeType.PROMPT_TEMPLATES);

    const isSidebarView = parent.id?.includes('MARCI__sidebar-container');

    // Get the current page number and page size from the promptTemplateSection object
    const { currentPage, pageSize } = this.PromptTemplateSection;

    let templatesWithGizmoStarterPrompts = [];
    if (
      this.PromptTemplatesType === PromptTemplatesType.PUBLIC &&
      this.CurrentGizmo
    ) {
      // only show Gizmo starter prompts on Public tab
      const gizmoStarterPrompts = this.CurrentGizmo?.PromptStarterS || [];
      templatesWithGizmoStarterPrompts = [...gizmoStarterPrompts, ...templates];
    } else {
      templatesWithGizmoStarterPrompts = [...templates];
    }

    // Calculate the start and end indices of the current page of prompt templates
    const start = pageSize * currentPage;
    const end = Math.min(
      pageSize * (currentPage + 1),
      templatesWithGizmoStarterPrompts.length
    );

    // Get the current page of prompt templates and add "IsFavorite" flag to each of the current templates
    const currentTemplates = await Promise.all(
      templatesWithGizmoStarterPrompts
        .slice(start, end)
        .map(async (template) => ({
          ...template,
          IsFavorite: await this.isFavorite(template.ID),
          IsVerified: await this.isVerified(template.ID),
        }))
    );

    const favoritesList = this.Lists.getFavorites();
    const isFavoritesListView = this.PromptTemplatesList === favoritesList?.ID;

    const hiddenList = this.Lists.getHidden();

    const customLists = this.Lists.getCustom(this.Client.UserQuota);
    const customListIDS = customLists.map((list) => list.ID);

    const MARCIVerifiedList = this.Lists.getMARCIVerified();

    const isCustomListView =
      this.PromptTemplatesType === PromptTemplatesType.CUSTOM_LIST &&
      (customListIDS.includes(this.PromptTemplatesList) ||
        (MARCIVerifiedList?.ID === this.PromptTemplatesList &&
          MARCIVerifiedList.OwnList));

    const selectedList = this.Lists.withID(this.PromptTemplatesList);

    // Pagination buttons (conditionally rendered, depending on the number of prompt templates)
    const paginationContainer = /*html*/ `
    <div class="MARCI__flex MARCI__flex-1 MARCI__gap-3.5 MARCI__justify-between MARCI__items-center MARCI__flex-col sm:MARCI__flex-row MARCI__mt-6">
      <div class="MARCI__text-left" style="margin-top: -1rem;">
        <label class="MARCI__block MARCI__text-sm MARCI__font-medium" title="The number of prompt templates per page">Prompts per Page</label>
        <select class="MARCI__bg-gray-100 MARCI__border-0 MARCI__text-sm MARCI__rounded MARCI__block MARCI__w-full dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200 focus:MARCI__ring-0 dark:hover:MARCI__bg-gray-800 pageSizeSelect">
          ${pageSizeOptions
            .map(
              (pageSize) => /*html*/ `
                <option value="${pageSize}" ${
                pageSize === this.PromptTemplateSection.pageSize
                  ? 'selected'
                  : ''
              }>${pageSize}</option>`
            )
            .join('')}
        </select>
      </div>
      
      <span class="${css`paginationText`}">
        Showing <span class="${css`paginationNumber`}">${
      start + 1
    }</span> to <span class="${css`paginationNumber`}">${end}</span> of <span class="${css`paginationNumber`}">${
      templatesWithGizmoStarterPrompts.length
    } Prompts</span>
      </span>
      <div class="${css`paginationButtonGroup`}">
        <button onclick="MARCI.prevPromptTemplatesPage()" class="${css`paginationButton`}" style="border-radius: 6px 0 0 6px">Prev</button>
        <button onclick="MARCI.nextPromptTemplatesPage()" class="${css`paginationButton`} MARCI__border-0 MARCI__border-l MARCI__border-gray-500" style="border-radius: 0 6px 6px 0">Next</button>
      </div>
    </div>
  `;

    // Create the HTML for the prompt templates section
    const html = /*html*/ `
    <div class="${css`column`} MARCI__relative" style="min-width: 0">


      ${
        isSidebarView
          ? /*html*/ `
          <div class="lg:MARCI__absolute MARCI__top-0 MARCI__right-0 MARCI__text-right">
            <a title="Close MARCI sidebar"
              class="MARCI__p-2 MARCI__cursor-pointer MARCI__align-middle MARCI__inline-block MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-850 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" 
              onclick="event.stopPropagation(); document.getElementById('MARCI__sidebar-icon').click()">
              ${svg('CrossExtraLarge')}
            </a>
          </div>`
          : /* html */ `
          <div class="lg:MARCI__absolute MARCI__top-0 MARCI__right-0 MARCI__text-right">
            <div class="MARCI__mb-2">
              ${
                this.Client.AppUser?.IsLinked
                  ? 
                  /*html*/ 
                  /*MarciAI_change
                  Don't show the "Your MARCI Account" link for now
                  */
                  // `
                  //   <div class="MARCI__mb-2">
                  //     <div>
                  //       Hello, <a target="_blank" href="${AppAccountURL}">
                  //         ${sanitizeInput(this.Client.AppUser.FullName)}
                  
                  //       </a>
                  //     </div>
                            
                  //     <div>
                  //       <a target="_blank" class="MARCI__underline" href="" onclick="event.preventDefault(); MARCI.showAccountModal()">Your MARCI Account</a>
                  //     </div>
                  //   </div>`
                     /*html*/ `
                    <div class="MARCI__mb-2">
                      <div>
                        Hello, <span>
                          ${sanitizeInput(this.Client.AppUser.FullName)}
                        </span>
                      </div>
                    </div>
                    `
                  : /*html*/ `<a href="" onclick="event.preventDefault(); MARCI.connectAccount()" target="blank">Login</a>`
              }
            </div>        
            
            ${
              this.isAdmin()
                ? /*html*/ `
                  <label class="MARCI__relative MARCI__inline-flex MARCI__items-center MARCI__mb-5 MARCI__cursor-pointer MARCI__flex-col" title="Admin Mode">
                    <input type="checkbox" value="" class="MARCI__sr-only MARCI__peer" id="adminMode" onchange="MARCI.toggleAdminMode()" ${
                      this.AdminMode ? ' checked' : ''
                    }>
                    <div class="MARCI__w-9 MARCI__h-5 MARCI__bg-gray-200 peer-focus:MARCI__outline-none MARCI__rounded-full MARCI__peer dark:MARCI__bg-gray-850 peer-checked:after:MARCI__translate-x-full peer-checked:after:MARCI__border-white after:MARCI__content-[''] after:MARCI__absolute after:MARCI__top-[2px] after:MARCI__left-[2px] after:MARCI__bg-white after:MARCI__border-gray-300 after:MARCI__border after:MARCI__rounded-full after:MARCI__h-4 after:MARCI__w-4 after:MARCI__transition-all dark:MARCI__border-gray-600 peer-checked:MARCI__bg-gray-600"></div>
                    <span class="MARCI__ml-3 MARCI__text-sm MARCI__font-medium MARCI__text-gray-900 dark:MARCI__text-gray-300"></span>
                  </label>
                `
                : ''
            }
          </div>`
      }

      ${svg`PromptBubble`}

      <h2 class="${css`h2`}">${
      this.Client &&
      this.Client.UserQuota &&
      this.Client.UserQuota.hasPaidPlan()
        ? AppSloganPremium
        : AppSlogan
    }</h2>
      
      <ul class="MARCI__flex MARCI__flex-col MARCI__gap-3.5 MARCI__mb-4">
        <ul class="MARCI__border-b MARCI__border-gray-200 dark:MARCI__border-gray-700 dark:MARCI__text-gray-400 md:MARCI__flex MARCI__flex-wrap MARCI__font-medium MARCI__text-center MARCI__text-gray-500 MARCI__text-sm MARCI__whitespace-nowrap">
    
          <li class="MARCI__flex-1 MARCI__mr-2">
            <a href="#" id="favoritePromptsTab" title="Your &quot;Favorites&quot; List" 
              onclick="${
                favoritesList
                  ? `MARCI.changePromptTemplatesType('${PromptTemplatesType.CUSTOM_LIST}', '${favoritesList.ID}')`
                  : 'MARCI.Client.UserQuota.canUseFavorites(MARCI.Lists) ? MARCI.howToUseFavoriteList() : null'
              }" 
              class="${
                favoritesList &&
                this.PromptTemplatesType === PromptTemplatesType.CUSTOM_LIST &&
                this.PromptTemplatesList === favoritesList.ID
                  ? 'MARCI__bg-gray-50 dark:MARCI__bg-white/5'
                  : ''
              } dark:hover:MARCI__bg-gray-800 dark:hover:MARCI__text-gray-300 hover:MARCI__bg-gray-50 hover:MARCI__text-gray-600 MARCI__p-4 MARCI__rounded-t-lg MARCI__flex MARCI__justify-center MARCI__w-full">
              ${svg('StarSolidLarge')} &nbsp; Favorites 
            </a>
          </li>

          <li id="MARCIVerifiedPromptsTab_li" class="MARCI__flex-1 MARCI__mr-2">
            <a href="#" id="MARCIVerifiedPromptsTab" title="&quot;MARCI Verified&quot; Prompts List" 
              onclick="MARCI.Client.UserQuota.canUseMARCIVerifiedList() ? MARCI.changePromptTemplatesType('${
                PromptTemplatesType.CUSTOM_LIST
              }', '${MARCIVerifiedList?.ID}') : ''"
              class="${
                MARCIVerifiedList &&
                this.PromptTemplatesType === PromptTemplatesType.CUSTOM_LIST &&
                this.PromptTemplatesList === MARCIVerifiedList?.ID
                  ? 'MARCI__bg-gray-50 dark:MARCI__bg-white/5'
                  : ''
              } dark:hover:MARCI__bg-gray-800 dark:hover:MARCI__text-gray-300 hover:MARCI__bg-gray-50 hover:MARCI__text-gray-600 MARCI__p-4 MARCI__rounded-t-lg MARCI__flex MARCI__justify-center MARCI__w-full">
              ${svg('CheckBadgeSolidLarge')} &nbsp; MARCI
            </a>
          </li>

          <li class="MARCI__flex-1 MARCI__mr-2">
            <a href="#" id="publicPromptsTab" onclick="MARCI.changePromptTemplatesType('${
              PromptTemplatesType.PUBLIC
            }')" 
            class="${
              this.PromptTemplatesType === PromptTemplatesType.PUBLIC
                ? 'MARCI__bg-gray-50 dark:MARCI__bg-white/5'
                : ''
            } dark:hover:MARCI__bg-gray-800 dark:hover:MARCI__text-gray-300 hover:MARCI__bg-gray-50 hover:MARCI__text-gray-600 MARCI__inline-block MARCI__p-4 MARCI__rounded-t-lg MARCI__w-full">
              Public
            </a>
          </li>
          <li class="MARCI__flex-1 MARCI__mr-2">
            <a href="#" id="ownPromptsTab" title="Prompts you own (Private + Team + Public)" 
            onclick="MARCI.changePromptTemplatesType('${
              PromptTemplatesType.OWN
            }')" 
            class="${
              this.PromptTemplatesType === PromptTemplatesType.OWN
                ? 'MARCI__bg-gray-50 dark:MARCI__bg-white/5'
                : ''
            } dark:hover:MARCI__bg-gray-800 dark:hover:MARCI__text-gray-300 hover:MARCI__bg-gray-50 hover:MARCI__text-gray-600 MARCI__inline-block MARCI__p-4 MARCI__rounded-t-lg MARCI__w-full">
              Own
            </a>
          </li>

          ${
            customLists.length
              ? customLists
                  .map(
                    (list) => /*html*/ `
                    <li class="MARCI__flex-1 MARCI__mr-2">
                      <a href="#" title="${list.createTitle(
                        this.Client
                      )}" onclick="MARCI.changePromptTemplatesType('${
                      PromptTemplatesType.CUSTOM_LIST
                    }', '${list.ID}')"
                      class="${
                        this.PromptTemplatesType ===
                          PromptTemplatesType.CUSTOM_LIST &&
                        this.PromptTemplatesList === list.ID
                          ? 'MARCI__bg-gray-50 dark:MARCI__bg-white/5'
                          : ''
                      } dark:hover:MARCI__bg-gray-800 dark:hover:MARCI__text-gray-300 hover:MARCI__bg-gray-50 hover:MARCI__text-gray-600 MARCI__p-4 MARCI__rounded-t-lg MARCI__flex MARCI__justify-center MARCI__items-center MARCI__gap-2 MARCI__w-full"> 
                      ${
                        list.ListTypeNo === ListTypeNo.TEAM_CUSTOM
                          ? list.HasWriteAccessForTeamMember(
                              this.Client.UserTeamM
                            )
                            ? svg('TeamListSolid')
                            : svg('TeamList')
                          : ''
                      }  ${sanitizeInput(list.Comment)}

                        ${this.createCustomListActions(list)}
                      </a>
                    </li>`
                  )
                  .join('')
              : ''
          }
        
          <li id="hiddenPromptsTab_li" class="MARCI__flex-1">
            <a href="#" id="hiddenPromptsTab" title="&quot;Hidden&quot; Prompts List" 
            onclick="${
              hiddenList
                ? `MARCI.changePromptTemplatesType('${PromptTemplatesType.CUSTOM_LIST}', '${hiddenList.ID}')`
                : 'MARCI.Client.UserQuota.canUseHidden(MARCI.Lists) ? MARCI.howToUseHiddenList() : null'
            }" 
            class="${
              hiddenList &&
              this.PromptTemplatesType === PromptTemplatesType.CUSTOM_LIST &&
              this.PromptTemplatesList === hiddenList.ID
                ? 'MARCI__bg-gray-50 dark:MARCI__bg-white/5'
                : ''
            } dark:hover:MARCI__bg-gray-800 dark:hover:MARCI__text-gray-300 hover:MARCI__bg-gray-50 hover:MARCI__text-gray-600 MARCI__p-4 MARCI__rounded-t-lg MARCI__flex MARCI__justify-center MARCI__w-full">
              ${svg('EyeSlash')} &nbsp; Hidden
            </a>
          </li>

          <li id="addNewListTab_li" class="MARCI__flex-1">
            <a href="#" id="addNewListTab" title="Create New List" 
            onclick="MARCI.showListCreateModal()" 
            class="MARCI__rounded MARCI__flex MARCI__justify-center MARCI__items-center MARCI__m-2 MARCI__p-2 MARCI__font-medium MARCI__text-gray-800 MARCI__bg-gray-100 hover:MARCI__bg-gray-200 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__text-gray-400 dark:hover:MARCI__text-white dark:hover:MARCI__bg-gray-800">
            ${svg('Plus')} &nbsp; Add List
            </a>
          </li>
        </ul>
    
        <div class="MARCI__grid MARCI__grid-cols-2 lg:MARCI__flex MARCI__flex-row MARCI__gap-3 MARCI__items-end MARCI__justify-between MARCI__w-full md:last:MARCI__mb-6 MARCI__pt-2 MARCI__stretch MARCI__text-left MARCI__text-sm">
          <div>
            <label for="topicSelect" class="MARCI__block MARCI__text-sm MARCI__font-medium">Topic</label>
        
            <select id="topicSelect" class="MARCI__bg-gray-100 MARCI__border-0 MARCI__text-sm MARCI__rounded MARCI__block MARCI__w-full dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200 focus:MARCI__ring-0 dark:hover:MARCI__bg-gray-800">
              <option value="${DefaultPromptTopic}" 
              ${
                this.PromptTopic === DefaultPromptTopic ? 'selected' : ''
              }>All</option>

              ${this.Topics.map(
                (topic) =>
                  /*html*/ `<option value="${sanitizeInput(topic.ID)}" ${
                    this.PromptTopic === topic.ID ? 'selected' : ''
                  }>${sanitizeInput(topic.Label)}</option>`
              ).join('')}
            </select>
          </div>

          <div>
            <label for="activitySelect" class="MARCI__block MARCI__text-sm MARCI__font-medium">Activity</label>
        
            <select id="activitySelect" class="MARCI__bg-gray-100 MARCI__border-0 MARCI__text-sm MARCI__rounded MARCI__block MARCI__w-full dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200 focus:MARCI__ring-0 dark:hover:MARCI__bg-gray-800">
              <option value="${DefaultPromptActivity}" 
              ${
                this.PromptActivity === DefaultPromptActivity ? 'selected' : ''
              }>All</option>

              ${this.getActivities(this.PromptTopic)
                .map(
                  (activity) =>
                    /*html*/ `<option value="${sanitizeInput(activity.ID)}" ${
                      this.PromptActivity === activity.ID ? 'selected' : ''
                    }>${sanitizeInput(activity.Label)}</option>`
                )
                .join('')}
            </select>
          </div>

          <div>
            <label for="sortBySelect" class="MARCI__block MARCI__text-sm MARCI__font-medium">Sort by</label>
        
            <select id="sortBySelect" class="MARCI__bg-gray-100 MARCI__border-0 MARCI__text-sm MARCI__rounded MARCI__block MARCI__w-full dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200 focus:MARCI__ring-0 dark:hover:MARCI__bg-gray-800">
              ${Object.keys(SortModeNo)
                .map(
                  (sortMode) => /*html*/ `
                  <option value="${SortModeNo[sortMode]}" ${
                    this.PromptSortMode === SortModeNo[sortMode]
                      ? 'selected'
                      : ''
                  }>${capitalizeWords(sortMode.replaceAll('_', ' '))}</option>`
                )
                .join('')}
            </select>
          </div>

          <div>
            <label for="modelSelect" class="MARCI__block MARCI__text-sm MARCI__font-medium">Model</label>
        
            <select id="modelSelect" class="MARCI__bg-gray-100 MARCI__border-0 MARCI__text-sm MARCI__rounded MARCI__block MARCI__w-full dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200 focus:MARCI__ring-0 dark:hover:MARCI__bg-gray-800">
              <option value="${DefaultPromptModel}" 
              ${
                this.PromptModel === DefaultPromptModel ? 'selected' : ''
              }>Not specific</option>

              ${
                this.CurrentGizmo
                  ? /*html*/ `
                  <optgroup label="Current GPT">
                    <option value="${sanitizeInput(
                      this.CurrentGizmo.GizmoCode
                    )}" ${
                      this.PromptModel === this.CurrentGizmo.GizmoCode
                        ? 'selected'
                        : ''
                    }>${sanitizeInput(this.CurrentGizmo.Title)}</option>
                  </optgroup>
                  <optgroup label="ChatGPT Models">
                  `
                  : ''
              }

              ${this.ModelsActive.map(
                (model) =>
                  /*html*/ `<option value="${sanitizeInput(model.ID)}" ${
                    this.PromptModel === model.ID ? 'selected' : ''
                  }>${sanitizeInput(model.LabelUser)}</option>`
              ).join('')}

              ${this.CurrentGizmo ? /*html*/ `</optgroup>` : ''}
            </select>
          </div>

          <div class="MARCI__whitespace-nowrap MARCI__flex">
            <button title="Create New Prompt" 
              onclick="event.preventDefault(); MARCI.createNewPrompt()" 
              class="MARCI__rounded MARCI__justify-center MARCI__items-center MARCI__hidden lg:MARCI__inline-block MARCI__mr-1 MARCI__p-2 MARCI__px-2.5 MARCI__font-medium MARCI__text-gray-800 MARCI__bg-gray-100 hover:MARCI__bg-gray-200 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__text-gray-400 dark:hover:MARCI__text-white dark:hover:MARCI__bg-gray-800">
              ${svg('Plus')}
            </button>
            <input id="promptSearchInput" type="search" class="MARCI__bg-gray-100 MARCI__border-0 MARCI__text-sm MARCI__rounded MARCI__inline-block MARCI__w-full dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200 focus:MARCI__ring-0 lg:MARCI__w-[260px] dark:hover:MARCI__bg-gray-800" placeholder="Search" 
            value="${sanitizeInput(
              this.PromptSearch
            )}" onfocus="this.value = this.value">
          </div>

          <div class="lg:MARCI__hidden">
            <button title="Create New Prompt" 
              onclick="event.preventDefault(); MARCI.createNewPrompt()" 
              class="MARCI__rounded MARCI__w-full MARCI__flex MARCI__justify-center MARCI__items-center MARCI__p-2 MARCI__font-medium MARCI__text-gray-800 MARCI__bg-gray-100 hover:MARCI__bg-gray-200 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:MARCI__text-gray-400 dark:hover:MARCI__text-white dark:hover:MARCI__bg-gray-800">
              ${svg('Plus')} &nbsp; Add Prompt
            </button>
          </div>
        </div>

        ${
          templatesWithGizmoStarterPrompts.length >
          this.PromptTemplateSection.pageSize
            ? paginationContainer
            : ''
        }

        <ul class="${css`ul`} MARCI__grid MARCI__grid-cols-1 lg:MARCI__grid-cols-2 ${
      !isSidebarView ? '2xl:MARCI__grid-cols-4' : ''
    }">
          ${currentTemplates
            .map((template) =>
              template.IsGizmoStarterPrompt
                ? /*html*/ `<button onclick="MARCI.useGizmoStarterPrompt('${
                    template.ID
                  }')" class="${css`card`} MARCI__relative MARCI__group">

                  <h3 class="${css`h3`}" style="overflow-wrap: anywhere;">
                    ${sanitizeInput(template.Prompt)}
                  </h3>

                  <div class="MARCI__-mt-0.5 MARCI__text-gray-500 MARCI__text-xs MARCI__pb-1 MARCI__max-w-full MARCI__w-full">
                    (${sanitizeInput(template.Title)})
                  </div>
                </button>
                `
                : /*html*/ `
            <button onclick="MARCI.selectPromptTemplateByIndex(${
              template.ID
            })" class="${css`card`} MARCI__relative MARCI__group">
              ${
                !template.OwnPrompt && !isCustomListView && !isFavoritesListView
                  ? /*html*/ `
                    <div class="MARCI__absolute MARCI__top-0 MARCI__left-0 MARCI__flex MARCI__text-gray-400 lg:MARCI__invisible group-hover:MARCI__visible">
                      <a title="${
                        template.IsHidden ? 'Unhide' : 'Hide'
                      } this prompt"
                        class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); ${
                          template.IsHidden
                            ? `MARCI.removeFromHiddenList(${template.ID})`
                            : `MARCI.addToHiddenList(${template.ID})`
                        } ">
                        ${svg('Cross')}
                      </a>
                    </div>`
                  : ''
              }

              ${
                isCustomListView &&
                ((template.OwnPrompt &&
                  selectedList.HasWriteAccessForTeamMember(
                    this.Client.UserTeamM
                  )) ||
                  selectedList.OwnList ||
                  selectedList.HasAdminAccessForTeamMember(
                    this.Client.UserTeamM
                  ))
                  ? /*html*/ `
                    <div class="MARCI__absolute MARCI__top-0 MARCI__left-0 MARCI__flex MARCI__text-gray-400 lg:MARCI__invisible group-hover:MARCI__visible">
                      <a title="Remove this prompt from the list"
                        class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); MARCI.removeFromList('${
                          this.PromptTemplatesList
                        }', ${template.ID})">
                        ${svg('Cross')}
                      </a>
                    </div>`
                  : ''
              }

              <div class="MARCI__flex MARCI__items-start MARCI__w-full MARCI__justify-between">
                <h3 class="${css`h3`}" style="overflow-wrap: anywhere; ${
                    template.IsVerified ? 'padding-right: 30px;' : ''
                  }">
                  ${sanitizeInput(template.Title)}
                  ${
                    template.IsVerified
                      ? /*html*/ `
                        <span class="MARCI__ml-1 MARCI__text-gray-500 dark:MARCI__text-gray-400 MARCI__inline-block" 
                              style="vertical-align: sub; transform: translate(20px); margin-left: -20px;" 
                              title="This prompt was reviewed and verified by MARCI.">
                          ${
                            template.IsVerified
                              ? svg('CheckBadgeSolidLarge')
                              : ''
                          }
                        </span>`
                      : ''
                  }
                </h3>

                <div class="MARCI__flex MARCI__gap-4 MARCI__justify-center lg:MARCI__gap-1 lg:MARCI__pl-2 MARCI__mt-1 MARCI__right-2 MARCI__text-gray-400 lg:MARCI__invisible group-hover:MARCI__visible">

                  ${
                    !template.OwnPrompt
                      ? 
                      // MarciAI_change
                      // <a title="View prompt template source" class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); MARCI.viewPromptTemplateSource(${
                      //   template.ID
                      // })">${svg('Eye')}</a>  
                      // <a title="Report this prompt" class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); MARCI.showReportPromptModal(${
                      //   template.ID
                      // })">${svg('Report')}</a>    
                      // `
                      /*html*/
                      `
                      <a title="Report this prompt" class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); MARCI.showReportPromptModal(${
                        template.ID
                      })">${svg('Report')}</a>    
                      `
                      : ''
                  }
                  
                  ${
                    template.OwnPrompt || this.isAdminMode()
                      ? /*html*/ `
                    <a title="Delete this prompt" class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); MARCI.deletePromptTemplate(${
                      template.ID
                    })">${svg('Trash')}</a>
                    <a title="Edit this prompt" class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); MARCI.editPromptTemplate(${
                      template.ID
                    })">${svg('Edit')}</a>
                    `
                      : ''
                  }

                  ${
                    template.IsHidden
                      ? ''
                      : /*html*/ 
                      // MarciAI_change: temp don't show the "Add to list" button for now
                      // `
                      //   <a title="Add this prompt to list" class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); MARCI.addToList(${
                      //     template.ID
                      //   })">${svg('SquaresPlus')}</a>
                      // `
                      `       
                        <a title="${`${
                          template.IsFavorite
                            ? 'Remove this prompt from'
                            : 'Add this prompt to'
                        } Favorites`}" class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); ${
                          template.IsFavorite
                            ? `MARCI.removeFromFavoritesList(${template.ID})`
                            : `MARCI.addToFavoritesList(${template.ID})`
                        }">${
                          template.IsFavorite ? svg('StarSolid') : svg('Star')
                        }</a>`
                  }
                </div>
              </div>      

              <div class="MARCI__-mt-0.5 MARCI__text-gray-500 MARCI__text-xs MARCI__pb-1 MARCI__max-w-full MARCI__w-full">
                <span title="Topic: ${sanitizeInput(
                  this.getTopicLabel(template.Topic)
                )}">
                  ${sanitizeInput(this.getTopicLabel(template.Topic))}
                </span>
                / 
                <span title="Activity: ${sanitizeInput(
                  this.getActivityLabel(template.Activity)
                )}">
                  ${sanitizeInput(this.getActivityLabel(template.Activity))}
                </span>
              </div>

              <div class="MARCI__text-gray-500 MARCI__text-xs MARCI__flex MARCI__pb-1 MARCI__max-w-full">
                ${
                  template.PromptTypeNo === PromptTypeNo.PUBLIC
                    ? /*html*/ `<span class="MARCI__mr-1" title="Public">${svg(
                        'Globe'
                      )}</span>`
                    : template.PromptTypeNo === PromptTypeNo.TEAM
                    ? /*html*/ `<span class="MARCI__mr-1" title="Team">${svg(
                        'TeamPrompt'
                      )}</span>`
                    : /*html*/ `<span class="MARCI__mr-1" title="Private">${svg(
                        'Lock'
                      )}</span>`
                }

                ${
                  template.AuthorName
                    ? template.AuthorURL
                      ? /*html*/ `· 
                      <a href="${sanitizeInput(
                        template.AuthorURL
                      )}" class="MARCI__mx-1 MARCI__underline MARCI__overflow-hidden MARCI__text-ellipsis MARCI__flex-1 MARCI__whitespace-nowrap"
                        onclick="event.stopPropagation()"
                        rel="noopener noreferrer" target="_blank"
                      title="Created by ${sanitizeInput(template.AuthorName)}">
                        ${sanitizeInput(template.AuthorName)}
                      </a>`
                      : /* html */ `· <span class="MARCI__mx-1 MARCI__overflow-hidden MARCI__text-ellipsis MARCI__flex-1 MARCI__whitespace-nowrap"
                      title="Created by ${sanitizeInput(template.AuthorName)}">
                      ${sanitizeInput(template.AuthorName)}
                    </span>`
                    : ''
                }  
                · 
                <span title="Last updated on ${formatDateTime(
                  template.RevisionTime
                )}" class="MARCI__mx-1">${formatAgo(
                    template.RevisionTime
                  )}</span>

                ${
                  template.ForkedFromPromptID
                    ? /*html*/ `· 
                    <a class="MARCI__mx-1 MARCI__underline" 
                      onclick="event.stopPropagation()"  
                      href="https://app.aiprm.com/prompts/${template.ForkedFromPromptID}"
                      rel="noopener noreferrer" target="_blank" 
                      title="Forked from Prompt Template ${template.ForkedFromPromptID}">
                      Forked From
                    </a>`
                    : ''
                }
              </div>
              
              <p class="${css`p`} MARCI__text-gray-600 dark:MARCI__text-gray-200 MARCI__overflow-hidden MARCI__text-ellipsis" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;"
                title="${sanitizeInput(template.Teaser)}">
                ${
                  this.templateRequiresLiveCrawling(template)
                    ? /*html*/ `
                      <span class="MARCI__bg-green-100 MARCI__text-green-800 MARCI__text-xs MARCI__font-medium MARCI__mr-1 MARCI__px-1.5 MARCI__py-0.5 MARCI__rounded dark:MARCI__bg-green-900 dark:MARCI__text-green-300" title="This prompt is utilizing MARCI Live Crawling feature.">Live Crawling</span>
                    `
                    : ''
                }

                ${
                  this.CurrentGizmo &&
                  template.GizmoCodeS?.includes(this.CurrentGizmo.GizmoCode)
                    ? /*html*/ `
                    <span class="MARCI__bg-green-100 MARCI__text-green-800 MARCI__text-xs MARCI__font-medium MARCI__mr-1 MARCI__px-1.5 MARCI__py-0.5 MARCI__rounded dark:MARCI__bg-green-900 dark:MARCI__text-green-300" title="This prompt is optimized for ${sanitizeInput(
                      this.CurrentGizmo.Title
                    )}">${sanitizeInput(this.CurrentGizmo.Title)}</span>
                  `
                    : ''
                }

                ${
                  // MarciAI_change
                  // this.addPluginsToPromptCard(template.GizmoCodeS)
                  ''
                }

                ${(template.ModelS || [])
                  .map((modelID) => {
                    if (template.OwnPrompt) {
                      const model = this.Models?.find((m) => m.ID === modelID);
                      if (!model) return '';

                      const modelLabelUser = model?.LabelUser;
                      const modelLabelAuthor = model?.LabelAuthor;
                      const modelStatusClass =
                        model?.StatusNo === ModelStatusNo.ACTIVE
                          ? 'MARCI__bg-green-100 MARCI__text-green-800 dark:MARCI__bg-green-900 dark:MARCI__text-green-300'
                          : 'MARCI__bg-yellow-100 MARCI__text-yellow-800 dark:MARCI__bg-yellow-900 dark:MARCI__text-yellow-300';

                      return model
                        ? /*html*/ `
                      <span class="MARCI__text-xs MARCI__font-medium MARCI__mr-1 MARCI__px-1.5 MARCI__py-0.5 MARCI__rounded ${modelStatusClass}" title="This prompt is optimized for ${sanitizeInput(
                            modelLabelAuthor
                          )}${this.getModelStatusSuffix(
                            model
                          )}">${sanitizeInput(modelLabelUser)}</span>
                      `
                        : '';
                    } else {
                      const model = this.ModelsActive?.find(
                        (m) => m.ID === modelID
                      );
                      if (!model) return '';

                      const modelLabelUser = model?.LabelUser;
                      const modelLabelAuthor = model?.LabelAuthor;

                      return model
                        ? /*html*/ `
                      <span class="MARCI__bg-green-100 MARCI__text-green-800 MARCI__text-xs MARCI__font-medium MARCI__mr-1 MARCI__px-1.5 MARCI__py-0.5 MARCI__rounded dark:MARCI__bg-green-900 dark:MARCI__text-green-300" title="This prompt is optimized for ${sanitizeInput(
                        modelLabelAuthor
                      )}">${sanitizeInput(modelLabelUser)}</span>
                      `
                        : '';
                    }
                  })
                  .join('')}

                ${sanitizeInput(template.Teaser)}
              </p>

            <div class="MARCI__text-gray-500 MARCI__text-xs MARCI__flex MARCI__pt-3 MARCI__w-full MARCI__justify-between MARCI__mt-auto">
                <span class="MARCI__flex MARCI__items-center" title="Views (${
                  template.Views
                })">
                  <span class="MARCI__p-1">${svg(
                    'Eye'
                  )}</span> &nbsp; ${formatHumanReadableNumber(template.Views)}
                </span>

                <span class="MARCI__flex MARCI__items-center" title="Usages (${
                  template.Usages
                })">
                  <span class="MARCI__p-1">${svg(
                    'Quote'
                  )}</span> &nbsp; ${formatHumanReadableNumber(template.Usages)}
                </span>

                <span class="MARCI__flex MARCI__items-center" title="Votes (${
                  template.Votes
                })">
                  ${
                    !template.OwnPrompt
                      ? /*html*/ `<a title="Votes (${
                          template.Votes
                        }) - Vote for this prompt with thumbs up"
                        class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); MARCI.voteThumbsUp(${
                          template.ID
                        })">${svg('ThumbUp')}</a>`
                      : /*html*/ `${svg('ThumbUp')}`
                  }
                  &nbsp; ${formatHumanReadableNumber(template.Votes)}

                  ${
                    !template.OwnPrompt
                      ? /*html*/ `&nbsp; <a title="Votes (${
                          template.Votes
                        }) - Vote for this prompt with thumbs down"
                        class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" onclick="event.stopPropagation(); MARCI.voteThumbsDown(${
                          template.ID
                        })">${svg('ThumbDown')}</a>`
                      : ''
                  }
                </span>

                <span id="copyLinkToThisPrompt" class="MARCI__flex MARCI__items-center" title="Copy link to this prompt">
                  <a class="MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" 
                  onclick="event.stopPropagation(); MARCI.copyPromptDeepLink(${
                    template.ID
                  })" title="Copy link to this prompt">
                  ${svg('Link')}
                  </a>
                </span>
            </div>
            
          </button>
        `
            )
            .join('')}
              
          ${
            this.PromptTemplatesType !== PromptTemplatesType.CUSTOM_LIST ||
            selectedList.ListTypeNo === ListTypeNo.CUSTOM ||
            (selectedList.ListTypeNo === ListTypeNo.TEAM_CUSTOM &&
              selectedList.HasWriteAccessForTeamMember(this.Client.UserTeamM))
              ? /*html*/ `<button onclick="MARCI.createNewPrompt()" class="${css`card`} MARCI__relative MARCI__group MARCI__justify-center MARCI__items-center">
              <div class="MARCI__flex MARCI__items-center MARCI__gap-3">
                ${svg('Plus')}
                ${
                  this.PromptTemplatesType === PromptTemplatesType.PUBLIC
                    ? 'Add Public Prompt'
                    : this.PromptTemplatesType === PromptTemplatesType.OWN
                    ? 'Add Private Prompt'
                    : selectedList.ListTypeNo === ListTypeNo.CUSTOM
                    ? 'Add Private Prompt'
                    : 'Add Team Prompt'
                }
              </div>
            </button>`
              : ''
          }
        </ul>

        ${this.handleNoPromptsInViewMessage(
          templates,
          isFavoritesListView,
          selectedList
        )}
    
        ${
          templatesWithGizmoStarterPrompts.length >
          this.PromptTemplateSection.pageSize
            ? paginationContainer
            : ''
        }

      </ul>
      
    </div>
   `;

    let wrapper = document.createElement('div');
    wrapper.id = 'templates-wrapper';
    wrapper.className = `MARCI__mt-6 md:MARCI__flex MARCI__items-start MARCI__text-center MARCI__gap-2.5 MARCI__max-w-full MARCI__m-auto sm:MARCI__mx-4 MARCI__text-sm ${
      !isSidebarView ? ' MARCI__pt-16' : ''
    }`;

    if (parent.querySelector('#templates-wrapper')) {
      wrapper = parent.querySelector('#templates-wrapper');
    } else {
      parent.appendChild(wrapper);
    }

    wrapper.innerHTML = html;

    // Add event listeners for topic, activity, sort by select, search input and prompts per page select
    wrapper
      .querySelector('#topicSelect')
      .addEventListener('change', this.changePromptTopic.bind(this));

    wrapper
      .querySelector('#activitySelect')
      .addEventListener('change', this.changePromptActivity.bind(this));

    wrapper
      .querySelector('#sortBySelect')
      .addEventListener('change', this.changePromptSortBy.bind(this));

    wrapper
      .querySelector('#modelSelect')
      .addEventListener('change', this.changePromptModel.bind(this));

    wrapper
      .querySelector('#promptSearchInput')
      .addEventListener(
        'input',
        this.debounce(this.changePromptSearch.bind(this), 300).bind(this)
      );

    const pageSizeSelectElements = wrapper.querySelectorAll(
      'select.pageSizeSelect'
    );

    // Remove event listener for the pagination buttons (if not needed/already added)
    document.removeEventListener('keydown', this.boundHandleArrowKey);

    // Add event listener for the pagination buttons and page size select elements
    if (pageSizeSelectElements.length > 0) {
      pageSizeSelectElements.forEach((select) => {
        select.addEventListener('change', this.changePromptPageSize.bind(this));
      });

      // Add event listener for the pagination buttons
      document.addEventListener('keydown', this.boundHandleArrowKey);
    }
  },

  /**
   * @param {Prompt[]} currentTemplates
   * @param {boolean} isFavoritesListView
   * @param {List} selectedList
   */
  handleNoPromptsInViewMessage(
    currentTemplates,
    isFavoritesListView,
    selectedList
  ) {
    // there are prompts in the current view
    if (currentTemplates.length > 0) {
      return '';
    }

    if (
      this.PromptTopic != DefaultPromptTopic ||
      this.PromptActivity != DefaultPromptActivity ||
      this.PromptModel != DefaultPromptModel ||
      this.PromptSearch != ''
    ) {
      return /*html*/ `
        <div class="MARCI__w-full MARCI__my-8">
          <div class="MARCI__font-semibold MARCI__text-xl">No MARCI prompts found for your current filter.</div>
          <div>Please reset your filters to view all MARCI prompts.</div>
          <a class="MARCI__underline" href="#" title="Reset filters" onclick="event.stopPropagation(); MARCI.resetFilters();">Click here to reset filters</a>
        </div>
      `;
    }

    if (this.PromptTemplatesType === PromptTemplatesType.OWN) {
      return /*html*/ `
        <div class="MARCI__w-full MARCI__my-8">
          <div class="MARCI__font-semibold MARCI__text-xl">You do not have any own prompts at the moment.</div>
          <a class="MARCI__underline" href="#" title="Create New Prompt" onclick="event.preventDefault(); MARCI.createNewPrompt()">Click here to create your own prompt</a>
        </div>`;
    }

    if (this.PromptTemplatesType === PromptTemplatesType.CUSTOM_LIST) {
      const hiddenList = this.Lists.getHidden();

      if (hiddenList && this.PromptTemplatesList === hiddenList.ID) {
        return /*html*/ `
          <div class="MARCI__w-full MARCI__my-8 MARCI__inline_svg">
            <div class="MARCI__font-semibold MARCI__text-xl">This list doesn't have any prompts at the moment.</div>
            Add existing public prompt to Hidden list using ${svg(
              'Cross'
            )} icon next to the public prompt title.
          </div>`;
      } else if (isFavoritesListView) {
        return /*html*/ `
        <div class="MARCI__w-full MARCI__my-8 MARCI__inline_svg">
          <div class="MARCI__font-semibold MARCI__text-xl">This list doesn't have any prompts at the moment.</div>
          Add existing prompt to Favorites list using ${svg(
            'Star'
          )} icon next to the prompt title.
        </div>`;
      } else if (
        selectedList &&
        (selectedList.ListTypeNo === ListTypeNo.MARCI_VERIFIED ||
          selectedList.ListTypeNo === ListTypeNo.CUSTOM ||
          selectedList.HasWriteAccessForTeamMember(this.Client.UserTeamM))
      ) {
        return /*html*/ `
        <div class="MARCI__w-full MARCI__my-8 MARCI__inline_svg">
          <div class="MARCI__font-semibold MARCI__text-xl">This list doesn't have any prompts at the moment.</div>
          <a class="MARCI__underline" href="#" title="Create New Prompt" onclick="event.preventDefault(); MARCI.createNewPrompt()">Click here to create your own prompt</a> or add existing prompt to this list using ${svg(
            'SquaresPlus'
          )} icon next to the prompt title.
        </div>`;
      } else {
        return /*html*/ `
        <div class="MARCI__w-full MARCI__my-8 MARCI__inline_svg">
          <div class="MARCI__font-semibold MARCI__text-xl">This list doesn't have any prompts at the moment.</div>
          Only Team Owner, Team Admin or Team User with Read-Write access can add prompts to this list.
        </div>`;
      }
    }
  },

  createGizmoStarterPrompts() {
    if (!this.CurrentGizmo) {
      return [];
    }

    const gizmo = this.Gizmos?.find(
      (g) => g.GizmoCode === this.CurrentGizmo.GizmoCode
    );
    if (!gizmo) {
      // we do not have Gizmo yet in list
      return [];
    }

    let idIndex = 0;
    return gizmo.PromptStarterS.map((p) => {
      return {
        ID: 'g-' + idIndex++, // we need to have unique ID for each PromptStarter - also different from normal MARCI prompts
        Title: gizmo.Title + ' starter prompt',
        Prompt: p,
        IsGizmoStarterPrompt: true,
      };
    });
  },

  useGizmoStarterPrompt(starterPromptID) {
    if (!this.CurrentGizmo) {
      console.error('useGizmoStarterPrompt: No current gizmo');
      return;
    }

    const starterPrompt = this.CurrentGizmo.PromptStarterS.find(
      (p) => p.ID === starterPromptID
    );
    if (!starterPrompt) {
      console.error('useGizmoStarterPrompt: No starter prompt with ID');
      return;
    }

    // Get the prompt textarea input
    const textarea = document.querySelector(
      this.Config.getSelectorConfig().PromptTextarea
    );

    // If there is no textarea, skip
    if (!textarea) {
      console.error('useGizmoStarterPrompt: No textarea found');
      return;
    }

    // Add the continue action prompt to the textarea
    textarea.tagName === 'TEXTAREA'
      ? (textarea.value = starterPrompt.Prompt)
      : (textarea.innerText = starterPrompt.Prompt);

    textarea.focus();

    // Dispatch the input event to trigger the event listeners and enable the "Submit" button
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  },

  /** @param {List} list */
  createCustomListActions(list) {
    if (
      this.PromptTemplatesType !== PromptTemplatesType.CUSTOM_LIST ||
      this.PromptTemplatesList !== list.ID
    ) {
      return '';
    }

    return /*html*/ `
        <div class="MARCI__dropdown">
          <button class="MARCI__align-middle MARCI__pl-2">
            ${svg('EllipsisVertical')}
          </button>

          <ul title="" class="MARCI__dropdown-menu MARCI__hidden MARCI__z-50 MARCI__border MARCI__bg-white MARCI__absolute MARCI__text-left MARCI__cursor-pointer MARCI__rounded-xl MARCI__border-gray-100 dark:MARCI__bg-gray-900 dark:MARCI__border-gray-800 dark:MARCI__shadow-xs dark:MARCI__text-gray-100 MARCI__shadow-xxs MARCI__py-2">
            ${
              list.ListTypeNo === ListTypeNo.CUSTOM ||
              list.HasAdminAccessForTeamMember(this.Client.UserTeamM)
                ? /* html */ `<li class="MARCI__flex MARCI__items-center MARCI__py-2 MARCI__px-4 hover:!MARCI__bg-gray-50 dark:hover:!MARCI__bg-gray-700 MARCI__text-gray-800 dark:MARCI__text-gray-100" onclick="event.stopPropagation(); MARCI.editCustomList('${
                    list.ID
                  }')">${svg('Edit')}&nbsp;Rename List</li>`
                : ''
            }

            ${
              this.Client.UserQuota?.hasTeamsFeatureEnabled() &&
              (list.ListTypeNo === ListTypeNo.CUSTOM ||
                list.HasOwnerAccessForTeamMember(this.Client.UserTeamM))
                ? /*html*/ `
                <li class="MARCI__flex MARCI__items-center MARCI__py-2 MARCI__px-4 hover:!MARCI__bg-gray-50 dark:hover:!MARCI__bg-gray-700 MARCI__text-gray-800 dark:MARCI__text-gray-100" onclick="event.stopPropagation();MARCI.toggleTeamList('${
                  list.ID
                }');">
                  ${
                    list.ListTypeNo === ListTypeNo.TEAM_CUSTOM
                      ? /* html */ `${svg('Lock')}&nbsp;Make List Private`
                      : /* html */ `${svg('Share')}&nbsp;Share with Team`
                  }
                </li>
                `
                : ''
            }

            ${
              list.ListTypeNo === ListTypeNo.CUSTOM ||
              list.HasAdminAccessForTeamMember(this.Client.UserTeamM)
                ? /* html */ `<li class="MARCI__flex MARCI__items-center MARCI__py-2 MARCI__px-4 hover:!MARCI__bg-red-100 dark:hover:!MARCI__bg-red-500/50 MARCI__text-gray-800 dark:MARCI__text-gray-100" onclick="event.stopPropagation(); MARCI.deleteCustomList('${
                    list.ID
                  }')">${svg('Trash')}&nbsp;Delete List</li>`
                : ''
            }

            ${
              list.ListTypeNo === ListTypeNo.TEAM_CUSTOM
                ? list.HasAdminAccessForTeamMember(this.Client.UserTeamM)
                  ? /* html */ `
                <div class="MARCI__my-1.5 MARCI__h-px MARCI__bg-gray-100 dark:MARCI__bg-white/20" role="none"></div>
                <li class="MARCI__flex MARCI__items-center MARCI__py-2 MARCI__px-4 hover:!MARCI__bg-gray-50 dark:hover:!MARCI__bg-gray-700 MARCI__text-gray-800 dark:MARCI__text-gray-100" onclick="event.stopPropagation();window.open('${AppTeamURL}/${
                      list.ForTeamID
                    }')">${svg('TeamPrompt')}&nbsp;Manage Team</li>`
                  : /* html */ `
                <li class="MARCI__flex MARCI__items-center MARCI__py-2 MARCI__px-4 hover:!MARCI__bg-gray-50 dark:hover:!MARCI__bg-gray-700 MARCI__text-gray-800 dark:MARCI__text-gray-100" onclick="event.stopPropagation();window.open('${AppTeamURL}/${
                      list.ForTeamID
                    }')">${svg('TeamPrompt')}&nbsp;View Team</li>`
                : ''
            }
          </ul>
        </div>
    `;
  },

  /** @param {List['ID']} listID */
  toggleTeamList(listID) {
    const list = this.Lists.withID(listID);

    if (list.ListTypeNo === ListTypeNo.TEAM_CUSTOM) {
      this.switchListToPrivateList(list);
    } else {
      this.switchListToTeamList(listID);
    }
  },

  /** @param {List} list */
  async switchListToPrivateList(list) {
    // Ask for confirmation
    if (
      !confirm(
        `Are you sure you want to make list "${sanitizeInput(
          list.Comment
        )}" private and stop sharing it with your Team?`
      )
    ) {
      return;
    }

    try {
      // Update the list using the API and update it in the local list of lists
      await list.updateListType(ListTypeNo.CUSTOM, null);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not update list. ${
          error instanceof Reaction ? error.message : ''
        }`
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      `Updated prompts list "${sanitizeInput(list.Comment)}".`
    );

    this.insertPromptTemplatesSection();
  },

  /** @param {List['ID']} listID */
  async switchListToTeamList(listID) {
    let shareListWithTeamModal = document.getElementById(
      'shareListWithTeamModal'
    );

    // if modal does not exist, create it, add event listener on submit and append it to body
    if (!shareListWithTeamModal) {
      shareListWithTeamModal = document.createElement('div');
      shareListWithTeamModal.id = 'shareListWithTeamModal';

      shareListWithTeamModal.addEventListener(
        'submit',
        this.shareListWithTeam.bind(this, listID)
      );

      document.body.appendChild(shareListWithTeamModal);
    }

    shareListWithTeamModal.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
      <div class="MARCI__absolute MARCI__bg-black/50 dark:MARCI__bg-black/80 MARCI__inset-0">
      </div>

      <div class="MARCI__fixed MARCI__inset-0 MARCI__overflow-y-auto">
        <div class="MARCI__flex MARCI__items-center MARCI__justify-center MARCI__min-h-full">
          <form>
            <div
              class="MARCI__align-center MARCI__bg-white dark:MARCI__bg-gray-900 dark:MARCI__text-gray-200 MARCI__inline-block MARCI__overflow-hidden sm:MARCI__rounded-lg MARCI__shadow-xl sm:MARCI__align-middle sm:MARCI__max-w-lg sm:MARCI__my-8 sm:MARCI__w-full MARCI__text-left MARCI__transform MARCI__transition-all"
              role="dialog" aria-modal="true" aria-labelledby="modal-headline">

              <div class="MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__px-4 MARCI__pt-5 MARCI__pb-4 sm:MARCI__p-6 sm:MARCI__pb-4 MARCI__w-96">
                <label>Share with Team</label>
                <select id="shareListWithTeamSelectTeam" name="shareListWithTeamSelectTeam" class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full">
                  ${
                    this.Client.OwnTeamS?.length > 0
                      ? this.Client.OwnTeamS.map(
                          (team) =>
                            /*html*/ `<option value="${sanitizeInput(
                              team.TeamID
                            )}">${sanitizeInput(team.TeamName)}</option>`
                        ).join('')
                      : /*html*/ `<option value="NEW">My First Team</option>`
                  }
                </select>

                ${
                  this.Client.OwnTeamS?.length > 0
                    ? /*html*/ `<a href="${AppTeamURL}" target="blank" class="MARCI__text-sm MARCI__text-gray-500 MARCI__underline">Manage My Teams</a>`
                    : ''
                }
              </div>

              <div class="MARCI__bg-gray-200 dark:MARCI__bg-gray-850 MARCI__px-4 MARCI__py-3 MARCI__text-right">
                <button type="button" class="MARCI__bg-gray-600 hover:MARCI__bg-gray-800 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white"
                        onclick="MARCI.hideShareListWithTeamModal()"> Cancel
                </button>
                <button type="submit" class="MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">Share with Team</button>
              </div>
            </div>
          </form>
        </div>
      </div>

    </div>
    `;

    shareListWithTeamModal.style = 'display: block;';

    // add event listener to close the modal on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideShareListWithTeamModal();
      }
    });
  },

  hideShareListWithTeamModal() {
    this.hideModal('shareListWithTeamModal');
  },

  /**
   * @param {List['ID']} listID
   * @param {Event} e
   */
  async shareListWithTeam(listID, e) {
    e.preventDefault();

    const list = this.Lists.withID(listID);

    const formData = new FormData(e.target);
    const forTeamID = formData.get('shareListWithTeamSelectTeam');

    try {
      // Update the list using the API and update it in the local list of lists
      await list.updateListType(ListTypeNo.TEAM_CUSTOM, forTeamID);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not update list. ${
          error instanceof Reaction ? error.message : ''
        }`
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      `Updated prompts list "${sanitizeInput(list.Comment)}".`
    );

    if (forTeamID === 'NEW') {
      // refresh teams
      await this.Client.checkUserStatus();
    }

    this.hideShareListWithTeamModal();

    await this.insertPromptTemplatesSection();
  },

  async resetFilters() {
    const topicReset = this.PromptTopic != DefaultPromptTopic;

    this.PromptTopic = DefaultPromptTopic;
    this.PromptActivity = DefaultPromptActivity;
    this.PromptSearch = '';
    this.PromptTemplateSection.currentPage = 0;

    this.PromptModel = DefaultPromptModel;
    localStorage.setItem(lastPromptModelKey, this.PromptModel);

    if (topicReset) {
      await this.selectPromptTemplateByIndex(null);

      localStorage.setItem(lastPromptTopicKey, this.PromptTopic);

      this.fetchPromptTemplates();

      this.fetchMessages();
    } else {
      await this.insertPromptTemplatesSection();
    }
  },

  resetGizmoFilters() {
    this.GizmoSearch = '';
    this.GizmoSection.currentPage = 0;

    this.insertGizmosSection();
  },

  /**
   * boundHandleArrowKey is the bound version of the handleArrowKey function
   *
   * @type {function(e: KeyboardEvent): void}
   */
  boundHandleArrowKey: null,

  // handleArrowKey handles the arrow key presses for the page navigation
  async handleArrowKey(e) {
    const isArrowKey = e.key === 'ArrowLeft' || e.key === 'ArrowRight';

    const isInput =
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable;

    if (!isArrowKey || isInput) {
      // If the key pressed is not an arrow key or if it was pressed in an input or textarea element, do nothing
      return;
    }

    // If the key pressed is a left arrow key, call the previous page function
    if (e.key === 'ArrowLeft') {
      await this.prevPromptTemplatesPage();

      return;
    }

    // Otherwise, call the next page function
    await this.nextPromptTemplatesPage();
  },

  // changePromptPageSize updates the this.PromptTemplateSection.pageSize variable and re-renders the templates
  async changePromptPageSize(e) {
    let pageSize = +e.target.value;

    // if the pageSize is not in the pageSizeOptions array, use the default pageSize option
    pageSize = pageSizeOptions.includes(pageSize) ? pageSize : pageSizeDefault;

    // persist the last selected page size in local storage
    localStorage.setItem(lastPageSizeKey, pageSize);

    this.PromptTemplateSection.currentPage = 0;
    this.PromptTemplateSection.pageSize = pageSize;

    await this.insertPromptTemplatesSection();
  },

  // changeGizmoPageSize updates the this.GizmoSection.pageSize variable and re-renders the gizmos
  async changeGizmoPageSize(e) {
    let pageSize = +e.target.value;

    // if the pageSize is not in the pageSizeOptions array, use the default pageSize option
    pageSize = pageSizeOptions.includes(pageSize) ? pageSize : pageSizeDefault;

    // persist the last selected page size in local storage
    localStorage.setItem(lastGizmoPageSizeKey, pageSize);

    this.GizmoSection.currentPage = 0;
    this.GizmoSection.pageSize = pageSize;

    this.insertGizmosSection();
  },

  // changePromptTopic updates the this.PromptTopic variable and reloads the templates & messages
  async changePromptTopic(e) {
    this.PromptTopic = e.target.value;

    this.PromptActivity = DefaultPromptActivity;

    this.PromptTemplateSection.currentPage = 0;

    await this.selectPromptTemplateByIndex(null);

    // persist the last selected topic in local storage
    localStorage.setItem(lastPromptTopicKey, this.PromptTopic);

    this.fetchPromptTemplates();

    this.fetchMessages();
  },

  // changePromptActivity updates the this.PromptActivity variable and re-renders the templates
  async changePromptActivity(e) {
    this.PromptActivity = e.target.value;

    this.PromptTemplateSection.currentPage = 0;

    await this.insertPromptTemplatesSection();
  },

  // changePromptSortBy updates the this.PromptSortMode variable and reloads the templates
  changePromptSortBy(e) {
    this.PromptSortMode = +e.target.value;

    this.PromptTemplateSection.currentPage = 0;

    this.fetchPromptTemplates();
  },

  // changeGizmoSortBy updates the this.GizmoSortMode variable and reloads the gizmos
  changeGizmoSortBy(e) {
    this.GizmoSortMode = +e.target.value;

    this.GizmoSection.currentPage = 0;

    this.fetchGizmos();
  },

  // changePromptModel updates the this.PromptModel variable and reloads the templates
  async changePromptModel(e) {
    this.PromptModel = e.target.value;

    this.PromptTemplateSection.currentPage = 0;

    // persist the last selected model in local storage
    localStorage.setItem(lastPromptModelKey, this.PromptModel);

    await this.insertPromptTemplatesSection();
  },

  // changePromptSearch updates the this.PromptSearch variable and re-renders the templates
  async changePromptSearch(e) {
    this.PromptSearch = e.target.value;

    this.PromptTemplateSection.currentPage = 0;

    await this.insertPromptTemplatesSection();

    const searchInput = document.querySelector('#promptSearchInput');

    searchInput.selectionStart = searchInput.selectionEnd =
      searchInput.value.length;
    searchInput.focus();
  },

  // changePromptSearch updates the this.GizmoSearch variable and re-renders the gizmos
  changeGizmoSearch(e) {
    this.GizmoSearch = e.target.value;

    this.GizmoSection.currentPage = 0;

    this.insertGizmosSection();

    const searchInput = document.querySelector('#gizmoSearchInput');

    searchInput.selectionStart = searchInput.selectionEnd =
      searchInput.value.length;

    searchInput.focus();
  },

  /**
   * changePromptTemplatesType updates PromptTemplatesType and PromptTemplatesList and re-renders the templates
   *
   * @param {PromptTemplatesType} type
   * @param {import('./client.js').List['ID']} listID
   */
  async changePromptTemplatesType(type, listID = null) {
    if (
      this.PromptTemplatesType === type &&
      this.PromptTemplatesList === listID
    ) {
      return;
    }

    this.PromptTemplatesType = type;

    this.PromptTemplatesList = listID;

    this.PromptTemplateSection.currentPage = 0;

    // persist the last selected prompt template type and listID in local storage
    localStorage.setItem(lastPromptTemplateTypeKey, type);
    localStorage.setItem(lastListIDKey, listID);

    await this.insertPromptTemplatesSection();
  },

  // debounce is a function that returns a function that will only execute after a certain amount of time has passed
  debounce(callback, milliseconds) {
    let timeout;

    return (argument) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => callback(argument), milliseconds);
    };
  },

  // Insert language select and continue button above the prompt textarea input
  insertLanguageToneWritingStyleContinueActions() {
    let wrapper = document.createElement('div');

    wrapper.id = 'language-select-wrapper';
    wrapper.className = css('languageSelectWrapper');

    // Get the list of languages
    const languages = this.Languages;

    // If there are no languages, skip
    if (!languages) {
      console.error('insertLanguageSelect: No languages found');
      return;
    }

    const selectorConfig = this.Config.getSelectorConfig();

    // Get the prompt textarea input
    const textarea = document.querySelector(selectorConfig.PromptTextarea);

    // If there is no textarea, skip
    if (!textarea) {
      console.error('insertLanguageSelect: No textarea found');
      return;
    }

    // Hide the spacer for absolutely positioned prompt input
    const spacer = document.querySelector(selectorConfig.LangWrapperSpacer);

    if (spacer) {
      spacer.style = 'display: none';
    }

    // Remove the absolute positioning from the prompt input parent
    const formParent = textarea.form?.parentElement;

    if (formParent) {
      formParent.classList.remove(
        'absolute',
        'md:!bg-transparent',
        'md:border-t-0',
        'md:dark:border-transparent',
        'md:border-transparent'
      );
    }

    // Get the parent of the textarea
    const parent = textarea.parentElement;

    // If there is no parent element, skip
    if (!parent) {
      console.error('insertLanguageSelect: No parent element found');
      return;
    }

    // Add padding to the parent element
    parent.classList.add('MARCI__pr-4');

    // Get existing language select wrapper or create a new one
    if (parent.querySelector(`#${wrapper.id}`)) {
      wrapper = parent.querySelector(`#${wrapper.id}`);
    } else {
      // Check if #prompt-wrapper is present
      const promptWrapper = parent.querySelector('#prompt-wrapper');

      if (promptWrapper) {
        // Try inserting #language-select-wrapper right after #prompt-wrapper
        try {
          // DOM doesn't provide an insertAfter() directly, so we insert before the next sibling
          if (promptWrapper.nextSibling) {
            parent.insertBefore(wrapper, promptWrapper.nextSibling);
          } else {
            // If there's no next sibling, prepend it
            parent.prepend(wrapper);
          }
        } catch (error) {
          console.warn(
            'Could not insert language-select-wrapper after prompt-wrapper; falling back to prepend:',
            error
          );
          parent.prepend(wrapper);
        }
      } else {
        // Fallback if #prompt-wrapper is not found at all
        parent.prepend(wrapper);
      }
    }

    // Create the HTML for the language select section
    wrapper.innerHTML = /*html*/ `
    <div class="MARCI__flex MARCI__w-full">
      <div>
        <label for="languageSelect" class="${css(
          'selectLabel'
        )} MARCI__whitespace-nowrap">Output in</label>
        
        <select id="languageSelect" class="${css('select')}">
          <option value ${
            !this.TargetLanguage ? ' selected' : ''
          }>Default language</option>  

          ${this.Languages.map(
            (language) => `
            <option value="${language.languageEnglish}" ${
              this.TargetLanguage === language.languageEnglish
                ? ' selected'
                : ''
            }>
              ${language.languageLabel}
              </option> 
          `
          ).join('')}
        </select>
      </div>
      
      <div class="MARCI__ml-2">
        <label for="toneSelect" class="${css('selectLabel')}">Tone</label>
      
        <select id="toneSelect" class="${css('select')}">
          <option value ${!this.Tone ? ' selected' : ''}>Default</option>

          ${this.Tones.filter((tone) =>
            this.Client.UserQuota.canUseCustomTone(tone)
          )
            .map(
              (tone) => `
            <option value="${tone.ID}" ${
                this.Tone === tone.ID ? ' selected' : ''
              }>
              ${tone.Label}
              </option> 
          `
            )
            .join('')}

          ${
            // MarciAI_change: temp don't allow user add new tone
            ''
            // !this.Client.UserQuota.canUseCustomTone()
            //   ? '<option value disabled>_________</option><option value="UPGRADE">Upgrade for more</option>'
            //   : '<option value disabled>_________</option><option value="ADD_NEW">Add tone...</option>'
          }
        </select>
      </div>

      <div class="MARCI__ml-2">
        <label for="writingStyleSelect" class="${css(
          'selectLabel'
        )} MARCI__whitespace-nowrap">Writing Style</label>
      
        <select id="writingStyleSelect" class="${css('select')}">
          <option value ${
            !this.WritingStyle ? ' selected' : ''
          }>Default</option>

          ${this.WritingStyles.filter((writingStyle) =>
            this.Client.UserQuota.canUseCustomWritingStyle(writingStyle)
          )
            .map(
              (writingStyle) => `
            <option value="${writingStyle.ID}" ${
                this.WritingStyle === writingStyle.ID ? ' selected' : ''
              }>
              ${writingStyle.Label}
              </option> 
          `
            )
            .join('')}

          ${
            // MarciAI_change: temp don't allow user add new writing style
            ''
            // !this.Client.UserQuota.canUseCustomWritingStyle()
            //   ? '<option value disabled>_________</option><option value="UPGRADE">Upgrade for more</option>'
            //   : '<option value disabled>_________</option><option value="ADD_NEW">Add writing style...</option>'
          }
        </select>
      </div>
    </div>

    <div class="MARCI__inline-flex MARCI__invisible" role="group" id="continueActionsGroup">
      <button id="continueWritingButton" title="Continue writing please" class="${css(
        'continueButton'
      )}" onclick="event.stopPropagation(); MARCI.continueWriting()" type="button">
        Continue
      </button>

      <select id="continueActionSelect" class="${css('continueActionSelect')}">
        <option value selected disabled>-- Select an action --</option>

        ${this.ContinueActions.map(
          (action) => `
          <option value="${action.ID}" ${
            !this.Client.UserQuota.canUsePowerContinue() ? 'disabled' : ''
          }>${action.Label}</option>
        `
        ).join('')}

        ${
          // MarciAI_change: temp don't allow user add new continue action
          ''
          // !this.Client.UserQuota.canUsePowerContinue()
          //   ? '<option value disabled>_________</option><option value="UPGRADE">Upgrade to activate</option>'
          //   : '<option value disabled>_________</option><option value="ADD_NEW">Add power continue...</option>'
        }
      </select>
    </div>
  `;

    // Add event listener to language select to update the target language on change
    wrapper
      .querySelector('#languageSelect')
      .addEventListener('change', this.changeTargetLanguage.bind(this));

    // Add event listener to tone select to update the tone on change
    wrapper
      .querySelector('#toneSelect')
      .addEventListener('change', this.changeTone.bind(this));

    // Add event listener to writing style select to update the writing style on change
    wrapper
      .querySelector('#writingStyleSelect')
      .addEventListener('change', this.changeWritingStyle.bind(this));

    // Add event listener to continue action select to update the continue action on change
    wrapper
      .querySelector('#continueActionSelect')
      .addEventListener('change', this.changeContinueAction.bind(this));

    // Prevent event bubbling to prompt textarea
    wrapper.addEventListener('click', (e) => e.stopPropagation());
  },

  // Insert the "Include My Profile info" below prompt textarea
  insertIncludeMyProfileInfo() {
    // MarciAI_change
    return;

    const selectorConfig = this.Config.getSelectorConfig();

    // Get the prompt textarea input
    const textarea = document.querySelector(selectorConfig.PromptTextarea);

    // If there is no textarea, skip
    if (!textarea) {
      console.error('insertMyProfileInfo: No textarea found');
      return;
    }

    // New Composer
    let isNewComposer = document.querySelector(
      selectorConfig.NewComposerTextarea
    );

    // select last button element for parent element of textarea
    let button = document.querySelector(selectorConfig.PromptSubmitButton);

    // If the button is not found, skip
    if (
      (!button ||
        !button.tagName ||
        button.tagName.toLowerCase() !== 'button') &&
      !isNewComposer
    ) {
      console.error('insertMyProfileInfo: No button found');
      return;
    }

    let wrapper = document.querySelector('#includeMyProfile');
    let wrapperClassName =
      'MARCI__mt-4 MARCI__pl-10 MARCI__pr-10 MARCI__-mb-1.5 MARCI__whitespace-nowrap @2xl/prompt-composer:MARCI__text-right @2xl/prompt-composer:MARCI__absolute';

    // Create the wrapper if it doesn't exist
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = wrapperClassName;
      wrapper.id = 'includeMyProfile';

      // Insert the wrapper after the submit button
      !isNewComposer
        ? button.parentNode.insertBefore(wrapper, button.nextSibling)
        : textarea.parentNode.appendChild(wrapper);
    }

    // Hide for not linked accounts
    if (!this.Client.User.IsLinked) {
      wrapper.classList.add('MARCI__hidden');
      this.SelectedMyProfileInfoID = null;
    } else {
      wrapper.classList.remove('MARCI__hidden');
    }

    // Insert the checkbox
    wrapper.innerHTML = /*html*/ `
      <label class="MARCI__text-sm MARCI__items-center MARCI__mx-2"
        title="Include provided &quot;My Profile&quot; info that you would like ChatGPT to know and remember about you and your preferences.">
        <input name="includeMyProfile" type="checkbox" class="MARCI__mr-2 dark:MARCI__bg-gray-850" 
          ${this.IncludeMyProfileMessage ? 'checked' : ''} ${
      this.MyProfileInfos.length > 0 ? '' : 'disabled'
    } />
        Include <a class="MARCI__underline MARCI__cursor-pointer" title="Manage My Profile Info" href="${AppAccountURL}#myprofileinfo" target="_blank">My Profile Info</a>:
      </label>

      <div id="includeMyProfileInfoSelectWrapper" class="MARCI__inline-block MARCI__group">
        <select id="includeMyProfileInfoSelect" class="MARCI__bg-gray-100 MARCI__border-0 MARCI__text-sm MARCI__rounded dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:group-hover:MARCI__bg-gray-800 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white group-hover:MARCI__bg-gray-200 focus:MARCI__ring-0 sm:MARCI__max-w-xs MARCI__max-w-[6rem] ${
          !this.MyProfileInfos.length ? 'MARCI__pointer-events-none' : ''
        }" 
          ${this.IncludeMyProfileMessage ? '' : 'disabled'}>
          ${
            this.MyProfileInfos.length > 0
              ? this.MyProfileInfos.map(
                  (myProfileInfo) => `
            <option value="${myProfileInfo.ID}" ${
                    myProfileInfo.ID === this.SelectedMyProfileInfoID
                      ? 'selected'
                      : ''
                  }>
              ${sanitizeInput(myProfileInfo.Label)}
            </option> 
          `
                ).join('')
              : `<option value="" selected disabled>No Profile Info found</option>`
          }
        </select>
      </div>
     `;

    const selectWrapper = wrapper.querySelector(
      '#includeMyProfileInfoSelectWrapper'
    );

    // add on click event listener to includeMyProfileInfoSelectWrapper if there are no options, otherwise remove it
    if (!this.MyProfileInfos.length) {
      selectWrapper.addEventListener('click', this.openMyProfileInfoSettings);
    } else {
      selectWrapper.removeEventListener(
        'click',
        this.openMyProfileInfoSettings
      );
    }

    const includeMyProfileInfoSelect = wrapper.querySelector(
      '#includeMyProfileInfoSelect'
    );

    wrapper.querySelector('input').addEventListener('change', (event) => {
      this.IncludeMyProfileMessage = event.target.checked;

      if (this.IncludeMyProfileMessage && this.MyProfileInfos.length > 0) {
        if (includeMyProfileInfoSelect.value === '') {
          this.SelectedMyProfileInfoID = this.MyProfileInfos[0].ID;
          includeMyProfileInfoSelect.value = this.SelectedMyProfileInfoID;
        }

        this.SelectedMyProfileInfoID = parseInt(
          includeMyProfileInfoSelect.value
        );

        includeMyProfileInfoSelect.disabled = false;
      } else {
        includeMyProfileInfoSelect.disabled = true;
      }

      try {
        localStorage.setItem(
          selectedMyProfileInfoKey,
          this.SelectedMyProfileInfoID
        );
      } catch (error) {
        console.error(error);
      }
    });

    // Add event listener to checkbox to update the include my profile info on change
    includeMyProfileInfoSelect.addEventListener('change', (event) => {
      this.SelectedMyProfileInfoID = parseInt(event.target.value);

      try {
        localStorage.setItem(
          selectedMyProfileInfoKey,
          this.SelectedMyProfileInfoID
        );
      } catch (error) {
        console.error(error);
      }
    });

    // Add event listener to wrapper to prevent event bubbling to prompt textarea
    wrapper.addEventListener('click', (e) => e.stopPropagation());
  },

  openMyProfileInfoSettings(event) {
    event.stopPropagation();

    window.open(`${AppAccountURL}#myprofileinfo`, '_blank');
  },

  insertVariablesInputWrapper() {
    let variableWrapper = document.querySelector('#' + variableWrapperID);

    if (variableWrapper) {
      variableWrapper.innerHTML = '';
      variableWrapper.classList.add('MARCI__hidden');
    } else {
      const langWrapper = document.querySelector('#language-select-wrapper');

      if (!langWrapper) {
        console.error(
          'insertVariablesInputWrapper: No language select wrapper found'
        );
        return;
      }

      variableWrapper = document.createElement('div');
      variableWrapper.id = variableWrapperID;

      variableWrapper.className =
        'MARCI__gap-3 lg:MARCI__max-w-3xl md:last:MARCI__mb-6 MARCI__mx-2 MARCI__pt-2 MARCI__stretch MARCI__justify-between MARCI__text-sm MARCI__pb-2 MARCI__mb-2 MARCI__border-b MARCI__hidden';
      langWrapper.after(variableWrapper);
    }
  },

  // Change the TargetLanguage on selection change
  changeTargetLanguage(event) {
    this.TargetLanguage = event.target.value;

    // persist the last selected language in local storage
    localStorage.setItem(lastTargetLanguageKey, this.TargetLanguage);
  },

  // Change the Tone on selection change
  changeTone(event) {
    // Show upgrade modal if the user is not allowed to use more custom tones
    if (event.target.value === 'UPGRADE') {
      this.Tone = null;

      this.Client.UserQuota.upgradeCustomTone();

      return;
    } else if (event.target.value === 'ADD_NEW') {
      this.Tone = null;

      if (this.Client.UserQuota.canAddCustomToneWritingStylePowerContinue()) {
        window.open(AppAccountURL + '#tone', '_blank');
      }

      return;
    }

    this.Tone = parseInt(event.target.value);
  },

  // Change the WritingStyle on selection change
  changeWritingStyle(event) {
    // Show upgrade modal if the user is not allowed to use more custom tones
    if (event.target.value === 'UPGRADE') {
      this.WritingStyle = null;

      this.Client.UserQuota.upgradeCustomTone();

      return;
    } else if (event.target.value === 'ADD_NEW') {
      this.WritingStyle = null;

      if (this.Client.UserQuota.canAddCustomToneWritingStylePowerContinue()) {
        window.open(AppAccountURL + '#style', '_blank');
      }

      return;
    }

    this.WritingStyle = parseInt(event.target.value);
  },

  // Change the ContinueAction on selection change and submit the continue action prompt
  changeContinueAction(event) {
    // Show upgrade modal if the user is not allowed to use Power Continue
    if (event.target.value === 'UPGRADE') {
      this.Client.UserQuota.upgradePowerContinue();

      return;
    } else if (event.target.value === 'ADD_NEW') {
      if (this.Client.UserQuota.canAddCustomToneWritingStylePowerContinue()) {
        window.open(AppAccountURL + '#continue', '_blank');
      }

      return;
    }

    const continueActionID = parseInt(event.target.value);

    // Get prompt for the selected continue action
    const continueAction = this.ContinueActions.find(
      (action) => action.ID === continueActionID
    );

    // If the continue action is not found, skip
    if (!continueAction) {
      return;
    }

    // Track usage of continue action
    this.Client.usePrompt(
      `${continueAction.ID}`,
      UsageTypeNo.SEND,
      this.CurrentGizmo?.GizmoCode
    );

    // Submit the continue action prompt
    this.submitContinueActionPrompt(continueAction.Prompt);
  },

  // Ask ChatGPT to continue writing
  continueWriting() {
    this.submitContinueActionPrompt('Continue writing please');
  },

  // Submit the continue action prompt to ChatGPT
  submitContinueActionPrompt(prompt = '') {
    const selectorConfig = this.Config.getSelectorConfig();

    const textarea = document.querySelector(selectorConfig.PromptTextarea);

    const value =
      textarea.tagName === 'TEXTAREA' ? textarea.value : textarea.innerText;

    // If the textarea is not empty and it's not "Continue writing please" - ask for confirmation
    if (
      value.trim() &&
      value.trim() !== 'Continue writing please' &&
      !confirm(
        'Are you sure you want to continue? The current prompt text will be lost.'
      )
    ) {
      return;
    }

    this.SelectedContinueActionPrompt = prompt;

    // Add the continue action prompt to the textarea
    textarea.tagName === 'TEXTAREA'
      ? (textarea.value = prompt)
      : (textarea.innerText = prompt);

    textarea.focus();

    // Dispatch the input event to trigger the event listeners and enable the "Submit" button
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // select last button element for parent element of textarea
    let button = document.querySelector(selectorConfig.PromptSubmitButton);

    // wait for the button to be enabled in 500ms loop (max 5 retries)
    let retries = 0;

    const interval = setInterval(() => {
      // if the button is not found, retry
      if (!button || button.disabled) {
        button = document.querySelector(selectorConfig.PromptSubmitButton);
        retries++;
      }

      // if the button is found or the max retries is reached, clear the interval
      if (button || retries >= 5) {
        clearInterval(interval);
      }

      // If the button is not found, skip
      if (button?.tagName?.toLowerCase() !== 'button') {
        console.error('submitContinueActionPrompt: No button found');
        return;
      }

      // Click the "Submit" button with a delay of 500ms
      setTimeout(() => {
        button.click();
      }, 500);
    }, 500);
  },

  hideContinueActionsButton() {
    const button = document.querySelector('#continueActionsGroup');

    if (!button) {
      return;
    }

    button.classList.add('MARCI__invisible');
  },

  showContinueActionsButton() {
    const button = document.querySelector('#continueActionsGroup');

    if (!button) {
      return;
    }

    button.classList.remove('MARCI__invisible');
  },

  // Decrement the current page of the prompt templates section and re-render
  async prevPromptTemplatesPage() {
    this.PromptTemplateSection.currentPage--;
    this.PromptTemplateSection.currentPage = Math.max(
      0,
      this.PromptTemplateSection.currentPage
    );

    // Update the section
    await this.insertPromptTemplatesSection();
  },

  // nextPromptTemplatesPage increments the current page and re-renders the templates
  async nextPromptTemplatesPage() {
    let templates = await this.getCurrentPromptTemplates();

    if (!templates || !Array.isArray(templates)) return;

    // Filter templates based on selected activity and search query
    templates = await this.filterPromptTemplates(templates);

    let templatesWithGizmoStarterPrompts = [];
    if (
      this.PromptTemplatesType === PromptTemplatesType.PUBLIC &&
      this.CurrentGizmo
    ) {
      // only show Gizmo starter prompts on Public tab
      const gizmoStarterPrompts = this.CurrentGizmo?.PromptStarterS || [];
      templatesWithGizmoStarterPrompts = [...gizmoStarterPrompts, ...templates];
    } else {
      templatesWithGizmoStarterPrompts = [...templates];
    }

    // If there are no templates, skip
    if (templatesWithGizmoStarterPrompts.length === 0) return;

    this.PromptTemplateSection.currentPage++;

    this.PromptTemplateSection.currentPage = Math.min(
      Math.floor(
        (templatesWithGizmoStarterPrompts.length - 1) /
          this.PromptTemplateSection.pageSize
      ),
      this.PromptTemplateSection.currentPage
    );

    // Update the section
    await this.insertPromptTemplatesSection();
  },

  // Decrement the current page of the gizmos section and re-render
  async prevGizmosPage() {
    this.GizmoSection.currentPage--;
    this.GizmoSection.currentPage = Math.max(0, this.GizmoSection.currentPage);

    // Update the section
    this.insertGizmosSection();
  },

  // nextGizmosPage increments the current page and re-renders the gizmos
  async nextGizmosPage() {
    let gizmos = this.Gizmos;

    if (!gizmos || !Array.isArray(gizmos)) return;

    // Filter templates based on selected activity and search query
    gizmos = this.filterGizmos(gizmos);

    // If there are no templates, skip
    if (gizmos.length === 0) return;

    this.GizmoSection.currentPage++;

    this.GizmoSection.currentPage = Math.min(
      Math.floor((gizmos.length - 1) / this.GizmoSection.pageSize),
      this.GizmoSection.currentPage
    );

    // Update the section
    this.insertGizmosSection();
  },

  // Export the current chat log to a file
  exportCurrentChat() {
    // unknown prompt ID - use hardcoded prompt ID = UsageTypeNo.EXPORT
    this.Client.usePrompt(
      `${UsageTypeNo.EXPORT}`,
      UsageTypeNo.EXPORT,
      this.CurrentGizmo?.GizmoCode
    );

    new Exporter(this.Config).exportCurrentChat();
  },

  /** @param {string} ForkedFromPromptID */
  updateForkedFromPromptLink(ForkedFromPromptID) {
    const forkedFromPromptLink = document.getElementById(
      'savePromptForm-forked-from'
    );

    // Update the "Forked from Prompt Template" link
    forkedFromPromptLink.href =
      'https://app.aiprm.com/prompts/' + ForkedFromPromptID;

    forkedFromPromptLink.innerHTML =
      'Forked from Prompt Template ' + ForkedFromPromptID;

    // Show the "Forked from Prompt Template" link
    forkedFromPromptLink.style = 'display: block;';
  },

  /** @param {HTMLFormElement} form */
  hidePublicPromptFormElements(form) {
    // Disable "Public" option for Prompt type
    document.getElementById('PromptTypeNo-public').disabled = true;

    // Hide the "Share as public" disclaimer
    document.getElementById('savePromptForm-public-disclaimer').style =
      'display: none;';
  },

  // Edit the prompt template
  async editPromptTemplate(idx) {
    const prompt = (await this.getCurrentPromptTemplates())[idx];
    if (!prompt.Prompt) {
      try {
        const promptFetch = await this.Client.getPrompt(prompt.ID, true);
        prompt.Prompt = promptFetch.Prompt;
      } catch (error) {
        this.showNotification(
          NotificationSeverity.ERROR,
          `Could not load the prompt template. ${
            error instanceof Reaction ? error.message : ''
          }`
        );
        return;
      }
    }

    // Only allow editing of own prompt templates
    if (
      this.PromptTemplatesType !== PromptTemplatesType.OWN &&
      !prompt.OwnPrompt &&
      !this.isAdminMode()
    ) {
      return;
    }

    await this.showSavePromptModal(
      new CustomEvent(editPromptTemplateEvent),
      prompt.GizmoCodeS
    );

    // Pre-fill the prompt template modal with the prompt template
    const form = document.getElementById('savePromptForm');

    const promptText = prompt.Prompt.replace(headerRegexPattern, '');
    form.elements['Prompt'].value = promptText;
    form.elements['PromptTypeNo'].value = prompt.PromptTypeNo;
    form.elements['Teaser'].value = prompt.Teaser;
    form.elements['PromptHint'].value = prompt.PromptHint;
    form.elements['Title'].value = prompt.Title;
    form.elements['Topic'].value = prompt.Topic;
    form.elements['ID'].value = prompt.ID;
    form.elements['AuthorName'].value = prompt.AuthorName;
    form.elements['AuthorURL'].value = prompt.AuthorURL;
    form.elements['Views'].value = prompt.Views;
    form.elements['Usages'].value = prompt.Usages;
    form.elements['Votes'].value = prompt.Votes;

    this.prepareModelsMultiselect(prompt, form);

    // Show the "Forked from Prompt Template" link if applicable
    if (prompt.ForkedFromPromptID) {
      form.elements['ForkedFromPromptID'].value = prompt.ForkedFromPromptID;

      this.updateForkedFromPromptLink(prompt.ForkedFromPromptID);

      if (!this.isAdminMode()) {
        // Forked prompts for non-admins are always private
        this.hidePublicPromptFormElements(form);
      }
    }

    // Trigger onchange event on Topics to update available Activities
    form.elements['Topic'].dispatchEvent(new Event('change'));

    // Set the selected Activity (Activity)
    form.elements['Activity'].value = prompt.Activity;

    const cloneButton = document.getElementById('MARCI__cloneButton');
    cloneButton.classList.remove('MARCI__hidden');
    cloneButton.onclick = () => {
      this.hideSavePromptModal();
      this.clonePrompt(idx);
    };
  },

  prepareModelsMultiselect(prompt, form) {
    const currentGizmo = this.CurrentGizmo;
    const optionsModelS = Array.from(form.elements['ModelS'].options);

    optionsModelS?.forEach(function (o) {
      if (
        currentGizmo &&
        o.value === currentGizmo.GizmoCode &&
        prompt.GizmoCodeS?.find((c) => c == o.value)
      ) {
        o.selected = true;
      } else if (prompt.ModelS?.find((c) => c == o.value)) {
        o.selected = true;
      } else if (
        o.attributes['MARCIModelStatusNo']?.value != ModelStatusNo.ACTIVE
      ) {
        o.remove();
      }
    });

    // initialize multi-select
    MultiselectDropdown(modelMultiselectOptions);
  },

  // Delete a prompt template
  async deletePromptTemplate(idx) {
    const prompt = (await this.getCurrentPromptTemplates())[idx];

    // Only allow deleting of own prompt templates
    if (
      this.PromptTemplatesType !== PromptTemplatesType.OWN &&
      !prompt.OwnPrompt &&
      !this.isAdminMode()
    ) {
      return;
    }

    // Ask for confirmation
    if (
      !confirm(
        `Are you sure you want to delete prompt template "${prompt.Title}"?`
      )
    ) {
      return;
    }

    try {
      await this.Client.deletePrompt(prompt.ID);

      // remove template using ID
      this.OwnPrompts = this.OwnPrompts.filter(
        (ownPrompt) => ownPrompt.ID !== prompt.ID
      );

      // remove template using ID from the public prompt templates if it's public
      if (prompt.PromptTypeNo === PromptTypeNo.PUBLIC) {
        this.PromptTemplates = this.PromptTemplates.filter(
          (promptTemplate) => promptTemplate.ID !== prompt.ID
        );
      }

      // remove template using ID from lists
      this.Lists.removeItemByPromptIDFromListsByType(prompt.ID);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Something went wrong. Please try again.'
      );
      return;
    }

    // update the section
    await this.insertPromptTemplatesSection();
  },

  // Vote for a prompt template with a thumbs up
  async voteThumbsUp(idx) {
    try {
      await this.Client.voteForPrompt(
        (
          await this.getCurrentPromptTemplates()
        )[idx].ID,
        1,
        this.CurrentGizmo?.GizmoCode
      );
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Something went wrong. Please try again.'
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      'Thanks for your vote!'
    );
  },

  // Vote for a prompt template with a thumbs down
  async voteThumbsDown(idx) {
    try {
      await this.Client.voteForPrompt(
        (
          await this.getCurrentPromptTemplates()
        )[idx].ID,
        -1,
        this.CurrentGizmo?.GizmoCode
      );
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Something went wrong. Please try again.'
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      'Thanks for your vote!'
    );
  },

  // Vote for a gizmo with a thumbs up
  async voteGizmoThumbsUp(GizmoCode) {
    try {
      await this.Client.voteForGizmo(
        GizmoCode,
        GizmoVoteTypeNo.TEASER_THUMBS,
        1
      );
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Something went wrong. Please try again.'
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      'Thanks for your vote!'
    );
  },

  // Vote for a gizmo with a thumbs down
  async voteGizmoThumbsDown(GizmoCode) {
    try {
      await this.Client.voteForGizmo(
        GizmoCode,
        GizmoVoteTypeNo.TEASER_THUMBS,
        -1
      );
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Something went wrong. Please try again.'
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      'Thanks for your vote!'
    );
  },

  // Report the prompt template as inappropriate
  async reportPrompt(e) {
    // prevent the form from submitting
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
      await this.Client.reportPrompt(
        formData.get('PromptID'),
        +formData.get('FeedbackTypeNo'),
        formData.get('FeedbackText'),
        formData.get('FeedbackContact')
      );
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Something went wrong. Please try again.'
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      'Thanks for your feedback! We will review this prompt.'
    );

    this.hideModal('reportPromptModal');
  },

  // Copy link to prompt template to clipboard
  async copyPromptDeepLink(idx) {
    const prompt = (await this.getCurrentPromptTemplates())[idx];

    if (!prompt) {
      return;
    }

    const promptLink =
      prompt.PromptTypeNo === PromptTypeNo.PUBLIC
        ? `https://app.aiprm.com/prompts/${prompt.ID}`
        : `https://chat.openai.com/?${queryParamPromptID}=${prompt.ID}`;

    navigator.clipboard.writeText(promptLink).then(
      // successfully copied
      () => {
        // Warning about prompt not shared as public
        if (prompt.PromptTypeNo !== PromptTypeNo.PUBLIC) {
          this.showNotification(
            NotificationSeverity.WARNING,
            `The link to the prompt template was copied to your clipboard.<br>This prompt is not shared as public. Only you ${
              prompt.PromptTypeNo === PromptTypeNo.TEAM ? 'and your team' : ''
            } can access it.`
          );

          return;
        }

        // Success - copied & public
        this.showNotification(
          NotificationSeverity.SUCCESS,
          'The link to the prompt template was copied to your clipboard.'
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
  },

  // Copy link to gizmo to clipboard
  async copyGizmoDeepLink(URL) {
    navigator.clipboard.writeText(URL).then(
      // successfully copied
      () => {
        // Success - copied
        this.showNotification(
          NotificationSeverity.SUCCESS,
          'The link to the GPT was copied to your clipboard.'
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
  },

  // This function selects a prompt template using the index
  async selectPromptTemplateByIndex(idx) {
    // Reset prompt variables when selecting a new prompt
    this.PromptVariables = {};

    const templates = await this.getCurrentPromptTemplates();

    // If there are no templates, skip
    if (!templates || !Array.isArray(templates)) return;

    await this.selectPromptTemplate(templates[idx]);

    // Hide the "Continue Writing" button (prompt selected/new chat)
    this.hideContinueActionsButton();
  },

  /**
   * Validates prompt variables
   *
   * @param {string} template - Prompt template
   * @returns {ValidatePromptVariablesResult} - Validation result
   */
  validatePromptVariables(template) {
    const errors = [];

    var matches;

    // collect all prompt variable placeholders
    var promptVariablePlaceholders = [];
    while ((matches = ValidateVariablePlaceholder.exec(template.Prompt))) {
      let promptVariableID = matches[1];

      let unique = true;
      promptVariablePlaceholders.forEach((v) => {
        if (v === promptVariableID) {
          unique = false;
        }
      });

      if (unique) {
        promptVariablePlaceholders.push(promptVariableID);
      }
    }

    // collect all prompt variable definitions
    var promptVariableDefinitions = [];
    while ((matches = ValidateVariableDefinition.exec(template.Prompt))) {
      let promptVariableID = matches[1];

      var unique = true;
      promptVariableDefinitions.forEach((v) => {
        if (v.ID === promptVariableID) {
          unique = false;
        }
      });

      if (unique) {
        let defaultValue = '';
        if (matches.length >= 4 && matches[3]) {
          defaultValue = matches[3].substring(1);
        }

        let enumS = [];
        if (matches.length >= 5 && matches[4]) {
          let enumsString = matches[4].substring(1);

          if (enumsString.length > 0) {
            enumS = enumsString.split('|');
          }
        }

        promptVariableDefinitions.push({
          ID: promptVariableID,
          Label: matches[2],
          DefaultValue: defaultValue,
          EnumS: enumS,
        });
      } else {
        errors.push(
          `Duplicate variable definition for VARIABLE${promptVariableID}.`
        );
      }
    }

    // check if there are not over limit variables
    if (
      promptVariablePlaceholders.length > ValidateVariableMaxCount ||
      promptVariableDefinitions.length > ValidateVariableMaxCount
    ) {
      errors.push(
        `Too many variables. Only up to ${ValidateVariableMaxCount} variables can be used per prompt template.`
      );

      return { Errors: errors };
    }

    // check if all prompt variable placeholders have a definition
    promptVariablePlaceholders.forEach((placeholder) => {
      if (placeholder <= ValidateVariableMaxCount) {
        let found = false;
        promptVariableDefinitions.forEach((definition) => {
          if (definition.ID === placeholder) {
            found = true;
          }
        });

        if (!found) {
          errors.push(
            `Missing variable definition for VARIABLE${placeholder}.`
          );
        }
      } else {
        errors.push(
          `Invalid variable placeholder for VARIABLE${placeholder}. Only variables 1 to 6 can be used.`
        );
      }
    });

    // max allowed enum values for prompt variables
    const promptVarEnumMaxSize =
      this.Client.UserQuota.promptVariableEnumMaxSize();

    // check prompt variable enum values size
    for (var i = 0; i < promptVariableDefinitions.length; i++) {
      if (promptVariableDefinitions[i].EnumS.length > promptVarEnumMaxSize) {
        return { EnumMaxSizeError: true };
      }
    }

    // check if all prompt variable definitions have a placeholder
    promptVariableDefinitions.forEach((definition) => {
      if (definition.ID <= ValidateVariableMaxCount) {
        let found = false;
        promptVariablePlaceholders.forEach((placeholder) => {
          if (definition.ID === placeholder) {
            found = true;
          }
        });

        if (!found) {
          errors.push(
            `Unused variable definition for VARIABLE${definition.ID}.`
          );
        }
      } else {
        errors.push(
          `Invalid variable definition for VARIABLE${definition.ID}. Only variables 1 to 6 can be defined.`
        );
      }
    });

    return { Errors: errors };
  },

  extractVariableDefinitions(template) {
    if (template.PromptVariables) {
      return;
    }

    var promptVariables = [];
    var matches;
    while ((matches = VariableDefinition.exec(template.Prompt))) {
      let promptVariableID = matches[1];

      var unique = true;
      promptVariables.forEach((promptVariable) => {
        if (promptVariable.ID === promptVariableID) {
          unique = false;
        }
      });

      if (unique) {
        let defaultValue = '';
        if (matches.length >= 4 && matches[3]) {
          defaultValue = matches[3].substring(1);
        }

        let enumS = [];
        if (matches.length >= 5 && matches[4]) {
          let enumsString = matches[4].substring(1);

          if (enumsString.length > 0) {
            enumS = enumsString.split('|');
          }
        }

        promptVariables.push({
          ID: promptVariableID,
          Label: matches[2],
          DefaultValue: defaultValue,
          EnumS: enumS,
        });
      }
    }

    if (promptVariables.length > 0) {
      // Reorder prompt variables by ID ascending
      promptVariables.sort((a, b) => a.ID - b.ID);

      template.PromptVariables = promptVariables;
    }
  },

  promptVariableEnumValueSelected(selectElem) {
    const promptVariableID = selectElem.id.replace(variableIDPrefix, '');
    this.PromptVariables[promptVariableID].Value = selectElem.value;

    // Show upgrade modal if the user is not allowed to use more enum values
    if (selectElem.value === 'UPGRADE') {
      selectElem.selectedIndex = 0;
      this.Client.UserQuota.upgradePromptVariableEnumMaxSize();

      // Reset the selected value (the first value is selected by default)
      this.PromptVariables[promptVariableID].Value = selectElem.value;

      return;
    }
  },

  /**
   * Select a prompt template and show it in the prompt input field
   *
   * @param {Prompt} template
   */
  async selectPromptTemplate(template) {
    // Reset prompt variables when selecting a new prompt
    this.PromptVariables = {};

    if (template && !template.Prompt) {
      try {
        const templateFetch = await this.Client.getPrompt(template.ID, true);
        template.Prompt = templateFetch.Prompt;
      } catch (error) {
        this.showNotification(
          NotificationSeverity.ERROR,
          `Could not load the prompt template. ${
            error instanceof Reaction ? error.message : ''
          }`
        );
        return;
      }
    }

    const textarea = document.querySelector(
      this.Config.getSelectorConfig().PromptTextarea
    );

    if (!textarea) {
      console.error('selectPromptTemplate: No textarea found');
      return;
    }

    const parent = textarea.parentElement;

    // Check if #prompt-wrapper already exists
    let wrapper = parent.querySelector('#prompt-wrapper');

    if (!wrapper) {
      // If not found, create a new wrapper
      wrapper = document.createElement('div');
      wrapper.id = 'prompt-wrapper';

      // Check if #language-select-wrapper exists
      const languageSelectWrapper = parent.querySelector(
        '#language-select-wrapper'
      );

      if (languageSelectWrapper) {
        // Attempt to place #prompt-wrapper before #language-select-wrapper
        try {
          parent.insertBefore(wrapper, languageSelectWrapper);
        } catch (error) {
          console.warn(
            'Could not insert #prompt-wrapper before #language-select-wrapper; falling back to prepend:',
            error
          );
          parent.prepend(wrapper);
        }
      } else {
        // Fallback if there's no #language-select-wrapper
        parent.prepend(wrapper);
      }
    }

    const url = new URL(window.location.href);

    this.insertVariablesInputWrapper();

    const variableWrapper = document.querySelector('#' + variableWrapperID);

    if (template) {
      // if the prompt needs live crawling, check if the user can use it
      if (
        this.promptRequiresLiveCrawling(template.Prompt) &&
        !this.Client.UserQuota.canUseLiveCrawling()
      ) {
        return;
      }

      // if the prompt needs custom indexes, check if the user can use it
      if (
        this.Client.UserQuota.hasCustomIndexesFeatureEnabled() &&
        this.promptRequiresCustomIndexes(template.Prompt) &&
        !this.Client.UserQuota.canUseCustomIndexes()
      ) {
        return;
      }

      wrapper.innerHTML = /*html*/ `
        <span class="${css`tag`}" title="${sanitizeInput(template.Teaser)}">
          ${sanitizeInput(template.Title)}

          <a title="Deselect prompt / New chat"
            class="MARCI__ml-3 MARCI__align-middle MARCI__inline-block MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400" 
            onclick="event.stopPropagation(); MARCI.selectPromptTemplateByIndex(null)">
            ${svg('Cross')}
          </a>
        </span>

        ${
          template.AuthorName
            ? /*html*/ `
              <span class="MARCI__text-xs">by 
                ${
                  template.AuthorURL
                    ? /*html*/ `<a href="${sanitizeInput(template.AuthorURL)}"
                      class="MARCI__mx-1 MARCI__underline" 
                      onclick="event.stopPropagation()"
                      rel="noopener noreferrer" target="_blank"
                      title="Created by">${sanitizeInput(
                        template.AuthorName
                      )}</a>`
                    : /*html*/ `<span class="MARCI__mx-1" title="Created by ${sanitizeInput(
                        template.AuthorName
                      )}">${sanitizeInput(template.AuthorName)}</span>`
                }
              </span>
            `
            : ''
        }`;

      this.extractVariableDefinitions(template);

      if (template.PromptVariables && template.PromptVariables.length > 0) {
        variableWrapper.classList.remove('MARCI__hidden');

        if (template.PromptVariables.length == 1) {
          variableWrapper.classList.remove(
            'MARCI__grid',
            'MARCI__grid-cols-1',
            'lg:MARCI__grid-cols-2'
          );
        } else {
          variableWrapper.classList.add(
            'MARCI__grid',
            'MARCI__grid-cols-1',
            'lg:MARCI__grid-cols-2'
          );
        }

        template.PromptVariables.forEach((promptVariable) => {
          // Store prompt variables with their default values for later use during prompt submit
          this.PromptVariables[promptVariable.ID] = {
            ...promptVariable,
            Value: promptVariable.DefaultValue,
          };

          const variableElement = document.createElement('div');

          let variableHTML = /*html*/ `
            <label class="MARCI__block MARCI__text-sm MARCI__font-medium MARCI__truncate" title="${sanitizeInput(
              promptVariable.Label
            )}">${sanitizeInput(promptVariable.Label)}</label>
          `;

          if (promptVariable.EnumS.length > 0) {
            variableHTML += /*html*/ `
              <select id="${variableIDPrefix}${promptVariable.ID}" 
                name="${variableIDPrefix}${promptVariable.ID}"
                title="${sanitizeInput(promptVariable.Label)}"
                onchange="MARCI.promptVariableEnumValueSelected(this)"
                class="MARCI__w-full MARCI__border-0 MARCI__rounded MARCI__p-2 MARCI__mt-1 MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-850 dark:hover:MARCI__bg-gray-800 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200" required>
                  ${promptVariable.EnumS.slice(
                    0,
                    this.Client.UserQuota.promptVariableEnumMaxSize()
                  )
                    .map(
                      (e) => /*html*/ `
                      <option value="${sanitizeInput(e)}" ${
                        promptVariable.DefaultValue === e ? 'selected' : ''
                      }>${sanitizeInput(e)}</option>`
                    )
                    .join('')}

                  ${
                    promptVariable.EnumS.length >
                    this.Client.UserQuota.promptVariableEnumMaxSize()
                      ? '<option value disabled>_________</option><option value="UPGRADE">Upgrade for all prompt variable values</option>'
                      : ''
                  }
              }
              </select>
           `;
          } else {
            variableHTML += /*html*/ `
              <textarea id="${variableIDPrefix}${promptVariable.ID}" 
              name="${variableIDPrefix}${promptVariable.ID}"
              rows="1"
              title="${sanitizeInput(promptVariable.Label)}"
              placeholder="${sanitizeInput(promptVariable.Label)}"
              onchange="MARCI.PromptVariables[${
                promptVariable.ID
              }].Value = this.value"
              class="MARCI__w-full MARCI__border-0 MARCI__rounded MARCI__p-2 MARCI__mt-1 MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-850 dark:hover:MARCI__bg-gray-800 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200">${sanitizeInput(
                promptVariable.DefaultValue
              )}</textarea>
            `;
          }

          variableElement.innerHTML = variableHTML;
          variableWrapper.append(variableElement);

          // Trigger onchange event to update default values in PromptVariables
          if (promptVariable.EnumS.length > 0) {
            variableElement
              .querySelector('select')
              ?.dispatchEvent(new Event('change'));

            // Prevent event bubbling to prompt textarea
            variableElement.addEventListener('click', (e) =>
              e.stopPropagation()
            );
          }
        });
      }

      this.updatePromptTextareaPlaceholder(textarea, template.PromptHint);

      this.SelectedPromptTemplate = template;
      textarea.focus();

      this.Client.usePrompt(
        template.ID,
        UsageTypeNo.CLICK,
        this.CurrentGizmo?.GizmoCode
      );

      // Update query param MARCI_PromptID to the selected prompt ID
      if (url.searchParams.get(queryParamPromptID) === template.ID) {
        return;
      }

      url.searchParams.set(queryParamPromptID, template.ID);
    } else {
      wrapper.innerHTML = '';

      this.updatePromptTextareaPlaceholder(textarea, '');

      this.SelectedPromptTemplate = null;

      this.setPromptPanelHintPlaceholder(textarea);

      // Remove MARCI_VARIABLE* and MARCI_PromptID query params
      const removeSearchParams = [];

      for (const key of url.searchParams.keys()) {
        if (key.startsWith(queryParamVariable) || key === queryParamPromptID) {
          removeSearchParams.push(key);
        }
      }

      // No need to update the history if no query params to remove
      if (!removeSearchParams.length) {
        return;
      }

      // Remove query params
      removeSearchParams.forEach((key) => url.searchParams.delete(key));
    }

    // Push new URL to browser history
    window.history.pushState({}, '', url);
  },

  CSVToArray(strData, strDelimiter) {
    strDelimiter = strDelimiter || ',';
    var pattern = new RegExp(
      '(\\' +
        strDelimiter +
        '|\\r?\\n|\\r|^)' +
        '(?:"([^"]*(?:""[^"]*)*)"|' +
        '([^"\\' +
        strDelimiter +
        '\\r\\n]*))',
      'gi'
    );
    var data = [[]];
    var matches;

    // No need to continue if no strData provided
    if (!strData) {
      return data;
    }

    while ((matches = pattern.exec(strData))) {
      var delimiter = matches[1];
      if (delimiter.length && delimiter !== strDelimiter) {
        data.push([]);
      }
      var value = matches[2]
        ? matches[2].replace(new RegExp('""', 'g'), '"')
        : matches[3];
      data[data.length - 1].push(value);
    }
    return data;
  },

  // get the topic label from the topic ID
  getTopicLabel(TopicID) {
    const topic = this.Topics.find((topic) => topic.ID === TopicID);

    if (!topic) {
      return '';
    }

    return topic.Label;
  },

  // get the activity label from the activity ID
  getActivityLabel(ActivityID) {
    const activity = this.Activities.find(
      (activity) => activity.ID === ActivityID
    );

    if (!activity) {
      return '';
    }

    return activity.Label;
  },

  // current user is admin
  isAdmin() {
    return this.Client.User.UserLevelNo === UserLevelNo.SUPER_ADMIN;
  },

  // current user is admin and has enabled admin mode
  isAdminMode() {
    return this.isAdmin() && this.AdminMode;
  },

  // toggle admin mode and re-render prompt templates
  async toggleAdminMode() {
    if (!this.isAdmin()) {
      return;
    }

    this.AdminMode = !this.AdminMode;

    await this.insertPromptTemplatesSection();
  },

  // current user can create public or private prompt template
  canCreatePromptTemplate() {
    return (
      this.canCreatePublicPromptTemplate() ||
      this.canCreateTeamPromptTemplate() ||
      this.canCreatePrivatePromptTemplate()
    );
  },

  // current user can create private prompt template
  canCreatePrivatePromptTemplate() {
    return (
      this.isAdmin() ||
      this.Client.UserQuota.canCreatePrivatePromptTemplate(this.OwnPrompts)
    );
  },

  // current user can create private prompt template
  canCreateTeamPromptTemplate() {
    return (
      this.isAdmin() ||
      this.Client.UserQuota.canCreateTeamPromptTemplate(this.OwnPrompts)
    );
  },

  // current user can create public prompt template
  canCreatePublicPromptTemplate() {
    return (
      this.isAdmin() ||
      this.Client.UserQuota.canCreatePublicPromptTemplate(this.OwnPrompts)
    );
  },

  /**
   * Show modal to view prompt template
   */
  async showViewPromptModal(idx) {
    const prompt = (await this.getCurrentPromptTemplates())[idx];

    let viewPromptModal = document.getElementById('viewPromptModal');

    // if modal does not exist, create it, add event listener on submit and append it to body
    if (!viewPromptModal) {
      viewPromptModal = document.createElement('div');
      viewPromptModal.id = 'viewPromptModal';
      document.body.appendChild(viewPromptModal);
    }

    viewPromptModal.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
        <div class="MARCI__absolute MARCI__bg-black/50 dark:MARCI__bg-black/80 MARCI__inset-0">
        </div>

        <div class="MARCI__fixed MARCI__inset-0 MARCI__overflow-y-auto">
          <div class="MARCI__flex MARCI__items-center MARCI__justify-center MARCI__min-h-full">
            <form id="viewPromptForm">
              <div
              class="MARCI__align-center MARCI__bg-white dark:MARCI__bg-gray-900 dark:MARCI__text-gray-200 MARCI__inline-block MARCI__overflow-hidden sm:MARCI__rounded-lg MARCI__shadow-xl sm:MARCI__align-middle sm:MARCI__max-w-lg sm:MARCI__my-8 sm:MARCI__w-full MARCI__text-left MARCI__transform MARCI__transition-all"
              role="dialog" aria-modal="true" aria-labelledby="modal-headline">
          
                <div class="MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__px-4 MARCI__pt-5 MARCI__pb-4 sm:MARCI__p-6 sm:MARCI__pb-4 MARCI__overflow-y-auto">
                  <label>Prompt Template</label>
                  <textarea disabled name="Prompt" class="MARCI__w-full MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__p-2 MARCI__mt-2 MARCI__mb-3" style="height: 120px;" required
                            placeholder="Prompt text including placeholders [TARGETLANGUAGE] or [PROMPT] replaced automagically by MARCI"
                            title="Prompt text including placeholders [TARGETLANGUAGE] or [PROMPT] replaced automagically by MARCI"></textarea>
            
                  <label>Teaser</label>
                  <textarea disabled name="Teaser" required
                    title="Short teaser for this prompt template, e.g. 'Create a keyword strategy and SEO content plan from 1 [KEYWORD]'"
                    class="MARCI__w-full MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__p-2 MARCI__mt-2 MARCI__mb-3" style="height: 71px;"
                    placeholder="Create a keyword strategy and SEO content plan from 1 [KEYWORD]"></textarea>
                    
                  <label>Prompt Hint</label>
                  <input disabled name="PromptHint" required type="text"
                    title="Prompt hint for this prompt template, e.g. '[KEYWORD]' or '[your list of keywords, maximum ca. 8000]"
                    class="MARCI__w-full MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__p-2 MARCI__mt-2 MARCI__mb-3" placeholder="[KEYWORD] or [your list of keywords, maximum ca. 8000]" />

                  <label>Title</label>
                  <input disabled name="Title" type="text" 
                    title="Short title for this prompt template, e.g. 'Keyword Strategy'" required placeholder="Keyword Strategy" class="MARCI__w-full MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__mb-3 MARCI__mt-2 MARCI__p-2" />
            
                  <div class="MARCI__flex">
                    <div class="MARCI__mr-4 MARCI__w-full">
                      <label>Topic</label>
                      <select disabled name="Topic" class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full" required>
                        ${this.Topics.map(
                          (topic) => /*html*/ `
                              <option value="${sanitizeInput(topic.ID)}" ${
                            topic.ID === prompt.Topic ? 'selected' : ''
                          }>${sanitizeInput(topic.Label)}</option>`
                        ).join('')}
                      </select>
                    </div>

                    <div class="MARCI__w-full">
                      <label>Activity</label>
                      <select disabled name="Activity" class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full" required>
                        ${this.getActivities(prompt.Topic)
                          .map(
                            (activity) => /*html*/ `
                              <option value="${sanitizeInput(
                                activity.ID
                              )}">${sanitizeInput(activity.Label)}</option>`
                          )
                          .join('')}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label>Made for</label>
                    <div class="MARCI__w-full MARCI__border-gray-500 MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__p-2 MARCI__mt-2 MARCI__mb-3 MARCI__border">
                      ${
                        prompt.ModelS?.length > 0
                          ? prompt.ModelS?.map((modelID) => {
                              const model = this.Models?.find(
                                (m) => m.ID === modelID
                              );
                              const modelLabel = model?.LabelAuthor;

                              return modelLabel
                                ? /*html*/ `<span class="MARCI__whitespace-nowrap ${
                                    model?.StatusNo !== ModelStatusNo.ACTIVE
                                      ? 'MARCI__line-through'
                                      : ''
                                  }" title="This prompt is optimized for ${sanitizeInput(
                                    modelLabel
                                  )}${this.getModelStatusSuffix(
                                    model
                                  )}">${sanitizeInput(modelLabel)}</span>`
                                : '';
                            })
                              .filter((m) => m !== '')
                              .join(', ')
                          : /*html*/ `<span title="This prompt is not optimized for specific model">Not specific</span>`
                      }
                    </div>
                  </div>

                  <div class="MARCI__block MARCI__mt-4">
                    <div class="MARCI__flex MARCI__justify-between MARCI__mt-4">
                      <div class="MARCI__mr-4 MARCI__w-full"><label>Author Name</label>
                        <input disabled name="AuthorName" type="text" title="Author Name visible for all users"
                              placeholder="Author Name" class="MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__mb-3 MARCI__mt-2 MARCI__p-2 MARCI__w-full" />
                      </div>

                      <div class="MARCI__w-full"><label>Author URL</label>
                        <input disabled name="AuthorURL" type="url" title="Author URL visible for all users"
                              placeholder="https://www.example.com/" class="MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__mb-3 MARCI__mt-2 MARCI__p-2 MARCI__w-full" />
                      </div>
                    </div>                
                  </div>
                </div>
            
                <div class="MARCI__bg-gray-200 dark:MARCI__bg-gray-850 MARCI__px-4 MARCI__py-3 MARCI__text-right">
                  <button type="button" class="MARCI__bg-gray-600 hover:MARCI__bg-gray-800 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white"
                          onclick="MARCI.hideViewPromptModal()"> Close
                  </button>
                  <button type="button" class="MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white"  
                          onclick="MARCI.hideViewPromptModal(); MARCI.forkToPrivatePrompt(${idx})">
                    Fork as Private Prompt
                  </button>
                </div>
            
              </div>
            </form>
          </div>
        </div>
        
      </div>
    `;

    viewPromptModal.style = 'display: block;';

    // add event listener to close the modal on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideViewPromptModal();
      }
    });
  },

  hideViewPromptModal() {
    this.hideModal('viewPromptModal');
  },

  async viewPromptTemplateSource(idx) {
    if (!this.Client.UserQuota.canUseViewPromptTemplateSource()) {
      return;
    }

    const prompt = (await this.getCurrentPromptTemplates())[idx];
    if (!prompt.Prompt) {
      try {
        const promptFetch = await this.Client.getPrompt(prompt.ID, true);
        prompt.Prompt = promptFetch.Prompt;
      } catch (error) {
        this.showNotification(
          NotificationSeverity.ERROR,
          `Could not load the prompt template. ${
            error instanceof Reaction ? error.message : ''
          }`
        );
        return;
      }
    }

    this.Client.usePrompt(
      prompt.ID,
      UsageTypeNo.VIEW_SOURCE,
      this.CurrentGizmo?.GizmoCode
    );

    await this.showViewPromptModal(idx);

    // Pre-fill the prompt template modal with the prompt template
    const form = document.getElementById('viewPromptForm');

    const promptText = prompt.Prompt.replace(headerRegexPattern, '');
    form.elements['Prompt'].value = promptText;
    form.elements['Teaser'].value = prompt.Teaser;
    form.elements['PromptHint'].value = prompt.PromptHint;
    form.elements['Title'].value = prompt.Title;
    form.elements['Topic'].value = prompt.Topic;
    form.elements['Activity'].value = prompt.Activity;
    form.elements['AuthorName'].value = prompt.AuthorName;
    form.elements['AuthorURL'].value = prompt.AuthorURL;
  },

  async forkToPrivatePrompt(idx) {
    const promptOriginal = (await this.getCurrentPromptTemplates())[idx];

    this.Client.usePrompt(
      promptOriginal.ID,
      UsageTypeNo.FORK,
      this.CurrentGizmo?.GizmoCode
    );

    await this.showSavePromptModal(
      new CustomEvent(forkPromptTemplateEvent),
      promptOriginal.GizmoCodeS
    );

    // Pre-fill the prompt template modal with the prompt template
    const form = document.getElementById('savePromptForm');

    form.elements['ForkedFromPromptID'].value = promptOriginal.ID;

    const promptText = promptOriginal.Prompt.replace(headerRegexPattern, '');
    form.elements['Prompt'].value = promptText;
    form.elements['Teaser'].value = promptOriginal.Teaser;
    form.elements['PromptHint'].value = promptOriginal.PromptHint;
    form.elements['Title'].value = promptOriginal.Title;
    form.elements['Topic'].value = promptOriginal.Topic;

    this.prepareModelsMultiselect(promptOriginal, form);

    // Update the "Forked from Prompt Template" link
    this.updateForkedFromPromptLink(promptOriginal.ID);

    form.elements['PromptTypeNo'].value = promptOriginal.PromptTypeNo;

    // Forked prompts for non-admins are always private
    if (!this.isAdminMode()) {
      if (promptOriginal.PromptTypeNo === PromptTypeNo.PUBLIC) {
        form.elements['PromptTypeNo'].value = PromptTypeNo.PRIVATE;
      }

      this.hidePublicPromptFormElements(form);
    }

    // Trigger onchange event on Topics to update available Activities
    form.elements['Topic'].dispatchEvent(new Event('change'));

    // Set the selected Activity (Activity)
    form.elements['Activity'].value = promptOriginal.Activity;
  },

  async clonePrompt(idx) {
    const promptOriginal = (await this.getCurrentPromptTemplates())[idx];

    await this.showSavePromptModal(
      new CustomEvent(clonePromptTemplateEvent),
      promptOriginal.GizmoCodeS
    );

    // Pre-fill the prompt template modal with the cloned prompt template
    const form = document.getElementById('savePromptForm');

    // Do not set prompt.ID from original prompt template to create a new prompt
    const promptText = promptOriginal.Prompt.replace(headerRegexPattern, '');
    form.elements['Prompt'].value = promptText;
    form.elements['PromptTypeNo'].value = promptOriginal.PromptTypeNo;
    form.elements['Teaser'].value = promptOriginal.Teaser;
    form.elements['PromptHint'].value = promptOriginal.PromptHint;
    form.elements['Title'].value = promptOriginal.Title;
    form.elements['Topic'].value = promptOriginal.Topic;
    form.elements['AuthorName'].value = promptOriginal.AuthorName;
    form.elements['AuthorURL'].value = promptOriginal.AuthorURL;

    this.prepareModelsMultiselect(promptOriginal, form);

    // Cloning forked prompt template results in a forked prompt too
    if (promptOriginal.ForkedFromPromptID) {
      form.elements['ForkedFromPromptID'].value =
        promptOriginal.ForkedFromPromptID;

      this.updateForkedFromPromptLink(promptOriginal.ForkedFromPromptID);

      if (!this.isAdminMode()) {
        // Forked prompts for non-admins are always private
        this.hidePublicPromptFormElements(form);
      }
    }

    // Trigger onchange event on Topics to update available Activities
    form.elements['Topic'].dispatchEvent(new Event('change'));

    // Set the selected Activity (Activity)
    form.elements['Activity'].value = promptOriginal.Activity;
  },

  // Add prompt template to "Hidden" prompts list
  async addToHiddenList(idx) {
    if (!this.Client.UserQuota.canUseHidden(this.Lists)) {
      return;
    }

    const prompt = (await this.getCurrentPromptTemplates())[idx];

    const hiddenList = this.Lists.getHidden();

    try {
      hiddenList
        ? // if hidden list already exists, add prompt to it
          await hiddenList.add(prompt)
        : // if hidden list does not exist, create it and add prompt to it
          await this.Lists.create(this.Client, ListTypeNo.HIDDEN, '', {
            PromptID: prompt.ID,
            Comment: '',
          });
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not hide prompt template. ${
          error instanceof Reaction ? error.message : ''
        }`
      );

      if (
        error instanceof Reaction &&
        error.ReactionNo === ReactionNo.RXN_MARCI_QUOTA_EXCEEDED
      ) {
        hiddenList
          ? this.Client.UserQuota.listItemQuotaExceeded()
          : this.Client.UserQuota.listQuotaExceeded();
      }

      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      'Added to "Hidden" prompts list.'
    );

    await this.insertPromptTemplatesSection();
  },

  // Remove prompt template from "Hidden" prompts list
  async removeFromHiddenList(idx) {
    const prompt = (await this.getCurrentPromptTemplates())[idx];

    const list = this.Lists.getHidden();

    try {
      await list.remove(prompt);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not unhide prompt template. ${
          error instanceof Reaction ? error.message : ''
        }`
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      'Removed from "Hidden" prompts list.'
    );

    await this.insertPromptTemplatesSection();
  },

  // Check if prompt template is hidden
  async isHidden(prompt) {
    const list = this.Lists.getHidden();

    if (!list) {
      return false;
    }

    return await list.has(prompt);
  },

  /**
   * Add prompt template to "Favorites" prompts list
   *
   * @param {string} idx - prompt template index
   * @returns {Promise<void>}
   */
  async addToFavoritesList(idx) {
    if (!this.Client.UserQuota.canUseFavorites(this.Lists)) {
      return;
    }

    const prompt = (await this.getCurrentPromptTemplates())[idx];

    const favoritesList = this.Lists.getFavorites();

    try {
      favoritesList
        ? // if favorites list already exists, add prompt to it
          await favoritesList.add(prompt)
        : // if favorites list does not exist, create it and add prompt to it
          await this.Lists.create(this.Client, ListTypeNo.FAVORITES, '', {
            PromptID: prompt.ID,
            Comment: '',
          });

      // Update context menu
      await this.setupFavoritePromptsContextMenu();
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not add to "Favorites" prompts list. ${
          error instanceof Reaction ? error.message : ''
        }`
      );

      if (
        error instanceof Reaction &&
        error.ReactionNo === ReactionNo.RXN_MARCI_QUOTA_EXCEEDED
      ) {
        favoritesList
          ? this.Client.UserQuota.listItemQuotaExceeded()
          : this.Client.UserQuota.listQuotaExceeded();
      }

      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      'Added to "Favorites" prompts list.'
    );

    this.insertPromptTemplatesSection();
  },

  /**
   * Remove prompt template from "Favorites" prompts list
   *
   * @param {string} idx - prompt template index
   * @returns {Promise<void>}
   */
  async removeFromFavoritesList(idx) {
    const prompt = (await this.getCurrentPromptTemplates())[idx];

    const list = this.Lists.getFavorites();

    try {
      // remove prompt from favorites list via API and update the local list
      await list.remove(prompt);

      // Update context menu
      await this.setupFavoritePromptsContextMenu();
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not remove from "Favorites" prompts list. ${
          error instanceof Reaction ? error.message : ''
        }`
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      'Removed from "Favorites" prompts list.'
    );

    this.insertPromptTemplatesSection();
  },

  /**
   * Check if prompt is in "Favorites" prompts list
   *
   * @param {string} idx - prompt template index
   * @returns {Promise<boolean>}
   */
  async isFavorite(idx) {
    const list = this.Lists.getFavorites();

    if (!list) {
      return false;
    }

    const prompt = (await this.getCurrentPromptTemplates())[idx];

    if (!prompt) {
      // Gizmo starter prompt
      return false;
    }

    return await list.has(prompt);
  },

  /**
   * Add prompt template to custom list
   *
   * @param {string} idx
   */
  async addToList(idx) {
    const prompt = (await this.getCurrentPromptTemplates())[idx];

    const lists = this.Lists.getCustomWithWriteAccess(
      this.Client.UserQuota,
      this.Client.UserTeamM
    );

    const MARCIVerifiedList = this.Lists.getMARCIVerified();

    // if MARCI verified list exists and it's owned by the user, add it to the list
    if (MARCIVerifiedList && MARCIVerifiedList.OwnList) {
      lists.push(MARCIVerifiedList);
    }

    // sort lists by Comment
    lists.sort((a, b) => a.Comment.localeCompare(b.Comment));

    // show list selection modal
    this.showListSelectionModal(lists, prompt);
  },

  /**
   * Remove prompt template from custom list
   *
   * @param {List['ID']} listID
   * @param {string} idx - prompt template index
   */
  async removeFromList(listID, idx) {
    const prompt = (await this.getCurrentPromptTemplates())[idx];

    const list = this.Lists.withID(listID);

    try {
      // remove prompt from list via API and update local list
      await list.remove(prompt);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not remove from list. ${
          error instanceof Reaction ? error.message : ''
        }`
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      `Removed from "${sanitizeInput(list.Comment)}" prompts list.`
    );

    this.insertPromptTemplatesSection();
  },

  /**
   * Show list selection modal to select list to add prompt to or to create a new list
   *
   * @param {List[]} lists
   * @param {Prompt} prompt
   */
  showListSelectionModal(lists, prompt, onlyTeamLists = false) {
    let listSelectionModal = document.getElementById('listSelectionModal');

    // if modal does not exist, create it, add event listener on submit and append it to body
    if (!listSelectionModal) {
      listSelectionModal = document.createElement('div');
      listSelectionModal.id = 'listSelectionModal';

      if (onlyTeamLists) {
        listSelectionModal.addEventListener(
          'submit',
          this.handleListSelectionModalSubmit.bind(this, prompt)
        );
      } else {
        listSelectionModal.addEventListener(
          'submit',
          this.handleListSelectionModalSubmit.bind(this, undefined)
        );
      }

      document.body.appendChild(listSelectionModal);
    }

    listSelectionModal.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
        <div class="MARCI__absolute MARCI__bg-black/50 dark:MARCI__bg-black/80 MARCI__inset-0">
        </div>

        <div class="MARCI__fixed MARCI__inset-0 MARCI__overflow-y-auto">
          <div class="MARCI__flex MARCI__items-center MARCI__justify-center MARCI__min-h-full">
            <form>
              <div
                class="MARCI__align-center MARCI__bg-white dark:MARCI__bg-gray-900 dark:MARCI__text-gray-200 MARCI__inline-block MARCI__overflow-hidden sm:MARCI__rounded-lg MARCI__shadow-xl sm:MARCI__align-middle sm:MARCI__max-w-lg sm:MARCI__my-8 sm:MARCI__w-full MARCI__text-left MARCI__transform MARCI__transition-all"
                role="dialog" aria-modal="true" aria-labelledby="modal-headline">

                <div class="MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__px-4 MARCI__pt-5 MARCI__pb-4 sm:MARCI__p-6 sm:MARCI__pb-4 MARCI__w-96">

                  <input type="hidden" name="promptID" value="${sanitizeInput(
                    prompt.ID
                  )}">          

                  <h3 class="${css`h3`} MARCI__my-4">${
      onlyTeamLists ? 'Choose Team List to add to' : 'Choose a list'
    }</h3>

                  <label class="MARCI__block">Lists</label>
                  <select name="listID" class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full">
                    ${lists
                      .map((list) => {
                        if (
                          list.ListTypeNo === ListTypeNo.MARCI_VERIFIED ||
                          list.ListTypeNo === ListTypeNo.CUSTOM ||
                          list.HasWriteAccessForTeamMember(
                            this.Client.UserTeamM
                          )
                        ) {
                          const disabledFlag =
                            list.ListTypeNo == ListTypeNo.TEAM_CUSTOM &&
                            prompt.PromptTypeNo === PromptTypeNo.PRIVATE
                              ? 'disabled'
                              : '';

                          return `<option value="${sanitizeInput(
                            list.ID
                          )}" ${disabledFlag} ${
                            this.PromptTemplatesList === list.ID
                              ? 'selected'
                              : ''
                          }>${sanitizeInput(list.Comment)}${
                            list.ListTypeNo == ListTypeNo.TEAM_CUSTOM
                              ? ' (Team List)'
                              : ''
                          }</option>`;
                        }
                      })
                      .join('')}

                      <option disabled>_________</option>

                      ${
                        !lists.length
                          ? '<option value selected>-- No lists found, yet. Please create a new custom list first. --</option>'
                          : '<option value>-- Create a new list --</option>'
                      }
                  </select>
                  
                  <div id="createNewList" class="${
                    lists.length &&
                    (this.Lists.withType(ListTypeNo.CUSTOM) !== undefined ||
                      prompt.PromptTypeNo !== PromptTypeNo.PRIVATE)
                      ? 'MARCI__hidden'
                      : ''
                  }">
                    <h3 class="${css`h3`} MARCI__my-4 MARCI__mt-6">Create a new list</h3>
                    
                    <label class="MARCI__block">List Name</label>
                    <input type="text" name="listName" class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full" ${
                      !(
                        lists.length ||
                        (prompt.PromptTypeNo !== PromptTypeNo.PRIVATE &&
                          this.Lists.withType(ListTypeNo.CUSTOM) !== undefined)
                      )
                        ? 'required'
                        : ''
                    }>

                    ${
                      prompt.PromptTypeNo !== PromptTypeNo.PRIVATE &&
                      this.Client.UserQuota?.hasTeamsFeatureEnabled()
                        ? /*html*/ `
                        <label class="MARCI__text-sm MARCI__flex MARCI__items-center" id="savePromptForm-public-checkbox">
                          <input id="createNewListShareWithTeam" name="createNewListShareWithTeam" 
                            type="checkbox" class="MARCI__mr-2 dark:MARCI__bg-gray-850" 
                            onchange="MARCI.toggleCreateNewListSelectTeam();"
                            ${onlyTeamLists ? 'checked disabled' : ''}> 
                          Share with Team
                        </label>

                        <div id="createNewListSelectTeam" class="${
                          !onlyTeamLists ? 'MARCI__hidden' : ''
                        }">
                          <select id="createNewListSelectTeam" name="createNewListSelectTeam" class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full">
                            ${
                              this.Client.OwnTeamS?.length > 0
                                ? this.Client.OwnTeamS.map(
                                    (team) =>
                                      /*html*/ `<option value="${sanitizeInput(
                                        team.TeamID
                                      )}">${sanitizeInput(
                                        team.TeamName
                                      )}</option>`
                                  ).join('')
                                : /*html*/ `<option value="NEW">My First Team</option>`
                            }
                          </select>

                          ${
                            this.Client.OwnTeamS?.length > 0
                              ? /*html*/ `<a href="${AppTeamURL}" target="blank" class="MARCI__text-sm MARCI__text-gray-500 MARCI__underline">Manage My Teams</a>`
                              : ''
                          }
                        </div>
                        `
                        : ''
                    }
                  </div>

                  ${
                    this.Client.UserQuota?.hasTeamsFeatureEnabled() &&
                    prompt.PromptTypeNo === PromptTypeNo.PRIVATE &&
                    this.Lists.withType(ListTypeNo.TEAM_CUSTOM) !== undefined
                      ? /*html*/ `
                      <p class="MARCI__mt-4 MARCI__text-[10px]" id="privatePromptInTeamList">Private prompts cannot be shared in Team lists. Please update prompt to Team prompt before adding it to Team list.</p>
                      `
                      : ''
                  }

                </div>

                <div class="MARCI__bg-gray-200 dark:MARCI__bg-gray-850 MARCI__px-4 MARCI__py-3 MARCI__text-right">
                  <button type="button" class="MARCI__bg-gray-600 hover:MARCI__bg-gray-800 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white"
                          onclick="MARCI.hideModal('listSelectionModal')"> Cancel
                  </button>
                  <button type="submit" class="MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">Add to list</button>
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>
    `;

    // add event listener to show/hide "Create a new list" section
    const listIDSelect = listSelectionModal.querySelector(
      'select[name="listID"]'
    );

    listIDSelect.addEventListener('change', (e) => {
      const createNewListSection =
        listSelectionModal.querySelector('#createNewList');

      if (e.target.value === '') {
        createNewListSection.classList.remove('MARCI__hidden');
        return;
      }

      createNewListSection.classList.add('MARCI__hidden');
    });

    listSelectionModal.style = 'display: block;';

    // add event listener to close the modal on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideModal('listSelectionModal');
      }
    });
  },

  toggleCreateNewListSelectTeam(e) {
    const checkbox = document.querySelector('#createNewListShareWithTeam');
    const section = document.querySelector('#createNewListSelectTeam');

    if (checkbox.checked) {
      section.classList.remove('MARCI__hidden');
    } else {
      section.classList.add('MARCI__hidden');
    }
  },

  // Handle submit of list selection modal form and add prompt to list or create a new list and add prompt to it
  async handleListSelectionModalSubmit(promptToSave = undefined, e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const listID = formData.get('listID');
    const listName = formData.get('listName')?.trim();

    // no list selected and no list name entered
    if (!listID && !listName) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Please select a list or create a new one.'
      );
      return;
    }

    const shareWithTeamCheckbox = document.querySelector(
      '#createNewListShareWithTeam'
    );
    const shareWithTeam =
      shareWithTeamCheckbox && shareWithTeamCheckbox.checked;
    const forTeamID = formData.get('createNewListSelectTeam');

    if (!shareWithTeam && !listID) {
      if (!this.isAdminMode() && !this.Client.UserQuota.canUseCustomList()) {
        return;
      }
    }

    const promptID = formData.get('promptID');

    let list;

    try {
      // existing list - add prompt to it
      if (listID) {
        if (promptToSave) {
          await this.Client.savePrompt(promptToSave, listID);

          list = this.Lists.withID(listID);

          const creationTime = new Date();
          list.list.Items.push({
            Comment: '',
            CreationTime: creationTime.toISOString(),
            ItemOrder: 0,
            ItemStatusNo: ItemStatusNo.ACTIVE,
            ListID: listID,
            PromptID: promptID,
            RevisionTime: creationTime.toISOString(),
          });
        } else {
          list = this.Lists.withID(listID);

          if (
            !this.isAdminMode() &&
            !this.Client.UserQuota.canAddToCustomList(list)
          ) {
            return;
          }

          await list.add({ ID: promptID });
        }
      }
      // new team list - create it and add prompt to it
      else if (shareWithTeam) {
        if (!forTeamID) {
          this.showNotification(
            NotificationSeverity.ERROR,
            'Please select a team.'
          );
          return;
        }

        list = await this.Lists.create(
          this.Client,
          ListTypeNo.TEAM_CUSTOM,
          listName,
          {
            PromptID: promptID,
            Comment: '',
          },
          forTeamID
        );
      }
      // new list - create it and add prompt to it
      else {
        if (!this.Client.UserQuota.canCreateCustomList(this.Lists)) {
          return;
        }

        list = await this.Lists.create(
          this.Client,
          ListTypeNo.CUSTOM,
          listName,
          {
            PromptID: promptID,
            Comment: '',
          }
        );
      }
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not add to list. ${
          error instanceof Reaction ? error.message : ''
        }`
      );

      if (
        error instanceof Reaction &&
        error.ReactionNo === ReactionNo.RXN_MARCI_QUOTA_EXCEEDED
      ) {
        listID
          ? this.Client.UserQuota.listItemQuotaExceeded()
          : this.Client.UserQuota.listQuotaExceeded();
      }

      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      `Added to "${sanitizeInput(list.Comment)}" prompts list.`
    );

    this.hideModal('listSelectionModal');

    // re-insert the prompt templates section if it's a new list
    if (!listID || listID === this.PromptTemplatesList) {
      this.insertPromptTemplatesSection();
    }
  },

  /**
   * Show create list modal
   */
  showListCreateModal() {
    let listCreateModal = document.getElementById('listCreateModal');

    // if modal does not exist, create it, add event listener on submit and append it to body
    if (!listCreateModal) {
      listCreateModal = document.createElement('div');
      listCreateModal.id = 'listCreateModal';

      listCreateModal.addEventListener(
        'submit',
        this.handleListCreateModalSubmit.bind(this)
      );

      document.body.appendChild(listCreateModal);
    }

    listCreateModal.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
        <div class="MARCI__absolute MARCI__bg-black/50 dark:MARCI__bg-black/80 MARCI__inset-0">
        </div>

        <div class="MARCI__fixed MARCI__inset-0 MARCI__overflow-y-auto">
          <div class="MARCI__flex MARCI__items-center MARCI__justify-center MARCI__min-h-full">
            <form>
              <div
                class="MARCI__align-center MARCI__bg-white dark:MARCI__bg-gray-900 dark:MARCI__text-gray-200 MARCI__inline-block MARCI__overflow-hidden sm:MARCI__rounded-lg MARCI__shadow-xl sm:MARCI__align-middle sm:MARCI__max-w-lg sm:MARCI__my-8 sm:MARCI__w-full MARCI__text-left MARCI__transform MARCI__transition-all"
                role="dialog" aria-modal="true" aria-labelledby="modal-headline">

                <div class="MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__px-4 MARCI__pt-5 MARCI__pb-4 sm:MARCI__p-6 sm:MARCI__pb-4 MARCI__w-96">

                  <h3 class="${css`h3`} MARCI__my-4">Create a new list</h3>

                    <label class="MARCI__block">List Name</label>
                    <input type="text" name="listName" class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full" required>

                    ${
                      this.Client.UserQuota?.hasTeamsFeatureEnabled()
                        ? /*html*/ `
                        <label class="MARCI__text-sm MARCI__flex MARCI__items-center" id="savePromptForm-public-checkbox">
                          <input id="createNewListShareWithTeam" name="createNewListShareWithTeam" 
                            type="checkbox" class="MARCI__mr-2 dark:MARCI__bg-gray-850" 
                            onchange="MARCI.toggleCreateNewListSelectTeam();"> 
                          Share with Team
                        </label>

                        <div id="createNewListSelectTeam" class="MARCI__hidden">
                          <select id="createNewListSelectTeam" name="createNewListSelectTeam" class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full">
                            ${
                              this.Client.OwnTeamS?.length > 0
                                ? this.Client.OwnTeamS.map(
                                    (team) =>
                                      /*html*/ `<option value="${sanitizeInput(
                                        team.TeamID
                                      )}">${sanitizeInput(
                                        team.TeamName
                                      )}</option>`
                                  ).join('')
                                : /*html*/ `<option value="NEW">My First Team</option>`
                            }
                          </select>

                          ${
                            this.Client.OwnTeamS?.length > 0
                              ? /*html*/ `<a href="${AppTeamURL}" target="blank" class="MARCI__text-sm MARCI__text-gray-500 MARCI__underline">Manage My Teams</a>`
                              : ''
                          }
                        </div>
                        `
                        : ''
                    }
                </div>

                <div class="MARCI__bg-gray-200 dark:MARCI__bg-gray-850 MARCI__px-4 MARCI__py-3 MARCI__text-right">
                  <button type="button" class="MARCI__bg-gray-600 hover:MARCI__bg-gray-800 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white"
                          onclick="MARCI.hideModal('listCreateModal')"> Cancel
                  </button>
                  <button type="submit" class="MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">Create list</button>
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>
    `;

    listCreateModal.style = 'display: block;';

    // add event listener to close the modal on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideModal('listCreateModal');
      }
    });
  },

  // Handle submit of list create modal form and create a new list
  async handleListCreateModalSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const listName = formData.get('listName')?.trim();

    // no list name entered
    if (!listName) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Please specify list name.'
      );
      return;
    }

    const shareWithTeamCheckbox = document.querySelector(
      '#createNewListShareWithTeam'
    );
    const shareWithTeam =
      shareWithTeamCheckbox && shareWithTeamCheckbox.checked;
    const forTeamID = formData.get('createNewListSelectTeam');
    if (!shareWithTeam) {
      if (!this.isAdminMode() && !this.Client.UserQuota.canUseCustomList()) {
        return;
      }
    }

    let list;

    try {
      if (shareWithTeam) {
        if (!forTeamID) {
          this.showNotification(
            NotificationSeverity.ERROR,
            'Please select a team.'
          );
          return;
        }

        list = await this.Lists.create(
          this.Client,
          ListTypeNo.TEAM_CUSTOM,
          listName,
          {},
          forTeamID
        );

        // init list with empty Items
        list.list.Items = [];
      }
      // new list - create it and add prompt to it
      else {
        if (!this.Client.UserQuota.canCreateCustomList(this.Lists)) {
          return;
        }

        list = await this.Lists.create(
          this.Client,
          ListTypeNo.CUSTOM,
          listName,
          {}
        );

        // init list with empty Items
        list.list.Items = [];
      }
    } catch (error) {
      if (
        error instanceof Reaction &&
        error.ReactionNo === ReactionNo.RXN_MARCI_QUOTA_EXCEEDED
      ) {
        this.Client.UserQuota.listQuotaExceeded();
      } else {
        this.showNotification(
          NotificationSeverity.ERROR,
          `Could not create list. ${
            error instanceof Reaction ? error.message : ''
          }`
        );
      }

      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      `Created "${sanitizeInput(list.Comment)}" prompts list.`
    );

    this.hideModal('listCreateModal');

    this.insertPromptTemplatesSection();
  },

  /**
   * Edit a custom list's name, then re-insert the prompt templates section
   *
   * @param {List['ID]} listID
   */
  async editCustomList(listID) {
    const list = this.Lists.withID(listID);

    // Ask for new name
    const listName = prompt(
      'Please enter a new name for the list:',
      sanitizeInput(list.Comment)
    );

    // Abort if no name was entered
    if (!listName) {
      return;
    }

    try {
      // Update the list using the API and update it in the local list of lists
      await list.update(listName);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not update list. ${
          error instanceof Reaction ? error.message : ''
        }`
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      `Updated prompts list "${sanitizeInput(list.Comment)}".`
    );

    this.insertPromptTemplatesSection();
  },

  /**
   * Delete a custom list after confirmation, then re-insert the prompt templates section
   *
   * @param {List['ID]} listID
   */
  async deleteCustomList(listID) {
    const list = this.Lists.withID(listID);

    // Ask for confirmation
    if (
      !confirm(
        `Are you sure you want to delete list "${sanitizeInput(list.Comment)}"?`
      )
    ) {
      return;
    }

    try {
      // delete the list using the API and remove it from the local list of lists
      await this.Lists.delete(list);
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        `Could not delete list. ${
          error instanceof Reaction ? error.message : ''
        }`
      );
      return;
    }

    this.showNotification(
      NotificationSeverity.SUCCESS,
      `Deleted list "${sanitizeInput(list.Comment)}".`
    );

    // reset the list of lists and the selected list type after deleting a list
    this.PromptTemplatesList = null;

    this.PromptTemplatesType = PromptTemplatesType.PUBLIC;

    this.insertPromptTemplatesSection();
  },

  // Explain how to use the "Favorites" prompts list in case of no prompts in the list
  howToUseFavoriteList() {
    this.showNotification(
      NotificationSeverity.INFO,
      'To add a prompt to your "Favorites" prompts list, click the star icon next to the prompt title.'
    );
  },

  // Explain how to use the "Hidden" prompts list in case of no prompts in the list
  howToUseHiddenList() {
    this.showNotification(
      NotificationSeverity.INFO,
      'To add prompt to your "Hidden" prompts list and hide it, click the cross icon next to the prompt title.'
    );
  },

  /**
   * Check if prompt is in the "MARCI Verified Prompts" list
   *
   * @param {number} idx
   * @returns {Promise<boolean>}
   */
  async isVerified(idx) {
    const list = this.Lists.getMARCIVerified();

    // no MARCI Verified list
    if (!list) {
      return false;
    }

    // cannot use MARCI Verified list
    if (!this.Client.UserQuota.canUseMARCIVerifiedList(false)) {
      return false;
    }

    const prompt = (await this.getCurrentPromptTemplates())[idx];

    if (!prompt) {
      // Gizmo starter prompt
      return false;
    }

    return await list.has(prompt);
  },

  // Show MARCI Account modal (connect/disconnect MARCI account, current MARCI Plan level and OpenAI account)
  showAccountModal() {
    let accountModal = document.getElementById('MARCI__accountModal');

    // if modal does not exist, create it, add event listener on submit and append it to body
    if (!accountModal) {
      accountModal = document.createElement('div');
      accountModal.id = 'MARCI__accountModal';

      document.body.appendChild(accountModal);
    }

    accountModal.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
        <div class="MARCI__absolute MARCI__bg-black/50 dark:MARCI__bg-black/80 MARCI__inset-0">
        </div>

        <div class="MARCI__fixed MARCI__inset-0 MARCI__overflow-y-auto">
          <div class="MARCI__flex MARCI__items-center MARCI__justify-center MARCI__min-h-full">

            <div
              class="MARCI__align-center MARCI__bg-white dark:MARCI__bg-gray-900 dark:MARCI__text-gray-200 MARCI__inline-block MARCI__overflow-hidden sm:MARCI__rounded-lg MARCI__shadow-xl sm:MARCI__align-middle sm:MARCI__max-w-lg sm:MARCI__my-8 sm:MARCI__w-full MARCI__text-left MARCI__transform MARCI__transition-all"
              role="dialog" aria-modal="true" aria-labelledby="modal-headline">

                <div class="MARCI__border-b dark:MARCI__border-gray-700 MARCI__px-6 MARCI__flex MARCI__w-full MARCI__flex-row MARCI__items-center MARCI__justify-between">
                  <h2 class="MARCI__py-3 MARCI__text-lg MARCI__font-medium MARCI__leading-6 MARCI__text-gray-900 dark:MARCI__text-gray-200">
                    Your MARCI Account
                  </h2>
                  <button class="MARCI__text-gray-700 MARCI__opacity-50 MARCI__transition hover:MARCI__opacity-75 dark:MARCI__text-white MARCI__pl-2"
                    onclick="MARCI.hideModal('MARCI__accountModal')">
                    ${svg('CrossLarge')}
                  </button>
                </div>                
          
                <div class="MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__p-4 MARCI__px-6 MARCI__overflow-y-auto">

                  <dl class="MARCI__text-sm">
                    <div class="MARCI__flex MARCI__py-4 MARCI__flex-col sm:MARCI__flex-row MARCI__border-b dark:MARCI__border-gray-700">
                      <dt class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__font-medium">MARCI Account</dt>
                      <dd class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__justify-between">
                        <div style="overflow-wrap: anywhere">
                          ${
                            this.Client.User.IsLinked
                              ? `${sanitizeInput(
                                  this.Client.AppUser.UserEmail
                                )}`
                              : 'Not Connected with MARCI Account'
                          }
                        </div>
                        ${
                          this.Client.User.IsLinked
                            ? /*html*/ `
                              <a class="MARCI__inline-block MARCI__mt-4 MARCI__bg-white MARCI__border MARCI__border-green-500 hover:MARCI__border-green-700 MARCI__text-green-500 hover:MARCI__text-green-700 MARCI__py-2 MARCI__px-3 MARCI__rounded dark:MARCI__bg-gray-900 dark:hover:MARCI__text-green-400 dark:hover:MARCI__border-green-400" href="${AppAccountURL}" target="_blank">
                                View Account
                              </a>
                              <button class="MARCI__block sm:MARCI__inline-block sm:MARCI__ml-2 MARCI__mt-4 MARCI__bg-white MARCI__border MARCI__border-red-500 hover:MARCI__border-red-700 MARCI__text-red-500 hover:MARCI__text-red-700 MARCI__py-2 MARCI__px-3 MARCI__rounded dark:MARCI__bg-gray-900 dark:hover:MARCI__text-red-400 dark:hover:MARCI__border-red-400" onclick="MARCI.disconnectAccount()">
                                Disconnect
                              </button>
                            `
                            : /*html*/ `
                              <a class="MARCI__inline-block MARCI__mt-4 MARCI__bg-white MARCI__border MARCI__border-green-500 hover:MARCI__border-green-700 MARCI__text-green-500 hover:MARCI__text-green-700 MARCI__py-2 MARCI__px-3 MARCI__rounded dark:MARCI__bg-gray-900 dark:hover:MARCI__text-green-400 dark:hover:MARCI__border-green-400" href="${AppAccountURL}?action=connect" target="_blank">
                                Connect
                              </a>
                            `
                        }
                      </dd>
                    </div>

                    <div class="MARCI__flex MARCI__py-4 MARCI__flex-col sm:MARCI__flex-row MARCI__border-b dark:MARCI__border-gray-700">
                      <dt class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__font-medium">OpenAI Account</dt>
                      <dd class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__justify-between">
                        <div>
                           ${sanitizeInput(getUserOpenAI()?.email || 'Unknown')}
                        </div>
                      </dd>
                    </div>

                    <div class="MARCI__flex MARCI__py-4 MARCI__flex-col sm:MARCI__flex-row MARCI__border-b dark:MARCI__border-gray-700">
                      <dt class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__font-medium">MARCI Teams</dt>
                      <dd class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__justify-between">
                          <a class="MARCI__inline-block MARCI__mt-1 MARCI__bg-white MARCI__border MARCI__border-green-500 hover:MARCI__border-green-700 MARCI__text-green-500 hover:MARCI__text-green-700 MARCI__py-2 MARCI__px-3 MARCI__rounded dark:MARCI__bg-gray-900 dark:hover:MARCI__text-green-400 dark:hover:MARCI__border-green-400" href="${AppTeamURL}" target="_blank">
                            Manage My Teams
                          </a>
                      </dd>
                    </div>

                    <div class="MARCI__flex MARCI__py-4 MARCI__flex-col sm:MARCI__flex-row MARCI__border-b dark:MARCI__border-gray-700">
                      <dt class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__font-medium">MARCI Plan Level</dt>
                      <dd class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__justify-between">
                        <div>
                          ${this.Client.UserQuota.getMaxPlanLevelLabel()}
                        </div>

                        <a class="MARCI__inline-block MARCI__mt-4 MARCI__bg-white MARCI__border MARCI__border-green-500 hover:MARCI__border-green-700 MARCI__text-green-500 hover:MARCI__text-green-700 MARCI__py-2 MARCI__px-3 MARCI__rounded dark:MARCI__bg-gray-900 dark:hover:MARCI__text-green-400 dark:hover:MARCI__border-green-400" href="${AppPricingURL}" target="_blank">
                          Upgrade
                        </a>
                      </dd>
                    </div>                    

                    <div class="MARCI__flex MARCI__py-4 MARCI__flex-col sm:MARCI__flex-row MARCI__border-b dark:MARCI__border-gray-700">
                      <dt class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__font-medium">My Profile Info</dt>
                      <dd class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__justify-between">
                        <a class="MARCI__inline-block MARCI__bg-white MARCI__border MARCI__border-green-500 hover:MARCI__border-green-700 MARCI__text-green-500 hover:MARCI__text-green-700 MARCI__py-2 MARCI__px-3 MARCI__rounded dark:MARCI__bg-gray-900 dark:hover:MARCI__text-green-400 dark:hover:MARCI__border-green-400" href="${AppAccountURL}#myprofileinfo" target="_blank">
                          Manage My Profile Info
                        </a>
                      </dd>
                    </div>

                    <div class="MARCI__flex MARCI__pt-4 MARCI__flex-col sm:MARCI__flex-row">
                      <dt class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__font-medium">Settings</dt>
                      <dd class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__justify-between">
                        <label class="MARCI__text-sm MARCI__flex MARCI__items-center" id="savePromptForm-public-checkbox">
                          <input id="accountModal-hideWatermark" type="checkbox" class="MARCI__mr-2 dark:MARCI__bg-gray-850" 
                            onchange="MARCI.toggleHideMARCIWatermark()" ${
                              this.getHideWatermark() ? 'checked' : ''
                            }> 
                          Hide MARCI Watermark
                        </label>
                      </dd>
                    </div>

                    <div class="MARCI__flex MARCI__pb-4 MARCI__flex-col sm:MARCI__flex-row">
                      <dt class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__font-medium"></dt>
                      <dd class="MARCI__w-full sm:MARCI__w-1/2 MARCI__py-2 MARCI__justify-between">
                        <label class="MARCI__text-sm MARCI__flex MARCI__items-center">
                          <input id="accountModal-newPromptDefaultText" type="checkbox" class="MARCI__mr-2 dark:MARCI__bg-gray-850" 
                            onchange="MARCI.toggleNewPromptDefaultText()" ${
                              this.getNewPromptDefaultText() === 'true'
                                ? 'checked'
                                : ''
                            }> 
                          Enable default text for new prompts
                        </label>
                      </dd>
                    </div>

                  </dl>

                </div>
              </div>
          </div>
        </div>
      </div>
    `;

    accountModal.style = 'display: block;';

    // add event listener to close the modal on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideModal('MARCI__accountModal');
      }
    });
  },

  // Open app to connect MARCI account
  connectAccount() {
    // send wake up message to background script to make sure it's ready to receive messages
    window.postMessage({
      from: 'MARCI',
      data: { type: 'MARCI.wakeUp' },
    });

    // open new window
    window.open(`${AppAccountURL}?action=connect`, '_blank');
  },

  // Disconnect the user's MARCI account
  async disconnectAccount() {
    if (!confirm('Are you sure you want to disconnect your MARCI account?')) {
      return;
    }

    // unlink the MARCI account and user
    try {
      await this.Client.unlinkUser();
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Could not disconnect your MARCI account, please try again later.',
        false
      );

      return;
    }

    try {
      // refresh MARCI user profile and quota
      await this.Client.checkUserStatus();

      // show notification if connection status is not updated, yet
      if (this.Client.User.IsLinked) {
        this.showNotification(
          NotificationSeverity.INFO,
          'Disconnecting your MARCI account, please wait...',
          false
        );
      }

      // wait for CheckUserStatus to update the connection status, quotas and user profile
      while (this.Client.User.IsLinked) {
        // poll checkUserStatus every 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));

        await this.Client.checkUserStatus();
      }
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Could not get user status, please try again later.',
        false
      );

      return;
    }

    // hide the modal
    this.hideModal('MARCI__accountModal');

    // show notification
    this.showNotification(
      NotificationSeverity.SUCCESS,
      'Your MARCI account has been disconnected successfully.',
      false
    );

    // reset App User
    this.Client.AppUser = null;

    // refresh the prompt templates section to show link to login
    await this.insertPromptTemplatesSection();
  },

  // Get the user's profile message from localStorage
  getHideWatermark() {
    if (!this.Client.UserQuota.canUseHideWatermark(false)) {
      return '';
    }

    return localStorage.getItem(hideWatermarkKey) || '';
  },

  toggleHideMARCIWatermark() {
    const checkbox = document.getElementById('accountModal-hideWatermark');

    // check if user can use hide watermark
    if (!this.Client.UserQuota.canUseHideWatermark()) {
      checkbox.checked = false;
      return;
    }

    // update local storage
    try {
      localStorage.setItem(hideWatermarkKey, checkbox.checked ? 'true' : '');
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Could not update Hide MARCI Watermark setting, please try again later.',
        false
      );

      checkbox.checked = false;
      return;
    }
  },

  // Get the user's setting for new prompt default text from localStorage
  getNewPromptDefaultText() {
    return localStorage.getItem(newPromptDefaultTextKey) || 'true';
  },

  toggleNewPromptDefaultText() {
    const checkbox = document.getElementById(
      'accountModal-newPromptDefaultText'
    );

    // update local storage
    try {
      localStorage.setItem(
        newPromptDefaultTextKey,
        checkbox.checked ? 'true' : 'false'
      );
    } catch (error) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Could not update new prompt default text setting, please try again later.',
        false
      );

      checkbox.checked = false;
      return;
    }
  },

  // Reset the option to include the user's profile message
  resetIncludeMyProfileInfo() {
    // reset the flag
    this.IncludeMyProfileMessage = false;

    // uncheck the checkbox if it exists
    const checkbox = document.querySelector('input[name="includeMyProfile"]');
    if (checkbox) {
      checkbox.checked = false;
    }
  },

  // Prefill prompt input with the prompt from URL or message
  prefillPromptInput() {
    // Get the prompt from URL
    const prompt =
      this.PrefillPrompt ||
      new URLSearchParams(window.location.search).get(queryParamPrompt);

    // If prompt is empty return
    if (!prompt) {
      return;
    }

    // Reset the prefill prompt
    this.PrefillPrompt = null;

    // Get the prompt textarea input
    const textarea = document.querySelector(
      this.Config.getSelectorConfig().PromptTextarea
    );

    // If there is no textarea, skip
    if (!textarea) {
      console.error('prefillPromptInput: No textarea found');
      return;
    }

    // Add the continue action prompt to the textarea
    textarea.tagName === 'TEXTAREA'
      ? (textarea.value = prompt)
      : (textarea.innerText = prompt);

    // Dispatch the input event to trigger the event listeners and enable the "Submit" button
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  },

  /**
   * submitNewGPT asks for GPT URL first, then will parse Gizmo ID from URL,
   * call backend API to fetch GPT config and submit new GPT with config via MARCI API
   */
  async submitNewGPT() {
    // Ask for GPT URL
    const gptURL = prompt(
      'Please enter the GPT URL (e.g. https://chat.openai.com/g/g-dq9i42tRO-chatxgb):'
    );

    // Abort if no URL was entered
    if (!gptURL) {
      return;
    }

    // Parse GPT ID from URL
    const gptID = gptURL.split('/').pop();

    // Abort if no GPT ID was parsed
    if (!gptID) {
      this.showNotification(
        NotificationSeverity.ERROR,
        'Could not parse GPT ID from URL.'
      );
      return;
    }

    this.storeGPT(gptID);
  },

  /**
   * storeGPT calls backend API to fetch GPT config and submits new GPT with config via MARCI API
   *
   * @param {string} gptID
   * @param {boolean} notify
   */
  async storeGPT(gptID, notify = true) {
    let gptConfig;

    try {
      // Fetch GPT config from backend API
      const response = await fetch(`/backend-api/gizmos/${gptID}`, {
        headers: {
          Authorization: `Bearer ${this.Client.AccessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Could not fetch GPT config from backend API.');
      }

      gptConfig = await response.json();
    } catch (error) {
      console.error(error);

      notify &&
        this.showNotification(
          NotificationSeverity.ERROR,
          'Could not fetch GPT config from backend API. Please try to reload the page and try again.'
        );
      return;
    }

    // Abort if no GPT config was fetched
    if (!gptConfig) {
      notify &&
        this.showNotification(
          NotificationSeverity.ERROR,
          'Could not fetch GPT config from backend API.'
        );
      return;
    }

    // Submit new GPT with config via API
    try {
      await this.Client.submitNewGizmo(gptConfig);
    } catch (error) {
      notify &&
        this.showNotification(
          NotificationSeverity.ERROR,
          'Could not submit new GPT via API.'
        );
      return;
    }

    // Show thanks notification
    notify &&
      this.showNotification(
        NotificationSeverity.SUCCESS,
        'Thank you for submitting a new GPT!'
      );
  },

  // selectGizmo selects a GPT from the list of GPTs using GizmoCode and tracks the event
  async selectGizmo(GizmoCode) {
    // Abort if no GizmoCode was passed
    if (!GizmoCode) {
      return;
    }

    // Track the event
    try {
      await this.Client.useGizmo(GizmoCode, GizmoVoteTypeNo.VIEW);
    } catch (error) {
      console.error('Could not track gizmo view event', error);
    }

    // Navigate
    window.location = `/g/${sanitizeInput(GizmoCode)}`;
  },

  /**
   * Get suffix for model status
   * @param {Model?} model
   */
  getModelStatusSuffix(model) {
    if (!model) {
      return '';
    } else if (model?.StatusNo == ModelStatusNo.ACTIVE) {
      return '';
    } else if (model?.StatusNo == ModelStatusNo.UNSUPPORTED) {
      return ' (Unsupported by this platform)';
    } else {
      return ' (Deprecated)';
    }
  },

  /**
   * Modify the conversation messages to not show the prompt template source
   *
   * @param {(() => Promise<Response>)} fetchConversationMessages
   * @returns {Promise<Response>}
   */
  async modifyConversationMessages(fetchConversationMessages) {
    try {
      // Get the chat messages (raw fetch API call)
      const response = await fetchConversationMessages();

      // If the response is not ok, return the response
      if (!response.ok) {
        return Promise.resolve(response);
      }

      // Intercept the fetch messages response (JSON)
      let conversation = await response.json();

      // No conversation chat messages
      if (!conversation?.mapping) {
        console.error('No chat messages found in conversation:', conversation);

        return new Promise((resolve) => {
          resolve({
            ...response,
            text: () => Promise.resolve(JSON.stringify(conversation)),
            json: () => Promise.resolve(conversation),
          });
        });
      }

      // console.log('Conversation:', conversation);

      const selectorConfig = this.Config.getSelectorConfig();

      // Find the first user message
      const firstUserMessage = document.querySelector(
        selectorConfig.FirstPrompt
      )?.parentElement;

      if (!firstUserMessage) {
        return new Promise((resolve) => {
          resolve({
            ...response,
            text: () => Promise.resolve(JSON.stringify(conversation)),
            json: () => Promise.resolve(conversation),
          });
        });
      }

      const reactFiber = Object.keys(firstUserMessage).find((key) =>
        key?.includes(selectorConfig.ReactFiberPropertyKey)
      );

      const userMessages =
        firstUserMessage?.[reactFiber]?.return?.memoizedProps?.messages;

      // console.log('User messages:', userMessages);

      userMessages?.forEach((message) => {
        // console.log('User message:', message);

        if (!conversation.mapping[message.message.id]) {
          console.error(
            'No conversation message found for user message:',
            message
          );
          return;
        }

        // console.log('Replacing message:', {
        //   original: conversation.mapping[message.message.id].message.content,
        //   replacement: message.message.content,
        // });

        conversation.mapping[message.message.id].message.content =
          message.message.content;
      });

      // Return new Promise with modified response
      return new Promise((resolve) => {
        resolve({
          ...response,
          text: () => Promise.resolve(JSON.stringify(conversation)),
          json: () => Promise.resolve(conversation),
        });
      });
    } catch (error) {
      console.error('Error in modifyConversationMessages:', error);

      return fetchConversationMessages();
    }
  },
};

window.MARCI.init();
