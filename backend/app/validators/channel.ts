import vine from '@vinejs/vine'

// validator for creating or joining a channel
export const createChannelValidator = vine.create({
  name: vine
    .string()
    .trim()
    .minLength(2)
    .maxLength(24)
    .regex(/^[\w-]+$/),
  type: vine.enum(['public', 'private'] as const).optional(),
})

// validator for target user nickname
export const targetUserValidator = vine.create({
  targetNickName: vine.string().trim().minLength(1),
})
