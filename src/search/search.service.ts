import { Injectable } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { PostsService } from '../post/post.service';
import { GroupsService } from '../group/group.service';
import { EventsService } from '../event/event.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly profileService: ProfileService,
    private readonly postService: PostsService,
    private readonly groupService: GroupsService,
    private readonly eventService: EventsService,
  ) {}

  async searchAll(query: string, userId: string) {
    if (!query || query.trim().length < 2) {
      return { profiles: [], posts: [], groups: [], events: [] };
    }

    const [profiles, posts, groups, events] = await Promise.all([
      this.profileService.search(query, userId),
      this.postService.search(query),
      this.groupService.search(query),
      this.eventService.search(query),
    ]);

    return { profiles, posts, groups, events };
  }
}
