import { registerChatGPTComContentScript } from '../utils.js';

document.addEventListener('DOMContentLoaded', function () {
  // Toggle dark mode based on user's system preference
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (isDarkMode) {
    document.querySelector('html').classList.add('dark');
  }

  // Set up i18n
  const elements = document.querySelectorAll('[data-i18n]');

  for (const element of elements) {
    const messageKey = element.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(messageKey);

    if (!message) {
      console.error(`No message found for key: ${messageKey}`);
      continue;
    }

    element.innerHTML = message;
  }

  // Button click event for requesting permission
  document
    .getElementById('requestPermission')
    .addEventListener('click', function () {
      chrome.permissions.request(
        {
          origins: ['https://chatgpt.com/*'],
        },
        function (granted) {
          if (granted) {
            // Register content script
            registerChatGPTComContentScript();

            // Confirm permission granted
            alert(chrome.i18n.getMessage('permissionsGranted'));

            // Open ChatGPT in the same tab
            window.location.href = 'https://chatgpt.com/';
          } else {
            // Handle denial
            console.error('ChatGPT.com - Permission denied.');

            alert(chrome.i18n.getMessage('permissionsDenied'));
          }
        }
      );
    });

  // check if optional permission for chatgpt.com is granted on load
  chrome.permissions.contains(
    { origins: ['https://chatgpt.com/*'] },
    function (hasPermission) {
      // if permission for chatgpt.com is granted -> show confirmation & redirect to ChatGPT
      if (hasPermission) {
        // Confirm permission granted
        alert(chrome.i18n.getMessage('permissionsGranted'));

        // re-register content script
        registerChatGPTComContentScript();

        // if permission is granted -> redirect to ChatGPT
        window.location.href = 'https://chatgpt.com/';
      }
      // if permission for chatgpt.com is not granted -> show request permission button (needs user interaction)
    }
  );
});
