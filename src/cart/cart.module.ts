import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';
import { DatabaseModule } from '../database/database.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { CheckoutService } from './services/checkout.service';

@Module({
  imports: [OrderModule, DatabaseModule],
  providers: [CartService, CheckoutService],
  controllers: [CartController],
})
export class CartModule {}
