export const EINVALIDTYPE = (type) => {
    return {
        message: `Invalid package type option: ${type}`,
        details: `The type option must be one of yarn, npm or maven`
    }
};

export const ETYPENOTINSTALLED = (type) => {
    return {
        message: `${type} is not installed`,
        details: `Please install ${type} package and try again`
    }
};

export const EINVALIDPKGROOT = (pkgRoot) => {
    return {
        message: `Invalid package root: ${pkgRoot}`,
        details: `The package root ${pkgRoot} does not exist`
    }
};

export const EINVALIDDEPENDENCY = (dependency) => {
    return {
        message: `Invalid dependency list`,
        details: `The dependency must be an array of objects with pkgRoot and type properties`
    }
};
