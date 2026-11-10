import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

// transforms user model for json serialization
export default class UserTransformer extends BaseTransformer<User> {
  // serializes user attributes to safe public object
  toObject() {
    return {
      id: this.resource.userId,
      userId: this.resource.userId,
      firstName: this.resource.firstName,
      lastName: this.resource.lastName,
      nickName: this.resource.nickName,
      email: this.resource.email,
      status: this.resource.status,
      onlyMentions: this.resource.onlyMentions,
      createdAt: this.resource.createdAt,
      initials: this.resource.initials,
    }
  }
}
