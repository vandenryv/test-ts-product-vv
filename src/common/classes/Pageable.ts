import { z } from 'zod';

export const PageableSchema = z.object({
  page: z
    .number()
    .int()
    .positive(),
  size: z
    .number()
    .int()
    .positive(),
});

export type Pageable = z.infer<typeof PageableSchema>;

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

export type PossiblePageableValue = string | number | undefined;

export interface PageableRaw {
  page: PossiblePageableValue;
  size: PossiblePageableValue;
}

/**
 * Take a pageable query page and size, possibly string format and parse them into a Pageable object or return undefined if parsing fails.
 * @param pageableRaw
 */
export function tryParsePageable(pageableRaw: PageableRaw): Pageable | undefined {
  let page = DEFAULT_PAGE;
  switch (typeof pageableRaw.page){
    case 'number':
      page = pageableRaw.page;
      break;
    case 'string':
      page = Number.parseInt(pageableRaw.page);
      break;
  }
  let size = DEFAULT_PAGE_SIZE;
  switch (typeof pageableRaw.size){
    case 'number':
      size = pageableRaw.size;
      break;
    case 'string':
      size = Number.parseInt(pageableRaw.size);
      break;
  }
  if (isNaN(page) || isNaN(size)){
    return undefined;
  }
  return { page: page, size: size };
}