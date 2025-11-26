import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { ListQueryDto } from './dto/list-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  // 📋 Danh sách khách hàng
  @Get()
  @ApiOperation({ summary: '📋 Danh sách khách hàng (role = CUSTOMER)' })
  list(@Query() q: ListQueryDto) {
    return this.service.list(q);
  }

  // 🔍 Chi tiết khách hàng
  @Get(':id')
  @ApiOperation({ summary: '🔍 Chi tiết khách hàng (bao gồm địa chỉ & đơn hàng)' })
  detail(@Param('id') id: string) {
    return this.service.detail(id);
  }

  // 🏠 Danh sách địa chỉ riêng của khách hàng
  @Get(':id/addresses')
  @ApiOperation({ summary: '🏠 Danh sách địa chỉ của khách hàng' })
  addresses(@Param('id') id: string) {
    return this.service.addresses(id);
  }

  // ✏️ Cập nhật thông tin khách hàng
  @Patch(':id')
  @ApiOperation({ summary: '✏️ Cập nhật thông tin khách hàng (tên, email)' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.service.update(id, dto);
  }

  // 🗑️ Xóa khách hàng
  @Delete(':id')
  @ApiOperation({ summary: '🗑️ Xoá khách hàng (và địa chỉ cascade)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
