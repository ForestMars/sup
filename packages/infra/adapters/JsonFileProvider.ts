// packages/infra/adapters/JsonFileProvider.ts
import { Provider, ResolutionDetails, JsonValue } from '@openfeature/server-sdk';
import flagsConfig from '../../../config/flags.json';

export class JsonFileProvider implements Provider {
  metadata = {
    name: 'JsonFileProvider',
  };

  async resolveBooleanEvaluation(
      flagKey: string,
      defaultValue: boolean,
      context: EvaluationContext,
      logger: Logger
    ): Promise<ResolutionDetails<boolean>> {
      const value = flagsConfig[flagKey as keyof typeof flagsConfig]?.enabled ?? defaultValue;
      return { value };
    }

    async resolveStringEvaluation(
      flagKey: string,
      defaultValue: string,
      context: EvaluationContext,
      logger: Logger
    ): Promise<ResolutionDetails<string>> {
      const value = flagsConfig[flagKey as keyof typeof flagsConfig]?.value ?? defaultValue;
      return { value };
    }

    async resolveNumberEvaluation(
      flagKey: string,
      defaultValue: number,
      context: EvaluationContext,
      logger: Logger
    ): Promise<ResolutionDetails<number>> {
      const value = flagsConfig[flagKey as keyof typeof flagsConfig]?.value ?? defaultValue;
      return { value };
    }

    async resolveObjectEvaluation<T extends JsonValue>(
      flagKey: string,
      defaultValue: T,
      context: EvaluationContext,
      logger: Logger
    ): Promise<ResolutionDetails<T>> {
      const value = flagsConfig[flagKey as keyof typeof flagsConfig]?.value ?? defaultValue;
      return { value };
    }
}
