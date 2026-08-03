import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { InvoiceEntity } from '@app/database/entities/billing/invoice.entity';

import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from './dto';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new invoice',
  })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully.',
    type: InvoiceEntity,
  })
  create(
    @Body() dto: CreateInvoiceDto,
  ): Promise<InvoiceEntity> {
    return this.invoicesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all invoices',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully.',
    type: [InvoiceEntity],
  })
  findAll(): Promise<InvoiceEntity[]> {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve an invoice by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully.',
    type: InvoiceEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InvoiceEntity> {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an invoice',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully.',
    type: InvoiceEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ): Promise<InvoiceEntity> {
    return this.invoicesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an invoice',
  })
  @ApiParam({
    name: 'id',
    description: 'Invoice UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.invoicesService.remove(id);
  }
}
