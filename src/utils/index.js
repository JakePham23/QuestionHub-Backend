import crypto from 'node:crypto';

export const getRandomString = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
}