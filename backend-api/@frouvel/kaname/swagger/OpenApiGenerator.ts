/* eslint-disable max-lines */
/* eslint-disable max-depth */
/**
 * OpenAPI Specification Generator
 *
 * Generates OpenAPI 3.0 specification from aspida type definitions.
 * Uses the existing aspida/frourio structure to auto-generate documentation.
 * Supports JSDoc comments for enhanced documentation.
 */

import type { FastifyInstance } from 'fastify';
import type { OpenAPIV3 } from 'openapi-types';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { parse as parseComments } from 'comment-parser';

interface JsDocInfo {
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  params?: Array<{
    name: string;
    description?: string;
    type?: string;
  }>;
}

export interface OpenApiGeneratorOptions {
  title: string;
  version: string;
  description?: string;
  servers?: OpenAPIV3.ServerObject[];
  basePath?: string;
  apiBasePath?: string; // e.g., '/api'
}

export class OpenApiGenerator {
  private readonly _options: OpenApiGeneratorOptions;
  private readonly _basePath: string;
  private readonly _apiBasePath: string;

  private constructor(args: {
    options: OpenApiGeneratorOptions;
    basePath: string;
  }) {
    this._options = args.options;
    this._basePath = args.basePath;
    this._apiBasePath = args.options.apiBasePath || '';
  }

  static create(options: OpenApiGeneratorOptions, basePath: string) {
    return new OpenApiGenerator({ options, basePath });
  }

  /**
   * Generate OpenAPI specification
   */
  generate(): OpenAPIV3.Document {
    const spec: OpenAPIV3.Document = {
      openapi: '3.0.0',
      info: {
        title: this._options.title,
        version: this._options.version,
        description: this._options.description,
      },
      servers: this._options.servers || [
        {
          url: this._options.basePath || 'http://localhost:8080',
          description: 'Development server',
        },
      ],
      paths: {},
      components: {
        schemas: {
          ProblemDetails: {
            type: 'object',
            description: 'RFC9457 Problem Details for HTTP APIs',
            required: ['type', 'title', 'status', 'detail'],
            properties: {
              type: {
                type: 'string',
                description: 'A URI reference that identifies the problem type',
                example: 'about:blank',
              },
              title: {
                type: 'string',
                description: 'A short, human-readable summary of the problem type',
                example: 'Not Found',
              },
              status: {
                type: 'integer',
                description: 'The HTTP status code',
                example: 404,
              },
              detail: {
                type: 'string',
                description: 'A human-readable explanation specific to this occurrence',
                example: 'The requested resource was not found',
              },
              instance: {
                type: 'string',
                description: 'A URI reference that identifies the specific occurrence',
                example: '/api/users/123',
              },
            },
            additionalProperties: true,
          },
        },
        responses: {
          BadRequest: {
            description: 'Bad Request - Invalid input or validation error',
            content: {
              'application/problem+json': {
                schema: {
                  $ref: '#/components/schemas/ProblemDetails',
                },
              },
            },
          },
          Unauthorized: {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/problem+json': {
                schema: {
                  $ref: '#/components/schemas/ProblemDetails',
                },
              },
            },
          },
          Forbidden: {
            description: 'Forbidden - Insufficient permissions',
            content: {
              'application/problem+json': {
                schema: {
                  $ref: '#/components/schemas/ProblemDetails',
                },
              },
            },
          },
          NotFound: {
            description: 'Not Found - Resource does not exist',
            content: {
              'application/problem+json': {
                schema: {
                  $ref: '#/components/schemas/ProblemDetails',
                },
              },
            },
          },
          InternalServerError: {
            description: 'Internal Server Error - Unexpected server error',
            content: {
              'application/problem+json': {
                schema: {
                  $ref: '#/components/schemas/ProblemDetails',
                },
              },
            },
          },
        },
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    };

    // Scan api directory and generate paths
    const apiPath = join(this._basePath, 'api');
    this._scanApiDirectory(apiPath, spec, this._apiBasePath);

