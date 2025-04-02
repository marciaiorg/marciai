'use strict';

import { registerChatGPTComContentScript } from '../utils.js';
import { VERSION } from '../version.js';

// open permission page on redirect to chatgpt.com, if optional permission is not granted
chrome.webRequest.onBeforeRedirect.addListener(
  function (details) {
    // Check the target URL of the redirect
    const targetURL = details?.redirectUrl;

    if (targetURL?.includes('https://chatgpt.com')) {
      // check permissions
      chrome.permissions.contains(
        { origins: ['https://chatgpt.com/*'] },
        function (hasPermission) {
          if (!hasPermission) {
            // open permissions page
            openPermissions();
          }
        }
      );
    }
  },
  { urls: ['https://chat.openai.com/*'], types: ['main_frame'] }
);

function openChatGPT() {
  chrome.tabs.create({ url: 'https://chat.openai.com/' });
}

function openPermissions() {
  chrome.tabs.create({ url: 'permissions.html' });
}

// open success page on successful install in the background
function openSuccessPage(reason) {
  if (reason !== 'install') {
    return;
  }

  // MarciAI_change
  // chrome.tabs.create({
  //   url: `https://www.aiprm.com/success/install-chatgpt?utm_campaign=success-install&utm_content=${VERSION}&utm_source=chatgpt&utm_medium=extension`,
  //   active: false,
  // });
}

chrome.runtime.onInstalled.addListener(function (details) {
  // only verify permissions on install and update
  if (!['install', 'update'].includes(details.reason)) {
    return;
  }

  // check if optional permission for chatgpt.com is granted
  chrome.permissions.contains(
    { origins: ['https://chatgpt.com/*'] },
    function (hasPermission) {
      if (!hasPermission) {
        // if permission for chatgpt.com is not granted open permissions
        openPermissions();

        openSuccessPage(details.reason);
      } else {
        // re-register content script
        registerChatGPTComContentScript();

        // if permission is granted and it is an install event open chatgpt.com
        if (details.reason !== 'install') {
          return;
        }

        openChatGPT();

        openSuccessPage(details.reason);
      }
    }
  );
});

// open permissions page on icon click or ChatGPT if optional permission is granted already
chrome.action.onClicked.addListener(() => {
  chrome.permissions.contains(
    { origins: ['https://chatgpt.com/*'] },
    function (hasPermission) {
      if (!hasPermission) {
        // if permission for chatgpt.com is not granted open permissions
        openPermissions();
      } else {
        // re-register content script
        registerChatGPTComContentScript();

        // if permission is granted open ChatGPT
        openChatGPT();
      }
    }
  );
});

let connections = [];

// listen for connections from content scripts
chrome.runtime.onConnect.addListener(function (port) {
  // only accept connections from our extension
  if (port.name !== 'MARCI') {
    return;
  }

  // add connection to list of connections with tab id as key
  connections[port.sender.tab.id] = port;

  // add disconnect listener to remove connection from list
  port.onDisconnect.addListener(function () {
    delete connections[port.sender.tab.id];
  });

  // listen for messages from content script
  port.onMessage.addListener(function (message) {
    // only accept messages from our extension
    if (message.from !== 'MARCI') {
      return;
    }

    if (message.data?.type === 'MARCI.favoritePrompts') {
      // remove all context menu items
      chrome.contextMenus.removeAll();

      // insert new context menu items
      insertContextMenuItems(message.data.favoritePrompts);
    }
  });
});

// listen for messages from MARCI APP
chrome.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  // only accept messages from our extension with tokens
  if (!request.tokens) {
    sendResponse({ success: false });
    return;
  }

  // no connections available
  if (!connections.length) {
    sendResponse({ success: false });
    return;
  }

  // send to connections
  for (let tabId in connections) {
    connections[tabId].postMessage({
      type: 'tokens',
      tokens: request.tokens,
    });
  }

  sendResponse({ success: true });
});

// mapping of prompt IDs to context menu item IDs
const contextMenuPromptMap = {
  MARCI_MIDJOURNEY_V5_LIVE: '1837526819881603072',
  MARCI_OUTRANK_ARTICLE: '1000101',
  MARCI_OUTRANK_ARTICLE_LIVE: '1806246638470299648',
  MARCI_SUMMARIZE: '1783773498066604032',
  MARCI_SUMMARIZE_LIVE: '1837503888648581120',
  MARCI_FIND_QUESTIONS: '1000109',
  MARCI_FIND_QUESTIONS_LIVE: '1837517873166934016',
  MARCI_SOCIAL_MEDIA_POSTS_LIVE: '1837511372687810560',
  MARCI_SPELLING_GRAMMAR: '1788887681418391552',
  MARCI_CUSTOM: '',
};

// Handle context menu item clicks
chrome.contextMenus.onClicked.addListener(function (info) {
  let prompt = `${[info.selectionText || '', info.pageUrl].join('\n\n')}`;
  let promptID =
    info.menuItemId === 'MARCI_CUSTOM'
      ? ''
      : contextMenuPromptMap[info.menuItemId] || info.menuItemId;

  // remove _LIVE suffix
  promptID = promptID.replace('_LIVE', '');

  // menu item ID ends with _LIVE = live crawling
  if (info.menuItemId.endsWith('_LIVE')) {
    prompt = info.pageUrl;
  }

  // open new tab with MARCI and prefill MARCI_Prompt and MARCI_PromptID
  chrome.tabs.create(
    {
      url: `https://chat.openai.com/${
        promptID ? `?MARCI_PromptID=${promptID}` : ''
      }`,
    },
    function (newTab) {
      sendPromptMessageToTab(prompt, newTab.id);
    }
  );
});

