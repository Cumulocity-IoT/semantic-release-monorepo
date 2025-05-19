import execa from 'execa';
import { getResolvedPath } from './util.js';
/**
 * Updates the version of the project and its dependencies using the specified package manager.
 * @param {Object} pluginConfig - The configuration object for the project.
 * @param {string} pluginConfig.type - The package manager to use for the project.
 * @param {Array<Object>} pluginConfig.dependencies - The dependencies of the project.
 * @param {Object} context - The configuration object for the release.
 * @param {string} context.nextRelease.version - The version to update to.
 * @param {Object} context.logger - The logger object.
 * @param {string} context.cwd - The current working directory.
 * @param {Object} context.env - The environment variables.
 * @param {WritableStream} context.stdout - The standard output stream.
 * @param {WritableStream} context.stderr - The standard error stream.
 */
export default async function (
  { type, dependencies = [], versioningOptions },
  { nextRelease: { version }, logger, cwd, env, stdout, stderr }
) {
  //if type at project level is specified, use that
  await updateVersion(version, { cwd, logger, stdout, stderr, env }, { type, versioningOptions });
  for (let dependency of dependencies) {
    await updateVersion(
      version,
      { cwd, logger, stdout, stderr, env },
      {
        type: dependency.type,
        pkgRoot: dependency.pkgRoot,
        versioningOptions: dependency.versioningOptions
      }
    );
  }
}

/**
 * Updates the version of a package using the specified package manager.
 * @param {string} version - The version to update to.
 * @param {Object} options - The options for updating the version.
 * @param {string} options.cwd - The current working directory.
 * @param {Object} options.logger - The logger object.
 * @param {WritableStream} options.stdout - The standard output stream.
 * @param {WritableStream} options.stderr - The standard error stream.
 * @param {string} [options.type='yarn'] - The package manager to use.
 * @param {string} [options.pkgRoot=options.cwd] - The root directory of the package.
 * @
 */
async function updateVersion(
  version,
  { cwd, logger, stdout, stderr, env },
  { type = 'yarn', pkgRoot = cwd, versioningOptions }
) {
  logger.log(
    `updateVersion(${version}, ${cwd}, ${type}, ${pkgRoot}, ${JSON.stringify(versioningOptions)})`
  );
  const resolvedPath = getResolvedPath(pkgRoot, cwd);
  switch (type) {
    case 'yarn':
      await updateVersionWithYarn(version, resolvedPath, { logger, stdout, stderr });
      break;
    case 'yarn-berry':
      await updateVersionWithYarnBerry(version, resolvedPath, { logger, stdout, stderr });
      break;
    case 'npm':
      await updateVersionWithNpm(version, resolvedPath, { logger, stdout, stderr });
      break;
    case 'maven':
      if (versioningOptions && versioningOptions.customVersionProperty)
        await updateCustomVersionProperty(
          version,
          resolvedPath,
          { logger, stdout, stderr, env },
          versioningOptions
        );
      else await updateVersionWithMaven(version, resolvedPath, { logger, stdout, stderr, env });
      break;
  }
}

/**
 * Updates the version of a package using yarn.
 * @param {string} version - The version to update to.
 * @param {string} basePath - The base path of the package.
 * @param {Object} options - The options for updating the version.
 * @param {Object} options.logger - The logger object.
 * @param {WritableStream} options.stdout - The standard output stream.
 * @param {WritableStream} options.stderr - The standard error stream.
 */
async function updateVersionWithYarn(version, basePath, { logger, stdout, stderr }) {
  logger.log(`Updating version to ${version} with yarn at ${basePath}`);
  const command = execa(
    'yarn',
    ['version', `--new-version=${version}`, '--no-git-tag-version', '--allow-same-version'],
    { cwd: basePath, preferLocal: true }
  );
  command.stdout.pipe(stdout, { end: false });
  command.stderr.pipe(stderr, { end: false });
  await command;
}

/**
 * Updates the version of a package using yarn.
 * @param {string} version - The version to update to.
 * @param {string} basePath - The base path of the package.
 * @param {Object} options - The options for updating the version.
 * @param {Object} options.logger - The logger object.
 * @param {WritableStream} options.stdout - The standard output stream.
 * @param {WritableStream} options.stderr - The standard error stream.
 */
async function updateVersionWithYarnBerry(version, basePath, { logger, stdout, stderr }) {
  const command = execa('yarn', ['version', version], { cwd: basePath, preferLocal: true });
  command.stdout.pipe(stdout, { end: false });
  command.stderr.pipe(stderr, { end: false });
  await command;
}

/**
 * Updates the version of a package using npm.
 * @param {string} version - The version to update to.
 * @param {string} basePath - The base path of the package.
 * @param {Object} options - The options for updating the version.
 * @param {Object} options.logger - The logger object.
 * @param {WritableStream} options.stdout - The standard output stream.
 * @param {WritableStream} options.stderr - The standard error stream.
 */
async function updateVersionWithNpm(version, basePath, { logger, stdout, stderr }) {
  logger.log(`Updating version to ${version} with npm at ${basePath}`);
  const command = execa(
    'npm',
    ['version', version, '--no-git-tag-version', '--allow-same-version'],
    { cwd: basePath, preferLocal: true }
  );
  command.stdout.pipe(stdout, { end: false });
  command.stderr.pipe(stderr, { end: false });
  await command;
}

/**
 * Updates the version of a package using Maven.
 * @param {string} version - The version to update to.
 * @param {string} basePath - The base path of the package.
 * @param {Object} options - The options for updating the version.
 * @param {Object} options.logger - The logger object.
 * @param {WritableStream} options.stdout - The standard output stream.
 * @param {WritableStream} options.stderr - The standard error stream.
 * @param {Object} options.env - The environment variables.
 */
async function updateCustomVersionProperty(
  version,
  basePath,
  { logger, stdout, stderr, env },
  versioningOptions
) {
  logger.log(`Updating version to ${version} with maven at ${basePath}`);
  const commandstr = 'mvn versions:set-property';
  const args = [`-Dproperty=${versioningOptions.customVersionProperty}`, `-DnewVersion=${version}`];
  const options = { cwd: basePath, preferLocal: true, env };

  const command = execa(commandstr, args, options);
  command.stdout.pipe(stdout, { end: false });
  command.stderr.pipe(stderr, { end: false });
  await command;
}

/**
 * Updates the version of a package using Maven.
 * @param {string} version - The version to update to.
 * @param {string} basePath - The base path of the package.
 * @param {Object} options - The options for updating the version.
 * @param {Object} options.logger - The logger object.
 * @param {WritableStream} options.stdout - The standard output stream.
 * @param {WritableStream} options.stderr - The standard error stream.
 * @param {Object} options.env - The environment variables.
 */
async function updateVersionWithMaven(version, basePath, { logger, stdout, stderr, env }) {
  logger.log(`Updating version to ${version} with maven at ${basePath}`);
  const command = execa('mvn', ['versions:set', `-DnewVersion=${version}`], {
    cwd: basePath,
    env,
    preferLocal: true
  });
  command.stdout.pipe(stdout, { end: false });
  command.stderr.pipe(stderr, { end: false });
  await command;
}
