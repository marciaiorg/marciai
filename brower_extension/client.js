import { APIEndpoint, NewAPIEndpoint, APIEndpointAPP } from './config.js';
import { VERSION } from './version.js';

/* eslint-disable no-unused-vars */
import {
  SystemNo,
  VoteTypeNo,
  SortModeNo,
  FeedbackTypeNo,
  MessageVoteTypeNo,
  UsageTypeNo,
  MessageSeverityNo,
  UserStatusNo,
  UserLevelNo,
  SubPromptTypeNo,
  ListTypeNo,
  ListStatusNo,
  ItemStatusNo,
  MemberRoleNo,
  LicenseWarningLevelNo,
  GizmoVoteTypeNo,
} from './enums.js';
/* eslint-enable */

import { UserQuota } from './quota.js';

import { Reaction } from './rxn.js';

import { getUserOpenAI } from './utils.js';

/** @typedef {{MessageID: string, MessageGroupNo: MessageGroupNo, MessageSeverityNo: MessageSeverityNo, MessageStatusNo: MessageStatusNo, MessageSubject: string, MessageBodyHTML: string, OnlyOperatorERID: string, OnlySystemNo: SystemNo, ExpiryTime: string, CreationTime: string}} Message */

/** @typedef {{OperatorERID: string, SystemNo: SystemNo, UserEmail: string, FullName: string, UserStatusNo: UserStatusNo, UserLevelNo: UserLevelNo, UserFootprint: string, MaxNewPublicPromptsAllowed: number, MaxNewPrivatePromptsAllowed: number, IsLinked: boolean, FeatureBitset: number, LicenseWarning: UserLicenseWarning}} User */

/** @typedef {{UserEmail: string, FullName: string, UserERID: string}} AppUser */

/** @typedef {{AccessToken: string, RefreshToken: string}} Tokens */

/** @typedef {{MaxPrivateListItems: number, MaxPromptPublicUpcoming: number, TotalCustomContinue: number, TotalCustomStyles: number, TotalCustomTones: number, TotalPrivateLists: number, TotalPromptStorePrivate: number, MaxLevel: number, QuotaPromptSendPerDayMARCI: number, QuotaPromptSendPerDayMARCIblocking: number, QuotaPromptSendPerDayNONMARCI: number, QuotaPromptSendPerDayNONMARCIblocking: number, QuotaPromptBlockingTime: number}} Quota */

/** @typedef {{TypeNo: SubPromptTypeNo, PromptID: string, Label: String, Prompt: String, Description: String, ItemOrder: number}} SubPrompt */

/** @typedef {{Comment: string, CreationTime: string, ItemOrder: number, ItemStatusNo: ItemStatusNo, ListID: string, PromptID: string, RevisionTime: string}} ListItem */

/** @typedef {{PromptID: ListItem['PromptID'], Comment: ListItem['Comment']}} FirstListItem */

/** @typedef {{ID: string, Comment: string, CreationTime: string, ForTeamID: string, Items?: ListItem[], ListOrder: number, ListStatusNo: ListStatusNo, ListTypeNo: ListTypeNo, OwnList: boolean, RevisionTime: string}} List */

/** @typedef {{TeamID: string, MemberRoleNo: MemberRoleNo, TeamName: string, TeamDescription: string}} UserTeam */

/** @typedef {Map<String, UserTeam>} UserTeamM */

/** @typedef {{Message: string, WarningLevelNo: LicenseWarningLevelNo}} UserLicenseWarning */

