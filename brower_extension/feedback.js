import { FeedbackTypeNo } from './enums.js';
import { hideModal } from './utils.js';

/**
 * Create modal to report feedback for a prompt
 *
 * @param {import('./inject.js').Prompt} prompt
 * @param {function(Event)} reportPrompt
 */
const createReportPromptModal = function (prompt, reportPrompt) {
  // prompt does not exist
  if (!prompt) {
    return;
  }

  // cannot report own prompts
  if (prompt.OwnPrompt) {
    return;
  }

  let reportPromptModal = document.getElementById('reportPromptModal');

  // if modal does not exist, create it, add event listener on submit and append it to body
  if (!reportPromptModal) {
    reportPromptModal = document.createElement('div');
    reportPromptModal.id = 'reportPromptModal';

    reportPromptModal.addEventListener('submit', reportPrompt);

    document.body.appendChild(reportPromptModal);
  }

  reportPromptModal.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
        <div class="MARCI__absolute MARCI__bg-black/50 dark:MARCI__bg-black/80 MARCI__inset-0">
        </div>

        <div class="MARCI__fixed MARCI__inset-0 MARCI__overflow-y-auto">
          <div class="MARCI__flex MARCI__items-center MARCI__justify-center MARCI__min-h-full">
            <div
              class="MARCI__align-center MARCI__bg-white dark:MARCI__bg-gray-900 dark:MARCI__text-gray-200 MARCI__inline-block MARCI__overflow-hidden sm:MARCI__rounded-lg MARCI__shadow-xl sm:MARCI__align-middle sm:MARCI__max-w-lg sm:MARCI__my-8 sm:MARCI__w-full MARCI__text-left MARCI__transform MARCI__transition-all"
              role="dialog" aria-modal="true" aria-labelledby="modal-headline">

              <div class="MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__px-4 MARCI__pt-5 MARCI__pb-4 sm:MARCI__p-6 sm:MARCI__pb-4">

                <div id="reportPromptIntroText">
                  <p class="MARCI__mb-6">
                    Thanks for helping us improve.<br><br>

                    We need you to answer a few questions so we can better understand what's going on with this Prompt.<br><br>

                    You'll also have the option to add more info in your own words and add more details to the report.<br><br>

                    We take reports seriously.<br><br>

                    If we find a rule violation, we'll either remove the Prompt immediately or ask them to revise, or lock or suspend the account.
                  </p>

                  <div class="MARCI__mt-2">
                    <label for="FeedbackTypeNo" class="MARCI__block">What would you like to report?</label>
                    <select data-prompt-id="${prompt.ID}" id="FeedbackTypeNo" name="FeedbackTypeNo" class="MARCI__mt-2 MARCI__mb-3 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-850 dark:hover:MARCI__bg-gray-800 MARCI__rounded MARCI__w-full" required>
                      <option value="${FeedbackTypeNo.GENERIC_LEGAL_CONCERN}">
                      Legal concerns
                      </option>
                      <optgroup label="Result concerns">                        
                        <option value="${FeedbackTypeNo.NOT_MULTILINGUAL}">
                          Result in wrong language
                        </option>
                        <option value="${FeedbackTypeNo.NOT_GENERIC}">
                          Result on wrong topic/keywords
                        </option>                        
                        <option value="${FeedbackTypeNo.GENERIC_CONCERN}">
                          Prompt not working as expected
                        </option>
                      </optgroup>                  
                      <option value="${FeedbackTypeNo.SPAM}">Spam</option>
                    </select>
                  </div>
                </div>

                <div class="reportPromptFeedbackContainer MARCI__hidden MARCI__overflow-y-auto" id="reportPromptFeedbackForm"></div>
              </div>

              <div class="MARCI__bg-gray-200 dark:MARCI__bg-gray-850 MARCI__px-4 MARCI__py-3 MARCI__text-right">
                <button type="button" class="MARCI__bg-gray-600 hover:MARCI__bg-gray-800 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white"
                        onclick="MARCI.hideModal('reportPromptModal')"> Cancel
                </button>
                <button type="button" id="reportPromptSubmitButton" class="MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">Start Report
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>`;

  // add event listener to change button text and type on click
  reportPromptModal.querySelector('#reportPromptSubmitButton').addEventListener(
    'click',
    (e) => {
      // hide intro text
      document.getElementById('reportPromptIntroText').style = 'display: none;';

      const feedbackTypeNoSelect = document.getElementById('FeedbackTypeNo');

      // show feedback type specific text & form
      const feedbackForm = document.getElementById('reportPromptFeedbackForm');

      feedbackForm.innerHTML = getFeedbackFormTemplate(
        +feedbackTypeNoSelect.value,
        feedbackTypeNoSelect.dataset.promptId
      );

      feedbackForm.classList.remove('MARCI__hidden');

      // change button text to "Send Report" and replace event listener
      e.target.innerText = 'Send Report';

      e.target.addEventListener('click', () => {
        // submit the visible form in reportPromptModal
        document
          .querySelector(
            '#reportPromptModal .reportPromptFeedbackContainer:not(.hidden) form'
          )
          .requestSubmit();
      });
    },
    { once: true }
  );

  reportPromptModal.style = 'display: block;';

  // add event listener to close the modal on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideModal('reportPromptModal');
    }
  });
};

/**
 * Get the feedback form template for a specific feedback type
 * 
 * @param {FeedbackTypeNo} selectedFeedbackTypeNo
 * @param {string} promptID
 * @returns {string} - HTML string
 s*/
const getFeedbackFormTemplate = (selectedFeedbackTypeNo, promptID) => {
  const requiresFeedbackContactText = [
    FeedbackTypeNo.GENERIC_CONCERN,
    FeedbackTypeNo.GENERIC_LEGAL_CONCERN,
  ].includes(selectedFeedbackTypeNo);

  return /*html*/ `
    <p class="MARCI__mb-6">
      Since we are not affiliated with OpenAI or ChatGPT,
      we are not responsible for the output of ChatGPT.<br><br>

      ${
        selectedFeedbackTypeNo === FeedbackTypeNo.GENERIC_CONCERN
          ? /*html*/ `
          But we can try to help you with results.<br><br>

          We can do this by looking at the prompt reported,
          and the output generated.

          <br><br>
          You can also report your question on <a style="text-decoration:underline" target="_blank" href="https://forum.aiprm.com/c/prompt-user-questions/6">our user forum</a> and others will try to help you there, often faster.
          <br>
        `
          : `But we will take your report about the prompt and evaluate it.
          
          <br><br>
          You can also report your question on <a style="text-decoration:underline" target="_blank" href="https://forum.aiprm.com/c/prompt-user-questions/6">our user forum</a> and others will try to help you there, often faster.
          <br>

          
          `
      }
    </p>

    <form>
      <input type="hidden" name="PromptID" value="${promptID}" />

      <input type="hidden" name="FeedbackTypeNo" value="${selectedFeedbackTypeNo}" />

      <label>Contact Email${
        !requiresFeedbackContactText
          ? ' <span class="MARCI__text-sm MARCI__text-gray-500">(optional)</span>'
          : ''
      }</label>
      <input name="FeedbackContact" 
        ${requiresFeedbackContactText ? ' required ' : ''} type="email"
        title="Email address to contact you in case we need more information"
        class="MARCI__w-full MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__p-2 MARCI__mt-2 MARCI__mb-3"
        placeholder="example@example.com" />

      <label>Feedback${
        !requiresFeedbackContactText
          ? ' <span class="MARCI__text-sm MARCI__text-gray-500">(optional)</span>'
          : ''
      }</label>
      <textarea name="FeedbackText" 
        ${requiresFeedbackContactText ? ' required ' : ''}
        title="Short description of the issue"
        class="MARCI__w-full MARCI__bg-gray-100 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 MARCI__rounded MARCI__p-2 MARCI__mt-2 MARCI__mb-3" style="height: 140px;"
        placeholder="Please describe the issue you are having with this prompt.${
          selectedFeedbackTypeNo === FeedbackTypeNo.GENERIC_CONCERN
            ? ' Please include your full history of the prompt including the original prompt used.'
            : ''
        }"></textarea>
    </form>
  `;
};

export { createReportPromptModal };
