// add validateConditions and prepare functions for semantic release plugin
import verifyConfig from './lib/verify-config.js';
import prepare from './lib/prepare.js';
import AggergateError from 'aggregate-error';

let verified = false;

export async function validateConditions(pluginConfig, context) {
    const { logger } = context;
    logger.log('pluginConfig', pluginConfig);
    const errors = [];
    if (!verified) {
        errors = [...errors, ...await verifyConfig(pluginConfig, context)];
        verified = true;
    }
    if(errors.length > 0){
        throw new AggergateError(errors);
    }
}

export async function prepare(pluginConfig, context) {
    const errors = [];
    if (!verified) {
        errors = [...errors, ...await verifyConfig(pluginConfig, context)];
        verified = true;
    }
    if(errors.length > 0){
        throw new AggergateError(errors);
    }
    await prepare(pluginConfig, context);
}