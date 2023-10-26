import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const tweetRouter = createTRPCRouter({
  infiniteFeed: publicProcedure.input(
    z.object({
      limit: z.number().optional(),
      cursor: z.object({ id: z.string(), createAt: z.date() }).optional(),
    })
  ).query(async ({ input: { limit= 10, cursor }, ctx }) => {
    ctx.prisma.tweet.findMany({
      take: limit + 1,
      cursor: cursor ? { createAt_id: cursor } : undefined,
      orderBy: [{ createAt: "desc" }, { id: "desc" }]
    })
  }),
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const tweet =  await ctx.prisma.tweet.create({
        data: {content, userId: ctx.session.user.id}
      })

      return tweet;
    })
});
