import execa from 'execa';
import { pathExists as fsPathExists } from 'fs-extra';
import path from 'path';
import { isString } from 'lodash-es';

export const isTypeInstalled = async (type) => {
  try {
    switch (type) {
      case 'yarn':
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

export const pathExists = async (dPath, cwd) => {
  const resolvedPath = getResolvedPath(dPath, cwd);
  // check if the path exists
  if (!(await fsPathExists(resolvedPath))) return false;
  return true;
};

export const isNonEmptyString = (value) => {
  return isString(value) && value.trim();
};

export const getResolvedPath = (dPath, cwd) => {
  const SEPARATOR = '/';
  return path.isAbsolute(dPath) ? dPath : path.resolve(cwd, ...dPath.split(SEPARATOR));
};
