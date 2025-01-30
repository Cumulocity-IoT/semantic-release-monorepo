import execa from 'execa';
import { pathExists as fsPathExists } from 'fs-extra';
import path from 'path';
import { isString } from 'lodash-es';

/**
 * Checks if a specific type of tool is installed.
 * @param {string} type - The type of tool to check (e.g., 'yarn', 'npm', 'maven').
 * @returns {Promise<boolean>} - A promise that resolves to true if the tool is installed, false otherwise.
 */
export const isTypeInstalled = async (type) => {
  try {
    switch (type) {
      case 'yarn':
      case 'yarn-berry':
        await execa('yarn', ['--version']);
        break;
      case 'npm':
        await execa('npm', ['--version']);
        break;
      case 'maven':
        await execa('mvn', ['--version']);
        break;
    }
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Checks if a path exists.
 * @param {string} dPath - The path to check.
 * @param {string} cwd - The current working directory.
 * @returns {Promise<boolean>} - A promise that resolves to true if the path exists, false otherwise.
 */
export const pathExists = async (dPath, cwd) => {
  const resolvedPath = getResolvedPath(dPath, cwd);
  // check if the path exists
  if (!(await fsPathExists(resolvedPath))) return false;
  return true;
};

/**
 * Checks if a value is a non-empty string.
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is a non-empty string, false otherwise.
 */
export const isNonEmptyString = (value) => {
  return isString(value) && value.trim();
};

/**
 * Resolves a path relative to the current working directory.
 * @param {string} dPath - The path to resolve.
 * @param {string} cwd - The current working directory.
 * @returns {string} - The resolved path.
 */
export const getResolvedPath = (dPath, cwd) => {
  const SEPARATOR = '/';
  return path.isAbsolute(dPath) ? dPath : path.resolve(cwd, ...dPath.split(SEPARATOR));
};
