import { Response } from 'express';
import { pool } from '../db/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const VALID_SLOTS = ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'];

function getSlotDisplayLabel(slot: string): string {
  switch (slot) {
    case 'morning_fasting': return 'Morning fasting';
    case 'after_breakfast': return 'After breakfast';
    case 'after_lunch': return 'After lunch';
    case 'after_dinner': return 'After dinner';
    default: return slot;
  }
}

export async function getReadings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const countRes = await pool.query('SELECT COUNT(*) FROM readings WHERE user_id = $1', [userId]);
    const total = parseInt(countRes.rows[0].count, 10);

    const result = await pool.query(
      'SELECT id, user_id, TO_CHAR(date, \'YYYY-MM-DD\') as date, slot, value, notes, created_at FROM readings WHERE user_id = $1 ORDER BY date DESC, created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );

    return res.json({
      readings: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    console.error('Get readings error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getReadingById(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const readingId = parseInt(req.params.id, 10);

    if (isNaN(readingId)) {
      return res.status(400).json({ error: 'Invalid reading ID.' });
    }

    const result = await pool.query(
      'SELECT id, user_id, TO_CHAR(date, \'YYYY-MM-DD\') as date, slot, value, notes, created_at FROM readings WHERE id = $1 AND user_id = $2',
      [readingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reading not found or unauthorized.' });
    }

    return res.json({ reading: result.rows[0] });
  } catch (err: any) {
    console.error('Get reading by ID error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function createReading(req: AuthRequest, res: Response) {
  const userId = req.user?.id!;
  const { date, slot, value, notes } = req.body;

  // 1. Empty value check
  if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return res.status(400).json({ error: 'Please enter a glucose value.' });
  }

  // 2. Reject decimal / non-integer values (Whole number check)
  const numValue = Number(value);
  if (isNaN(numValue) || !Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
    return res.status(400).json({ error: 'Value must be between 40 and 600 mg/dL.' });
  }

  // 3. Slot validation
  if (!VALID_SLOTS.includes(slot)) {
    return res.status(400).json({ error: 'Invalid reading slot.' });
  }

  // 4. Future date check
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  if (isNaN(inputDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format.' });
  }

  if (inputDate > today) {
    return res.status(400).json({ error: 'Date cannot be in the future.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Row-level locking to handle concurrent requests safely
    await client.query(
      'SELECT id FROM readings WHERE user_id = $1 AND date = $2 FOR UPDATE',
      [userId, date]
    );

    // Check max 4 readings per day
    const countRes = await client.query(
      'SELECT COUNT(*) FROM readings WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    const currentCount = parseInt(countRes.rows[0].count, 10);
    if (currentCount >= 4) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You can add only 4 readings per day.' });
    }

    // Check duplicate slot
    const slotRes = await client.query(
      'SELECT id FROM readings WHERE user_id = $1 AND date = $2 AND slot = $3',
      [userId, date, slot]
    );
    if (slotRes.rows.length > 0) {
      await client.query('ROLLBACK');
      const label = getSlotDisplayLabel(slot);
      const prefix = ['After breakfast', 'After lunch', 'After dinner'].includes(label) ? 'an' : 'a';
      return res.status(400).json({ error: `You already have ${prefix} ${label} reading for this date.` });
    }

    const insertRes = await client.query(
      'INSERT INTO readings (user_id, date, slot, value, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, TO_CHAR(date, \'YYYY-MM-DD\') as date, slot, value, notes, created_at',
      [userId, date, slot, numValue, notes || '']
    );

    await client.query('COMMIT');
    return res.status(201).json({ reading: insertRes.rows[0] });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Create reading error:', err);
    return res.status(500).json({ error: 'Internal server error during reading creation.' });
  } finally {
    client.release();
  }
}

export async function updateReading(req: AuthRequest, res: Response) {
  const userId = req.user?.id!;
  const readingId = parseInt(req.params.id, 10);
  const { date, slot, value, notes } = req.body;

  if (isNaN(readingId)) {
    return res.status(400).json({ error: 'Invalid reading ID.' });
  }

  if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return res.status(400).json({ error: 'Please enter a glucose value.' });
  }

  const numValue = Number(value);
  if (isNaN(numValue) || !Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
    return res.status(400).json({ error: 'Value must be between 40 and 600 mg/dL.' });
  }

  if (!VALID_SLOTS.includes(slot)) {
    return res.status(400).json({ error: 'Invalid reading slot.' });
  }

  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  if (isNaN(inputDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format.' });
  }

  if (inputDate > today) {
    return res.status(400).json({ error: 'Date cannot be in the future.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify ownership with row locking
    const ownerCheck = await client.query('SELECT * FROM readings WHERE id = $1 AND user_id = $2 FOR UPDATE', [readingId, userId]);
    if (ownerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reading not found or unauthorized.' });
    }

    // Check count excluding current reading
    const countRes = await client.query(
      'SELECT COUNT(*) FROM readings WHERE user_id = $1 AND date = $2 AND id != $3',
      [userId, date, readingId]
    );
    if (parseInt(countRes.rows[0].count, 10) >= 4) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You can add only 4 readings per day.' });
    }

    // Check duplicate slot excluding current reading
    const slotRes = await client.query(
      'SELECT id FROM readings WHERE user_id = $1 AND date = $2 AND slot = $3 AND id != $4',
      [userId, date, slot, readingId]
    );
    if (slotRes.rows.length > 0) {
      await client.query('ROLLBACK');
      const label = getSlotDisplayLabel(slot);
      const prefix = ['After breakfast', 'After lunch', 'After dinner'].includes(label) ? 'an' : 'a';
      return res.status(400).json({ error: `You already have ${prefix} ${label} reading for this date.` });
    }

    const updateRes = await client.query(
      'UPDATE readings SET date = $1, slot = $2, value = $3, notes = $4 WHERE id = $5 AND user_id = $6 RETURNING id, user_id, TO_CHAR(date, \'YYYY-MM-DD\') as date, slot, value, notes, created_at',
      [date, slot, numValue, notes || '', readingId, userId]
    );

    await client.query('COMMIT');
    return res.json({ reading: updateRes.rows[0] });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Update reading error:', err);
    return res.status(500).json({ error: 'Internal server error during reading update.' });
  } finally {
    client.release();
  }
}

export async function deleteReading(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id!;
    const readingId = parseInt(req.params.id, 10);

    if (isNaN(readingId)) {
      return res.status(400).json({ error: 'Invalid reading ID.' });
    }

    const result = await pool.query('DELETE FROM readings WHERE id = $1 AND user_id = $2 RETURNING id', [readingId, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reading not found or unauthorized.' });
    }

    return res.json({ message: 'Reading deleted successfully.' });
  } catch (err: any) {
    console.error('Delete reading error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
