/* eslint-disable max-lines */
/* eslint-disable max-depth */
/**
 * OpenAPI Specification Generator
 *
 * Generates OpenAPI 3.0 specification from aspida type definitions.
 * Uses the existing aspida/frourio structure to auto-generate documentation.
 */

import type { FastifyInstance } from 'fastify';
import type { OpenAPIV3 } from 'openapi-types';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export interface OpenApiGeneratorOptions {
  title: string;
  version: string;
  description?: string;
  servers?: OpenAPIV3.ServerObject[];
  basePath?: string;
}

export class OpenApiGenerator {
  private readonly _options: OpenApiGeneratorOptions;
  private readonly _basePath: string;

  private constructor(args: {
    options: OpenApiGeneratorOptions;
    basePath: string;
  }) {
    this._options = args.options;
    this._basePath = args.basePath;
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
        schemas: {},
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
    this._scanApiDirectory(apiPath, spec, '');

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
   * Parse route file and extract type definitions
   */
  private _parseRouteFile(
    filePath: string,
    spec: OpenAPIV3.Document,
    path: string,
  ): void {
    try {
      const content = readFileSync(filePath, 'utf-8');

      // Extract methods from DefineMethods
      const methodsMatch = content.match(/DefineMethods<\{([^}]+)\}>/s);
      if (!methodsMatch) return;

      const methodsContent = methodsMatch[1];
      const methods = ['get', 'post', 'put', 'patch', 'delete'];

      for (const method of methods) {
        const methodRegex = new RegExp(`${method}:\\s*\\{([^}]+)\\}`, 's');
        const methodMatch = methodsContent.match(methodRegex);

        if (methodMatch) {
          const methodDef = methodMatch[1];
          const pathItem = this._createPathItem(method, methodDef, path);

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
   * Create OpenAPI path item from method definition
   */
  private _createPathItem(
    method: string,
    methodDef: string,
    path: string,
  ): OpenAPIV3.OperationObject {
    const operation: OpenAPIV3.OperationObject = {
      summary: `${method.toUpperCase()} ${path}`,
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
          description: 'Bad Request',
          content: {
            'application/problem+json': {
              schema: {
                $ref: '#/components/schemas/ProblemDetails',
              },
            },
          },
        },
        '404': {
          description: 'Not Found',
          content: {
            'application/problem+json': {
              schema: {
                $ref: '#/components/schemas/ProblemDetails',
              },
            },
          },
        },
        '500': {
          description: 'Internal Server Error',
          content: {
            'application/problem+json': {
              schema: {
                $ref: '#/components/schemas/ProblemDetails',
              },
            },
          },
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
