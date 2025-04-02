import { ExportFilePrefix, ExportHeaderPrefix } from './config.js';

import { getUserOpenAI } from './utils.js';

/**
 * The Exporter class provides functionality to export the current chat as a markdown file.
 *
 * It includes methods to generate markdown content, process chat blocks, and handle different types of messages and additional content.
 */
export class Exporter {
  /** @type {import('./config.js').ExportConfig['Config']} */
  ExportConfig = null;

  /** @param {import('./config.js').Config} config */
  constructor(config) {
    this.Config = config;
    this.ExportConfig = config.getExportConfig();
  }

  /**
   * Exports the current chat as a markdown file.
   */
  exportCurrentChat() {
    const markdown = this.generateMarkdown();

    if (!markdown) {
      return;
    }

    const header = this.createHeader();

    this.downloadMarkdown(header + '\n\n\n' + markdown.join('\n\n---\n\n'));
  }

  /**
   * Generates markdown from chat blocks.
   *
   * @returns {Array<string>} An array of markdown strings generated from chat blocks.
   */
  generateMarkdown() {
    const enableExportChatV2 =
      this.Config.getPromptTemplatesConfig().EnableExportChatV2;

    const selectorConfig = this.Config.getSelectorConfig();

    const blocks = this.getChatBlocks(selectorConfig.ChatLogContainer);

    let markdown = blocks.map((block) =>
      this.processBlock(block, selectorConfig, enableExportChatV2)
    );

    return markdown.filter((b) => b);
  }

  /**
   * Retrieves all child elements (chat blocks) from containers matching the specified selector.
   *
   * @param {string} containerSelector - The CSS selector for the containers.
   * @returns {HTMLElement[]} An array of child elements from the matched containers.
   */
  getChatBlocks(containerSelector) {
    return [
      ...[...document.querySelectorAll(containerSelector)].reduce(
        (acc, container) => {
          acc.push(...container.children);
          return acc;
        },
        []
      ),
    ];
  }

  /**
   * Processes a block element based on the provided selector configuration and export version.
   *
   * @param {HTMLElement} block - The block element to process.
   * @param {import('./config.js').SelectorConfig} selectorConfig - The configuration object containing selector strings.
   * @param {boolean} enableExportChatV2 - Flag to determine whether to use the new export version (V2) or the old export version.
   * @returns {string} The processed block content as a string.
   */
  processBlock(block, selectorConfig, enableExportChatV2) {
    const wrapper = block.querySelector(
      selectorConfig.ConversationResponseWrapper
    );

    // no wrapper found - return empty string
    if (!wrapper) {
      return '';
    }

    // new export
    if (enableExportChatV2) {
      return this.processV2Block(block, selectorConfig);
    }

    // old export
    return this.processOldBlock(wrapper, selectorConfig);
  }

  /**
   * Processes a V2 block by selecting all response parts based on the provided selector configuration.
   *
   * @param {HTMLElement} block - The block element containing the responses to be processed.
   * @param {import('./config.js').SelectorConfig} selectorConfig - The configuration object containing the selectors for extracting responses.
   * @returns {string} A string containing the extracted messages, joined by a delimiter.
   */
  processV2Block(block, selectorConfig) {
    // select all response parts for V2
    const wrappers = [
      ...block.querySelectorAll(selectorConfig.ConversationResponseWrapper),
    ];

    return wrappers
      .map((wrp) => this.extractMessage(wrp, selectorConfig))
      .join('\n\n---\n\n');
  }

