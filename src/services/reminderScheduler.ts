import { EmailReminderService } from '../services/emailReminders';

export class ReminderScheduler {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning = false;

  // Start the reminder scheduler
  static start(): void {
    if (this.isRunning) {
      console.log('Reminder scheduler is already running');
      return;
    }

    console.log('Starting email reminder scheduler...');
    this.isRunning = true;

    // Check for reminders every hour
    this.intervalId = setInterval(async () => {
      try {
        await EmailReminderService.checkAndSendReminders();
      } catch (error) {
        console.error('Error in reminder scheduler:', error);
      }
    }, 60 * 60 * 1000); // 1 hour

    // Also run immediately on start
    EmailReminderService.checkAndSendReminders().catch(error => {
      console.error('Error in initial reminder check:', error);
    });
  }

  // Stop the reminder scheduler
  static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('Email reminder scheduler stopped');
    }
  }

  // Check if scheduler is running
  static isActive(): boolean {
    return this.isRunning;
  }

  // Manual trigger for testing
  static async triggerCheck(): Promise<void> {
    console.log('Manually triggering reminder check...');
    await EmailReminderService.checkAndSendReminders();
  }

  // Get upcoming reminders for admin dashboard
  static async getUpcomingReminders() {
    return EmailReminderService.getUpcomingReminders();
  }
}

// Auto-start scheduler when module loads (in browser environment)
if (typeof window !== 'undefined') {
  // Only start if we're in a browser environment
  ReminderScheduler.start();
}
