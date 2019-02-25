import { ReflectMetadata } from '@nestjs/common';
import { idArg, interfaceType } from 'nexus';

const StringTypeKey = Symbol('StringTypeKey');

export const StringType = (config: any) =>
  ReflectMetadata(StringTypeKey, config);

// PLACEHOLDER EXAMPLE
export const Character = interfaceType({
  name: 'Character',
  definition: t => {
    t.string('id', { description: 'The id of the character' });
    t.string('name', { description: 'The name of the character' });
    t.list.field('friends', {
      type: Character,
      description:
        'The friends of the character, or an empty list if they have none.',
      resolve: character => () => ({})
    });
    t.list.field('appearsIn', {
      type: 'Episode',
      description: 'Which movies they appear in.',
      resolve: o => o.appears_in,
      args: {
        id: idArg({ required: true })
      }
    });
    t.resolveType(character => character.type);
  }
});
