import { capitalizeWords, sanitizeInput } from './utils.js';

/** @typedef {{roles: string[], tasks: string[], constraints: string[], contexts: string[]}} PromptBuilderOptions */

export class PromptBuilder {
  /** @type {string[]} */
  roles = [];

  /** @type {string[]} */
  tasks = [];

  /** @type {string[]} */
  constraints = [];

  /** @type {string[]} */
  contexts = [];

  /** @type {import("./inject").Prompt} */
  prompt = {};

  /** @param {PromptBuilderOptions} options */
  constructor(options) {
    this.roles = options.roles;
    this.tasks = options.tasks;
    this.constraints = options.constraints;
    this.contexts = options.contexts;
  }

  /** @returns {string} */
  render() {
    return /*html*/ `
      <div>Prompt Builder</div>

      <div class="MARCI__w-full MARCI__bg-gray-100 MARCI__border-gray-500 MARCI__border dark:MARCI__bg-gray-800 dark:MARCI__border-gray-700 MARCI__rounded MARCI__p-4 MARCI__mt-2 MARCI__mb-3" id="MARCI__PromptBuilder-Prompt">
        <div class="MARCI__flex MARCI__gap-2 MARCI__items-end">
          <span class="MARCI__whitespace-nowrap">You are </span>

          <div class="MARCI__flex MARCI__flex-1 MARCI__flex-col">
            <label for="MARCI__act-as-input" class="MARCI__block MARCI__text-xs MARCI__text-gray-700 dark:MARCI__text-gray-400">Role</label>
            <input list="MARCI__act-as-options" id="MARCI__act-as-input" placeholder="Choose role or enter..." class="MARCI__rounded MARCI__border MARCI__border-green-500 MARCI__bg-green-100 dark:MARCI__bg-green-500/20 MARCI__px-2" />
            <datalist id="MARCI__act-as-options">
              ${this.roles
                .map(
                  (role) =>
                    `<option value="${sanitizeInput(role)}">${sanitizeInput(
                      role
                    )}</option>`
                )
                .join('')}
            </datalist>
          </div>
        </div>

        <div class="MARCI__flex MARCI__items-end MARCI__mt-4">
          <span class="MARCI__whitespace-nowrap">and you are asked to</span>

          <div class="MARCI__flex MARCI__flex-1 MARCI__flex-col MARCI__ml-2">
            <label for="MARCI__do-this-input" class="MARCI__block MARCI__text-xs MARCI__text-gray-700 dark:MARCI__text-gray-400">Task</label>
            <input list="MARCI__do-this-options" id="MARCI__do-this-input" placeholder="Choose task or enter..." class="MARCI__rounded MARCI__border MARCI__border-blue-500 MARCI__bg-blue-100 dark:MARCI__bg-blue-500/20 MARCI__px-2" />
            <datalist id="MARCI__do-this-options">
              ${this.tasks
                .map(
                  (task) =>
                    `<option value="${sanitizeInput(task)}">${sanitizeInput(
                      task
                    )}</option>`
                )
                .join('')}
            </datalist>
          </div>,
        </div>

        <div class="MARCI__flex MARCI__items-end MARCI__mt-4 MARCI__gap-2">
          <span class="MARCI__whitespace-nowrap">but</span>

          <div class="MARCI__flex MARCI__flex-1 MARCI__flex-col">
            <label for="MARCI__dont-do-this-input" class="MARCI__block MARCI__text-xs MARCI__text-gray-700 dark:MARCI__text-gray-400">Constraints</label>
            <input list="MARCI__dont-do-this-options" id="MARCI__dont-do-this-input" placeholder="Choose constraints or enter..." class="MARCI__rounded MARCI__border MARCI__border-orange-500 MARCI__bg-orange-100 dark:MARCI__bg-orange-500/20 MARCI__px-2" />
            <datalist id="MARCI__dont-do-this-options">
              ${this.constraints
                .map(
                  (constraint) =>
                    `<option value="${sanitizeInput(
                      constraint
                    )}">${sanitizeInput(constraint)}</option>`
                )
                .join('')}
            </datalist>
          </div>
        </div>

        <div class="MARCI__flex MARCI__items-end MARCI__mt-4">
          <span class="MARCI__whitespace-nowrap">in the context of</span>
          <div class="MARCI__flex MARCI__flex-1 MARCI__flex-col MARCI__ml-2">
            <label for="MARCI__dont-do-this-input" class="MARCI__block MARCI__text-xs MARCI__text-gray-700 dark:MARCI__text-gray-400">Context</label>
            <input list="MARCI__context-options" id="MARCI__context-input" placeholder="Choose context or enter..." class="MARCI__rounded MARCI__border MARCI__border-purple-500 MARCI__bg-purple-100 dark:MARCI__bg-purple-500/20 MARCI__px-2" />
            <datalist id="MARCI__context-options">
              ${this.contexts
                .map(
                  (context) =>
                    `<option value="${sanitizeInput(context)}">${sanitizeInput(
                      context
                    )}</option>`
                )
                .join('')}
            </datalist>
          </div>.
        </div>

        <br>

        Reply only in &nbsp;<span title='This will change depending on selected "Output in" language' class="MARCI__my-2 MARCI__bg-gray-200 dark:MARCI__bg-gray-600 MARCI__p-1"><code>[TARGETLANGUAGE]</code></span>&nbsp; language.
        
        <br><br>
        
        Your task is: &nbsp;<span title="This will change depending on the prompt message you enter" class="MARCI__my-2 MARCI__bg-gray-200 dark:MARCI__bg-gray-600 MARCI__p-1"><code>[PROMPT]</code></span>
      </div>`;
  }

  get() {
    return this.prompt;
  }

  build() {
    const role = document.getElementById('MARCI__act-as-input').value;
    const task = document.getElementById('MARCI__do-this-input').value;
    const constraint = document.getElementById(
      'MARCI__dont-do-this-input'
    ).value;
    const context = document.getElementById('MARCI__context-input').value;

    if (!role || !task || !constraint || !context) {
      this.prompt.Prompt = '';

      return;
    }

    this.prompt.Prompt = `You are ${role} and you are asked to ${task}, but ${constraint} in the context of ${context}.

Reply only in [TARGETLANGUAGE] language.

Your task is: [PROMPT]`;

    this.prompt.Title = `${capitalizeWords(role)} - ${capitalizeWords(task)}`;
    this.prompt.Teaser = `Helpful ${capitalizeWords(
      role
    )} ready to ${capitalizeWords(task)}`;
    this.prompt.PromptHint = 'Please ...';
  }

  validate() {
    const role = document.getElementById('MARCI__act-as-input').value;
    const task = document.getElementById('MARCI__do-this-input').value;
    const constraint = document.getElementById(
      'MARCI__dont-do-this-input'
    ).value;
    const context = document.getElementById('MARCI__context-input').value;

    return role && task && constraint && context;
  }
}
