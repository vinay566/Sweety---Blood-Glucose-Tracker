import { Response } from 'express';
import { pool } from '../db/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function getDailyReport(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const result = await pool.query(
      'SELECT id, user_id, TO_CHAR(date, \'YYYY-MM-DD\') as date, slot, value, notes, created_at FROM readings WHERE user_id = $1 AND date = $2 ORDER BY created_at ASC',
      [userId, dateStr]
    );

    const readings = result.rows;
    const count = readings.length;

    if (count === 0) {
      return res.json({
        highest: null,
        lowest: null,
        average: null,
        count: 0,
        dateRange: dateStr,
        readings: []
      });
    }

    const values = readings.map((r: any) => r.value);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const sum = values.reduce((acc: number, val: number) => acc + val, 0);
    const average = parseFloat((sum / count).toFixed(1));

    return res.json({
      highest,
      lowest,
      average,
      count,
      dateRange: dateStr,
      readings
    });
  } catch (err: any) {
    console.error('Daily report error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getMtdReport(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const targetDate = new Date(dateStr);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = dateStr;

    const result = await pool.query(
      'SELECT id, user_id, TO_CHAR(date, \'YYYY-MM-DD\') as date, slot, value, notes, created_at FROM readings WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date ASC, created_at ASC',
      [userId, startDate, endDate]
    );

    const readings = result.rows;
    const count = readings.length;

    if (count === 0) {
      return res.json({
        highest: null,
        lowest: null,
        average: null,
        count: 0,
        dateRange: `${startDate} – ${endDate}`,
        readings: []
      });
    }

    const values = readings.map((r: any) => r.value);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const sum = values.reduce((acc: number, val: number) => acc + val, 0);
    const average = parseFloat((sum / count).toFixed(1));

    return res.json({
      highest,
      lowest,
      average,
      count,
      dateRange: `${startDate} – ${endDate}`,
      readings
    });
  } catch (err: any) {
    console.error('MTD report error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getMonthlyReport(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const targetDate = new Date(dateStr);
    
    const prevYear = targetDate.getMonth() === 0 ? targetDate.getFullYear() - 1 : targetDate.getFullYear();
    const prevMonth = targetDate.getMonth() === 0 ? 11 : targetDate.getMonth() - 1;

    const firstDayPrevMonth = new Date(prevYear, prevMonth, 1);
    const lastDayPrevMonth = new Date(prevYear, prevMonth + 1, 0);

    const startDate = firstDayPrevMonth.toISOString().split('T')[0];
    const endDate = lastDayPrevMonth.toISOString().split('T')[0];

    const result = await pool.query(
      'SELECT id, user_id, TO_CHAR(date, \'YYYY-MM-DD\') as date, slot, value, notes, created_at FROM readings WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date ASC, created_at ASC',
      [userId, startDate, endDate]
    );

    const readings = result.rows;
    const count = readings.length;

    if (count === 0) {
      return res.json({
        highest: null,
        lowest: null,
        average: null,
        count: 0,
        dateRange: `${startDate} – ${endDate}`,
        readings: []
      });
    }

    const values = readings.map((r: any) => r.value);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const sum = values.reduce((acc: number, val: number) => acc + val, 0);
    const average = parseFloat((sum / count).toFixed(1));

    return res.json({
      highest,
      lowest,
      average,
      count,
      dateRange: `${startDate} – ${endDate}`,
      readings
    });
  } catch (err: any) {
    console.error('Monthly report error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const result = await pool.query('SELECT value FROM readings WHERE user_id = $1', [userId]);
    const values = result.rows.map(r => r.value);
    const total = values.length;

    if (total === 0) {
      return res.json({ total: 0, highest: null, lowest: null, average: null });
    }

    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = parseFloat((sum / total).toFixed(1));

    return res.json({ total, highest, lowest, average });
  } catch (err: any) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
