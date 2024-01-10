import SemanticReleaseError from '@semantic-release/error';
import * as ERRORDEFINITIONS from './definitions/errors.js';

export default (code, option) => {
  const { message, details } = ERRORDEFINITIONS[code](option);
  return new SemanticReleaseError(message, code, details);
};
