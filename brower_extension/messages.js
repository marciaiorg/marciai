/* eslint-disable no-unused-vars */
import {
  MessageSeverityNo,
  MessageStatusNo,
  MessageVoteTypeNo,
} from './enums.js';
/* eslint-enable */

import { hideModal, svg } from './utils.js';

// Mapping of MessageSeverityNo to the corresponding CSS class name for the notification message
const NotificationMessageSeverityClassName = {
  [MessageSeverityNo.INFO]: 'MARCI__bg-gray-500',
  [MessageSeverityNo.SUCCESS]: 'MARCI__bg-green-500',
  [MessageSeverityNo.UPDATE]: 'MARCI__bg-[#5436DA]',
};

/**
 * Show the first active and not expired static message (if any),
 * or the first active and not expired message with MessageSeverityNo.MANDATORY_MUST_CONFIRM (if any),
 * or the first active and not expired message with other MessageSeverityNo (if any)
 *
 * @param {import("./client").Message[]} staticMessages
 * @param {import("./client").Message[]} messages
 * @param {(MessageID: string)} confirmCallback
 * @param {(MessageID: string, Vote: MessageVoteTypeNo)} voteCallback
 * @param {(MessageID: string)} readStaticMessageCallback
 * @returns {boolean} true if a message was shown, false otherwise
 */
const showMessage = (
  staticMessages,
  messages,
  confirmCallback,
  voteCallback,
  readStaticMessageCallback
) => {
  // get the first active and not expired static message
  let staticMessage = staticMessages?.find(
    (message) =>
      message.MessageStatusNo === MessageStatusNo.ACTIVE &&
      (!message.ExpiryTime || new Date(message.ExpiryTime) > new Date())
  );

  // if there is a static message, show it
  if (staticMessage) {
    createNotificationMessage(staticMessage, readStaticMessageCallback);

    return true;
  }

  // get the first active and not expired message with MessageSeverityNo.MANDATORY_MUST_CONFIRM
  let message = messages?.find(
    (message) =>
      message.MessageStatusNo === MessageStatusNo.ACTIVE &&
      message.MessageSeverityNo === MessageSeverityNo.MANDATORY_MUST_CONFIRM &&
      (!message.ExpiryTime || new Date(message.ExpiryTime) > new Date())
  );

  // if there is a message with MessageSeverityNo.MANDATORY_MUST_CONFIRM, show it
  if (message) {
    createConfirmMessageModal(message, confirmCallback);

    return true;
  }

  // otherwise, get the first active and not expired message with other MessageSeverityNo (if any)
  message = messages?.find(
    (message) =>
      message.MessageStatusNo === MessageStatusNo.ACTIVE &&
      message.MessageSeverityNo !== MessageSeverityNo.MANDATORY_MUST_CONFIRM &&
      (!message.ExpiryTime || new Date(message.ExpiryTime) > new Date())
  );

  // if there is no message, return - otherwise show it
  if (!message) {
    return false;
  }

  createNotificationMessage(message, voteCallback);

  return true;
};

/**
 * Create a modal to confirm a message with MessageSeverityNo.MANDATORY_MUST_CONFIRM
 *
 * @param {import("./client").Message} message
 * @param {(MessageID: string)} confirmCallback
 */
