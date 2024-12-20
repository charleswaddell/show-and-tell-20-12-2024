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

type StripSpaces<
  RawFields extends string,
  Fields extends string = ''
> = RawFields extends `${infer Head}${infer Tail}`
  ? Head extends ' '
    ? StripSpaces<Tail, Fields>
    : StripSpaces<Tail, `${Fields}${Head}`>
  : Fields;

type SplitFields<
  RawFields extends string,
  Fields extends string = never
> = RawFields extends ''
  ? Fields
  : RawFields extends `${infer Field},${infer Rest}`
  ? SplitFields<Rest, Field | Fields>
  : Fields | RawFields;

type QueryFields<Query extends string> =
  Query extends `${string}select${infer RawFields}from${string}`
    ? { [K in SplitFields<StripSpaces<RawFields>>]: string }
    : never;

export const query =
  <Query extends string>(queryString: Query, values: QueryArgs<Query>) =>
  (queryable: Client) =>
    queryable.queryArray<Array<QueryFields<Query>>>(queryString, values);

const queryProducts = query(
  'select id, title, description from product where status = $string$ and price > $number$',
  ['on-sale', 10]
);
