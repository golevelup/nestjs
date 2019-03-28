import { Type } from '@nestjs/common';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { groupBy } from 'lodash';
import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
import { plainToClass } from 'class-transformer';

export type PropertyNamesOf<T> = {
  [K in keyof T]: T[K] extends Function ? never : T[K]
}[keyof T];

type modelFactory = <T>(
  classCtor: Type<T>,
  options?: PropertyNamesOf<T>
) => T | T[];

export const generate: modelFactory = <T>(
  classCtor: Type<T>,
  options?: PropertyNamesOf<T>
) => {
  const meta: ValidationMetadata[] = (getFromContainer(MetadataStorage) as any)
    .validationMetadatas;

  //   const grouped = groupBy(meta.validationMetadatas, 'target');
  //   console.log(grouped);

  const modelConstraints = meta.filter(x => x.target === classCtor);
  console.log(modelConstraints);

  return plainToClass(classCtor, {});
};
