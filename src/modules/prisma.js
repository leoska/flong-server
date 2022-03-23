import { PrismaClient } from '@prisma/client';
import _ from 'lodash';

const AMOUNT_ATTEMPT_RETRIES = 3;
const prismaDb = new PrismaClient();

// Enable graceful stop
process.once('SIGINT', async () => prismaDb.$disconnect());
process.once('SIGTERM', async () => prismaDb.$disconnect());

export default async function prismaCall(path, ...args) {
    const callFn = _.get(prismaDb, path, undefined);

    if (!callFn)
        throw new Error(`Method [${path}] is undefined!`);

    return await callFn(...args);
}