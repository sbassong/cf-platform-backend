import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Profile, ProfileSchema } from './schemas/profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService, MongooseModule],
})
export class ProfileModule {}
