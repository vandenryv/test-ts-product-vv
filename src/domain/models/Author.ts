

export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
}

export type AuthorToAdd = Omit<Author, 'id'>;