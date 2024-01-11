import SemanticReleaseError from '@semantic-release/error';
import * as ERRORDEFINITIONS from './definitions/errors.js';

/**
 * Creates a SemanticReleaseError based on the provided error code and option.
 *
 * @param {string} code - The error code.
 * @param {any} option - The option to pass to the error definition.
 * @returns {SemanticReleaseError} - The created SemanticReleaseError instance.
 */

export default (code, option) => {
  const { message, details } = ERRORDEFINITIONS[code](option);
  return new SemanticReleaseError(message, code, details);
};