  /**
   * Extracts the message text from a React component wrapper based on the provided selector configuration.
   *
   * @param {HTMLElement} wrapper - The React component wrapper containing the message.
   * @param {import('./config.js').SelectorConfig} selectorConfig - Configuration object containing the React Fiber property key.
   * @returns {string} The extracted and formatted message text. Returns an empty string if the React Fiber property or props are not found.
   */
  extractMessage(wrapper, selectorConfig) {
    // find React props
    const reactFiberKey = Object.keys(wrapper).find((key) =>
      key?.includes(selectorConfig.ReactFiberPropertyKey)
    );

    // no React Fiber property found in the message - return empty string (we can't extract the message)
    if (!reactFiberKey) {
      console.error('Failed to find React Fiber property in the message');
      return '';
    }

    const props = wrapper?.[reactFiberKey]?.return?.memoizedProps ?? null;

    // no props found in the message - return empty string (we can't extract the message)
    if (!props) {
      console.error('Failed to find props in the message');
      return '';
    }

    // find message text
    let text = this.getMessageText(props);

    // add additional content, content references, and sources
    text = this.addAdditionalContent(props, text);
    text = this.addContentReferences(props, text);
    text = this.addSources(props, text);

    // format message text
    return this.formatMessage(props, text);
  }

  /**
   * Processes the message text by removing citation placeholders and formatting the text parts.
   *
   * @param {Object} props - The properties object containing display parts.
   * @returns {string} - The processed message text with citations removed and parts formatted.
   */
  getMessageText(props) {
    // remove citations placeholders from the text
    const citationsPattern = new RegExp(
      this.ExportConfig.CitationsPattern,
      'g'
    );

    return (
      props?.displayParts
        ?.map(
          (part) =>
            (part.type && part.type !== this.ExportConfig.ContentTypeText
              ? `[${part.type}]\n`
              : '') + (part.text?.replace(citationsPattern, '') ?? '')
        )
        .join('\n') ?? ''
    );
  }

  /**
   * Adds additional content to the provided text based on the previous grouped messages in the props.
   *
   * @param {Object} props - The properties object containing previous grouped messages.
   * @param {string} text - The initial text to which additional content will be added.
   * @returns {string} - The text with additional content appended.
   */
  addAdditionalContent(props, text) {
    // no previous grouped messages - return the text as is
    if (!props.prevGroupedMessages) {
      return text;
    }

    props.prevGroupedMessages.forEach((group) => {
      // canvas content
      if (
        group?.message?.recipient &&
        this.ExportConfig.CanvasRecipients.includes(
          group?.message?.recipient
        ) &&
        group?.message?.content?.parts?.[0]
      ) {
        const content = JSON.parse(group.message.content.parts[0]);

        // check if content has name and content - if not, skip
        if (!content?.name || !content?.content) {
          return;
        }

        text += `\n\n\`\`\`\n# ${content.name}\n\n${content.content}\n\`\`\``;
        return;
      }

      // data analysis
      if (
        group?.message?.content?.content_type &&
        this.ExportConfig.DataAnalysisContentTypes.includes(
          group?.message?.content?.content_type
        ) &&
        group?.message?.content?.text
      ) {
        text += `\n\n\`\`\`\n${group.message.content.text}\n\`\`\``;
        return;
      }

      // chain-of-thought summary
      if (
        group?.message?.author?.name &&
        this.ExportConfig.ChainOfThoughtAuthorNames.includes(
          group?.message?.author?.name
        ) &&
        group?.message?.content?.content_type ===
          this.ExportConfig.ContentTypeText &&
        group?.message?.content?.parts?.[0]
      ) {
        const part = group.message.content.parts[0];
        text += `\n\n\`\`\`\n${part}\n\`\`\``;
      }
    });

    return text;
  }

  /**
   * Adds content references to the provided text.
   *
   * @param {Object} props - The properties object containing content references.
   * @param {string} text - The initial text to which content references will be added.
   * @returns {string} The text with added content references.
   */
  addContentReferences(props, text) {
    props.contentReferences?.forEach((ref) => {
      // check if reference has a prompt text - if so, add it to the text
      if (ref.prompt_text) {
        text += '\n\n' + ref.prompt_text;
        return;
      }

      // otherwise, check if reference is a video - if so, add video thumbnail and URL
      if (ref.type === this.ExportConfig.ContentTypeVideo) {
        text += `\n\n[![${ref.title}](${ref.thumbnail_url})](${ref.url})`;
      }
    });

    return text;
  }

