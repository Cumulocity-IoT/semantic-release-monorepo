// add validateConditions and prepare functions for semantic release plugin
import verifyConfig from './lib/verify-config.js';
import preparePackage from './lib/prepare.js';
import AggergateError from 'aggregate-error';

let verified = false;

export async function verifyConditions(pluginConfig, context) {
  const { logger } = context;
  logger.log('pluginConfig', pluginConfig);
  const errors = await verifyConfig(pluginConfig, context);
  verified = true;
  if (errors.length > 0) {
    throw new AggergateError(errors);
  }
}

export async function prepare(pluginConfig, context) {
  const errors = verified ? [] : await verifyConfig(pluginConfig, context);
  if (errors.length > 0) {
    throw new AggergateError(errors);
  }
  try {
    // TODO: Reload package in case it is updated in previous step
    await preparePackage(pluginConfig, context);
  } catch (error) {
    throw new AggergateError([error.message]);
  }
}
