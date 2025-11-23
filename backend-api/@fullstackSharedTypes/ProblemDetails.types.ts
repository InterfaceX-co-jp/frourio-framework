/**
 * RFC9457 Problem Details types
 * Shared between backend and frontend
 * 
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 */

/**
 * RFC9457 Problem Details object
 */
export interface ProblemDetails {
  /**
   * A URI reference that identifies the problem type.
   */
  type: string;

  /**
   * A short, human-readable summary of the problem type.
   */
  title: string;

  /**
   * The HTTP status code.
   */
  status: number;

  /**
   * A human-readable explanation specific to this occurrence.
   */
  detail: string;

  /**
   * A URI reference that identifies the specific occurrence.
   */
  instance?: string;

  /**
   * Additional extension members
   */
  [key: string]: any;
}

/**
 * The media type for RFC9457 problem details
 */
export const PROBLEM_DETAILS_MEDIA_TYPE = 'application/problem+json' as const;

/**
 * Default type URI for generic problems
 */
export const DEFAULT_PROBLEM_TYPE = 'about:blank' as const;