import { PrismaClient } from '@prisma/client';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { NotFoundException } from 'src/core/exception/not-found.exception';
import { Pagination } from '@core/paginate';

import { Querybuilder } from './query-buider-backend/queryBuilder';
import {
  CreateInterface,
  FindByIdInterface,
  FindByInterface,
  FindInterface,
  Repository,
  UpdateInterface,
} from './type.repository';

export abstract class BaseRepository<Entity> implements Repository<Entity> {
  private readonly ORM: PrismaClient;
  private readonly table_name: string;

  protected constructor(tablename: string, ORM: PrismaClient) {
    this.ORM = ORM;
    this.table_name = tablename;
  }

  /**
   * save the entity on database
   *
   * @param {CreateInterface<Entity>} options
   * @return {*}  {(Promise<Entity | null>)}
   * @memberof BaseRepository
   */
  async create(options: CreateInterface<Entity>): Promise<Entity | null> {
    const data = await this.ORM[this.table_name.toString()].create({
      data: options.data,
    });

    if (!data) {
      return null;
    }

    if (options.cls) {
      return await this.transform(data, options.cls, options.transformOptions);
    }
  }

  /**
   * deletes the entity from the database
   *
   * @param {string} id
   * @return {*}  {Promise<void>}
   * @memberof BaseRepository
   */
  delete(id: string): Promise<void> {
    return this.ORM[this.table_name.toString()].delete({
      where: {
        id: id,
      },
    });
  }

  /**
   * update the entity on database
   *
   * @param {UpdateInterface<Entity>} options
   * @return {*}  {(Promise<Entity | null>)}
   * @memberof BaseRepository
   */
  async update(options: UpdateInterface<Entity>): Promise<Entity | null> {
    const data = await this.ORM[this.table_name.toString()].update({
      where: {
        id: options.id,
      },
      data: options.data,
    });

    if (!data) {
      return null;
    }

    if (options.cls) {
      return await this.transform(data, options.cls, options.transformOptions);
    }
  }

  /**
   * find all with conditions
   *
   * @param {FindInterface<Entity>} [findOptions]
   * @return {*}  {Promise<Entity[]>}
   * @memberof BaseRepository
   */
  async findAll(findOptions?: FindInterface<Entity>): Promise<Entity[]> {
    try {
      const query = await Querybuilder.query(findOptions.searchFilter);

      const results = await this.ORM[this.table_name.toString()].findMany({
        ...query,
      });

      if (findOptions.cls) {
        return await this.transformMany(
          results,
          findOptions.cls,
          findOptions.transformOptions,
        );
      } else {
        return results;
      }
    } catch (error) {
      return [];
    }
  }

