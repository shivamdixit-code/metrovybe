import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(
  process.cwd(),
  "app/signup/business/india-pincodes.json"
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") || "";
  const district = searchParams.get("district") || "";

  if (!fs.existsSync(DATA_PATH)) {
    return NextResponse.json(
      { error: "India location dataset not found." },
      { status: 500 }
    );
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

  if (!state) {
    return NextResponse.json({
      states: Object.keys(data).sort(),
    });
  }

  if (!data[state]) {
    return NextResponse.json({
      districts: [],
      locations: [],
    });
  }

  if (!district) {
    return NextResponse.json({
      districts: Object.keys(data[state]).sort(),
    });
  }

  const locations = data[state][district] || [];

  return NextResponse.json({
    locations,
  });
}
