import { hideModal, svg } from './utils.js';
import {
  QuickStartOnboardingDarkURL,
  QuickStartOnboardingURL,
  QuickStartTutorialURL,
  TutorialsURL,
} from './config.js';

const onboardingShownKey = 'MARCI_onboardingShown';
const onboardingModalID = 'onboardingModal';

const showOnboarding = (lastPromptTemplateTypeKey, cacheBuster) => {
  const wasShown = getOnboardingShown(lastPromptTemplateTypeKey);

  if (wasShown) {
    return false;
  }

  let modal = document.getElementById(onboardingModalID);

  // if modal does not exist, create it, add event listener on submit and append it to body
  if (!modal) {
    modal = document.createElement('div');
    modal.id = onboardingModalID;
    document.body.appendChild(modal);
  }

  modal.innerHTML = /*html*/ `
        <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
            <div class="MARCI__absolute MARCI__bg-black/50 dark:MARCI__bg-black/80 MARCI__inset-0"></div>

            <div class="MARCI__fixed MARCI__inset-0 MARCI__overflow-y-auto">
                <div class="MARCI__fixed MARCI__inset-0 MARCI__text-center MARCI__transition-opacity MARCI__z-50">
                    <div class="MARCI__flex MARCI__items-center MARCI__justify-center MARCI__min-h-full">
                        <div class="MARCI__align-center MARCI__bg-white dark:MARCI__bg-gray-900 dark:MARCI__text-gray-200 MARCI__inline-block MARCI__overflow-hidden sm:MARCI__rounded-lg MARCI__shadow-xl sm:MARCI__align-middle MARCI__text-left MARCI__transform MARCI__transition-all"
                            role="dialog" aria-modal="true" aria-labelledby="modal-headline">

                            <div class="MARCI__bg-white dark:MARCI__bg-gray-900 MARCI__px-4 MARCI__pt-5 MARCI__pb-4 sm:MARCI__p-6 sm:MARCI__pb-4">
                                <div class="MARCI__flex MARCI__gap-4 MARCI__border-b MARCI__border-gray-200 dark:MARCI__border-gray-700 MARCI__my-4">
                                    <h3 class="MARCI__m-0 MARCI__text-gray-900 dark:MARCI__text-gray-100 MARCI__text-xl MARCI__whitespace-nowrap">MARCI Quick start tutorial</h3>
                                    <div class="MARCI__text-right MARCI__w-full">
                                        <button id="MARCI__onboardingCloseButton">${svg(
                                          'CrossLarge'
                                        )}</button>
                                    </div>
                                </div>

                                <a href="${QuickStartTutorialURL}" target="_blank" rel="noopener noreferrer">
                                    <img src="${QuickStartOnboardingURL}?v=${cacheBuster}" title="MARCI Quick start tutorial" alt="MARCI Quick start tutorial" class="MARCI__max-h-60vh MARCI__my-4 dark:MARCI__hidden" />
                                    <img src="${QuickStartOnboardingDarkURL}?v=${cacheBuster}" title="MARCI Quick start tutorial" alt="MARCI Quick start tutorial" class="MARCI__max-h-60vh MARCI__my-4 MARCI__hidden dark:MARCI__block" />
                                </a>
                            </div>

                            <div class="MARCI__bg-gray-200 dark:MARCI__bg-gray-850 MARCI__px-4 MARCI__py-3 MARCI__text-right">
                                <a href="${TutorialsURL}" target="_blank" rel="noopener noreferrer" title="View MARCI tutorials for more information"
                                    class="MARCI__bg-blue-600 hover:MARCI__bg-blue-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">View tutorials
                                </a>
                                
                                <button id="MARCI__onboardingOkButton" type="button" title="Close this dialog and start using MARCI"
                                    class="MARCI__bg-green-600 hover:MARCI__bg-green-700 MARCI__mr-2 MARCI__px-4 MARCI__py-2 MARCI__rounded MARCI__text-white">Get started with MARCI
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  const keydownListener = (e) => {
    if (e.key === 'Escape') {
      finish();
    }
  };

  const finish = () => {
    hideModal(onboardingModalID);

    try {
      localStorage.setItem(onboardingShownKey, true);
    } catch (error) {
      console.error(
        'Could not update onboarding status in local storage',
        error
      );
    }

    document.removeEventListener('keydown', keydownListener);
  };

  const onboardingOkButton = document.getElementById(
    'MARCI__onboardingOkButton'
  );
  onboardingOkButton.onclick = () => {
    finish();
  };

  const onboardingCloseButton = document.getElementById(
    'MARCI__onboardingCloseButton'
  );
  onboardingCloseButton.onclick = () => {
    finish();
  };

  modal.style = 'display: block;';

  // add event listener to close the modal on ESC
  document.addEventListener('keydown', keydownListener);

  return true;
};

const getOnboardingShown = (lastPromptTemplateTypeKey) => {
  let wasShown;
  try {
    const wasShownValue = localStorage.getItem(onboardingShownKey);

    if (wasShownValue) {
      wasShown = wasShownValue === 'true';
    } else {
      // Check if the lastPromptTemplateType is set in localStorage
      const lastPromptTemplateType = localStorage.getItem(
        lastPromptTemplateTypeKey
      );

      // Set onboarding shown to true for existing user
      if (lastPromptTemplateType && lastPromptTemplateType !== '') {
        wasShown = true;
      } else {
        wasShown = false;
      }

      localStorage.setItem(onboardingShownKey, wasShown);
    }
  } catch (error) {
    console.error('Could not get onboarding status from local storage', error);
  }

  return wasShown;
};

export { showOnboarding };
