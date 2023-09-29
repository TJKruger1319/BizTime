const express = require("express");
const db = require("../db");
const router = express.Router();
const ExpressError = require('../expressError');

router.get("/", async function (req, res, next) {
    try {
      const results = await db.query(
            `SELECT code, name
             FROM companies
             ORDER BY name
             `);
  
      return res.json(results.rows);
    }
  
    catch (err) {
      return next(err);
    }
  });

  router.get("/:code",
      async function (req, res, next) {
  try {
    const code = req.query.code;

    const results = await db.query(
      `SELECT id, name, type 
       FROM companies
       WHERE code=$1`, [code]);

    return res.json(results.rows);
  }

  catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(
      'INSERT INTO users (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
    return res.status(201).json({"company": result.rows[0]})
  } catch (e) {
    return next(e)
  }
})

router.patch('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies
      SET name=$1, description=$2
      WHERE code=$3
      RETURNING code, name, description`, [code, name, description])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't find company with code of ${code}`, 404)
      }
      return res.send({ user: results.rows[0] })
  } catch (e) {
    return next(e)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
    return res.send({ status: "deleted" })
  } catch (e) {
    return next(e)
  }
})

module.exports = router;