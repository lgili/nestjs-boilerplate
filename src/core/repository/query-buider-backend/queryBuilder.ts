import { Global, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { QueryPrisma } from '../query-buider-frontend/interfaces/Query';
import { QueryResponse } from './dto/queryResponse.dto';
import { QueryValidator } from './dto/queryValidator.dto';
import { filter } from './functions/filter.fn';
import { paginate } from './functions/paginate.fn';
import { defaultPlainToClass } from './functions/plainToClass.fn';
import { populate } from './functions/populate.fn';
import { select } from './functions/select.fn';
import { sort } from './functions/sort.fn';
import defaultValidateOrReject from './functions/validateOrReject.fn';

@Global()
@Injectable()
export class Querybuilder {
  /**
   *
   *
   * @param primaryKey PrimaryKey from model selected, default is '_id_'
   * @returns {Promise<QueryResponse>} This will return your query to prisma
   * @seemore https://github.com/HarielThums/nestjs-prisma-querybuilder
   */
  static async query(
    query: QueryPrisma,
    primaryKey = 'id',
  ): Promise<QueryResponse> {
    const queryValidator = defaultPlainToClass(QueryValidator, query);

    await defaultValidateOrReject(queryValidator);

    const queryBuilder = this.buildQuery(queryValidator, primaryKey);

    return queryBuilder;
  }

  private static buildQuery(query: QueryPrisma, primaryKey: string) {
    query.page = Number(query.page) > 0 ? Number(query.page) : 1;
    query.limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

    // this.request.res.setHeader('page', query.page);
    if (query.sort) {
      query = sort(query);
    }

    if (query.page) {
      query = paginate(query);
    }

    if (query.select) {
      query = select(query, primaryKey);
    } else {
      delete query.select;
    }

    if (query.populate) {
      query = populate(query);
    }

    if (query.filter) {
      query = filter(query);
    }

    if (query.select?.hasOwnProperty('all')) delete query.select;

    return plainToInstance(QueryResponse, query, {
      excludeExtraneousValues: true,
    });
  }
}
