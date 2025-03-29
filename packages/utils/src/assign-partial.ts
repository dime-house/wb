import { assign, partialRight } from 'lodash';

export function assignPartial<T>(self: T, item?: any) {
  if (item) (partialRight(assign) as any)(self, item);
}
