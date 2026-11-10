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
      getStatus: typeof routes['profile.users.get_status']
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
  channels: {
    channels: {
      index: typeof routes['channels.channels.index']
      store: typeof routes['channels.channels.store']
      prune: typeof routes['channels.channels.prune']
      show: typeof routes['channels.channels.show']
      destroy: typeof routes['channels.channels.destroy']
      leave: typeof routes['channels.channels.leave']
      invite: typeof routes['channels.channels.invite']
      acceptInvite: typeof routes['channels.channels.accept_invite']
      declineInvite: typeof routes['channels.channels.decline_invite']
      revoke: typeof routes['channels.channels.revoke']
      kick: typeof routes['channels.channels.kick']
    }
  }
}
