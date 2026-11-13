import { pool } from './db.js';
import bcrypt from 'bcrypt';

export async function seedDemoData() {
  try {
    const client = await pool.connect();
    try {
      // Check if demo user exists
      const userRes = await client.query('SELECT id FROM users WHERE email = $1', ['demo@sweety.app']);
      let userId: number;

      if (userRes.rows.length === 0) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const insertUser = await client.query(
          'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
          ['Jane Doe', 'demo@sweety.app', hashedPassword]
        );
        userId = insertUser.rows[0].id;
        console.log('Created demo user: demo@sweety.app / password123');
      } else {
        userId = userRes.rows[0].id;
      }

      // Check readings count
      const readingsRes = await client.query('SELECT COUNT(*) FROM readings WHERE user_id = $1', [userId]);
      const count = parseInt(readingsRes.rows[0].count, 10);

      if (count === 0) {
        const today = new Date();
        const slots = ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'] as const;
        
        // Seed past 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];

          const values = [
            Math.floor(Math.random() * (110 - 85 + 1)) + 85, // morning_fasting
            Math.floor(Math.random() * (160 - 120 + 1)) + 120, // after_breakfast
            Math.floor(Math.random() * (155 - 115 + 1)) + 115, // after_lunch
            Math.floor(Math.random() * (150 - 110 + 1)) + 110  // after_dinner
          ];

          for (let s = 0; s < slots.length; s++) {
            await client.query(
              `INSERT INTO readings (user_id, date, slot, value, notes) 
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (user_id, date, slot) DO NOTHING`,
              [userId, dateStr, slots[s], values[s], 'Sample reading']
            );
          }
        }
        console.log('Seeded sample glucose readings for demo user with exact slot keys.');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
}
