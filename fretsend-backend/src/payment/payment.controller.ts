import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { Public } from '../common/decorators/index';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class PaymentActionDto {
  @ApiProperty({ enum: ['paid','unpaid','problem'] })
  @IsEnum(['paid','unpaid','problem'])
  action: 'paid' | 'unpaid' | 'problem';
}

@ApiTags('Payment')
@Controller({ path: 'payment', version: '1' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Public()
  @Get(':token')
  @ApiOperation({ summary: 'Vérifier un lien de paiement' })
  verify(@Param('token') token: string) {
    return this.paymentService.verifyToken(token);
  }

  @Public()
  @Post(':token')
  @ApiOperation({ summary: 'Traiter l\'action de paiement (paid/unpaid/problem)' })
  process(@Param('token') token: string, @Body() dto: PaymentActionDto) {
    return this.paymentService.processAction(token, dto.action);
  }
}
