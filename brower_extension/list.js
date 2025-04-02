import { ListTypeNo, MemberRoleNo } from './enums.js';

import { MARCIClient } from './client.js';

import { UserQuota } from './quota.js';

import { sanitizeInput } from './utils.js';

// Collection of lists
export class Lists {
  /** @type {List[]} */
  lists = [];

  /**
   * Create new instance with lists
   *
   * @param {List[]} lists
   */
  constructor(lists = []) {
    this.lists = lists;
  }

  /**
   * Sort lists by type, ownership (Team Lists) and comment
   *
   * @param {List} a
   * @param {List} b
   */
  sortLists(a, b) {
    try {
      if (a.ListTypeNo < b.ListTypeNo) {
        return -1;
      } else if (a.ListTypeNo > b.ListTypeNo) {
        return 1;
      } else {
        if (a.ListTypeNo === ListTypeNo.TEAM_CUSTOM) {
          const aOwner = a.IsTeamListWriteAccess();
          const bOwner = b.IsTeamListWriteAccess();

          if (aOwner && !bOwner) {
            return -1;
          } else if (!aOwner && bOwner) {
            return 1;
          } else {
            const aCommentLower = a.Comment.toLowerCase();
            const bCommentLower = b.Comment.toLowerCase();
            return aCommentLower < bCommentLower
              ? -1
              : aCommentLower > bCommentLower
              ? 1
              : 0;
          }
        } else {
          const aCommentLower = a.Comment.toLowerCase();
          const bCommentLower = b.Comment.toLowerCase();
          return aCommentLower < bCommentLower
            ? -1
            : aCommentLower > bCommentLower
            ? 1
            : 0;
        }
      }
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  // Sort lists
  sort() {
    if (this.lists.length > 1) {
      this.lists.sort(this.sortLists);
    }
  }

  /**
   * Add list to collection
   *
   * @param {List} list
   */
  add(list) {
    this.lists.push(list);

    this.sort();
  }

  /**
   * Delete list from collection and via API
   *
   * @param {List} list
   */
  async delete(list) {
    const removeListID = list.ID;

    await list.delete();

    this.lists = this.lists.filter((list) => list.ID !== removeListID);
  }

  /**
   * Create new list via API and add to collection, optionally with the first item and comment
   *
   * @param {MARCIClient} client
   * @param {ListTypeNo} type
   * @param {string} comment
   * @param {import('./client').FirstListItem} firstItem
   * @returns {Promise<List>}
   */
  async create(
    client,
    type,
    comment = '',
    firstItem = {},
    forTeamID = undefined
  ) {
    const list = await List.create(client, type, comment, firstItem, forTeamID);

    this.add(list);

    if (forTeamID === 'NEW') {
      const newTeam = {
        TeamID: list.ForTeamID,
        MemberRoleNo: MemberRoleNo.OWNER,
        TeamName: 'My First Team',
        TeamDescription: '',
      };
      client.OwnTeamS.push(newTeam);
      client.UserTeamM.set(newTeam.TeamID, newTeam);
    }

    return list;
  }

  /**
   * Get "Favorites" list
   *
   * @returns {List|undefined}
   */
  getFavorites() {
    return this.withType(ListTypeNo.FAVORITES);
  }

  /**
   * Get "Hidden" list
   *
   * @returns {List|undefined}
   */
  getHidden() {
    return this.withType(ListTypeNo.HIDDEN);
  }

  /**
   * Get "Custom" lists
   *
   * @param {UserQuota} userQuota
   * @returns {List[]}
   */
  getCustom(userQuota) {
    if (userQuota?.hasTeamsFeatureEnabled()) {
      return this.lists.filter(
        (list) => list.is(ListTypeNo.CUSTOM) || list.is(ListTypeNo.TEAM_CUSTOM)
      );
    } else {
      return this.lists.filter((list) => list.is(ListTypeNo.CUSTOM));
    }
  }

  /**
   * Get "Custom" lists with write access for user
   *
   * @param {UserQuota} userQuota
   * @param {import("./client").UserTeamM} userTeamM
   * @returns {List[]}
   */
  getCustomWithWriteAccess(userQuota, userTeamM) {
    if (userQuota?.hasTeamsFeatureEnabled()) {
      return this.lists.filter(
        (list) =>
          list.is(ListTypeNo.CUSTOM) ||
          (list.is(ListTypeNo.TEAM_CUSTOM) &&
            list.HasWriteAccessForTeamMember(userTeamM))
      );
    } else {
      return this.lists.filter((list) => list.is(ListTypeNo.CUSTOM));
    }
  }

  /**
   * Get "Custom" private lists
   *
   * @returns {List[]}
   */
  getCustomPrivate() {
    return this.lists.filter((list) => list.is(ListTypeNo.CUSTOM));
  }

  /**
   * Get "MARCI Verified" list
   *
   * @returns {List|undefined}
   */
  getMARCIVerified() {
    return this.withType(ListTypeNo.MARCI_VERIFIED);
  }

  /**
   * Get list by ID
   *
   * @returns {List|undefined}
   */
  withID(listID) {
    return this.lists.find((list) => list.list.ID === listID);
  }

  /**
   * Get list by type
   *
   * @param {ListTypeNo} type
   * @returns {List|undefined}
   */
  withType(type) {
    return this.lists.find((list) => list.is(type));
  }

  /**
   * Get list by ID and type
   *
   * @returns {List|undefined}
   */
  withIDAndType(listID, type) {
    return this.lists.find((list) => list.list.ID === listID && list.is(type));
  }

  /**
   * Removes prompts from all lists by prompt ID and optionally by list type
   *
   * @param {number} promptID
   * @param {ListTypeNo|undefined} listType
   */
  removeItemByPromptIDFromListsByType(promptID, listType) {
    this.lists.forEach((list) => {
      if (listType === undefined || list.ListTypeNo === listType) {
        list.removeItemByPromptID(promptID);
      }
    });
  }
}

// Single list
export class List {
  /** @type {import("./client").MARCIClient} */
  client;

  /** @type {import("./client").List} */
  list;

  /**
   * Create new instance with list and API client
   *
   * @param {import("./client").MARCIClient} client
   * @param {import("./client").List} list
   */
  constructor(client, list) {
    this.client = client;
    this.list = list;
  }

  // get list ID
  get ID() {
    return this.list.ID;
  }

  // get list comment
  get Comment() {
    return this.list.Comment;
  }

  // get list items
  get Items() {
    return this.list.Items;
  }

  // get OwnList flag
  get OwnList() {
    return this.list.OwnList;
  }

  // get ListTypeNo
  get ListTypeNo() {
    return this.list.ListTypeNo;
  }

  // get ForTeamID
  get ForTeamID() {
    return this.list.ForTeamID;
  }

  IsTeamListWriteAccess() {
    if (this.list.ListTypeNo === ListTypeNo.CUSTOM) {
      return false;
    }

    const team = this.client.UserTeamM?.get(this.list.ForTeamID);
    if (team) {
      return (
        team.MemberRoleNo === MemberRoleNo.OWNER ||
        team.MemberRoleNo === MemberRoleNo.ADMIN ||
        team.MemberRoleNo === MemberRoleNo.READ_WRITE
      );
    }

    return false;
  }

  /**
   * Checks if user has write access to list
   *
   * @param {import("./client").UserTeamM} userTeamM
   * @returns {boolean}
   */
  HasWriteAccessForTeamMember(userTeamM) {
    const role = userTeamM?.get(this.list.ForTeamID)?.MemberRoleNo;

    return (
      role &&
      (role === MemberRoleNo.OWNER ||
        role === MemberRoleNo.ADMIN ||
        role === MemberRoleNo.READ_WRITE)
    );
  }

  /**
   * Checks if user has admin access to list
   *
   * @param {import("./client").UserTeamM} userTeamM
   * @returns {boolean}
   */
  HasAdminAccessForTeamMember(userTeamM) {
    const role = userTeamM?.get(this.list.ForTeamID)?.MemberRoleNo;
    return role && (role === MemberRoleNo.OWNER || role === MemberRoleNo.ADMIN);
  }

  /**
   * Checks if user has owner access to list
   *
   * @param {import("./client").UserTeamM} userTeamM
   * @returns {boolean}
   */
  HasOwnerAccessForTeamMember(userTeamM) {
    const role = userTeamM?.get(this.list.ForTeamID)?.MemberRoleNo;
    return role && role === MemberRoleNo.OWNER;
  }

  /**
   * Removes prompt from list by prompt ID
   *
   * @param {number} promptID
   */
  removeItemByPromptID(promptID) {
    this.list.Items = this.list.Items.filter(
      (item) => item.PromptID !== promptID
    );
  }

  /**
   * Update list comment via API and update local list
   *
   * @param {List['Comment']} comment
   */
  async update(comment) {
    await this.client.updateList(this.list, comment);

    this.list.Comment = comment;
  }

  /**
   * Update list comment via API and update local list
   *
   * @param {ListTypeNo} listTypeNo
   * @param {string} forTeamID
   */
  async updateListType(listTypeNo, forTeamID = undefined) {
    const resp = await this.client.updateList(
      this.list,
      undefined,
      listTypeNo,
      forTeamID
    );

    if (resp) {
      this.list.ListTypeNo = listTypeNo;
      this.list.ForTeamID = resp.ForTeamID;
    }
  }

  // Delete list via API
  async delete() {
    await this.client.deleteList(
      this.list.ID,
      this.list.ListTypeNo,
      this.list.ForTeamID
    );
  }

  /**
   * Add prompt to list via API and update local list
   *
   * @param {import("./inject").Prompt} prompt
   */
  async add(prompt) {
    const item = await this.client.addToList(this.list.ID, prompt.ID);

    this.list.Items.push(item);
  }

  /**
   * Remove prompt from list via API and update local list
   *
   * @param {import("./inject").Prompt} prompt
   */
  async remove(prompt) {
    await this.client.removeFromList(this.list.ID, prompt.ID);

    this.list.Items = this.list.Items.filter(
      (item) => item.PromptID !== prompt.ID
    );
  }

  /**
   * Check if list contains prompt
   *
   * @param {import("./inject").Prompt} prompt
   * @returns {Promise<boolean>}
   */
  async has(prompt) {
    if (this.list.Items === undefined) {
      await this.getListDetails();
    }

    return this.list.Items.some((item) => item.PromptID === prompt.ID);
  }

  /**
   * Create new list via API and return new instance, optionally with the first item and comment
   *
   * @param {import("./client").MARCIClient} client
   * @param {ListTypeNo} type
   * @param {string} comment
   * @param {import('./client').FirstListItem} firstItem
   * @returns {Promise<List>}
   */
  static async create(
    client,
    type,
    comment = '',
    firstItem = {},
    forTeamID = undefined
  ) {
    return new List(
      client,
      await client.createList(type, comment, firstItem, forTeamID)
    );
  }

  // Get list details via API and update local list, if list items are not already loaded
  async getListDetails() {
    if (this.list.Items === undefined) {
      this.list = await this.client.getListDetails(this.list.ID);
    }
  }

  /**
   * Get all prompt IDs in list
   *
   * @returns {Promise<import("./inject").Prompt['ID']>}
   */
  async getPromptIDS() {
    if (this.list.Items === undefined) {
      await this.getListDetails();
    }

    return this.list.Items.map((item) => item.PromptID);
  }

  /**
   * Check if list is of type
   *
   * @param {ListTypeNo} type
   * @returns {boolean}
   */
  is(type) {
    return this.list.ListTypeNo === type;
  }

  /**
   * Create title for list
   *
   * @param {MARCIClient} client
   * @returns {string}
   */
  createTitle(client) {
    if (this.list.ListTypeNo === ListTypeNo.TEAM_CUSTOM) {
      let title =
        '&quot;' +
        sanitizeInput(this.list.Comment) +
        '&quot; Prompts Team List';

      const team = client.UserTeamM?.get(this.list.ForTeamID);

      if (team) {
        title =
          title +
          ' belonging to &quot;' +
          sanitizeInput(team.TeamName) +
          '&quot;';

        if (team.MemberRoleNo === MemberRoleNo.OWNER) {
          title = title + ' (Owner)';
        } else if (team.MemberRoleNo === MemberRoleNo.ADMIN) {
          title = title + ' (Admin)';
        } else if (team.MemberRoleNo === MemberRoleNo.READ_WRITE) {
          title = title + ' (Read-Write)';
        } else {
          title = title + ' (Read-Only)';
        }
      }

      return title;
    } else {
      return (
        '&quot;' + sanitizeInput(this.list.Comment) + '&quot; Prompts List'
      );
    }
  }
}
