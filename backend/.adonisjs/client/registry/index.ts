/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

export type { Route, Path } from './schema.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"signup"]],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"login"]],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"profile"]],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.users.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/account/profile',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"profile"]],
    types: placeholder as Registry['profile.users.update']['types'],
  },
  'profile.users.get_status': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/status',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"status"]],
    types: placeholder as Registry['profile.users.get_status']['types'],
  },
  'profile.users.update_status': {
    methods: ["PATCH"],
    pattern: '/api/v1/account/status',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"status"]],
    types: placeholder as Registry['profile.users.update_status']['types'],
  },
  'profile.users.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/account/profile',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"profile"]],
    types: placeholder as Registry['profile.users.destroy']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"logout"]],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'users.users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/users',
    tokens: [[0,"api"],[0,"v1"],[0,"users"]],
    types: placeholder as Registry['users.users.index']['types'],
  },
  'users.users.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/users/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"users"],[1,"id"]],
    types: placeholder as Registry['users.users.show']['types'],
  },
  'channels.channels.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/channels',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"]],
    types: placeholder as Registry['channels.channels.index']['types'],
  },
  'channels.channels.store': {
    methods: ["POST"],
    pattern: '/api/v1/channels',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"]],
    types: placeholder as Registry['channels.channels.store']['types'],
  },
  'channels.channels.prune': {
    methods: ["DELETE"],
    pattern: '/api/v1/channels/prune',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[0,"prune"]],
    types: placeholder as Registry['channels.channels.prune']['types'],
  },
  'channels.channels.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/channels/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"id"]],
    types: placeholder as Registry['channels.channels.show']['types'],
  },
  'channels.channels.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/channels/:id',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"id"]],
    types: placeholder as Registry['channels.channels.destroy']['types'],
  },
  'channels.channels.leave': {
    methods: ["DELETE"],
    pattern: '/api/v1/channels/:id/leave',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"id"],[0,"leave"]],
    types: placeholder as Registry['channels.channels.leave']['types'],
  },
  'channels.channels.invite': {
    methods: ["POST"],
    pattern: '/api/v1/channels/:id/invite',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"id"],[0,"invite"]],
    types: placeholder as Registry['channels.channels.invite']['types'],
  },
  'channels.channels.accept_invite': {
    methods: ["POST"],
    pattern: '/api/v1/channels/:id/accept-invite',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"id"],[0,"accept-invite"]],
    types: placeholder as Registry['channels.channels.accept_invite']['types'],
  },
  'channels.channels.decline_invite': {
    methods: ["DELETE"],
    pattern: '/api/v1/channels/:id/decline-invite',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"id"],[0,"decline-invite"]],
    types: placeholder as Registry['channels.channels.decline_invite']['types'],
  },
  'channels.channels.revoke': {
    methods: ["DELETE"],
    pattern: '/api/v1/channels/:id/members/:userId',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"id"],[0,"members"],[1,"userId"]],
    types: placeholder as Registry['channels.channels.revoke']['types'],
  },
  'channels.channels.kick': {
    methods: ["POST"],
    pattern: '/api/v1/channels/:id/kick',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"id"],[0,"kick"]],
    types: placeholder as Registry['channels.channels.kick']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
