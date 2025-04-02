const svg = function (name) {
  name = Array.isArray(name) ? name[0] : name;
  switch (name) {
    case 'Rocket':
      return '<svg stroke="currentColor" fill="currentColor" height="1rem" width="1rem" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-25.91 -25.91 310.92 310.92" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M256.468,2.637c-1.907-1.907-4.575-2.855-7.25-2.593L228.027,2.14c-33.604,3.324-65.259,18.304-89.135,42.18 l-0.365,0.365l-5.298-2.038c-23.593-9.073-50.386-3.388-68.262,14.486l-54.008,54.008c-0.096,0.091-0.188,0.184-0.279,0.279 l-8.044,8.043c-3.515,3.515-3.515,9.213,0,12.728c3.516,3.515,9.213,3.515,12.729,0l4.051-4.051l32.714,12.582 c0.372,0.618,0.813,1.206,1.347,1.739l3.65,3.65l-10.583,10.583c-3.49,3.49-3.51,9.129-0.071,12.649 c-17.598,19.116-23.107,33.004-32.352,56.335c-1.229,3.099-2.53,6.384-3.942,9.889c-1.543,3.823-0.657,8.178,2.257,11.095 c1.965,1.966,4.584,3.011,7.255,3.011c1.291,0,2.595-0.244,3.842-0.746c3.509-1.414,6.793-2.715,9.892-3.943 c23.33-9.246,37.219-14.755,56.336-32.353c1.748,1.707,4.015,2.564,6.285,2.564c2.304,0,4.606-0.879,6.364-2.636l10.582-10.582 l3.649,3.649c0.525,0.524,1.112,0.968,1.738,1.344l12.583,32.718l-4.051,4.051c-3.515,3.515-3.515,9.213,0,12.728 c1.758,1.758,4.061,2.636,6.364,2.636c2.303,0,4.606-0.879,6.364-2.636l8.043-8.043c0.096-0.091,0.188-0.185,0.279-0.28 l54.01-54.009c17.874-17.875,23.56-44.669,14.485-68.261l-2.037-5.298l0.365-0.365c23.876-23.876,38.856-55.532,42.18-89.135 l2.096-21.191C259.325,7.204,258.374,4.543,256.468,2.637z M33.343,114.214l44.353-44.352 c12.291-12.291,30.45-16.558,46.85-11.196l-65.453,65.452L33.343,114.214z M33.537,225.569 c7.256-18.099,12.332-28.892,25.667-43.484l17.816,17.816C62.428,213.236,51.633,218.313,33.537,225.569z M96.044,193.469 L65.635,163.06l4.219-4.219l30.409,30.409L96.044,193.469z M123.005,186.536L72.568,136.1l59.424-59.423l50.436,50.436 L123.005,186.536z M189.242,181.409l-44.352,44.352l-9.904-25.751l65.451-65.451 C205.801,150.958,201.534,169.117,189.242,181.409z M239.052,29.306c-2.915,29.473-16.054,57.237-36.996,78.179l-6.9,6.9 L144.72,63.949l6.901-6.901c20.94-20.941,48.705-34.08,78.178-36.995l10.27-1.016L239.052,29.306z"></path> <path d="M195.926,40.017c-6.187,0-12.003,2.409-16.378,6.784c-9.03,9.03-9.03,23.725,0,32.755 c4.375,4.375,10.191,6.784,16.378,6.784s12.003-2.409,16.378-6.784c9.03-9.03,9.03-23.725,0-32.755 C207.929,42.426,202.113,40.017,195.926,40.017z M199.575,66.828c-0.975,0.975-2.271,1.512-3.649,1.512 c-1.378,0-2.675-0.537-3.649-1.512c-2.013-2.013-2.013-5.287,0-7.3c0.975-0.975,2.271-1.512,3.649-1.512 c1.378,0,2.675,0.537,3.649,1.512C201.588,61.541,201.588,64.816,199.575,66.828z"></path> </g> </g> </g> </g></svg>';
    case 'Export':
      return '<svg fill="none" stroke-width="1.5" stroke="currentColor" class="MARCI__h-4 MARCI__w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"></path></svg>';
    case 'PromptBubble':
      return '<svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="MARCI__h-6 MARCI__w-6 MARCI__m-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>';
    case 'Save':
      return '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3"></path></svg>';
    case 'Cross':
      return '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    case 'CrossLarge':
      return '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="MARCI__h-5 MARCI__w-5" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    case 'CrossExtraLarge':
      return '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="MARCI__h-11 MARCI__w-11" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    case 'Edit':
      return '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    case 'ThumbUp':
      return '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>';
    case 'ThumbDown':
      return '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>';
    case 'Report':
      return '<svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    case 'Plus':
      return '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
    case 'Globe':
      return '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"></path></svg>';
    case 'Lock':
      return '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"></path></svg>';
    case 'Eye':
      return '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>';
    case 'Quote':
      return '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    case 'Link':
      return '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"></path></svg>';
    case 'Topic':
      return '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-4 MARCI__w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path></svg>';
    case 'StarSolidLarge':
      return '<svg fill="currentColor" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-5 MARCI__w-5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"></path></svg>';
    case 'Star':
      return '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-4 MARCI__w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"></path></svg>';
    case 'StarSolid':
      return '<svg fill="currentColor" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-4 MARCI__w-4 text-gray-500 dark:text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"></path></svg>';
    case 'Trash':
      return '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-4 MARCI__w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path></svg>';
    case 'SquaresPlus':
      return '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-4 MARCI__w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"></path></svg>';
    case 'CheckBadgeSolidLarge':
      return '<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="MARCI__h-5 MARCI__w-5"><path clip-rule="evenodd" fill-rule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"></path></svg>';
    case 'TeamList':
      return '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="MARCI__h-5 MARCI__w-5" xmlns="http://www.w3.org/2000/svg"><path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    case 'TeamListSolid':
      return '<svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" class="MARCI__h-5 MARCI__w-5" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" fill-rule="evenodd"></path><path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z"></path></svg>';
    case 'TeamPrompt':
      return '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="MARCI__h-4 MARCI__w-4"><path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    case 'EllipsisVertical':
      return '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="MARCI__h-4 MARCI__w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    case 'Share':
      return '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="MARCI__h-4 MARCI__w-4" xmlns="http://www.w3.org/2000/svg"><path d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    case 'EyeSlash':
      return '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="MARCI__h-5 MARCI__w-5" xmlns="http://www.w3.org/2000/svg"><path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    case 'Referral':
      return '<svg class="MARCI__flex-shrink-0" fill="none" stroke="currentColor" height="1rem" width="1rem" aria-hidden="true" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    case 'ReferralHuge':
      return '<svg fill="none" stroke="currentColor" height="4rem" width="4rem" aria-hidden="true" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  }
};

const css = function (name) {
  name = Array.isArray(name) ? name[0] : name;

  switch (name) {
    case 'VersionInfo':
      return 'MARCI__flex MARCI__py-3 MARCI__px-3 MARCI__items-center MARCI__gap-3 MARCI__rounded-md hover:MARCI__bg-gray-100 dark:hover:MARCI__bg-gray-850 MARCI__transition-colors MARCI__duration-200 MARCI__cursor-pointer MARCI__text-sm dark:MARCI__text-gray-100 MARCI__text-gray-900';
    case 'ExportButton':
      return 'MARCI__flex MARCI__py-3 MARCI__px-3 MARCI__items-center MARCI__gap-3 MARCI__rounded-md hover:MARCI__bg-gray-100 dark:hover:MARCI__bg-gray-850 MARCI__transition-colors MARCI__duration-200 MARCI__cursor-pointer MARCI__text-sm dark:MARCI__text-gray-100 MARCI__text-gray-900';
    case 'column':
      return 'MARCI__flex MARCI__flex-col MARCI__gap-3.5 MARCI__flex-1';
    case 'h2':
      return 'MARCI__text-lg MARCI__font-normal';
    case 'h3':
      return 'MARCI__m-0 MARCI__text-gray-900 dark:MARCI__text-gray-100 MARCI__text-xl';
    case 'ul':
      return 'MARCI__gap-3.5';
    case 'card':
      return 'MARCI__flex MARCI__flex-col MARCI__gap-2 MARCI__w-full MARCI__bg-gray-50 dark:MARCI__bg-gray-850 MARCI__p-4 MARCI__rounded-md hover:MARCI__bg-gray-200 dark:hover:MARCI__bg-gray-800 MARCI__text-left';
    case 'p':
      return 'MARCI__m-0 MARCI__text-gray-500';
    case 'paginationText':
      return 'MARCI__text-sm MARCI__text-gray-700 dark:MARCI__text-gray-400';
    case 'paginationNumber':
      return 'MARCI__font-semibold MARCI__text-gray-900 dark:MARCI__text-white';
    case 'paginationButtonGroup':
      return 'MARCI__inline-flex xs:MARCI__mt-0';
    case 'paginationButton':
      return 'MARCI__px-4 MARCI__py-2 MARCI__font-medium MARCI__bg-gray-100 hover:MARCI__bg-gray-200 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__text-white dark:hover:MARCI__bg-gray-800';
    case 'continueButton':
      return 'MARCI__py-2 MARCI__font-medium MARCI__bg-gray-100 hover:MARCI__bg-gray-200 dark:MARCI__bg-gray-850 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 MARCI__bg-gray disabled:MARCI__text-gray-300 disabled:hover:MARCI__bg-transparent MARCI__rounded-l-md MARCI__px-4';
    case 'continueActionSelect':
      return 'MARCI__bg-gray-100 MARCI__border-0 MARCI__border-l MARCI__text-sm MARCI__rounded-r-md MARCI__block MARCI__w-2 dark:MARCI__bg-gray-850 MARCI__border-gray-200 dark:MARCI__border-gray-700 dark:hover:MARCI__bg-gray-800 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200 focus:MARCI__ring-0 focus:MARCI__border-gray-200 MARCI__pr-6';
    case 'action':
      return 'MARCI__p-1 MARCI__rounded-md hover:MARCI__bg-gray-100 hover:MARCI__text-gray-700 dark:MARCI__text-gray-400 dark:hover:MARCI__bg-gray-700 dark:hover:MARCI__text-gray-200 disabled:dark:hover:MARCI__text-gray-400 md:MARCI__invisible md:group-hover:MARCI__visible';
    case 'tag':
      return 'MARCI__inline-flex MARCI__items-center MARCI__py-1 MARCI__px-2 MARCI__mr-2 MARCI__mb-2 MARCI__text-sm MARCI__font-medium MARCI__text-white MARCI__rounded MARCI__bg-gray-850 MARCI__whitespace-nowrap';
    case 'languageSelectWrapper':
      return 'MARCI__flex MARCI__gap-3 lg:MARCI__max-w-3xl md:last:MARCI__mb-6 MARCI__ml-2 md:MARCI__ml-0 MARCI__pt-2 MARCI__stretch MARCI__justify-between MARCI__text-sm MARCI__items-end MARCI__pb-2 MARCI__mb-2 MARCI__border-b MARCI__flex-col sm:MARCI__flex-row dark:MARCI__border-gray-700';
    case 'select':
      return 'MARCI__bg-gray-100 MARCI__border-0 MARCI__text-sm MARCI__rounded MARCI__block MARCI__w-full dark:MARCI__bg-gray-850 dark:MARCI__border-gray-600 dark:hover:MARCI__bg-gray-800 dark:MARCI__placeholder-gray-400 dark:MARCI__text-white hover:MARCI__bg-gray-200 focus:MARCI__ring-0';
    case 'selectLabel':
      return 'MARCI__block MARCI__text-sm MARCI__font-medium';
  }
};

// See also https://developer.chrome.com/docs/extensions/mv3/security/#sanitize
const sanitizeInput = function (input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
};

// hide modal with modalID
const hideModal = function (modalID, showMessages = false) {
  const modal = document.getElementById(modalID);

  if (!modal) {
    return;
  }

  // remove the modal from the DOM
  modal.remove();

  // show messages after closing the modal with a small delay
  if (showMessages) {
    setTimeout(() => {
      window.MARCI.showMessages();
    }, 1000);
  }
};

// capitalize the first letter of each word
const capitalizeWords = function (string) {
  return string.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// format the date and time as YYYY-MM-DD HH:MM:SS
const formatDateTime = function (timestamp) {
  const d = new Date(timestamp);

  if (!d || d == 'Invalid Date') {
    return '';
  }

  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().split(' ')[0];

  return `${date} ${time}`;
};

// format the timestamp as X {unit} ago
const formatAgo = function (timestamp) {
  const d = new Date(timestamp);

  if (!d || d == 'Invalid Date') {
    return '';
  }

  const now = new Date();
  const diff = Math.max(0, now - d);

  const units = [
    { name: 'year', value: 31556952000 },
    { name: 'month', value: 2629746000 },
    { name: 'week', value: 604800000 },
    { name: 'day', value: 86400000 },
    { name: 'hour', value: 3600000 },
    { name: 'minute', value: 60000 },
    { name: 'second', value: 1000 },
  ];

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];

    if (diff >= unit.value) {
      const unitCount = Math.floor(diff / unit.value);
      const unitName = unitCount > 1 ? unit.name + 's' : unit.name;

      return `${unitCount} ${unitName} ago`;
    }
  }

  return 'just now';
};

