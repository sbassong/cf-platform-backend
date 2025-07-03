import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ProfileDocument } from '../../profile/schemas/profile.schema';

export type GroupDocument = Group & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Group {
  save(): Group | PromiseLike<Group> {
    throw new Error('Method not implemented.');
  }
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Profile', required: true })
  owner: ProfileDocument;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Profile' }],
    default: [],
  })
  members: ProfileDocument[];

  @Prop()
  avatarUrl?: string;

  @Prop()
  bannerUrl?: string;

  // Virtual property to get the member count
  get memberCount(): number {
    // The owner is also a member
    return this.members.length + 1;
  }
}

export const GroupSchema = SchemaFactory.createForClass(Group);