/**
 * @typedef {object} MARCIClient
 * @property {string} APIEndpoint
 * @property {string} NewAPIEndpoint
 * @property {User} User
 * @property {string} AccessToken
 * @property {UserQuota} UserQuota
 * @property {UserTeamM} UserTeamM
 * @property {UserTeam[]} OwnTeamS    // Team where user is owner or admin
 * @property {AppUser} AppUser
 * @property {SubPrompt[]} AccountSubPrompts
 * @property {() => Promise<void>} init
 * @property {() => Promise<void>} checkUserStatus
 * @property {(prompt: import('./inject.js').Prompt) => Promise<import('./inject.js').Prompt>} savePrompt
 * @property {(PromptID: string) => Promise<import('./inject.js').Prompt>} getPrompt
 * @property {(PromptID: string, Vote: 1|-1) => Promise<Response>} voteForPrompt
 * @property {(PromptID: string, FeedbackTypeNo: FeedbackTypeNo, FeedbackText: string, FeedbackContact: string) => Promise<Response>} reportPrompt
 * @property {(PromptID: string, UsageTypeNo?: UsageTypeNo.CLICK) => Promise<Response>} usePrompt
 * @property {(UserPrompt: string, PromptPrepared: string, Model: string, VariableNameS: string[], VariableValueS: string[], PromptID?: import('./inject.js').Prompt['ID']) => Promise<{Prompt: string}>} augmentPrompt
 * @property {(PromptID: string) => Promise<void>} deletePrompt
 * @property {(Topic: string, SortModeNo?: SortModeNo.TOP_VOTES, Limit?: number, Offset?: number) => Promise<Prompt[]>} getPrompts
 * @property {(Topic: string) => Promise<Message[]>} getMessages
 * @property {(MessageID: string, VoteTypeNo: MessageVoteTypeNo) => Promise<Response>} voteForMessage
 * @property {(MessageID: string) => Promise<Response>} confirmMessage
 * @property {() => void} resetTokens
 * @property {(tokens: Tokens) => void} storeTokens
 * @property {() => Tokens} getTokens
 * @property {(url: string, options: RequestInit) => Promise<Response>} fetchWithToken
 * @property {(refreshToken: string) => Promise<void>} refreshToken
 * @property {() => Promise<void>} unlinkUser
 * @property {() => Promise<boolean>} linkUser
 * @property {(hidden?: boolean) => Promise<List[]>} getLists
 * @property {(ListID: List['ID']) => Promise<List>} getListDetails
 * @property {() => Promise<List[]>} getAllListsWithDetails
 * @property {(TypeNo: ListTypeNo, Comment?: string, FirstItem?: FirstListItem) => Promise<List>} createList
 * @property {(List: List) => Promise<List>} updateList
 * @property {(ListID: List['ID'], ListTypeNo: List['ListTypeNo'], ForTeamID?: List['ForTeamID']) => Promise<void>} deleteList
 * @property {(ListID: string, PromptID: string) => Promise<ListItem>} addToList
 * @property {(ListID: List['ID'], PromptID: import('./inject.js').Prompt['ID']) => Promise<void>} removeFromList
 * @property {(myProfileInfo: string) => Promise<SubPrompt>} createMyProfileInfo
 * @property {(SortModeNo: SortModeNo) => Promise<Gizmo[]>} getGizmos
 * @property {(GizmoCode: string, GizmoVoteTypeNo: GizmoVoteTypeNo, GizmoConfig?: Object) => Promise<void>} useGizmo
 * @property {(GizmoCode: string, GizmoVoteTypeNo: GizmoVoteTypeNo, Vote: 1|-1) => Promise<void>} voteForGizmo
 * @property {(GizmoConfig: Object) => Promise<void>} submitNewGizmo
 * @property {() => Promise<import('./referrals.js').ReferralOffer>} fetchReferralOffer
 * @property {() => Promise<import('./referrals.js').ReferralCode>} fetchReferralCode
 * @property {(response: Response) => Promise<any>} handleResponse
 */

