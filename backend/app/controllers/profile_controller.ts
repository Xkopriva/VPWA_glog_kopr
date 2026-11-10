import UserTransformer from '#transformers/user_transformer'
import type { HttpContext } from '@adonisjs/core/http'

// handles profile details of authenticated user
export default class ProfileController {
  // returns profile details of currently authenticated user
  async show({ auth, serialize }: HttpContext) {
    return serialize(UserTransformer.transform(auth.getUserOrFail()))
  }
}
