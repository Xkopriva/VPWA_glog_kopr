import User from '#models/user'
import { updateUserValidator, updateStatusValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

// handles user resource crud operations
export default class UsersController {
  // lists all users in the system
  async index({ serialize }: HttpContext) {
    const users = await User.query().orderBy('nickName', 'asc')
    return serialize(UserTransformer.transform(users))
  }

  // shows specific user by identifier
  async show({ params, serialize }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return serialize(UserTransformer.transform(user))
  }

  // updates profile data of authenticated user
  async update({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateUserValidator)

    user.merge(payload)
    await user.save()

    return serialize(UserTransformer.transform(user))
  }

  // updates online status of authenticated user
  async updateStatus({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { status } = await request.validateUsing(updateStatusValidator)

    user.status = status
    await user.save()

    return serialize(UserTransformer.transform(user))
  }

  // deletes account of authenticated user
  async destroy({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.delete()

    return response.ok({
      message: 'user account deleted successfully',
    })
  }
}
