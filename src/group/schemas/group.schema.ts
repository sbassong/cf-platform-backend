import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
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

  @Virtual({
    get: function () {
      return this.members?.length;
    },
  })
  memberCount: number;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
