import { PopulateFields } from '../dto/populateFields.dto';
import { filter } from './filter.fn';

export const populate = (query) => {
  if (query.populate) {
    const select = {};
    let isAll = false;

    const populate = [query.populate].flat();

    populate.forEach((value: PopulateFields, index) => {
      select[value.path] = {};

      // if we want to get all the fields use include
      if (populate[index].select === 'all') {
        select[value.path] = true;
        isAll = true;
      } else {
        select[value.path]['select'] = { [value.primaryKey]: true };
      }

      if (value.populate) {
        value.populate.forEach((valueInside: PopulateFields, index) => {
          if (value.populate[index].select === 'all') {
            if (isAll) {
              delete select[value.path];
              select[value.path] = {};
            } else {
              delete select[value.path]['select'];
            }

            select[value.path]['include'] = {};
            select[value.path]['include'][valueInside.path] = true;
            isAll = true;
          } else {
            select[value.path]['select'][valueInside.path] = {};

            select[value.path]['select'][valueInside.path]['select'] = {
              [value.primaryKey]: true,
            };
          }
        });
      }
    });

    if (!isAll) {
      populate.forEach((value: PopulateFields, index) => {
        if (populate[index].select) {
          populate[index].select.split(' ').map((v: string) => {
            select[value.path]['select'][v] = true;
          });

          if (populate[index].populate) {
            populate[index].populate.forEach((valueInside: PopulateFields) => {
              valueInside.select.split(' ').map((v: string) => {
                select[value.path]['select'][valueInside.path]['select'][v] =
                  true;
              });
            });
          }
        }

        if (value.filter) {
          const filterResponse = filter(value)?.where;

          if (filterResponse) select[value.path]['where'] = filterResponse;
        }
      });
    }

    delete query.populate;

    if (query.select?.hasOwnProperty('all')) {
      query.include = {};

      query.include = { ...select };

      delete query.select;
    } else {
      query.select = { ...query.select, ...select };
    }
  }

  return query;
};
