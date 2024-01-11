/**
 * Represents an error for an invalid package type option.
 * @param {string} type - The invalid package type.
 * @returns {Object} - The error object with message and details properties.
 */
export const EINVALIDTYPE = (type) => {
  return {
    message: `Invalid package type option: ${type}`,
    details: `The type option must be one of yarn, npm or maven`
  };
};

/**
 * Represents an error for a missing package type installation.
 * @param {string} type - The missing package type.
 * @returns {Object} - The error object with message and details properties.
 */
export const ETYPENOTINSTALLED = (type) => {
  return {
    message: `${type} is not installed`,
    details: `Please install ${type} package and try again`
  };
};

/**
 * Represents an error for an invalid package root.
 * @param {string} pkgRoot - The invalid package root.
 * @returns {Object} - The error object with message and details properties.
 */
export const EINVALIDPKGROOT = (pkgRoot) => {
  return {
    message: `Invalid package root: ${pkgRoot}`,
    details: `The package root ${pkgRoot} does not exist`
  };
};

/**
 * Represents an error for an invalid dependency list.
 * @param {string} dependency - The invalid dependency list.
 * @returns {Object} - The error object with message and details properties.
 */
export const EINVALIDDEPENDENCY = (dependency) => {
  return {
    message: `Invalid dependency list`,
    details: `The dependency must be an array of objects with pkgRoot and type properties`
  };
};
