import { NextApiRequest, NextApiResponse } from "next";
import db from "../../db/index";
import NextCors from "nextjs-cors";

const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export default async function getData(req: NextApiRequest, res: NextApiResponse) {
  //CORS MIDDLEWARE
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200,
  });

  const content_key = req.headers["x-content-key"];
  if (!content_key) {
    return res.status(401).json({ error: "Content key not found or invalid content key" });
  }

  const query = `SELECT token from tokens WHERE token = '${content_key}'`;

  db.query(query)
    .then((dbRes) => {
      if (dbRes.rowCount < 1) return res.status(401).json({ message: "Content key not found or invalid content key" });

      const innerQuery = `SELECT * FROM data WHERE key = '${content_key}'`;

      db.query(innerQuery)
        .then((dbRes) => {
          const data = dbRes.rows[0].data;
          dbRes.rowCount > 0
            ? res.status(200).json({ data: isJson(data) ? JSON.parse(data) : data })
            : res.status(200).json({ data: "" });
        })
        .catch(() => {
          res.status(401).json({ error: "Content key not found or invalid content key" });
        });
    })
    .catch(() => {
      res.status(401).json({ error: "Content key not found" });
    });
}
