/**
 * Type definitions for comment-parser
 */

declare module 'comment-parser' {
  export interface CommentTag {
    tag: string;
    name: string;
    type: string;
    description: string;
    optional?: boolean;
    default?: string;
    source: string;
  }

  export interface Comment {
    description: string;
    tags: CommentTag[];
    source: string;
    problems: any[];
  }

  export interface ParserOptions {
    spacing?: 'compact' | 'preserve';
  }

  export function parse(
    source: string,
    options?: ParserOptions,
  ): Comment[];
}