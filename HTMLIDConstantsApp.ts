/**
 * HTML Element ID constants.
 * Value *must* be lower case version of KEY with underscores replaced
 * with dashes.
 * 
 * Typescript will catch any duplicated keys.
 * 
 * Make sure the semantics are clear: use the same prefix for
 * related elements, and use a suffix that indicates the HTML type.
 */
const HTML_IDS = {

  ERROR_MESSAGE: 'error-message',
  ERROR_MODAL: 'error-modal',

  MAIN_APP_CONNECTION_LOSS_NOTIFICATION: 'main-page-connection-loss-notification',
  MAIN_PAGE_LOGOUT_BUTTON: 'main-page-logout-button',
  MAIN_PAGE_MEMBER_STATUS_LIST: 'main-page-member-status-list',
  MAIN_PAGE_PROFILE_BUTTON: 'main-page-profile-button',
  MAIN_PAGE_STATUS_SELECT: 'main-page-status-select',
  MAIN_PAGE_SUMMARY_BUTTON: 'main-page-summary-button',

  PROFILE_ABOUT_ME_INPUT: 'profile-about-me-input',
  PROFILE_ADDRESS_INPUT: 'profile-address-input',
  PROFILE_CITY_INPUT: 'profile-city-input',
  PROFILE_COUNTRY_INPUT: 'profile-country-input',
  PROFILE_EMAIL_INPUT: 'profile-email-input',
  PROFILE_FIRST_NAME_INPUT: 'profile-first-name-input',
  PROFILE_LAST_NAME_INPUT: 'profile-last-name-input',
  PROFILE_MAIN_FORM: 'profile-main-form',
  PROFILE_POSTAL_CODE_INPUT: 'profile-postal-code-input',
  PROFILE_SAVE_BUTTON: 'profile-save-button',
  PROFILE_USERNAME_INPUT: 'profile-username-input',

  THREAD_LIST_CONTAINER: 'thread-list-container',
  THREAD_NEW_BUTTON: 'thread-new-button',
  THREAD_NEW_THREAD_NAME: 'thread-new-thread-name',
}

/** 
 * The main app pages. Split these out so we can easily iterate through them separately.
 * They are "mixed-in" to the main list.
 * 
 * !Note: that Typescript won't catch the mix-in, so only use this
 * for very sparse things, like whole pages!
 */
export let HTML_MAIN_APP_PAGES = {
  APP_PROFILE_PAGE: 'app-profile-page',
  APP_SUMMARY_PAGE: 'app-summary-page',

}

//"mix-in" the main app pages into our main ID list.
const HTML_IDS_COMBINED = { ...HTML_IDS, ...HTML_MAIN_APP_PAGES }

//make sure the constants can't be messed with.
for (let prop in HTML_IDS_COMBINED)
  Object.defineProperty(HTML_IDS, prop, { configurable: false, writable: false })

export default HTML_IDS_COMBINED;