  /**
   * Adds sources to the provided text based on the metadata in the props object.
   *
   * @param {Object} props - The properties object containing messages and metadata.
   * @param {string} text - The text to which sources will be added.
   * @returns {string} The text with added sources if available.
   */
  addSources(props, text) {
    // no search result groups in the metadata - return the text as is
    if (!props.messages?.[0]?.message?.metadata?.search_result_groups) {
      return text;
    }

    text += '\n\n**Sources:**\n';

    props.messages[0].message.metadata.search_result_groups.forEach((group) => {
      group.entries.forEach((entry) => {
        text += `\n\n- [${entry.title}](${entry.url})\n\n  ${entry.snippet}`;
      });
    });

    return text;
  }

  /**
   * Formats a message with author and timestamp.
   *
   * @param {Object} props - The properties object.
   * @param {string} text - The text of the message to format.
   * @returns {string} The formatted message string.
   */
  formatMessage(props, text) {
    const author = props?.isUserTurn ? 'User' : 'ChatGPT';

    const createTime = props?.messages?.[0]?.message?.create_time
      ? ` (${new Date(
          props.messages[0].message.create_time * 1000
        ).toISOString()})`
      : '';

    // formatted message as "Author (Timestamp): Message"
    return `**${author}${createTime}:**\n` + text;
  }

  /**
   * Processes an old message block and formats it based on whether it is a user's message or an assistant's message.
   *
   * @param {HTMLElement} wrapper - The HTML element containing the message block.
   * @param {import('./config.js').SelectorConfig} selectorConfig - Configuration object containing CSS selectors.
   * @returns {string} - Formatted message string indicating whether it is from the user or the assistant.
   */
  processOldBlock(wrapper, selectorConfig) {
    // wrapper doesn't match conversation response selector - it's user's message
    if (!wrapper.querySelector(selectorConfig.ConversationResponse)) {
      return '**User:**\n' + wrapper.innerText;
    }

    // pass this point is assistant's message
    const assistantWrapper = wrapper.firstChild;

    return (
      '**ChatGPT:**\n' +
      [...assistantWrapper.children]
        .map((node) => this.formatOldMessage(node))
        .join('\n')
    );
  }

  /**
   * Formats the content of a given DOM node into a string.
   *
   * If the node is a <pre> element, it extracts the programming language from the
   * class of the <code> element inside it and formats the content as a code block.
   * Otherwise, it returns the inner HTML of the node.
   *
   * @param {HTMLElement} node - The DOM node to format.
   * @returns {string} The formatted content of the node.
   */
  formatOldMessage(node) {
    let language;

    if (node.nodeName === 'PRE') {
      language =
        node.getElementsByTagName('code')[0]?.classList[2]?.split('-')[1] || '';

      return `\`\`\`${language}\n${node.innerText
        .replace(/^.*\n?Copy code/g, '')
        .trim()}\n\`\`\``;
    }

    return `${node.innerHTML}`;
  }

  /**
   * Creates a header string containing user information and the current date and time.
   *
   * @returns {string} The constructed header string.
   */
  createHeader() {
    let header = '';

    try {
      header =
        ExportHeaderPrefix +
        (getUserOpenAI()?.name || '') +
        ' on ' +
        new Date().toLocaleString() +
        '\n```\n\n---';
    } catch {
      console.error(
        'Failed to get user name from getUserOpenAI(). Using default header instead.'
      );
    }

    return header;
  }

  /**
   * Downloads the given content as a Markdown (.md) file.
   *
   * @param {string} content - The content to be downloaded as a Markdown file.
   */
  downloadMarkdown(content) {
    const blob = new Blob([content], { type: 'text/plain' });

    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = ExportFilePrefix + new Date().toISOString() + '.md';

    document.body.appendChild(a);

    a.click();
  }
}
