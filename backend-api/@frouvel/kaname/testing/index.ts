/**
 * Testing Module
 *
 * Provides comprehensive testing utilities for the frourio-framework
 *
 * @module @frouvel/kaname/testing
 */

export { TestCase } from './TestCase';
export { DatabaseTestCase } from './DatabaseTestCase';
export { IntegrationTestCase } from './IntegrationTestCase';
export { Factory, defineFactory, Sequence, fake } from './Factory';
export type { FactoryFunction, FactoryBuilder } from './Factory';
export { setupTestEnvironment } from './setup';
export type { TestEnvironmentOptions } from './setup';
export { ApiClient } from './ApiClient';
export type { ApiResponse } from './ApiClient';