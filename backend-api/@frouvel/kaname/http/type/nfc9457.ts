/**
 * RFC9457: Problem Details for HTTP APIs
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 *
 * This module defines types and utilities for RFC9457-compliant error responses.
 */

/**
 * Re-export ProblemDetails from commonTypesWithClient to ensure type consistency
 * across backend and frontend
 */
export type { ProblemDetails } from 'commonTypesWithClient';

/**
 * Option type for creating a ProblemDetails object
 */
export interface CreateProblemDetailsOptions {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  extensions?: Record<string, any>;
}

/**
 * The media type for RFC9457 problem details
 */
export const PROBLEM_DETAILS_MEDIA_TYPE = 'application/problem+json' as const;

/**
 * Default type URI for generic problems
 */
export const DEFAULT_PROBLEM_TYPE = 'about:blank' as const;