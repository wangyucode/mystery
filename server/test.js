import * as host from "./host.js";
import * as prompts from "./prompts.js";
import { Level } from "level";

const db = new Level("db", { valueEncoding: 'json' });
console.log(db.status);
db.once("open", async () => { 
    await db.put("888", { count: 150 });
    const data = await db.get("888");
    console.log(data);
});

