/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    users: {
      update: typeof routes['profile.users.update']
      updateStatus: typeof routes['profile.users.update_status']
      destroy: typeof routes['profile.users.destroy']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  users: {
    users: {
      index: typeof routes['users.users.index']
      show: typeof routes['users.users.show']
    }
  }
}
