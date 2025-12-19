export class TaskHandlerValidationSchemaMissingError extends Error {
  constructor(taskName: string) {
    super(
      `Task handler "${taskName}" is missing a validation schema. Please provide a Zod schema for this task in the GraphileWorkerModule options.`,
    );
    this.name = 'TaskHandlerValidationSchemaMissingError';
  }
}
