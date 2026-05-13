import { Command } from '$/@frouvel/kaname/console/Command';
import type { Application } from '$/@frouvel/kaname/foundation';
import type { OpenApiGenerator } from '$/@frouvel/kaname/swagger/OpenApiGenerator';
import { OpenApiSpecGenerator } from '$/@frouvel/kaname/generator/OpenApiSpecGenerator';

export class GenerateOpenApiCommand extends Command {
  constructor(app: Application) {
    super(app);
  }

  protected signature() {
    return {
      name: 'openapi:generate',
      description: 'Generate OpenAPI specification file',
      options: [
        {
          flags: '-f, --format <format>',
          description: 'Output format: json|yaml (default: yaml)',
        },
        {
          flags: '-o, --output <path>',
          description: 'Output file path',
        },
      ],
    };
  }

  async handle(options?: { format?: string; output?: string }) {
    const format = (options?.format || 'yaml') as 'json' | 'yaml';
    
    if (format !== 'json' && format !== 'yaml') {
      this.error(`Invalid format: ${format}. Use 'json' or 'yaml'`);
      return;
    }

    const openApiGen = this.app.make<OpenApiGenerator>('swagger');
    
    const generator = new OpenApiSpecGenerator(openApiGen, {
      basePath: this.app.basePath(),
      format,
      outputPath: options?.output,
    });

    await generator.execute();
  }
}
