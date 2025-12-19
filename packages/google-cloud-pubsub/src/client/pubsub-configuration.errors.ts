type ConfigurationMismatchEntry = {
  key: string;
  local: string | null | undefined;
  remote: string | null | undefined;
};

type ConfigurationInvalidEntry = {
  key: string;
  reason: string;
  value: any;
};

export class PubsubConfigurationMismatchError extends Error {
  public readonly mismatchEntry: ConfigurationMismatchEntry;

  constructor(topicName: string, mismatchEntry: ConfigurationMismatchEntry) {
    const details = `  - ${mismatchEntry.key}: local is (${mismatchEntry.local}), but remote is (${mismatchEntry.remote})`;
    const message = `Configuration mismatch for topic (${topicName}). Found differences:\n${details}`;

    super(message);

    this.mismatchEntry = mismatchEntry;
    this.name = PubsubConfigurationMismatchError.name;
  }
}

export class PubsubConfigurationInvalidError extends Error {
  public invalidEntry: ConfigurationInvalidEntry;

  constructor(topicName: string, invalidEntry: ConfigurationInvalidEntry) {
    const details = `  - ${invalidEntry.key}: value is (${invalidEntry.value}), reason: ${invalidEntry.reason}`;
    const message = `Invalid pubsub client configuration for topic (${topicName}). Found errors:\n${details}`;

    super(message);

    this.invalidEntry = invalidEntry;
    this.name = PubsubConfigurationInvalidError.name;
  }
}
