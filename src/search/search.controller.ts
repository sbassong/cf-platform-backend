import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from './search.service';
import { GetUser } from '../auth/get-user-decorator';
import { UserDocument } from '../user/schemas/user.schema';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  search(@Query('q') query: string, @GetUser() user: UserDocument) {
    const userId = (user.profile as any)._id.toString();
    return this.searchService.searchAll(query, userId);
  }
}
