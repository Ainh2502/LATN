import { Controller, Get, Query } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { AttributeFilterDto } from './dto/attribute-filter.dto';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('attribute')
@Controller('attribute')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Get()
  async getAllAttributes() {
    return this.attributeService.getAllAttributes();
  }

  @Get('filter')
  @ApiQuery({ name: 'key', example: 'size' })
  @ApiQuery({ name: 'value', example: 'M' })
  async filterByAttribute(@Query() query: AttributeFilterDto) {
    return this.attributeService.filterByAttribute(query.key, query.value);
  }
}
