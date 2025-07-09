import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './group.service';
import { GroupsController } from './group.controller';
import { Group, GroupSchema } from './schemas/group.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    AuthModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupModule {}
