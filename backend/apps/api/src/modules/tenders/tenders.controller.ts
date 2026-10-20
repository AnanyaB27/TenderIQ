
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../../../libs/common/guards/jwt-auth.guard';
import { OrganizationMembershipGuard } from '../../../../../libs/common/guards/organization-membership.guard';
import { TendersService } from './tenders.service';
import { GetTendersDto } from './dto/get-tenders.dto';

@UseGuards(JwtAuthGuard, OrganizationMembershipGuard)
@Controller('tenders')
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Get()
  getTenders(
    @Query() query: GetTendersDto,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.tendersService.findAll({
      ...query,
      organizationId,
    });
  }

  @Get(':id')
  getTenderById(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.tendersService.findOneForOrganization(
      id,
      organizationId,
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        const isPdf =
          file.mimetype === 'application/pdf' ||
          file.originalname.toLowerCase().endsWith('.pdf');

        if (!isPdf) {
          callback(
            new BadRequestException(
              'Only PDF files are supported.',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  async uploadTender(
    @UploadedFile() file: any,
    @Query('organizationId') _unusedOrganizationId: string,
    @Req() req: any,
    @Query() _query: any,
    @UploadedFile() _unusedFile: any,
  ) {
    // The organization ID and title are multipart form fields,
    // so read them from req.body.
    const organizationId = req.body?.organizationId;
    const title = req.body?.title;
    const userId = req.user?.userId;

    if (!file) {
      throw new BadRequestException(
        'A PDF file is required.',
      );
    }

    const result =
      await this.tendersService.uploadCustomTender(
        organizationId,
        userId,
        file,
        title,
      );

    // Keep the identifiers available in both flat and nested
    // response formats for frontend compatibility.
    const documentId =
      result.documentId || result.document?.id || null;

    return {
      ...result,
      id: result.id,
      tenderId: result.id,
      documentId,
      document: documentId
        ? {
            ...(result.document || {}),
            id: documentId,
          }
        : null,
    };
  }

  @Delete(':id')
  deleteTender(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.tendersService.remove(id, organizationId);
  }
}
