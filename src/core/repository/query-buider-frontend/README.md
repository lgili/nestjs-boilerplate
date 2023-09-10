# prisma-querybuilder-interface

<br/>

## Use case


<br/>


<hr>

### Documentation


- **Properties**

  - Usage

    | Name     | Type       | exemple                                          |
    | -------- | ---------- | ------------------------------------------------ |
    | select   | string     | select: 'name email',                            |
    | page     | number     | page: 2,                                         |
    | limit    | number     | limit: 20,                                       |
    | sort     | SortFields | sort: {field: string, criteria: 'asc'},          |
    | populate | Populate   | populate: [{path: 'car', select: 'model plate'}] |
    | filter   | Filter     | filter: [{name: 'jonas'}, {value: { gte: 4 }}]   |

<br/>

- **Exported Interfaces**

  ```tsx
  import {
    QueryPrisma,
    Populate,
    Filter
  } from 'src/common/reposytory/interfaces';
  ```

  - **Query**

    all types

  - **Populate**
  - **Filter**
  - **Operators**

    contains, endsWith, startsWith, equals, gt, gte, in, lt, lte ,not, notIn

  <br/>

- **Full usage exemple**

  ```tsx
  const query: QueryPrisma = {
    select: 'name email',
    populate: [
      {
        path: 'role',
        select: 'name description',
        populate: [
          {
            path: 'permitions',
            select: 'description'
          }
        ]
      }
    ],
    filter: [
      {
        createdAt: { lte: new Date() }
      },
      {
        or: [
          {
            role: 'admin'
          },
          {
            active: true
          }
        ]
      },
      {
        and: [
          {
            firstName: 'Matt'
          },
          {
            lastName: { contains: 'Ryan' }
          }
        ]
      }
    ]
  };
  ```
  if its necessary get all filds in the path use **all** word. But for now if use the **all** word must be in all popule filds

```tsx
  const query: QueryPrisma = {
      select: 'all',
      filter: [{ path: 'name', value: 'lu', operator: 'contains' }],
      sort: { field: 'name', criteria: 'asc' },
      populate: [
        {
          path: 'role',
          select: 'all',
          populate: [
            {
              path: 'permissions',
              select: 'all',
            },
          ],
        },
      ],
      page: 3,
      limit: 3,
    };
  ```

- **Populate**

  ```tsx
  const populate: Populate = [
    {
      path: 'role',
      select: 'name description',
      filter: [{path: 'name', value: 'luiz', operator: 'contains'}],
      populate: [
        {
          path: 'permissions',
          select: 'description',
        }
      ],
      primaryKey: 'yourTablePrimaryKey' // default 'id'
    },

    // Non verbose syntax

    {
      car: 'name description',
      filter: [{name: {contains: 'luiz'}],
      populate: [{permissions: 'description'}],
      primaryKey: 'yourTablePrimaryKey' // default 'id'
    },
  ],
  ```

- **Filter**

  ```tsx
  const filter: Filter = [
    {
      path: 'createdAt',
      value: new Date(),
      operator: 'lte'
    },
    {
      or: [
        {
          path: 'role',
          value: 'admin',
          operator: 'equals'
        },
        {
          path: 'role',
          value: 'system',
          operator: 'equals'
        }
      ]
    },
    {
      and: [
        {
          path: 'name',
          value: 'Ricky',
          operator: 'equals',
          insensitive: true
        },
        {
          path: 'lastName',
          value: 'Morty',
          operator: 'contains',
          insensitive: true
        }
      ]
    }
  ];

  // Non verbose syntax

  const filter: Filter = [
    {
      createdAt: { lte: new Date() }
    },
    {
      or: [
        {
          role: 'admin'
        },
        {
          role: 'system'
        }
      ]
    },
    {
      and: [
        {
          name: { equals: 'Ricky', insensitive: true }
        },
        {
          lastName: { contains: 'Morty', insensitive: true }
        }
      ]
    }
  ];
  ```

### END

- Nestjs/Prisma Querybuilder Interface is ISC licensed.

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FWillian-Rodrigues%2Fnestjs-prisma-querybuilder-interface&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)
