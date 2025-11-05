import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsDateInRange(
  { minDate, maxDate }: { minDate?: Date; maxDate?: Date },
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'isDateInRange',
      target: object.constructor,
      propertyName,
      constraints: [minDate, maxDate],
      options: validationOptions,
      validator: {
        validate(value: Date, args: ValidationArguments & { constraints: Date[] }) {
          const [min, max] = args.constraints;
          if (!(value instanceof Date)) {
            return false;
          }

          if (min && !max) {
            return value >= min;
          }

          if (max && !min) {
            return value <= max;
          }

          return value >= min && value <= max;
        },
        defaultMessage(args: ValidationArguments & { constraints: Date[] }) {
          const [min, max]: Date[] = args.constraints;
          return `Date must be between ${min.toISOString().split('T')[0]} and ${max.toISOString().split('T')[0]}`;
        },
      },
    });
  };
}
