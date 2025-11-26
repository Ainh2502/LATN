/* 
 * LATN Modules - Shipment Module (Finalized)
 * Added: setProviderByOrder() API for choosing real shipping partner
 */

import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('shipment')
@UseGuards(JwtAuthGuard)
@Controller('shipment')
export class ShipmentController {
  constructor(private readonly service: ShipmentService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách vận đơn (Admin/Staff)' })
  findAll(@GetUser() user: any) {
    return this.service.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết vận đơn (Admin/Staff)' })
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật vận đơn (Admin/Staff)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentDto,
    @GetUser() user: any,
  ) {
    return this.service.update(id, dto, user);
  }

  /** 🆕 Chọn đối tác giao hàng thật khi provider = STANDARD */
  @Patch('by-order/:orderId/set-provider')
  @ApiOperation({
    summary: 'Gán đối tác giao hàng cho đơn (Admin/Staff)',
    description:
      'Chọn provider thật (GHN, GHTK, J&T, VIETTELPOST) khi provider hiện tại là STANDARD.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: ['GHN', 'GHTK', 'J&T', 'VIETTELPOST'],
        },
      },
    },
  })
  async setProviderByOrder(
    @Param('orderId') orderId: string,
    @Body('provider') provider: string,
    @GetUser() user: any,
  ) {
    return this.service.setProviderByOrder(orderId, provider, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá vận đơn (Admin/Staff)' })
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.service.remove(id, user);
  }
}
