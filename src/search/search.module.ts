import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';

import { SearchService } from './search.service';
import { ProfileService } from 'src/profile/profile.service';
import { PostsService } from 'src/post/post.service';
import { GroupsService } from 'src/group/group.service';
import { EventsService } from 'src/event/event.service';

import { AuthModule } from '../auth/auth.module';

import { Post, PostSchema } from '../post/schemas/post.schema';
import { Group, GroupSchema } from '../group/schemas/group.schema';
import { Event, EventSchema } from '../event/schemas/event.schema';
import { Profile, ProfileSchema } from '../profile/schemas/profile.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Event.name, schema: EventSchema },
      { name: Profile.name, schema: ProfileSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [
    ProfileService,
    SearchService,
    PostsService,
    GroupsService,
    EventsService,
  ],
})
export class SearchModule {}