const formatHumanReadableNumber = function (number) {
  if (number < 1000) {
    return number;
  }

  if (number < 1000000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return `${(number / 1000000).toFixed(1)}M`;
};

const hasFeature = function (bitset, feature) {
  return (bitset & feature) === feature;
};

/**
 * Retrieve the OpenAI user from various global window objects, if available.
 *
 * @returns {Object} The user object from window or null if not found.
 */
const getUserOpenAI = function () {
  // Check possible places where user info might exist
  const user =
    window?.__reactRouterContext?.state?.loaderData?.root?.clientBootstrap
      ?.user ||
    window?.__remixContext?.state?.loaderData?.root?.clientBootstrap?.user ||
    window?.__NEXT_DATA__?.props?.pageProps?.user ||
    null;

  return user;
};

// register content script for ChatGPT.com, if not already registered - otherwise update it
const registerChatGPTComContentScript = function () {
  const scriptID = 'ChatGPTComContentScript';

  // update content script, if already registered to prevent duplicate ID error
  chrome.scripting.getRegisteredContentScripts(
    ({ ids: [scriptID] },
    (contentScripts) => {
      // update content script
      if (contentScripts?.length > 0) {
        chrome.scripting.updateContentScripts(contentScripts);

        return;
      }

      // register content script
      chrome.scripting.registerContentScripts([
        {
          id: scriptID,
          matches: ['https://chatgpt.com/*'],
          js: ['content_script.js'],
          runAt: 'document_end',
        },
      ]);
    })
  );
};

export {
  css,
  svg,
  sanitizeInput,
  hideModal,
  capitalizeWords,
  formatDateTime,
  formatAgo,
  formatHumanReadableNumber,
  hasFeature,
  registerChatGPTComContentScript,
  getUserOpenAI,
};
