import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface GroupData {
  groups: number[];
}

export class GroupTracker {
  private groupsFilePath: string;

  constructor() {
    this.groupsFilePath = join(process.cwd(), 'src', 'data', 'groups.json');
  }

  /**
   * Load group chat IDs from JSON file
   */
  loadGroups(): number[] {
    try {
      const fileContent = readFileSync(this.groupsFilePath, 'utf-8');
      const data: GroupData = JSON.parse(fileContent);
      return data.groups || [];
    } catch (error) {
      console.error('Error loading groups:', error);
      return [];
    }
  }

  /**
   * Save group chat IDs to JSON file
   */
  saveGroups(groups: number[]): void {
    try {
      const data: GroupData = { groups };
      writeFileSync(this.groupsFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving groups:', error);
    }
  }

  /**
   * Add a group chat ID if it doesn't already exist
   * Group chat IDs are negative numbers in Telegram
   */
  addGroup(chatId: number): void {
    // Only track group chats (negative IDs) and channels (also negative)
    if (chatId >= 0) {
      return; // Skip private chats
    }

    const groups = this.loadGroups();
    if (!groups.includes(chatId)) {
      groups.push(chatId);
      this.saveGroups(groups);
      console.log(`✅ Added new group/channel: ${chatId}`);
    }
  }

  /**
   * Get all tracked group chat IDs
   */
  getAllGroups(): number[] {
    return this.loadGroups();
  }

  /**
   * Check if a chat ID is a group or channel
   */
  isGroupOrChannel(chatId: number): boolean {
    return chatId < 0;
  }
}



