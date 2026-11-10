import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

// handles user authentication tokens
export default class AccessTokensController {
  // verifies credentials and returns new access token
  async store({ request, serialize }: HttpContext) {
    const { uid, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(uid, password)
    user.status = 'online'
    await user.save()

    const token = await User.accessTokens.create(user)

    return await serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }

  // revokes current access token and logs user out
  async destroy({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    user.status = 'offline'
    await user.save()

    return {
      message: 'logged out successfully',
    }
  }
}
