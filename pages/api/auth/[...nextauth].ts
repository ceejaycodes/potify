import NextAuth, {NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from '@/utils/prisma'
import Stripe from 'stripe';


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  events: {
    createUser: async ({ user }: any) => {
      const stripe = new Stripe(process.env.SECRET_KEY as string, {apiVersion: '2022-11-15'});

      
     if (user.name && user.email){ 
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
         
      })
      await prisma.user.update({
        where: {id: user.id},
        data: {stripeCustomerId: customer.id}
      })
    }
    },
  },
  callbacks: {
     session({session, token, user}){
      session.user  = user
      return session

    },

  }


};

export default NextAuth(authOptions);