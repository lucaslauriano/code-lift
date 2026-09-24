import base from '@code-lift/config/eslint/base';

export default [...base, { ignores: ['prisma/migrations/**'] }];
