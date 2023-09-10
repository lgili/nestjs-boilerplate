import { ClassConstructor, ClassTransformOptions } from 'class-transformer';

import { QueryPrisma } from './query-buider-frontend/interfaces/Query';

interface Reader<Entity> {
  findAll(findOptions?: FindInterface<Entity>): Promise<Entity[]>;

  findOne(findOptions?: FindInterface<Entity>): Promise<Entity | null>;

  findById(findOptions: FindByIdInterface<Entity>): Promise<Entity | null>;

  findBy(findOptions: FindByInterface<Entity>): Promise<Entity | null>;

  countEntityByCondition(conditions: ObjectLiteral): Promise<number>;

  findAndCount(
    findOptions?: FindInterface<Entity>,
  ): Promise<[Entity[], number]>;
}

interface Writer<Entity> {
  create(options: CreateInterface<Entity>): Promise<Entity | null>;
  update(options: UpdateInterface<Entity>): Promise<Entity | null>;
  delete(id: string): Promise<void>;
}
export type Repository<Entity> = Reader<Entity> & Writer<Entity>;

export interface CreateInterface<K> {
  data: K;
  cls?: ClassConstructor<K>;
  transformOptions?: ClassTransformOptions;
}

export interface UpdateInterface<K> {
  id: string;
  data: DeepPartial<K>;
  cls?: ClassConstructor<K>;
  transformOptions?: ClassTransformOptions;
}

export interface FindByIdInterface<K> {
  id: string;
  include?: never;
  cls?: ClassConstructor<K>;
  transformOptions?: ClassTransformOptions;
}

export interface FindByInterface<K> {
  fieldName: string;
  value: string;
  include?: never;
  cls?: ClassConstructor<K>;
  transformOptions?: ClassTransformOptions;
}

export interface FindInterface<K> {
  searchFilter: QueryPrisma;
  cls?: ClassConstructor<K>;
  transformOptions?: ClassTransformOptions;
}

/**
 * Interface of the simple literal object with any string keys.
 */
export interface ObjectLiteral {
  [key: string]: any;
}

/**
 * Same as Partial<T> but goes deeper and makes Partial<T> all its properties and sub-properties.
 */
export declare type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Make all properties in T optional
 */
export declare type QueryPartialEntity<T> = {
  [P in keyof T]?: T[P] | (() => string);
};
/**
 * Make all properties in T optional. Deep version.
 */
export declare type QueryDeepPartialEntity<T> = {
  [P in keyof T]?:
    | (T[P] extends Array<infer U>
        ? Array<QueryDeepPartialEntity<U>>
        : T[P] extends ReadonlyArray<infer U>
        ? ReadonlyArray<QueryDeepPartialEntity<U>>
        : QueryDeepPartialEntity<T[P]>)
    | (() => string);
};
