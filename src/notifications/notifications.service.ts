import { Injectable } from '@nestjs/common';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class NotificationsService {
  private readonly expo = new Expo();

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    if (!Expo.isExpoPushToken(token)) return;
    const message: ExpoPushMessage = { to: token, title, body, data };
    await this.expo.sendPushNotificationsAsync([message]);
  }
}
