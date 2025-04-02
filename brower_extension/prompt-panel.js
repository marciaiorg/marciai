import { sanitizeInput } from './utils.js';

/** @enum {string} */
const PromptGroup = {
  FAVORITES: 'Favorites',
  CUSTOM_LISTS: 'Custom Lists',
  OWN: 'Own',
  PUBLIC: 'Public',
};

// Prompt panel with quick search and selection of prompts in the chat input
export class PromptPanel {
  /**
   * @param {Element} inputField
   * @param {import("./list").Lists} lists
   * @param {import("./client").Quota} userQuota
   * @param {() => import('./inject').Prompt[]} getAllPromptsCallback
   * @param {(template: import('./inject').Prompt) => Promise<void>} selectPromptCallback
   * @param {string} triggerKey
   */
  constructor(
    inputField,
    lists,
    userQuota,
    getAllPromptsCallback,
    selectPromptCallback,
    triggerKey
  ) {
    if (!inputField?.parentNode?.parentNode) {
      console.error(
        'MARCI Prompt Panel - input field not found/structure changed'
      );
      return;
    }

    this.inputField = inputField;

    this.promptPanel = document.getElementById('MARCI__PromptPanel');

    // if prompt panel already exists, do not create another one
    if (this.promptPanel) {
      return;
    }

    // create the prompt panel container
    this.promptPanel = document.createElement('div');
    this.promptPanel.id = 'MARCI__PromptPanel';
    this.promptPanel.classList =
      'MARCI__absolute MARCI__bottom-16 MARCI__z-20 MARCI__w-full MARCI__space-y-2 MARCI__hidden';

    this.promptPanel.innerHTML = /*html*/ `
          <div class="MARCI__rounded-2xl MARCI__border MARCI__border-black/[0.1] dark:MARCI__border-white/[0.1] MARCI__p-2 MARCI__shadow-lg MARCI__bg-white dark:MARCI__bg-gray-800">
            <input id="MARCI__PromptPanel__search-input" placeholder="Search MARCI prompts" class="MARCI__mb-1 MARCI__w-full MARCI__border-0 MARCI__white MARCI__p-2 MARCI__text-sm focus:MARCI__outline-none dark:MARCI__bg-gray-800">
             <div class="MARCI__prompt-list MARCI__max-h-40 MARCI__overflow-y-auto"></div>
          </div>`;

    // inject it before the parent node of the input field parent
    inputField.parentNode.parentNode.insertBefore(
      this.promptPanel,
      inputField.parentNode
    );

    this.triggerKey = triggerKey;

    this.searchInput = this.promptPanel.querySelector(
      '#MARCI__PromptPanel__search-input'
    );

    this.promptList = this.promptPanel.querySelector('.MARCI__prompt-list');

    this.getAllPrompts = getAllPromptsCallback;
    this.selectPromptCallback = selectPromptCallback;

    /**
     * @typedef {import("./inject").Prompt & { Group: PromptGroup }} PromptWithGroup
     */

    /** @type {PromptWithGroup[]} */
    this.prompts = [];
    this.lists = lists;
    this.userQuota = userQuota;

    this.selectedIndex = -1;
    this.debounceTimer = null;

    this.inputField.addEventListener('input', this.handleInput.bind(this));

    this.searchInput.addEventListener(
      'input',
      this.handleSearchInput.bind(this)
    );
    this.searchInput.addEventListener(
      'keydown',
      this.handleSearchInputKeyDown.bind(this)
    );

    this.handleDocumentClickBound = this.handleDocumentClick.bind(this);
  }

  // show/hide prompt panel based on input
  handleInput() {
    const query =
      this.inputField.tagName === 'TEXTAREA'
        ? this.inputField.value
        : this.inputField.innerText;

    if (query.startsWith(this.triggerKey) && query.length === 1) {
      this.showPromptPanel();
      this.focusSearchInput();

      // update textarea value
      this.inputField.tagName === 'TEXTAREA'
        ? (this.inputField.value = query)
        : (this.inputField.innerText = query);
    }
  }

