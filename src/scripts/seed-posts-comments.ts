import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as readline from 'readline';

// Import all necessary schemas and document types
import { User, UserDocument } from '../user/schemas/user.schema';
import { ProfileDocument } from '../profile/schemas/profile.schema';
import { Post, PostDocument } from '../post/schemas/post.schema';
import { Comment, CommentDocument } from '../comment/schemas/comment.schema';

async function run() {
  const emailToSeed = 'sampromoemail@gmail.com';
  console.log(`🌱 Attempting to seed data for user: ${emailToSeed}`);

  // ... (readline confirmation prompt remains the same)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise((resolve) => {
    rl.question(
      `Are you sure you want to add new posts and comments for this user? (yes/no): `,
      resolve,
    );
  });

  rl.close();

  if (answer !== 'yes') {
    console.log('Operation cancelled.');
    process.exit(0);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const postModel = app.get<Model<PostDocument>>(getModelToken(Post.name));
  const commentModel = app.get<Model<CommentDocument>>(
    getModelToken(Comment.name),
  );

  try {
    const user = await userModel
      .findOne({ email: emailToSeed })
      .populate('profile')
      .exec();

    if (!user || !user.profile) {
      console.error(
        `❌ Error: User with email "${emailToSeed}" or their associated profile was not found.`,
      );
      await app.close();
      process.exit(1);
    }

    // This is the corrected line:
    const userProfile = user.profile as unknown as ProfileDocument;

    console.log(
      `👤 Found user "${userProfile.displayName}" (@${userProfile.username})`,
    );

    const postsToCreate = [
      {
        content:
          "Just came back from a solo trip to Japan! The food was incredible, and the scenery was breathtaking. It's amazing the kind of adventures you can have when you're free to explore on your own schedule. #solotravel #childfree",
        imageUrl:
          'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=2070&auto=format&fit=crop',
      },
      {
        content:
          "Finally finished my latest project car, a restored '88 BMW E30. So much time and effort, but the feeling of that first drive is unbeatable. Weekends are for hobbies, not for carpools. 😉",
        imageUrl:
          'https://www.autotrainingcentre.com/wp-content/webp-express/webp-images/uploads/2014/02/Automotive-training.jpg.webp',
      },
      {
        content:
          "Spent the entire day reading a new fantasy series and didn't have to stop once. Pure bliss! What's everyone else reading?",
      },
    ];

    for (const postData of postsToCreate) {
      const newPost = await new postModel({
        ...postData,
        author: userProfile._id,
        likes: [],
        commentsCount: 0,
      }).save();

      console.log(`📝 Created post: "${newPost.content.substring(0, 30)}..."`);

      const comment = await new commentModel({
        post: newPost._id,
        author: userProfile._id,
        content: 'This looks amazing! So inspiring.',
        likes: [],
      }).save();

      newPost.commentsCount = 1;
      await newPost.save();

      console.log(`💬 Added a comment to the new post.`);
    }

    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ An error occurred during seeding:', error);
  } finally {
    await app.close();
    console.log('Disconnected from database. Script finished.');
    process.exit(0);
  }
}

run();
