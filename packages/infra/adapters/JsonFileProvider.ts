// packages/infra/adapters/JsonFileProvider.ts
import {
  EvaluationContext,
  JsonValue,
  Logger,
  Provider,
  ResolutionDetails,
} from '@openfeature/server-sdk';
import flagsConfig from '../../../config/flags.json';

export class JsonFileProvider implements Provider {
  metadata = {
    name: 'JsonFileProvider',
  };

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    _context: EvaluationContext,
    _logger: Logger,
  ): Promise<ResolutionDetails<boolean>> {
    const value =
      (flagsConfig[flagKey as keyof typeof flagsConfig] as any)?.enabled ??
      defaultValue;
    return { value };
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    _context: EvaluationContext,
    _logger: Logger,
  ): Promise<ResolutionDetails<string>> {
    const value =
      (flagsConfig[flagKey as keyof typeof flagsConfig] as any)?.value ??
      defaultValue;
    return { value };
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    _context: EvaluationContext,
    _logger: Logger,
  ): Promise<ResolutionDetails<number>> {
    const value =
      (flagsConfig[flagKey as keyof typeof flagsConfig] as any)?.value ??
      defaultValue;
    return { value };
  }

  async resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    _context: EvaluationContext,
    _logger: Logger,
  ): Promise<ResolutionDetails<T>> {
    const value =
      (flagsConfig[flagKey as keyof typeof flagsConfig] as any)?.value ??
      defaultValue;
    return { value };
  }
}
