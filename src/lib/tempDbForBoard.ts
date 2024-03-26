import { JSONFilePreset } from "lowdb/node";
import { BoardData } from "~/components/Board";
import crypto from "crypto";

const mock: BoardData = {
  board: {
    id: crypto.randomUUID(),
    title: "Board 0",
  },
  columns: [],
  notes: [],
};

export const db = await JSONFilePreset("db.json", mock);