const createConfirmMessageModal = (message, confirmCallback) => {
  let confirmMessageModal = document.getElementById('confirmMessageModal');

  // if modal does not exist, create it, add event listener on submit and append it to body
  if (!confirmMessageModal) {
    confirmMessageModal = document.createElement('div');
    confirmMessageModal.id = 'confirmMessageModal';

    // add event listener on submit to call confirmCallback and hide modal on success
    confirmMessageModal.addEventListener('submit', async (e) => {
      e.preventDefault();

      const MessageID = e.target.MessageID.value;

      if (await confirmCallback(MessageID)) {
        hideModal('confirmMessageModal');
      }
    });

    document.body.appendChild(confirmMessageModal);
  }

  confirmMessageModal.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
        <div class="MARCI__absolute MARCI__bg-black/50 dark:MARCI__bg-black/80 MARCI__inset-0">
        </div>

        <div class="MARCI__fixed MARCI__inset-0 MARCI__overflow-y-auto">
          <div class="MARCI__flex MARCI__items-center MARCI__justify-center MARCI__min-h-full">
            <form>
              <div
                class="MARCI__align-center MARCI__bg-white dark:MARCI__bg-gray-900 dark:MARCI__text-gray-200 MARCI__inline-block MARCI__overflow-hidden sm:MARCI__rounded-lg MARCI__shadow-xl sm:MARCI__align-middle sm:MARCI__max-w-2xl sm:MARCI__my-8 sm:MARCI__w-full MARCI__text-left MARCI__transform MARCI__transition-all MARCI__prose dark:MARCI__prose-invert"
                role="dialog" aria-modal="true" aria-labelledby="modal-headline">

                <div class="MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__px-4 MARCI__pt-5 MARCI__pb-4 sm:MARCI__p-6 sm:MARCI__pb-4">

                  <h3 class="MARCI__mt-1 MARCI__mb-6">${message.MessageSubject}</h3>

                  <div class="MARCI__mb-6 MARCI__overflow-y-auto">${message.MessageBodyHTML}</div>

                  <label class="MARCI__font-semibold">
                    <input name="MessageID" value="${message.MessageID}" type="checkbox" class="MARCI__mr-2 dark:MARCI__bg-gray-700" required> 
                    I read and accept these terms & conditions
                  </label>
                </div>

                <div class="MARCI__bg-gray-200 dark:MARCI__bg-gray-850 MARCI__px-4 MARCI__py-3 MARCI__text-right">
                  <button type="submit" id="reportPromptSubmitButton" class="MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">Confirm
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>`;

  confirmMessageModal.style = 'display: block;';
};

/**
 * Create a notification message with thumb up/down buttons
 *
 * @param {import("./client").Message} message
 * @param {(MessageID: string, Vote: MessageVoteTypeNo)} voteCallback
 */
const createNotificationMessage = (message, voteCallback) => {
  const className =
    NotificationMessageSeverityClassName[message.MessageSeverityNo];

  const notificationElement = document.createElement('div');

  notificationElement.innerHTML = /*html*/ `
      <div class="MARCI__fixed MARCI__flex MARCI__justify-center MARCI__w-full MARCI__top-2 MARCI__px-2 MARCI__z-50 MARCI__pointer-events-none">
        <div class="${className} MARCI__flex MARCI__pointer-events-auto MARCI__px-6 MARCI__py-3 MARCI__rounded-md MARCI__text-white" role="alert" style="min-width: 30rem;">
          <div class="MARCI__flex MARCI__flex-col MARCI__gap-2 MARCI__w-full">

            <h4 class="MARCI__w-full">${message.MessageSubject}</h4>

            <div class="MARCI__prose MARCI__w-full MARCI__text-white">
              ${message.MessageBodyHTML}
            </div> 

            <div class="MARCI__flex MARCI__gap-4 MARCI__mt-4" style="justify-content: end;">
              <button data-message-vote-type-no="${
                MessageVoteTypeNo.MESSAGE_LIKE
              }" title="I like this">${svg('ThumbUp')}</button>
              <button data-message-vote-type-no="${
                MessageVoteTypeNo.MESSAGE_DISLIKE
              }" title="I don't like this">${svg('ThumbDown')}</button>
            </div>

          </div>
        </div>
      </div>
    `;

  // add event listener on like and dislike button to call voteCallback with MessageVoteTypeNo from data attribute and hide notification on success
  notificationElement.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', async (e) => {
      if (
        await voteCallback(
          message.MessageID,
          +e.target.closest('button').dataset.messageVoteTypeNo
        )
      ) {
        notificationElement.remove();
      }
    });
  });

  document.body.appendChild(notificationElement);
};

export { showMessage };