  /**
   * find one with conditions
   *
   * @param {FindInterface<Entity>} [findOptions]
   * @return {*}  {Promise<Entity[]>}
   * @memberof BaseRepository
   */
  async findOne(findOptions?: FindInterface<Entity>): Promise<Entity | null> {
    try {
      const query = await Querybuilder.query(findOptions.searchFilter);

      const result = await this.ORM[this.table_name.toString()].findFirst({
        ...query,
      });

      if (findOptions.cls) {
        return await this.transform(
          result,
          findOptions.cls,
          findOptions.transformOptions,
        );
      } else {
        return result;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * find and count entity
   *
   * @param {FindInterface<Entity>} [findOptions]
   * @return {*}  {Promise<[Entity[], number]>}
   * @memberof BaseRepository
   */
  async findAndCount(
    findOptions?: FindInterface<Entity>,
  ): Promise<[Entity[], number]> {
    try {
      const query = await Querybuilder.query(findOptions.searchFilter);

      const results = await this.ORM[this.table_name.toString()].findMany({
        ...query,
      });

      const all = await this.ORM[this.table_name.toString()].count();

      if (findOptions.cls) {
        const traformededEntity = await this.transformMany(
          results,
          findOptions.cls,
          findOptions.transformOptions,
        );

        return [traformededEntity, all];
      } else {
        return [results, all];
      }
    } catch (error) {
      return [null, 0];
    }
  }

  /**
   * find entity by id
   *
   * @param {FindByIdInterface<Entity>} findOptions
   * @return {*}  {(Promise<Entity | null>)}
   * @memberof BaseRepository
   */
  findById(findOptions: FindByIdInterface<Entity>): Promise<Entity | null> {
    return this.ORM[this.table_name.toString()]
      .findFirst({
        where: {
          id: findOptions.id,
        },
        include: findOptions.include,
      })
      .then((entity) => {
        if (!entity) {
          return Promise.reject(new NotFoundException());
        }

        if (findOptions.cls) {
          return Promise.resolve(
            entity
              ? this.transform(
                  entity,
                  findOptions.cls,
                  findOptions.transformOptions,
                )
              : null,
          );
        } else {
          return Promise.resolve(entity ? entity : null);
        }
      })
      .catch((error) => Promise.reject(error));
  }

  /**
   * find by condition
   *
   * @param {string} fieldName
   * @param {*} value
   * @param {*} [include]
   * @return {*}  {(Promise<Entity | null>)}
   * @memberof BaseRepository
   */
  async findBy(findOptions: FindByInterface<Entity>): Promise<Entity | null> {
    return this.ORM[this.table_name.toString()]
      .findFirst({
        where: {
          [findOptions.fieldName]: findOptions.value,
        },
        include: findOptions.include,
      })
      .then((entity) => {
        if (!entity) {
          return null; //Promise.reject(new NotFoundException()); see if can use this instead
        }

        if (findOptions.cls) {
          return Promise.resolve(
            entity
              ? this.transform(
                  entity,
                  findOptions.cls,
                  findOptions.transformOptions,
                )
              : null,
          );
        } else {
          return Promise.resolve(entity ? entity : null);
        }
      })
      .catch((error) => Promise.reject(error));
  }

  /**
   * get count of entity by condition
   *
   * @param {*} [findOptions={}]
   * @return {*}  {Promise<number>}
   * @memberof BaseRepository
   */
  async countEntityByCondition(findOptions = {}): Promise<number> {
    return this.ORM[this.table_name.toString()]
      .count({
        ...findOptions,
      })
      .then((count) => {
        return Promise.resolve(count);
      })
      .catch((error) => Promise.reject(error));
  }

  /**
   * Paginate entity results
   *
   * @param {FindInterface<Entity>} paginateData
   * @return {*}  {Promise<Pagination<Entity>>}
   * @memberof BaseRepository
   */
  async paginate(
    findOptions: FindInterface<Entity>,
  ): Promise<Pagination<Entity>> {
    const [results, total] = await this.findAndCount(findOptions);

    const query = await Querybuilder.query(findOptions.searchFilter);

    const currentPage = Number(query.skip) || 1;
    const perPage = Number(query.take) || 10;

    const lastPage = Math.ceil(total / perPage);

    return new Pagination<Entity>({
      results: results,
      meta: {
        total,
        lastPage,
        currentPage,
        perPage,
        previous: currentPage > 1 ? currentPage - 1 : null,
        next: currentPage < lastPage ? currentPage + 1 : null,
      },
    });
  }

  /**
   * Transform entity
   *
   * @param {*} model
   * @param {ClassConstructor<Entity>} cls
   * @param {*} [transformOptions={}]
   * @return {*}  {Entity}
   * @memberof BaseRepository
   */
  transform(
    model: any,
    cls: ClassConstructor<Entity>,
    transformOptions = {},
  ): Entity {
    return plainToInstance(cls, model, transformOptions) as Entity;
  }

  /**
   *  transform array of entity
   *
   * @param {any[]} models
   * @param {ClassConstructor<Entity>} cls
   * @param {*} [transformOptions={}]
   * @return {*}  {Entity[]}
   * @memberof BaseRepository
   */
  transformMany(
    models: any[],
    cls: ClassConstructor<Entity>,
    transformOptions = {},
  ): Entity[] {
    return models.map((model) => this.transform(model, cls, transformOptions));
  }
}
