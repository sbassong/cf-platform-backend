import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventsService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { GetUser } from '../auth/get-user-decorator';
import { UserDocument } from '../user/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createEventDto: CreateEventDto,
    @GetUser() user: UserDocument,
  ) {
    return this.eventsService.create(createEventDto, user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@GetUser() user: UserDocument) {
    return this.eventsService.findAll(user);
  }

  @Get('by-participant/:profileId')
  findByParticipant(@Param('profileId') profileId: string) {
    return this.eventsService.findByParticipant(profileId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() user: UserDocument,
  ) {
    return this.eventsService.update(id, updateEventDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.eventsService.remove(id, user);
  }

  @Post(':id/rsvp')
  @UseGuards(AuthGuard('jwt'))
  rsvp(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.eventsService.rsvp(id, user);
  }

  @Post(':id/un-rsvp')
  @UseGuards(AuthGuard('jwt'))
  unRsvp(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.eventsService.unRsvp(id, user);
  }

  @Post('image-upload-url')
  @UseGuards(AuthGuard('jwt'))
  async getImageUploadUrl(@Body('contentType') contentType: string) {
    if (!contentType) {
      throw new BadRequestException('contentType is required.');
    }
    const key = `events/${uuidv4()}.jpeg`;
    return this.eventsService.getUploadUrl(key, contentType);
  }
}