    return spec;
  }

  /**
   * Recursively scan API directory
   */
  private _scanApiDirectory(
    dir: string,
    spec: OpenAPIV3.Document,
    pathPrefix: string,
  ): void {
    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Recursively scan subdirectories
          const newPrefix =
            entry === '_id'
              ? `${pathPrefix}/{id}`
              : entry.startsWith('_')
                ? `${pathPrefix}/{${entry.slice(1)}}`
                : `${pathPrefix}/${entry}`;

          this._scanApiDirectory(fullPath, spec, newPrefix);
        } else if (entry === 'index.ts') {
          // Parse route definition
          this._parseRouteFile(fullPath, spec, pathPrefix || '/');
        }
      }
    } catch (error) {
      // Directory might not exist or not readable
      console.warn(`Could not scan directory ${dir}:`, error);
    }
  }

  /**
   * Parse route file and extract type definitions with JSDoc comments
   */
  private _parseRouteFile(
    filePath: string,
    spec: OpenAPIV3.Document,
    path: string,
  ): void {
    try {
      const content = readFileSync(filePath, 'utf-8');

      // Parse JSDoc comments from the file
      const jsdocMap = this._parseJsDocFromFile(content);

      // Extract methods from DefineMethods - handle nested braces
      const defineMethodsIndex = content.indexOf('DefineMethods<{');
      if (defineMethodsIndex === -1) return;

      // Find matching closing brace by counting
      let braceCount = 0;
      const startIndex = defineMethodsIndex + 'DefineMethods<{'.length;
      let endIndex = startIndex;

      for (let i = startIndex - 1; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }

      const methodsContent = content.substring(startIndex, endIndex);
      const methods = ['get', 'post', 'put', 'patch', 'delete'];

      for (const method of methods) {
        // Find method definition with proper brace matching
        const methodPattern = new RegExp(`${method}:\\s*\\{`, 'g');
        const match = methodPattern.exec(methodsContent);

        if (match) {
          // Find matching closing brace for this method
          let braceCount = 1;
          const startIdx = match.index + match[0].length;
          let endIdx = startIdx;

          for (let i = startIdx; i < methodsContent.length; i++) {
            if (methodsContent[i] === '{') braceCount++;
            if (methodsContent[i] === '}') braceCount--;
            if (braceCount === 0) {
              endIdx = i;
              break;
            }
          }

          const methodDef = methodsContent.substring(startIdx, endIdx);
          const jsDoc = jsdocMap.get(method);
          const pathItem = this._createPathItem(method, methodDef, path, jsDoc);

          if (!spec.paths[path]) {
            spec.paths[path] = {};
          }

          // Type assertion needed due to OpenAPI PathItemObject complexity
          (spec.paths[path] as any)[method] = pathItem;
        }
      }
    } catch (error) {
      console.warn(`Could not parse route file ${filePath}:`, error);
    }
  }

  /**
   * Parse JSDoc comments from file content
   */
  private _parseJsDocFromFile(content: string): Map<string, JsDocInfo> {
    const jsdocMap = new Map<string, JsDocInfo>();

    try {
      // Parse all JSDoc comments
      const comments = parseComments(content, {
        spacing: 'preserve',
      });

      // Find comments before method definitions
      const methods = ['get', 'post', 'put', 'patch', 'delete'];

      for (const comment of comments) {
        // Extract method from the next code after comment
        const afterComment = content.slice(content.indexOf(comment.source));

        for (const method of methods) {
          const methodPattern = new RegExp(
            `\\*\\/\\s*${method}\\s*:\\s*\\{`,
            's',
          );

          if (methodPattern.test(afterComment.slice(0, 200))) {
            const summaryTag = comment.tags.find(
              (t: any) => t.tag === 'summary',
            );
            const descTag = comment.tags.find(
              (t: any) => t.tag === 'description',
            );

            const jsDoc: JsDocInfo = {
              summary:
                summaryTag?.description || comment.description || undefined,
              description: descTag?.description || undefined,
              tags: comment.tags
                .filter((t: any) => t.tag === 'tag')
                .map((t: any) => t.name),
              deprecated: comment.tags.some((t: any) => t.tag === 'deprecated'),
              params: comment.tags
                .filter((t: any) => t.tag === 'param')
                .map((t: any) => ({
                  name: t.name,
                  description: t.description,
                  type: t.type,
                })),
            };

            jsdocMap.set(method, jsDoc);
            break;
          }
        }
      }
    } catch (error) {
      console.warn('Error parsing JSDoc comments:', error);
    }

    return jsdocMap;
  }

  /**
   * Create OpenAPI path item from method definition with JSDoc info
   */
  private _createPathItem(
    method: string,
    methodDef: string,
    path: string,
    jsDoc?: JsDocInfo,
  ): OpenAPIV3.OperationObject {
    const operation: OpenAPIV3.OperationObject = {
      summary: jsDoc?.summary || `${method.toUpperCase()} ${path}`,
      description: jsDoc?.description,
      tags: jsDoc?.tags && jsDoc.tags.length > 0 ? jsDoc.tags : undefined,
      deprecated: jsDoc?.deprecated || undefined,
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/BadRequest',
        },
        '401': {
          $ref: '#/components/responses/Unauthorized',
        },
        '403': {
          $ref: '#/components/responses/Forbidden',
        },
        '404': {
          $ref: '#/components/responses/NotFound',
        },
        '500': {
          $ref: '#/components/responses/InternalServerError',
        },
      },
    };

    // Parse query parameters
    if (methodDef.includes('query:')) {
      operation.parameters = this._parseQueryParams(methodDef);
    }

    // Parse request body
    if (
      methodDef.includes('reqBody:') &&
      ['post', 'put', 'patch'].includes(method)
    ) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      };
    }

    // Add path parameters
    const pathParams = path.match(/\{([^}]+)\}/g);
    if (pathParams) {
      if (!operation.parameters) operation.parameters = [];

      pathParams.forEach((param) => {
        const paramName = param.slice(1, -1);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        operation.parameters!.push({
          name: paramName,
          in: 'path',
          required: true,
          schema: { type: 'string' },
        });
      });
    }

    return operation;
  }

  /**
   * Parse query parameters from method definition
   */
  private _parseQueryParams(methodDef: string): OpenAPIV3.ParameterObject[] {
    const params: OpenAPIV3.ParameterObject[] = [];

    // Simple regex-based parsing for common query params
    const queryMatch = methodDef.match(/query:\s*\{([^}]+)\}/s);
    if (queryMatch) {
      const queryContent = queryMatch[1];
      const paramMatches = queryContent.matchAll(/(\w+):\s*(\w+)/g);

      for (const match of paramMatches) {
        const [, name, type] = match;
        params.push({
          name,
          in: 'query',
          required: !queryContent.includes(`${name}?:`),
          schema: {
            type:
              type === 'number'
                ? 'number'
                : type === 'boolean'
                  ? 'boolean'
                  : 'string',
          },
        });
      }
    }

    return params;
  }

  /**
   * Register with Fastify instance
   */
  async register(fastify: FastifyInstance): Promise<void> {
    const spec = this.generate();

    // Add ProblemDetails schema to components
    if (spec.components?.schemas) {
      spec.components.schemas['ProblemDetails'] = {
        type: 'object',
        required: ['type', 'title', 'status'],
        properties: {
          type: {
            type: 'string',
            format: 'uri',
            description: 'A URI reference that identifies the problem type',
          },
          title: {
            type: 'string',
            description: 'A short, human-readable summary of the problem',
          },
          status: {
            type: 'integer',
            description: 'The HTTP status code',
          },
          detail: {
            type: 'string',
            description:
              'A human-readable explanation specific to this occurrence',
          },
          instance: {
            type: 'string',
            format: 'uri',
            description:
              'A URI reference that identifies the specific occurrence',
          },
        },
        additionalProperties: true,
      };
    }

    // Store the spec for later retrieval
    fastify.decorate('swagger', () => spec);
  }
}
