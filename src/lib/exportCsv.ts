import { api } from './api.ts';
import { Todo, User, AnalyticsData, ProductivityGraphData } from '../types.ts';

/**
 * Escapes a single cell value for CSV format (RFC 4180 compliant)
 */
function escapeCsv(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  // If contains quotes, commas, newlines, or carriage returns, wrap in quotes and escape quotes with ""
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Downloads a text string as a file using a temporary anchor element
 */
function triggerDownload(content: string, filename: string) {
  // Add UTF-8 BOM so Excel and Google Sheets render characters correctly
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ExportResult {
  taskCount: number;
  filename: string;
}

/**
 * Exports all historical task and productivity data to a well-structured CSV file
 */
export async function exportProductivityHistoryToCsv(user: User): Promise<ExportResult> {
  // 1. Fetch all historical todos and analytics
  const [todos, analytics, graphData] = await Promise.all([
    api.getTodos('all'),
    api.getAnalytics().catch(() => null as AnalyticsData | null),
    api.getProductivityGraph().catch(() => null as ProductivityGraphData | null),
  ]);

  const exportDate = new Date().toISOString().slice(0, 10);
  const sanitizedUserName = user.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const filename = `productivity_history_${sanitizedUserName}_${exportDate}.csv`;

  const lines: string[] = [];

  // ==========================================
  // METADATA & HEADER
  // ==========================================
  lines.push('PRODUCTIVITY PLATFORM - HISTORICAL DATA EXPORT');
  lines.push(`Generated On,${escapeCsv(new Date().toISOString())}`);
  lines.push(`User Name,${escapeCsv(user.name)}`);
  lines.push(`User Email,${escapeCsv(user.email)}`);
  lines.push(`Timezone,${escapeCsv(user.timezone || 'UTC')}`);
  lines.push(`Total Historical Tasks,${todos.length}`);
  lines.push(''); // Blank line

  // ==========================================
  // SECTION 1: ALL HISTORICAL TASKS
  // ==========================================
  lines.push('--- HISTORICAL TASK RECORDS ---');
  const taskHeaders = [
    'Task ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Category',
    'Due Date',
    'Due Time',
    'Completed Timestamp',
    'Reminder Minutes Before',
    'Reminder Sent',
    'Completion Email Sent',
    'Missed Task Email Sent',
    'Created Timestamp',
    'Last Updated Timestamp',
  ];
  lines.push(taskHeaders.map(escapeCsv).join(','));

  todos.forEach((t: Todo) => {
    const row = [
      t.id,
      t.title,
      t.description || '',
      t.completed ? 'Completed' : 'Pending',
      t.priority.toUpperCase(),
      t.category || 'General',
      t.dueDate || '',
      t.dueTime || '',
      t.completedAt || '',
      t.reminderMinutesBefore ? `${t.reminderMinutesBefore}m` : 'None',
      t.reminderSent ? 'Yes' : 'No',
      t.completionEmailSent ? 'Yes' : 'No',
      t.missedTaskEmailSent ? 'Yes' : 'No',
      t.createdAt || '',
      t.updatedAt || '',
    ];
    lines.push(row.map(escapeCsv).join(','));
  });

  lines.push(''); // Blank line

  // ==========================================
  // SECTION 2: PRODUCTIVITY & STREAK SUMMARY
  // ==========================================
  lines.push('--- LIFETIME PRODUCTIVITY METRICS & STREAKS ---');
  lines.push(['Productivity Metric', 'Value'].map(escapeCsv).join(','));

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.length - completedCount;
  const completionRate =
    todos.length > 0 ? ((completedCount / todos.length) * 100).toFixed(1) + '%' : '0%';

  lines.push(['Total Tasks Created', todos.length].map(escapeCsv).join(','));
  lines.push(['Total Tasks Completed', completedCount].map(escapeCsv).join(','));
  lines.push(['Tasks Currently Pending', pendingCount].map(escapeCsv).join(','));
  lines.push(['Overall Completion Rate', completionRate].map(escapeCsv).join(','));

  if (analytics) {
    lines.push(['Current Active Streak', `${analytics.currentStreak} Days`].map(escapeCsv).join(','));
    lines.push(['Best Historical Streak', `${analytics.bestStreak} Days`].map(escapeCsv).join(','));
    lines.push(['Most Productive Day', analytics.mostProductiveDay].map(escapeCsv).join(','));
  }

  lines.push(''); // Blank line

  // ==========================================
  // SECTION 3: 7-DAY PRODUCTIVITY VELOCITY
  // ==========================================
  if (graphData && graphData.days && graphData.days.length > 0) {
    lines.push('--- RECENT 7-DAY PRODUCTIVITY VELOCITY ---');
    const velocityHeaders = [
      'Date',
      'Day of Week',
      'Total Planned Tasks',
      'Completed Tasks',
      'Completion Rate (%)',
    ];
    lines.push(velocityHeaders.map(escapeCsv).join(','));

    graphData.days.forEach((day) => {
      const row = [
        day.date,
        day.dayOfWeek,
        day.totalTasks,
        day.completedTasks,
        `${day.completionPercentage}%`,
      ];
      lines.push(row.map(escapeCsv).join(','));
    });
    lines.push('');
  }

  // ==========================================
  // SECTION 4: CATEGORY DISTRIBUTION
  // ==========================================
  if (analytics && analytics.categoryStats) {
    lines.push('--- CATEGORY BREAKDOWN ---');
    lines.push(['Category', 'Total Tasks', 'Completed Tasks', 'Completion Rate'].map(escapeCsv).join(','));
    Object.entries(analytics.categoryStats).forEach(([cat, stat]: [string, any]) => {
      const catRate = stat.total > 0 ? ((stat.completed / stat.total) * 100).toFixed(1) + '%' : '0%';
      lines.push([cat, stat.total, stat.completed, catRate].map(escapeCsv).join(','));
    });
  }

  const csvContent = lines.join('\r\n');
  triggerDownload(csvContent, filename);

  return {
    taskCount: todos.length,
    filename,
  };
}
