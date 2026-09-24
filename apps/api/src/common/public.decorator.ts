import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'codelift:isPublic';

/**
 * Opts a route out of the global auth guard.
 *
 * The guard is global and the decorator is the exception, rather than the other way round: a new
 * endpoint is protected unless someone deliberately says otherwise.
 */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
