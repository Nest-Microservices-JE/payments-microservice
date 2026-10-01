import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import type { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}


  @Post('create-payment-session')
  createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto): Promise<Stripe.Response<Stripe.Checkout.Session>>{
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success(){
    return{
      ok:true,
      message: 'Payment successful'
    }
  }


  @Get('cancel')
  cancel(){
    return{
      ok:false,
      message: 'Payment cancelled'
    }
  }


  @Post('webhook')
  async stripeWebHook(@Req() req:Request, @Res() res:Response){
    return this.paymentsService.stripeWebHook(req,res);
  }


}
