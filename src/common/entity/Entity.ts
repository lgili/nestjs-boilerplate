import { AggregateRoot } from '@nestjs/cqrs';

export abstract class Entity<T> extends AggregateRoot {
  protected readonly _id: string;
  public readonly props: T;

  get id() {
    return this._id;
  }

  constructor(props: T, id?: string) {
    super();

    if (id != null) {
      this._id = id;
    }
    this.props = props;
  }

  public equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof Entity)) {
      return false;
    }

    return this._id === object._id;
  }
}
