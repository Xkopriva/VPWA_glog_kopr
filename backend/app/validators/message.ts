import vine from '@vinejs/vine'

// validator for sending a chat message
export const createMessageValidator = vine.create({
  text: vine.string().trim().minLength(1).maxLength(5000),
})
