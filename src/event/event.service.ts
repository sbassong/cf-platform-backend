import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UserDocument } from '../user/schemas/user.schema';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


@Injectable()
export class EventsService {
  private readonly s3Client: S3Client;

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
  }

  async create(
    createEventDto: CreateEventDto,
    user: UserDocument,
  ): Promise<Event> {
    const newEvent = new this.eventModel({
      ...createEventDto,
      organizer: user.profile,
      // The organizer is automatically the first attendee
      attendees: [user.profile],
    });
    return newEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel
      .find()
      .populate('organizer', 'displayName username avatarUrl')
      .sort({ date: 1 }) // Sort by upcoming date
      .exec();
  }

  async findOne(id: string): Promise<EventDocument> {
    const event = await this.eventModel
      .findById(id)
      .populate('organizer attendees')
      .exec();

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found.`);
    }
    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    user: UserDocument,
  ): Promise<Event> {
    const event = await this.findOne(id);
    if (event.organizer.toString() !== user.profile.toString()) {
      throw new ForbiddenException('You are not the organizer of this event.');
    }
    Object.assign(event, updateEventDto);
    return event.save();
  }

  async remove(id: string, user: UserDocument): Promise<{ message: string }> {
    const event = await this.findOne(id);
    if (event.organizer.toString() !== user.profile.toString()) {
      throw new ForbiddenException('You are not the organizer of this event.');
    }
    await this.eventModel.deleteOne({ _id: id }).exec();
    return { message: 'Event deleted successfully.' };
  }

  async rsvp(id: string, user: UserDocument): Promise<Event> {
    const event = await this.findOne(id);
    const userProfileId = user.profile.toString();

    const isOrganizer = event.organizer.toString() === userProfileId;
    const isAttending = event.attendees.some(
      (attendee) => attendee.toString() === userProfileId,
    );

    if (isOrganizer || isAttending) {
      throw new BadRequestException('You are already attending this event.');
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        id,
        { $push: { attendees: user.profile } },
        { new: true },
      )
      .populate('organizer attendees');

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID "${id}" not found.`);
    }

    return updatedEvent;
  }

  async unRsvp(id: string, user: UserDocument): Promise<Event> {
    const event = await this.findOne(id);
    const userProfileId = user.profile.toString();

    if (event.organizer.toString() === userProfileId) {
      throw new BadRequestException('The organizer cannot leave the event.');
    }

    const attendeeIndex = event.attendees.findIndex(
      (attendee) => attendee.toString() === userProfileId,
    );

    if (attendeeIndex === -1) {
      throw new BadRequestException('You are not attending this event.');
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        id,
        { $pull: { attendees: user.profile } },
        { new: true },
      )
      .populate('organizer attendees');

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID "${id}" not found.`);
    }

    return updatedEvent;
  }

  async findByParticipant(profileId: string): Promise<Event[]> {
    return this.eventModel
      .find({
        $or: [{ organizer: profileId }, { attendees: profileId }],
      })
      .populate('organizer', 'displayName username avatarUrl')
      .sort({ date: 1 })
      .exec();
  }

  async getUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 600,
    });
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    return { uploadUrl, publicUrl };
  }
}
