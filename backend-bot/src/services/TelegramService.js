class TelegramService {
  static async getInviteLink(groupId, bot) {
    try {
      const link = await bot.telegram.createChatInviteLink(groupId, {
        member_limit: 1, // one-time use
        expire_date: Math.floor(Date.now() / 1000) + 86400 // expire in 24h
      });
      return link.invite_link;
    } catch (error) {
      console.error('Error creating invite link. Verify VIP_GROUP_ID:', error.description);
      return 'https://t.me/'; // Needs to be a valid HTTP structure so Telegram API won't crash the inline button
    }
  }

  static async kickUser(groupId, userId, bot) {
    try {
      await bot.telegram.banChatMember(groupId, userId, 0); // Bans and kicks
      await bot.telegram.unbanChatMember(groupId, userId); // Unban immediately so they can rejoin if they pay again
      return true;
    } catch (error) {
      console.error('Error kicking user', error);
      return false;
    }
  }
}

module.exports = TelegramService;
