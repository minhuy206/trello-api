import { env } from '~/config/environment'
export const WHITELIST_DOMAINS = [
  'https://trello.minhuy.dev',
  'https://api-trello.minhuy.dev'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client'
}

export const WEBSITE_DOMAIN =
  env.BUILD_MODE === 'production'
    ? env.WEBSITE_DOMAIN_PRODUCTION
    : env.WEBSITE_DOMAIN_DEVELOPMENT

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
}

export const CARD_MEMBER_ACTION = {
  ADD: 'add',
  REMOVE: 'remove'
}
