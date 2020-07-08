import { WithAtLeast } from './hasura.types';

const exampleAction = {
  session_variables: { 'x-hasura-role': 'admin' },
  input: {
    input: { first_name: 'Jesse' },
    userId: 'fcadd6ee-7114-4536-8fea-fff338506364',
  },
  action: { name: 'UpdateUserDisplayProfile' },
};

type MainHasuraVariables = {
  'x-hasura-role': string;
};

export type HasuraAction = Omit<
  typeof exampleAction,
  'session_variables' | 'input'
> & {
  session_variables: WithAtLeast<MainHasuraVariables>;
  input: any;
};

export type TypedHasuraAction<T> = Omit<HasuraAction, 'input'> & { input: T };
