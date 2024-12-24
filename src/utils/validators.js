export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/

export const FIELD_REQUIRED_MESSAGE = 'This field is required.'
export const EMAIL_RULE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
export const EMAIL_RULE_MESSAGE = 'Email is invalid.'
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/
export const PASSWORD_RULE_MESSAGE =
  'Password must include at least 1 letter, a number, and at least 8 characters.'
export const PASSWORD_CONFIRMATION_MESSAGE =
  'Password Confirmation does not match!'
