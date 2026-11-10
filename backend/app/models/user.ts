import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

const AuthFinder = withAuthFinder(hash, {
  uids: ['email', 'nickName'],
  passwordColumnName: 'password',
})

// defines user lucid model with auth mixin
export default class User extends compose(UserSchema, AuthFinder) {
  // sets primary key to match user id in database
  static primaryKey = 'userId'

  // configures access tokens provider
  static accessTokens = DbAccessTokensProvider.forModel(User)

  // holds current access token for authenticated request
  declare currentAccessToken?: AccessToken

  // compatibility getter for standard id property
  get id(): number {
    return this.userId
  }

  // returns user initials from first and last name
  get initials(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase()
    }
    if (this.nickName) {
      return this.nickName.slice(0, 2).toUpperCase()
    }
    return this.email.slice(0, 2).toUpperCase()
  }
}
