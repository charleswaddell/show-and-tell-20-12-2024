import { Client } from 'https://deno.land/x/postgres@v0.19.3/mod.ts';

type QueryArgs<
  Query extends string,
  Args extends unknown[] = []
> = Query extends `$string$${infer Rest}`
  ? QueryArgs<Rest, [...Args, string]>
  : Query extends `$number$${infer Rest}`
  ? QueryArgs<Rest, [...Args, number]>
  : Query extends `$boolean$${infer Rest}`
  ? QueryArgs<Rest, [...Args, boolean]>
  : Query extends `${string}${infer Rest}`
  ? QueryArgs<Rest, Args>
  : Args;

export const query =
  <Query extends string>(queryString: Query, values: QueryArgs<Query>) =>
  (queryable: Client) =>
    queryable.queryArray(queryString, values);

const queryCustomerName = query(
  //'select name from customer where id = $number$',
  //[10]
  'select name from customer where id = $number$ and visible = $boolean$',
  [10, true]
);
