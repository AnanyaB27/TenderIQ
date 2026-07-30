import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

/**
 * Placeholder for the global ValidationPipe configuration
 * (`whitelist: true, forbidNonWhitelisted: true`, API_SPEC.md §3.1).
 * The bootstrap in apps/api/src/main.ts uses Nest's built-in ValidationPipe
 * directly; this class is reserved for any custom whitelist behavior needed
 * beyond that, implemented in a later phase.
 */
@Injectable()
export class WhitelistValidationPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    return value;
  }
}
