import { isArray, isNil } from 'lodash-es';
import getError from './get-error.js';
import { isNonEmptyString, isTypeInstalled, pathExists } from './util.js';

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

async function isValidPath(pkgRoot, cwd) {
  return !isNil(pkgRoot) && isNonEmptyString(pkgRoot) && (await pathExists(pkgRoot, cwd));
}

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
