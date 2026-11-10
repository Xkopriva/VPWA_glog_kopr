import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const NewAccountController = () => import('#controllers/new_account_controller')
const AccessTokensController = () => import('#controllers/access_tokens_controller')
const ProfileController = () => import('#controllers/profile_controller')
const UsersController = () => import('#controllers/users_controller')

// registers base root route
router.get('/', () => {
  return { hello: 'world' }
})

// registers api v1 routes group
router
  .group(() => {
    // public authentication routes
    router
      .group(() => {
        router.post('signup', [NewAccountController, 'store'])
        router.post('login', [AccessTokensController, 'store'])
      })
      .prefix('auth')
      .as('auth')

    // authenticated account routes
    router
      .group(() => {
        router.get('profile', [ProfileController, 'show'])
        router.patch('profile', [UsersController, 'update'])
        router.patch('status', [UsersController, 'updateStatus'])
        router.delete('profile', [UsersController, 'destroy'])
        router.post('logout', [AccessTokensController, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    // user resources routes
    router
      .group(() => {
        router.get('/', [UsersController, 'index'])
        router.get('/:id', [UsersController, 'show'])
      })
      .prefix('users')
      .as('users')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
