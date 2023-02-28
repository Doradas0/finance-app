import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../server/lambda/trpc-server';

export const trpc = createTRPCReact<AppRouter>();

