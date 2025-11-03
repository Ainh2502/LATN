import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

// import { UseGuards, Req } from '@nestjs/common';
 import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // create(@Body() dto: CreateReviewDto, @Req() req: any) {
  //   return this.reviewService.create(dto, req.user?.id);
  // }
  create(@Body() dto: CreateReviewDto) {
    // Nếu chưa nối JWT, tạm nhận dto.userId
    return this.reviewService.create(dto);
  }

   @Get()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['newest', 'oldest', 'highest', 'lowest'],
  })
  @ApiQuery({
    name: 'rating',
    required: false,
    description: 'Lọc theo số sao (1..5)',
  })
  async list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('productId') productId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    @Query('sort') sort?: 'newest' | 'oldest' | 'highest' | 'lowest',
    @Query('rating') rating?: string,
    @Req() req?: any,
  ) {
    const ratingNum = rating ? Number(rating) : undefined;
    const currentUserId = req?.user?.id || undefined;

    return this.reviewService.list(
      {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        productId,
        userId,
        status,
        sort,
        rating: !Number.isNaN(ratingNum!) ? ratingNum : undefined,
      },
      currentUserId, // ✅ truyền userId của người đang login
    );
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.reviewService.detail(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }

  /** Moderation nhanh */
  @Patch(':id/approve')
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard) // ví dụ: chỉ ADMIN/STAFF
  approve(@Param('id') id: string) {
    return this.reviewService.approve(id);
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  reject(@Param('id') id: string) {
    return this.reviewService.reject(id);
  }

  /** Thống kê của một product */
  @Get('product/:productId/summary')
  summary(@Param('productId') productId: string) {
    return this.reviewService.summaryByProduct(productId);
  }
}
