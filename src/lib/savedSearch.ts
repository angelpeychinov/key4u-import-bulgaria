// An absent scope means ordinary catalog search; an explicit empty scope means no saved cars.
export const isEmptySavedSearch = (filters: { ids?: string }) =>
  filters.ids !== undefined && filters.ids.trim() === "";