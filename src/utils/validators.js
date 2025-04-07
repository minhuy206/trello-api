export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/

export const USERNAME_RULE =
  /^(?=[a-zA-Z0-9._]{6,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/
export const USERNAME_RULE_MESSAGE =
  'Username must be 6-20 characters long and can only contain letters, numbers, dots, and underscores. It cannot start or end with a dot or underscore, and cannot have consecutive dots or underscores.'
export const EMAIL_RULE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
export const EMAIL_RULE_MESSAGE = 'Email is invalid.'
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/
export const PASSWORD_RULE_MESSAGE =
  'Password must include at least 1 letter, a number, and at least 8 characters.'
export const PASSWORD_CONFIRMATION_MESSAGE =
  'Password Confirmation does not match!'
export const OTP_RULE = /^[0-9]{6}$/
export const OTP_RULE_MESSAGE = 'OTP is invalid.'

export const LIMIT_COMMON_FILE_SIZE = 10485760 // byte = 10 MB
export const ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png']
