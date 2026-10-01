import { Injectable, RawBodyRequest } from '@nestjs/common';
import { envs } from '../config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { metadata } from 'reflect-metadata/no-conflict';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripeSecret)


    async createPaymentSession(paymentSessionDto: PaymentSessionDto):Promise<Stripe.Response<Stripe.Checkout.Session>>{

        const {currency, items, orderId} = paymentSessionDto;

        const lineItems = items.map(item =>{
            return {
              price_data:{
                currency:currency,
                product_data:{
                   name:item.name
                },
                unit_amount: Math.round(item.price * 100) // para convertir 
              },
              quantity: item.quantity
            }
        })

        const session =  await this.stripe.checkout.sessions.create({

            //Colocar id de orden
            payment_intent_data:{
                metadata:{
                    orderId: orderId
                }
            },
            line_items:lineItems,
            mode:'payment',
            success_url:envs.stripeSuccessUrl,
            cancel_url:envs.stripeCancelUrl
        });

        return session;
    }


    async stripeWebHook(req: RawBodyRequest<Request>, res:Response){
        const sig= req.headers['stripe-signature'];
        let event: Stripe.Event;

        //Prod
        const endpointSecret = envs.stripeEnpointSecret;
        try {
            event = this.stripe.webhooks.constructEvent(req.rawBody!, sig!, endpointSecret);
        } catch (err:any) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        
        switch(event.type){
            case 'charge.succeeded':
                const chargeSucceeded = event.data.object;
                console.log({
                    metadata: chargeSucceeded.metadata,
                    orderId: chargeSucceeded.metadata.orderId
                })
            break;

            default:
                console.log(`Event ${event.type} not handled`);

        }

        return res.status(200).send({sig});
    }

    
}
