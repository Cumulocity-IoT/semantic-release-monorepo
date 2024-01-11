import { isArray, isNil } from 'lodash-es';
import getError from './get-error.js';
import { isNonEmptyString, isTypeInstalled, pathExists } from './util.js';

/**
 * Validates the configuration object for type and dependencies.
 * @param {Object} config - The configuration object.
 * @param {string} config.type - The type of the project.
 * @param {Array} config.dependencies - The dependencies of the project.
 * @param {Object} options - Additional options.
 * @param {string} options.cwd - The current working directory.
 * @param {Object} options.logger - The logger object.
 * @returns {Array} - An array of errors encountered during validation.
 */
export default async function ({ type, dependencies }, { cwd, logger }) {
  logger.log('pluginConfig', type, dependencies);
  let errors = [];

  if (!isNil(type)) {
    errors = [...errors, ...(await validateType(type))];
  }

  if (!isNil(dependencies)) {
    errors = [...errors, ...(await validateDependencies(dependencies, cwd))];
  }
  return errors;
}

/**
 * Validates the type property of the configuration object.
 * @param {string} type - The type of the project.
 * @returns {Array} - An array of errors encountered during validation.
 */
async function validateType(type) {
  const errors = [];
  const supportedTypes = ['yarn', 'npm', 'maven'];
  if (!supportedTypes.includes(type)) {
    errors.push(getError('EINVALIDTYPE', type));
  } else {
    if (!(await isTypeInstalled(type))) {
      errors.push(getError('ETYPENOTINSTALLED', type));
    }
  }
  return errors;
}

/**
 * Checks if a package root is valid.
 * @param {string} pkgRoot - The package root path.
 * @param {string} cwd - The current working directory.
 * @returns {boolean} - True if the package root is valid, false otherwise.
 */
async function isValidPath(pkgRoot, cwd) {
  return !isNil(pkgRoot) && isNonEmptyString(pkgRoot) && (await pathExists(pkgRoot, cwd));
}

/**
 * Validates the dependencies property of the configuration object.
 * @param {Array} dependencies - The dependencies of the project.
 * @param {string} cwd - The current working directory.
 * @returns {Array} - An array of errors encountered during validation.
 */
async function validateDependencies(dependencies, cwd) {
  if (!isArray(dependencies)) return [getError('EINVALIDDEPENDENCY', dependencies)];
  let errors = [];
  for (const dependency of dependencies) {
    if (!(await isValidPath(dependency.pkgRoot, cwd)))
      errors.push(getError('EINVALIDPKGROOT', dependency.pkgRoot));
    errors = [...errors, ...(await validateType(dependency.type))];
  }
  return errors;
}
