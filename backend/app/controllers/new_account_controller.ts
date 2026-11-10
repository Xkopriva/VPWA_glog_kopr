import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

// handles registration of new user accounts
export default class NewAccountController {
  // creates user in database and returns token
  async store({ request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)

    const user = await User.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      nickName: payload.nickName,
      email: payload.email,
      password: payload.password,
      status: 'online',
      onlyMentions: false,
    })

    const token = await User.accessTokens.create(user)

    const serialized = await serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })

    return response.created(serialized)
  }
}