  // search prompts based on input with debounce
  handleSearchInput() {
    const query = this.searchInput.value;

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.searchPrompts(query);
    }, 300);
  }

  // handle keyboard navigation in prompt panel and apply selected prompt or hide panel
  handleSearchInputKeyDown(event) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectPreviousPrompt();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectNextPrompt();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.applySelectedPrompt();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.hidePromptPanel();
    } else if (event.key === 'Backspace' && this.searchInput.value === '') {
      event.preventDefault();
      this.hidePromptPanel();
    }
  }

  // search prompts based on query and filter based on hidden, favorites, custom lists
  async searchPrompts(query) {
    // filter prompts based on query
    this.prompts = this.getAllPrompts().filter(
      (prompt) =>
        !query || prompt.Title.toLowerCase().includes(query.toLowerCase())
    );

    // get hidden, favorites, custom lists and the prompts in them
    const hidden = (await this.lists.getHidden()?.getPromptIDS()) || [];
    const favorites = (await this.lists.getFavorites()?.getPromptIDS()) || [];
    let customLists = this.lists.getCustom(this.userQuota);

    customLists =
      (
        await Promise.all(
          customLists.map(async (list) => await list.getPromptIDS())
        )
      )?.flat() || [];

    // remove hidden prompts
    if (hidden.length > 0) {
      this.prompts = this.prompts.filter(
        (prompt) => !hidden.includes(prompt.ID)
      );
    }

    // define "group" for each prompt - Favorites, Custom Lists, Own, Public
    if (favorites.length > 0 || customLists.length > 0) {
      this.prompts = this.prompts.map((prompt) => {
        if (favorites.includes(prompt.ID)) {
          prompt.Group = PromptGroup.FAVORITES;
        } else if (customLists.includes(prompt.ID)) {
          prompt.Group = PromptGroup.CUSTOM_LISTS;
        } else {
          prompt.Group = prompt.OwnPrompt
            ? PromptGroup.OWN
            : PromptGroup.PUBLIC;
        }

        return prompt;
      });
    } else {
      // only show Own and Public prompts if there are no favorites or custom lists
      this.prompts = this.prompts.map((prompt) => {
        prompt.Group = prompt.OwnPrompt ? PromptGroup.OWN : PromptGroup.PUBLIC;

        return prompt;
      });
    }

    // sort by Group - Favorites, Custom Lists, Own, Public
    this.prompts = this.prompts.sort((a, b) => {
      if (a.Group === b.Group) {
        return 0;
      }
      if (a.Group === PromptGroup.FAVORITES) {
        return -1;
      }
      if (b.Group === PromptGroup.FAVORITES) {
        return 1;
      }
      if (a.Group === PromptGroup.CUSTOM_LISTS) {
        return -1;
      }
      if (b.Group === PromptGroup.CUSTOM_LISTS) {
        return 1;
      }
      if (a.Group === PromptGroup.OWN) {
        return -1;
      }
      if (b.Group === PromptGroup.OWN) {
        return 1;
      }
      return 0;
    });

    // limit the number of prompts to show
    this.prompts = this.prompts.slice(0, 10);

    this.renderPrompts();

    this.selectPrompt(0);
  }

  // render prompts in the prompt panel based on the filtered prompts and groups (Favorites, Custom Lists, Own, Public)
  renderPrompts() {
    this.promptList.innerHTML = '';

    if (this.prompts.length === 0) {
      this.promptList.innerHTML =
        '<div class="MARCI__px-4 MARCI__py-2 MARCI__text-gray-600">No prompts found.</div>';
      return;
    }

    let group = '';
    let index = 0;

    this.prompts.forEach((prompt) => {
      if (prompt.Group !== group) {
        group = prompt.Group;
        const groupElement = document.createElement('div');
        groupElement.className =
          'MARCI__px-2 MARCI__py-1 MARCI__text-xs MARCI__font-semibold MARCI__text-gray-500';
        groupElement.textContent = group;
        this.promptList.appendChild(groupElement);
      }

      const promptElement = document.createElement('div');
      promptElement.tabIndex = index;

      promptElement.className =
        'MARCI__group MARCI__flex MARCI__h-10 MARCI__items-center MARCI__gap-2 MARCI__rounded-lg MARCI__px-2 MARCI__font-medium hover:MARCI__bg-gray-100 MARCI__text-sm MARCI__text-gray-950 dark:MARCI__text-gray-100 dark:hover:MARCI__bg-gray-600';

      promptElement.innerHTML = `
            <div class="MARCI__flex MARCI__h-fit MARCI__grow MARCI__flex-row MARCI__justify-between MARCI__space-x-2 MARCI__overflow-hidden MARCI__text-ellipsis MARCI__whitespace-nowrap">
              <div class="MARCI__flex MARCI__flex-row MARCI__space-x-2 MARCI__truncate">
                <span class="MARCI__truncate dark:MARCI__text-gray-100 MARCI__shrink-0 MARCI__max-w-full">${sanitizeInput(
                  prompt.Title
                )}</span>
                ${
                  prompt.AuthorName
                    ? `<span class="MARCI__flex-grow MARCI__truncate MARCI__text-sm MARCI__font-light MARCI__text-gray-400 sm:MARCI__max-w-xs lg:MARCI__max-w-md MARCI__hidden sm:MARCI__block">${
                        prompt.AuthorName
                          ? `by ${sanitizeInput(prompt.AuthorName)}`
                          : ''
                      }</span>`
                    : ''
                }                
              </div>
            </div>
          `;

      const promptIndex = index;

      // select prompt on click
      promptElement.addEventListener('click', () => {
        this.selectPrompt(promptIndex);
        this.applySelectedPrompt();
      });

      this.promptList.appendChild(promptElement);

      index++;
    });
  }

  // hide prompt panel when clicked outside
  handleDocumentClick(event) {
    if (!this.promptPanel.contains(event.target)) {
      this.hidePromptPanel();
    }
  }

  // show prompt panel and search prompts based on input
  async showPromptPanel() {
    this.promptPanel.classList.remove('MARCI__hidden');
    await this.searchPrompts(this.searchInput.value);

    document.addEventListener('click', this.handleDocumentClickBound);
  }

  // hide prompt panel and reset selected index
  hidePromptPanel() {
    this.promptPanel.classList.add('MARCI__hidden');
    this.selectedIndex = -1;
    this.searchInput.value = '';
    this.inputField.focus();

    document.removeEventListener('click', this.handleDocumentClickBound);
  }

  // focus on search input and set cursor at the end
  focusSearchInput() {
    this.searchInput.focus();
    this.searchInput.selectionStart = this.searchInput.selectionEnd =
      this.searchInput.value.length;
  }

  // select previous prompt in the prompt panel
  selectPreviousPrompt() {
    if (this.selectedIndex > 0) {
      this.selectPrompt(this.selectedIndex - 1);
    }
  }

  // select next prompt in the prompt panel
  selectNextPrompt() {
    if (this.selectedIndex < this.prompts.length - 1) {
      this.selectPrompt(this.selectedIndex + 1);
    }
  }

  // select prompt in the prompt panel based on index and scroll to it
  selectPrompt(index) {
    const promptItems = this.promptPanel.querySelectorAll('.MARCI__group');

    if (this.selectedIndex !== -1) {
      promptItems?.[this.selectedIndex]?.classList?.remove(
        'MARCI__bg-gray-100',
        'dark:MARCI__bg-gray-600'
      );
    }

    this.selectedIndex = index;

    promptItems?.[this.selectedIndex]?.classList?.add(
      'MARCI__bg-gray-100',
      'dark:MARCI__bg-gray-600'
    );

    this.scrollToSelectedPrompt();
  }

  // scroll to selected prompt in the prompt panel
  scrollToSelectedPrompt() {
    const promptItems = this.promptList.querySelectorAll('.MARCI__group');
    const selectedPrompt = promptItems?.[this.selectedIndex];

    if (this.selectedIndex === 0) {
      this.promptList.scrollTop = 0;
    } else {
      selectedPrompt?.scrollIntoView({ block: 'nearest' });
    }
  }

  // apply selected prompt in the chat input and hide prompt panel
  applySelectedPrompt() {
    if (this.selectedIndex !== -1) {
      const selectedPrompt = this.prompts[this.selectedIndex];

      this.selectPromptCallback(selectedPrompt);

      this.inputField.tagName === 'TEXTAREA'
        ? (this.inputField.value = '')
        : (this.inputField.innerText = '');

      this.hidePromptPanel();
    }
  }
}
