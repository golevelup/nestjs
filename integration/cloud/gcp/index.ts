import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';

const named = (name: string) => `nestjs-plus-${name}`;

const pubSubAPI = new gcp.projects.Service(named('pubsub-api'), {
  service: 'pubsub.googleapis.com'
});

const pubSubTopicName = named('pubsub-topic');

const pubSubTopic = new gcp.pubsub.Topic(
  pubSubTopicName,
  {
    name: pubSubTopicName
  },
  {
    dependsOn: [pubSubAPI]
  }
);

export const pubSubArtifact = pubSubTopic.name;