/** @type {MARCIClient} */
const MARCIClient = {
  APIEndpoint,
  NewAPIEndpoint,

  /** @type {User} */
  User: null,

  AccessToken: null,

  /** @type {UserQuota} */
  UserQuota: null,

  /** @type {AppUser} */
  AppUser: null,

  /** @type {SubPrompt[]} */
  AccountSubPrompts: [],

  /**
   * Extends fetch request with X-MARCI-Version header
   */
  fetchExtended(url, options) {
    if (!options) {
      options = {};
    }

    if (!options.headers) {
      options.headers = {};
    }

    // MarciAI_change: dont need to send version to MARCI API
    // options.headers['X-MARCI-Version'] = VERSION;

    return fetch(url, options);
  },

  // fetch the user profile from ChatGPT session API endpoint
  async init() {
    const UserFootprint = '';

    return (
      fetch('/api/auth/session')
        .then(this.handleResponse)
        // set the user object
        .then(async (res) => {
          // Use the user ID from the ChatGPT session API response if available,
          // otherwise use the user ID from the page props (anonymous user ID)
          let OperatorERID = res?.user?.id || getUserOpenAI()?.id;

          // If OperatorERID is still not available and path is empty (homepage), try to fetch it from /backend-anon/me
          if (!OperatorERID && window.location.pathname === '/') {
            try {
              const anonResponse = await fetch('/backend-anon/me');
              const anonData = await anonResponse.json();

              OperatorERID = anonData.id;
            } catch (error) {
              console.error('Error fetching anonymous user ID:', error);
            }
          }

          if (!OperatorERID) {
            throw new Error('OperatorERID is missing.');
          }

          this.User = {
            // Send the anonymous, not identifiable OpenAI hashed user ID to MARCI to link the user to his own prompts
            OperatorERID: OperatorERID,
            SystemNo: SystemNo.OPENAI,
            // So far no reason to send email and name to MARCI. This may change in the future, but needs consent from the user.
            // UserEmail: res.user.UserEmail,
            //FullName: res.user.FullName,
            UserStatusNo: UserStatusNo.UNKNOWN,
            UserLevelNo: UserLevelNo.UNKNOWN,
            UserFootprint,
            MaxNewPrivatePromptsAllowed: 0,
            MaxNewPublicPromptsAllowed: 0,
            IsLinked: false,
          };

          this.AccessToken = res?.accessToken;

          // No access token is available in the ChatGPT session API response for anonymous users
          if (!this.AccessToken) {
            console.warn('No access token found');
          }
        })
        // check user status
        .then(() => this.checkUserStatus())
    );
  },

  // check the user status using MARCI API endpoint
  checkUserStatus() {
    if (!this.User) {
      return;
    }

    return (
      this.fetchExtended(
        `${this.NewAPIEndpoint}/Users/Status?OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}&UserFootprint=${this.User.UserFootprint}`
      )
        .then(this.handleResponse)
        // set the user status
        .then((res) => {
          if (!Object.prototype.hasOwnProperty.call(res, 'UserStatusNo')) {
            throw new Error(
              'User status response is missing UserStatusNo property.'
            );
          }

          this.User.UserStatusNo = res.UserStatusNo;

          if (Object.prototype.hasOwnProperty.call(res, 'FeatureBitset')) {
            this.User.FeatureBitset = res.FeatureBitset;
          } else {
            this.User.FeatureBitset = 0;
          }

          if (Object.prototype.hasOwnProperty.call(res, 'UserLevelNo')) {
            this.User.UserLevelNo = res.UserLevelNo;
          }

          if (
            Object.prototype.hasOwnProperty.call(
              res,
              'MaxNewPrivatePromptsAllowed'
            )
          ) {
            this.User.MaxNewPrivatePromptsAllowed =
              res.MaxNewPrivatePromptsAllowed;
          }

          if (
            Object.prototype.hasOwnProperty.call(
              res,
              'MaxNewPublicPromptsAllowed'
            )
          ) {
            this.User.MaxNewPublicPromptsAllowed =
              res.MaxNewPublicPromptsAllowed;
          }

          if (Object.prototype.hasOwnProperty.call(res, 'IsLinked')) {
            this.User.IsLinked = res.IsLinked;
          }

          // has AccountSubPrompts and it's an array
          if (
            Object.prototype.hasOwnProperty.call(res, 'AccountSubPrompts') &&
            Array.isArray(res.AccountSubPrompts)
          ) {
            this.AccountSubPrompts = res.AccountSubPrompts;
          }

          // has Quota and it's an object
          if (
            Object.prototype.hasOwnProperty.call(res, 'Quota') &&
            typeof res.Quota === 'object'
          ) {
            this.UserQuota = new UserQuota(this.User, res.Quota);
          }

          if (
            this.UserQuota?.hasTeamsFeatureEnabled() &&
            Object.prototype.hasOwnProperty.call(res, 'TeamS') &&
            typeof res.TeamS === 'object' &&
            res.TeamS !== null
          ) {
            this.OwnTeamS = res.TeamS.filter(
              (team) =>
                team.MemberRoleNo === MemberRoleNo.OWNER ||
                team.MemberRoleNo === MemberRoleNo.ADMIN
            );

            this.UserTeamM = new Map();
            for (const team of res.TeamS) {
              this.UserTeamM.set(team.TeamID, team);
            }
          }

          if (Object.prototype.hasOwnProperty.call(res, 'LicenseWarning')) {
            this.User.LicenseWarning = res.LicenseWarning;
          }

          if (
            this.User.IsLinked &&
            Object.prototype.hasOwnProperty.call(res, 'FullName') &&
            Object.prototype.hasOwnProperty.call(res, 'UserEmail') &&
            Object.prototype.hasOwnProperty.call(res, 'UserERID') &&
            Object.prototype.hasOwnProperty.call(res, 'IsLinked')
          ) {
            this.AppUser = {
              FullName: res.FullName,
              UserEmail: res.UserEmail,
              UserERID: res.UserERID,
              IsLinked: res.IsLinked,
            };

            console.log('UserERID: ', this.AppUser.UserERID);
          }
        })
        .then(() => this.UserQuota.fetchMessages())
    );
  },

  // save the prompt using MARCI API endpoint
  savePrompt(prompt, AddToListID = undefined) {
    const body = {
      ...prompt,
      User: this.User,
    };

    if (AddToListID) {
      body.AddToListID = AddToListID;
    }

    return this.fetchExtended(
      `${this.NewAPIEndpoint}/Prompts${prompt.ID ? '/' + prompt.ID : ''}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    ).then(this.handleResponse);
  },

  /**
   * Fetch the prompt from MARCI API endpoint
   *
   * @param {string} PromptID
   * @param {boolean|undefined} onlyBasic
   * @returns {Promise<Prompt>}
   */
  getPrompt(PromptID, onlyBasic = undefined) {
    let paramBasic = '';
    if (onlyBasic) {
      paramBasic = '&Basic=true';
    }

    return this.fetchExtended(
      `${this.NewAPIEndpoint}/Prompts/${PromptID}?OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}${paramBasic}`
    ).then(this.handleResponse);
  },

  /**
   * vote for a prompt using MARCI API endpoint
   *
   * @param {string} PromptID
   * @param {(1|-1)} Vote
   * @param {string|undefined} GizmoCode
   */
  voteForPrompt(PromptID, Vote, GizmoCode = undefined) {
    const body = {
      VoteTypeNo: VoteTypeNo.PROMPT_TEASER_THUMBS,
      Vote: Vote,
      User: this.User,
    };

    if (GizmoCode) {
      body.GizmoCodeS = [GizmoCode];
    }

    return this.fetchExtended(`${this.NewAPIEndpoint}/Vote/${PromptID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(this.handleResponse);
  },

  /**
   * Report a prompt using MARCI API endpoint
   *
   * @param {string} PromptID
   * @param {FeedbackTypeNo} FeedbackTypeNo
   * @param {string} FeedbackText
   * @param {string} FeedbackContact
   */
  reportPrompt(PromptID, FeedbackTypeNo, FeedbackText, FeedbackContact) {
    return this.fetchExtended(
      `${this.NewAPIEndpoint}/Prompts/${PromptID}/Feedback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FeedbackContact,
          FeedbackText,
          FeedbackTypeNo,
          User: this.User,
        }),
      }
    ).then(this.handleResponse);
  },

  /**
   * Track prompt usage using MARCI API endpoint
   *
   * @param {string} PromptID
   * @param {UsageTypeNo} UsageTypeNo
   * @param {string|undefined} GizmoCode
   */
  usePrompt(PromptID, UsageTypeNo = UsageTypeNo.CLICK, GizmoCode = undefined) {
    const body = {
      UsageTypeNo: UsageTypeNo,
      User: this.User,
    };

    if (GizmoCode) {
      body.GizmoCodeS = [GizmoCode];
    }

    return this.fetchExtended(`${this.NewAPIEndpoint}/Prompts/${PromptID}/Use`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(this.handleResponse);
  },

  /**
   * Augment prompt using MARCI API endpoint and custom index lookup
   *
   * @param {string} UserPrompt
   * @param {string} PromptPrepared
   * @param {string} Model
   * @param {string[]} VariableNameS
   * @param {string[]} VariableValueS
   * @param {import('./inject.js').Prompt['ID']?} PromptID
   * @returns {Promise<{Prompt: string}>} augmented prompt
   */
  augmentPrompt(
    UserPrompt,
    PromptPrepared,
    Model,
    VariableNameS,
    VariableValueS,
    PromptID
  ) {
    if (!this.UserQuota.hasCustomIndexesFeatureEnabled()) {
      throw new Error('Custom indexes feature is not enabled');
    }

    console.log(
      'augmentPrompt',
      'UserPrompt',
      UserPrompt,
      'PromptPrepared',
      PromptPrepared,
      'Model',
      Model,
      'VariableNameS',
      VariableNameS,
      'VariableValueS',
      VariableValueS,
      'PromptID',
      PromptID
    );

    return this.fetchExtended(`${this.APIEndpoint}/PromptAugment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        User: this.User,
        PromptID,
        UserPrompt,
        VariableNameS,
        VariableValueS,
        PromptPrepared,
        Model,
      }),
    }).then(this.handleResponse);
  },

  // delete prompt using MARCI API endpoint
  deletePrompt(PromptID) {
    return this.fetchExtended(
      `${this.NewAPIEndpoint}/Prompts/${PromptID}?OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}&UserFootprint=${this.User.UserFootprint}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          User: this.User,
        }),
      }
    ).then(this.handleResponse);
  },

  /**
   * Fetch the prompts using MARCI API endpoint
   *
   * @param {string} Topic Topic ID e.g. "SEO-84c5d6a7b8e9f0c1"
   * @param {SortModeNo} SortModeNo
   * @param {number} Limit
   * @param {number} Offset
   */
  getPrompts(Topic, SortModeNo = SortModeNo.TOP_USAGE, Limit = 10, Offset = 0) {
    return this.fetchExtended(
      `${this.NewAPIEndpoint}/Prompts?Topic=${Topic}&Limit=${Limit}&Offset=${Offset}&OwnerOperatorERID=${this.User.OperatorERID}&OwnerSystemNo=${this.User.SystemNo}&SortModeNo=${SortModeNo}&UserFootprint=${this.User.UserFootprint}&IncludeTeamPrompts=true`
    ).then(this.handleResponse);
  },

  /**
   * Get messages using MARCI API endpoint
   *
   * @param {string} Topic Topic ID e.g. "SEO-84c5d6a7b8e9f0c1"
   * @returns {Promise<Message[]>}
   */
  getMessages(Topic) {
    return this.fetchExtended(
      `${this.NewAPIEndpoint}/Messages?Topic=${Topic}&OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}`
    ).then(this.handleResponse);
  },

  /**
   * Vote for a message using MARCI API endpoint
   *
   * @param {string} MessageID
   * @param {MessageVoteTypeNo} VoteTypeNo
   */
  voteForMessage(MessageID, VoteTypeNo) {
    return this.fetchExtended(`${this.APIEndpoint}/Vote/${MessageID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        VoteTypeNo: VoteTypeNo,
        Vote: VoteTypeNo === MessageVoteTypeNo.MESSAGE_DISLIKE ? -1 : 1,
        User: this.User,
      }),
    }).then(this.handleResponse);
  },

  /**
   * Confirm a message using MARCI API endpoint
   *
   * @param {string} MessageID
   */
  confirmMessage(MessageID) {
    return this.fetchExtended(`${this.APIEndpoint}/Vote/${MessageID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        VoteTypeNo: VoteTypeNo.MESSAGE_CONFIRM,
        Vote: 1,
        User: this.User,
      }),
    }).then(this.handleResponse);
  },

  // reset stored tokens (invalid, expired or logout action)
  resetTokens() {
    this.storeTokens(null);
  },

  /** @param {Tokens} tokens */
  storeTokens(tokens) {
    localStorage.setItem('MARCI.tokens', JSON.stringify(tokens));
  },

  /** @return {Tokens} */
  getTokens() {
    return JSON.parse(localStorage.getItem('MARCI.tokens'));
  },

  // fetch using JWT access token or refresh token as fallback if access token is expired
  fetchWithToken(url, options) {
    const tokens = this.getTokens();

    // early return an error if no tokens are stored
    if (!tokens || (!tokens.AccessToken && !tokens.RefreshToken)) {
      this.resetTokens();

      return Promise.reject(new Error('No tokens stored'));
    }

    // fetch using JWT token
    return (
      fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: 'Bearer ' + tokens.AccessToken,
        },
      })
        // check if response is ok
        .then((response) => {
          if (response.ok) {
            return response;
          }

          // if access token is expired, try to refresh it
          if (response.status === 401) {
            return this.refreshToken(tokens.RefreshToken).then(() => {
              /** @type {{AccessToken: string, RefreshToken: string}} tokens */
              const tokens = this.getTokens();

              // early return an error if no refresh token is stored
              if (!tokens || !tokens.RefreshToken) {
                this.resetTokens();

                return Promise.reject(new Error('No refresh token stored'));
              }

              return fetch(url, {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: 'Bearer ' + tokens.AccessToken,
                },
              });
            });
          }

          throw new Error('Network response was not OK');
        })
    );
  },

  // refresh JWT access token
  refreshToken(refreshToken) {
    return (
      fetch(`${APIEndpointAPP}/user/tokens`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + refreshToken,
        },
      })
        // check if response is ok
        .then((response) => {
          if (response.ok) {
            return response.json();
          }

          // delete tokens from local storage if refresh token is expired
          if (response.status === 401) {
            this.resetTokens();
          }

          throw new Error('Network response was not OK');
        })
        // save tokens to local storage
        .then((tokens) => {
          this.storeTokens(tokens);
        })
    );
  },

  // unlink MARCI user and account from OpenAI user
  unlinkUser() {
    if (!this.User.IsLinked) {
      return;
    }

    return this.fetchExtended(`${APIEndpoint}/Users/Disconnect`, {
      method: 'POST',
      body: JSON.stringify({
        User: this.User,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(this.handleResponse);
  },

  // link OpenAI user to MARCI user and account
  linkUser() {
    if (this.User.IsLinked) {
      return;
    }

    // fetch using JWT token
    return this.fetchWithToken(`${APIEndpointAPP}/auth/openai/callback`, {
      method: 'POST',
      body: JSON.stringify({
        OperatorERID: this.User.OperatorERID,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(this.handleResponse)
      .then(() => {
        this.User.IsLinked = true;

        return true;
      });
  },

  /**
   * Get lists using MARCI API endpoint
   *
   * @param {boolean} hidden
   * @returns {Promise<List[]>}
   */
  getLists(hidden = false) {
    return this.fetchExtended(
      `${APIEndpoint}/Lists?OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}&UserFootprint=${this.User.UserFootprint}&Hidden=${hidden}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then(this.handleResponse);
  },

  /**
   * Get list details including items using MARCI API endpoint
   *
   * @param {List['ID']} ListID
   * @returns {Promise<List>}
   */
  getListDetails(ListID) {
    return this.fetchExtended(
      `${APIEndpoint}/List/${ListID}?OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}&UserFootprint=${this.User.UserFootprint}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then(this.handleResponse);
  },

  /**
   * Get all lists including details using MARCI API endpoint
   *
   * @returns {Promise<List[]>}
   */
  getAllListsWithDetails() {
    return this.fetchExtended(
      `${NewAPIEndpoint}/Lists/All/User?OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}&UserFootprint=${this.User.UserFootprint}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then(this.handleResponse);
  },

  /**
   * Create list using MARCI API endpoint
   *
   * @param {ListTypeNo} TypeNo
   * @param {string} Comment
   * @param {FirstListItem} FirstItem
   * @param {string} ForTeamID
   * @returns {Promise<List>}
   */
  createList(TypeNo, Comment = '', FirstItem = {}, ForTeamID = undefined) {
    const body = {
      User: this.User,
      ListTypeNo: TypeNo,
      ListStatusNo: ListStatusNo.ACTIVE,
      ListOrder: 0,
      Comment: Comment,
    };

    if (FirstItem.PromptID) {
      body.FirstItem = FirstItem;
    }

    if (ForTeamID) {
      if (ForTeamID === 'NEW') {
        body.CreateNewTeam = true;
      } else {
        body.ForTeamID = ForTeamID;
      }
    }

    return this.fetchExtended(`${APIEndpoint}/Lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(this.handleResponse);
  },

  /**
   * Update list using MARCI API endpoint
   *
   * @param {List} List
   * @param {ListTypeNo} listTypeNo
   * @param {string} ForTeamID
   * @returns {Promise<void>}
   */
  updateList(
    List,
    comment = undefined,
    listTypeNo = undefined,
    forTeamID = undefined
  ) {
    const body = {
      User: this.User,
      ListStatusNo: List.ListStatusNo,
      ListOrder: List.ListOrder,
    };

    if (comment === undefined) {
      body.Comment = List.Comment;
    } else {
      body.Comment = comment;
    }

    if (listTypeNo === undefined) {
      body.ListTypeNo = List.ListTypeNo;
    } else {
      body.ListTypeNo = listTypeNo;
    }

    if (forTeamID === undefined) {
      body.ForTeamID = List.ForTeamID;
    } else if (forTeamID === null) {
      body.ForTeamID = forTeamID;
    } else {
      if (forTeamID === 'NEW') {
        body.CreateNewTeam = true;
      } else {
        body.ForTeamID = forTeamID;
      }
    }

    return this.fetchExtended(`${APIEndpoint}/List/${List.ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(this.handleResponse);
  },

  /**
   * Delete list using MARCI API endpoint
   *
   * @param {List['ID']} ListID
   * @param {List['ListTypeNo']} ListTypeNo
   * @param {List['ForTeamID']} ForTeamID
   * @returns {Promise<void>}
   */
  deleteList(ListID, ListTypeNo, ForTeamID = undefined) {
    var forTeamIDQueryParam = '';
    if (ForTeamID !== undefined && ForTeamID !== null && ForTeamID !== '') {
      forTeamIDQueryParam = `&ForTeamID=${ForTeamID}`;
    }

    return this.fetchExtended(
      `${APIEndpoint}/List/${ListID}?OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}&UserFootprint=${this.User.UserFootprint}&ListTypeNo=${ListTypeNo}${forTeamIDQueryParam}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then(this.handleResponse);
  },

  /**
   * Add to list using MARCI API endpoint
   *
   * @param {string} ListID
   * @param {string} PromptID
   * @returns {Promise<ListItem>}
   */
  addToList(ListID, PromptID) {
    return this.fetchExtended(`${NewAPIEndpoint}/List/${ListID}/Items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        PromptID,
        ItemOrder: 0,
        ItemStatusNo: ItemStatusNo.ACTIVE,
        Comment: '',
        User: this.User,
      }),
    }).then(this.handleResponse);
  },

  /**
   * Remove list item from list using MARCI API endpoint
   *
   * @param {List['ID']} ListID
   * @param {import('./inject.js').Prompt['ID']} PromptID
   *
   * @returns {Promise<void>}
   */
  removeFromList(ListID, PromptID) {
    return this.fetchExtended(
      `${NewAPIEndpoint}/List/${ListID}/Items/${PromptID}?OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}&UserFootprint=${this.User.UserFootprint}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then(this.handleResponse);
  },

  /**
   * Create MyProfileInfo using MARCI API endpoint
   *
   * @param {string} myProfileInfo
   * @returns {Promise<SubPrompt>}
   */
  createMyProfileInfo(myProfileInfo) {
    return this.fetchExtended(
      `${APIEndpoint}/User/AccountSubPrompts/MyProfileInfo`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Label: 'My Profile',
          Prompt: myProfileInfo,
          User: this.User,
        }),
      }
    ).then(this.handleResponse);
  },

  /**
   * Fetch the gizmos using MARCI API endpoint
   * @param {SortModeNo} SortModeNo
   * @returns {Promise<Gizmo[]>}
   */
  getGizmos(SortModeNo) {
    return this.fetchExtended(
      `${this.APIEndpoint}/Gizmos?OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}&SortModeNo=${SortModeNo}`
    ).then(this.handleResponse);
  },

  /**
   * Track gizmo usage using MARCI API endpoint
   *
   * @param {string} GizmoCode
   * @param {GizmoVoteTypeNo} GizmoVoteTypeNo
   * @param {Object} GizmoConfig
   */
  useGizmo(GizmoCode, GizmoVoteTypeNo, GizmoConfig = undefined) {
    const requestBody = {
      VoteTypeNo: GizmoVoteTypeNo,
      Vote: 1,
      User: this.User,
    };

    if (GizmoConfig) {
      requestBody.LogJSON = JSON.stringify(GizmoConfig);
    }

    return this.fetchExtended(`${this.APIEndpoint}/Gizmos/${GizmoCode}/Vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }).then(this.handleResponse);
  },

  /**
   * Vote for a gizmo using MARCI API endpoint
   *
   * @param {string} GizmoCode
   * @param {GizmoVoteTypeNo} GizmoVoteTypeNo
   * @param {1|-1} Vote
   */
  voteForGizmo(GizmoCode, GizmoVoteTypeNo, Vote) {
    return this.fetchExtended(`${this.APIEndpoint}/Gizmos/${GizmoCode}/Vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        VoteTypeNo: GizmoVoteTypeNo,
        Vote: Vote,
        User: this.User,
      }),
    }).then(this.handleResponse);
  },

  // Submit new gizmo using MARCI API endpoint
  submitNewGizmo(gizmoConfig) {
    const mybody = JSON.stringify({
      Gizmo: JSON.stringify(gizmoConfig),
      User: this.User,
    });

    return this.fetchExtended(`${this.APIEndpoint}/Gizmos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: mybody,
    }).then(this.handleResponse);
  },

  /**
   * Fetch referral offer
   */
  fetchReferralOffer() {
    return this.fetchExtended(
      `${this.APIEndpoint}/ReferralOffer?OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}&UserFootprint=${this.User.UserFootprint}`
    ).then(this.handleResponse);
  },

  /**
   * Fetch referral code
   */
  fetchReferralCode() {
    return this.fetchExtended(
      `${this.APIEndpoint}/ReferralCode?OperatorERID=${this.User.OperatorERID}&SystemNo=${this.User.SystemNo}&UserFootprint=${this.User.UserFootprint}&PromoCodeWish=`
    ).then(this.handleResponse);
  },

  /**
   * Handle response from MARCI API endpoint and return JSON or throw reaction if available
   *
   * @param {Response} response
   */
  async handleResponse(response) {
    let [json, responseOK] = await Promise.all([response.json(), response.ok]);

    if (responseOK) {
      return json;
    }

    if (json && json.ReactionNo) {
      throw Reaction.mapReactionNo(json.ReactionNo);
    }

    throw new Error('Network response was not OK.');
  },
};

export { MARCIClient, Reaction };
