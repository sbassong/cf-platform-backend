import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false }) // _id: false because this will be a sub-document
export class NotificationSettings {
  @Prop({ type: Boolean, default: true })
  newFollower: boolean;

  @Prop({ type: Boolean, default: true })
  newPostInGroup: boolean;

  @Prop({ type: Boolean, default: true })
  eventReminder: boolean;

  @Prop({ type: Boolean, default: true })
  directMessage: boolean;
}

export const NotificationSettingsSchema =
  SchemaFactory.createForClass(NotificationSettings);
