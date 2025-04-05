export const validateBody = async (schema, body) => {
  return schema.validateAsync(body)
}