// send prompt message to tab ID
function sendPromptMessageToTab(prompt, tabID) {
  chrome.tabs.sendMessage(
    tabID,
    {
      type: 'MARCI.prompt',
      prompt,
    },
    function () {
      if (chrome.runtime.lastError) {
        // retry sending message
        setTimeout(function () {
          sendPromptMessageToTab(prompt, tabID);
        }, 1000);
      }
    }
  );
}

// Pre-fill prompt input with user input using omnibox
chrome.omnibox.onInputEntered.addListener((text) => {
  chrome.tabs.create({
    url: `https://chat.openai.com/?MARCI_Prompt=${encodeURIComponent(text)}`,
  });
});

function insertContextMenuItems(favoritePrompts = []) {
  // Create a context menu item "MARCI" with icon with sub-items
  chrome.contextMenus.create({
    id: 'MARCI',
    title: 'MARCI for ChatGPT',
    contexts: ['selection', 'page'],
  });

  // Favorites
  if (favoritePrompts.length > 0) {
    chrome.contextMenus.create({
      id: 'MARCI_FAVORITES',
      parentId: 'MARCI',
      title: 'Favorites',
      contexts: ['selection', 'page'],
      enabled: false,
    });
  }

  favoritePrompts?.forEach((prompt) => {
    chrome.contextMenus.create({
      id: prompt.ID,
      parentId: 'MARCI',
      title: prompt.Title,
      contexts: ['selection', 'page'],
    });
  });

  if (favoritePrompts.length > 0) {
    // Separator
    chrome.contextMenus.create({
      id: 'MARCI_SEPARATOR_FAVORITES',
      parentId: 'MARCI',
      type: 'separator',
      contexts: ['selection', 'page'],
    });
  }

  // Non-Live Crawling context menu items
  chrome.contextMenus.create({
    id: 'MARCI_HEADER',
    parentId: 'MARCI',
    title: 'Suggested',
    contexts: ['selection', 'page'],
    enabled: false,
  });

  chrome.contextMenus.create({
    id: 'MARCI_FIND_QUESTIONS',
    parentId: 'MARCI',
    title: 'Find Questions',
    contexts: ['selection', 'page'],
  });

  chrome.contextMenus.create({
    id: 'MARCI_OUTRANK_ARTICLE',
    parentId: 'MARCI',
    title: 'Outrank Article',
    contexts: ['selection', 'page'],
  });

  chrome.contextMenus.create({
    id: 'MARCI_SPELLING_GRAMMAR',
    parentId: 'MARCI',
    title: 'Spelling and Grammar',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'MARCI_SUMMARIZE',
    parentId: 'MARCI',
    title: 'Summarize',
    contexts: ['selection'],
  });

  // Separator
  chrome.contextMenus.create({
    id: 'MARCI_LIVE_CRAWLING',
    parentId: 'MARCI',
    type: 'separator',
    contexts: ['selection', 'page'],
  });

  // MarciAI_change: temp disable live crawling
  // // Live Crawling context menu items
  // chrome.contextMenus.create({
  //   id: 'MARCI_LIVE_CRAWLING_HEADER',
  //   parentId: 'MARCI',
  //   title: 'Live Crawling',
  //   contexts: ['selection', 'page'],
  //   enabled: false,
  // });

  // chrome.contextMenus.create({
  //   id: 'MARCI_FIND_QUESTIONS_LIVE',
  //   parentId: 'MARCI',
  //   title: 'Find Questions',
  //   contexts: ['selection', 'page'],
  // });

  // chrome.contextMenus.create({
  //   id: 'MARCI_MIDJOURNEY_V5_LIVE',
  //   parentId: 'MARCI',
  //   title: 'Midjourney V5 Prompts',
  //   contexts: ['selection', 'page'],
  // });

  // chrome.contextMenus.create({
  //   id: 'MARCI_OUTRANK_ARTICLE_LIVE',
  //   parentId: 'MARCI',
  //   title: 'Outrank Article',
  //   contexts: ['selection', 'page'],
  // });

  // chrome.contextMenus.create({
  //   id: 'MARCI_SOCIAL_MEDIA_POSTS_LIVE',
  //   parentId: 'MARCI',
  //   title: 'Social Media Posts',
  //   contexts: ['selection', 'page'],
  // });

  // chrome.contextMenus.create({
  //   id: 'MARCI_SUMMARIZE_LIVE',
  //   parentId: 'MARCI',
  //   title: 'Summarize',
  //   contexts: ['selection', 'page'],
  // });

  // Separator
  chrome.contextMenus.create({
    id: 'MARCI_SEPARATOR_CUSTOM',
    parentId: 'MARCI',
    type: 'separator',
    contexts: ['selection', 'page'],
  });

  chrome.contextMenus.create({
    id: 'MARCI_CUSTOM_HEADER',
    parentId: 'MARCI',
    title: 'Custom',
    contexts: ['selection', 'page'],
    enabled: false,
  });

  // Custom Prompt context menu item
  chrome.contextMenus.create({
    id: 'MARCI_CUSTOM',
    parentId: 'MARCI',
    title: 'Custom Prompt',
    contexts: ['selection', 'page'],
  });
}
