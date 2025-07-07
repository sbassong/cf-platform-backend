import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ProfileDocument } from '../../profile/schemas/profile.schema';

export type EventDocument = Event & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Event {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Profile', required: true })
  organizer: ProfileDocument;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Profile' }],
    default: [],
  })
  attendees: ProfileDocument[];

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  location: string;

  @Prop()
  imageUrl?: string;

  @Virtual({
    get: function () {
      return this.attendees?.length;
    },
  })
  attendeeCount: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);
