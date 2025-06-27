import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../user/schemas/user.schema';
import { Profile } from '../profile/schemas/profile.schema';
import { Model } from 'mongoose';
import * as readline from 'readline';

/**
 * A standalone script to completely wipe the users and profiles collections
 * from the database. Includes a countdown and final confirmation to prevent
 * accidental execution.
 */
async function run() {
  console.warn(
    '⚠️ WARNING: This script will permanently delete all users and profiles.',
  );

  // 5-second countdown to give the user a chance to cancel
  for (let i = 5; i > 0; i--) {
    console.log(`Starting in ${i}... (Press CTRL+C to cancel)`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Final confirmation prompt
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise((resolve) => {
    rl.question(
      'Are you absolutely sure you want to continue? (yes/no): ',
      resolve,
    );
  });

  rl.close();

  if (answer !== 'yes') {
    console.log('Operation cancelled.');
    process.exit(0);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const profileModel = app.get<Model<Profile>>(getModelToken(Profile.name));

  console.log('🚀 Deleting all documents from the collections...');

  try {
    // Delete all documents from the 'profiles' collection first
    const profileDeletionResult = await profileModel.deleteMany({}).exec();
    console.log(
      `✅ Successfully deleted ${profileDeletionResult.deletedCount} profiles.`,
    );

    // Delete all documents from the 'users' collection
    const userDeletionResult = await userModel.deleteMany({}).exec();
    console.log(
      `✅ Successfully deleted ${userDeletionResult.deletedCount} users.`,
    );
  } catch (error) {
    console.error('❌ An error occurred while clearing the database:', error);
  } finally {
    await app.close();
    console.log('Disconnected from database. Script finished.');
    process.exit(0);
  }
}

run();
