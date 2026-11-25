export function queryStringExtractor(queryString: unknown): string | undefined {
  if (typeof queryString === 'string') return queryString;
  if (
    Array.isArray(queryString) &&
    queryString.length > 0 &&
    typeof queryString[0] === 'string'
  )
    return queryString[0];
  return undefined;
}