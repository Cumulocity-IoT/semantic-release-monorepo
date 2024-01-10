import execa from 'execa';
import { getResolvedPath } from './util.js';
export default async function (
  { type, dependencies = [] },
  { nextRelease: { version }, logger, cwd, env, stdout, stderr }
) {
  //if type at project level is specified, use that
  await updateVersion(version, { cwd, logger, stdout, stderr, env }, { type });
  for (let dependency of dependencies) {
    await updateVersion(
      version,
      { cwd, logger, stdout, stderr, env },
      { type: dependency.type, pkgRoot: dependency.pkgRoot }
    );
  }
}

async function updateVersion(
  version,
  { cwd, logger, stdout, stderr, env },
  { type = 'yarn', pkgRoot = cwd }
) {
  logger.log(`updateVersion(${version}, ${cwd}, ${type}, ${pkgRoot})`);
  const resolvedPath = getResolvedPath(pkgRoot, cwd);
  switch (type) {
    case 'yarn':
      await updateVersionWithYarn(version, resolvedPath, { logger, stdout, stderr });
      break;
    case 'npm':
      await updateVersionWithNpm(version, resolvedPath, { logger, stdout, stderr });
      break;
    case 'maven':
      await updateVersionWithMaven(version, resolvedPath, { logger, stdout, stderr, env });
      break;
  }
}

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
