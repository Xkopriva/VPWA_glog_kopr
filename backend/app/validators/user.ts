import vine from '@vinejs/vine'

// shared validation rules for email and password
const email = () => vine.string().trim().email().maxLength(254)
const password = () => vine.string().minLength(4).maxLength(255)

// validator for user registration
export const signupValidator = vine.create({
  firstName: vine.string().trim().minLength(1).maxLength(50),
  lastName: vine.string().trim().minLength(1).maxLength(100),
  nickName: vine
    .string()
    .trim()
    .minLength(2)
    .maxLength(50)
    .unique({ table: 'users', column: 'nick_name' }),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
})

// validator for user authentication login
export const loginValidator = vine.create({
  uid: vine.string().trim(),
  password: vine.string(),
})

// validator for updating user profile
export const updateUserValidator = vine.create({
  firstName: vine.string().trim().minLength(1).maxLength(50).optional(),
  lastName: vine.string().trim().minLength(1).maxLength(100).optional(),
  nickName: vine.string().trim().minLength(2).maxLength(50).optional(),
  email: email().optional(),
  onlyMentions: vine.boolean().optional(),
  status: vine.enum(['online', 'dnd', 'offline'] as const).optional(),
})

// validator for updating only user status
export const updateStatusValidator = vine.create({
  status: vine.enum(['online', 'dnd', 'offline'] as const),
})
