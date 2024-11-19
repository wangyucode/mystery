import * as host from "./host.js";
import * as prompts from "./prompts.js";
import { Level } from "level";

const db = new Level("db", { valueEncoding: 'json' });
console.log(db.status);
await db.put("豪门疑云", {
    tokens: 0,
    user: 110,
    count: 1,
    rating: 510
});
const room = await db.get("豪门疑云");
console.log(room);
