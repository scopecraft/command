/**
 * MCP handler wrapper that applies parameter transformation
 */
import { transformMcpParams } from './parameter-transformer.js';

/**
 * Create an MCP handler that automatically transforms snake_case params to camelCase
 */
export function createMcpHandler<T>(
  handler: (params: any) => Promise<T>
): (params: unknown) => Promise<T> {
  return async (rawParams: unknown) => {
    const transformedParams = transformMcpParams(rawParams);
    return handler(transformedParams);
  };
}