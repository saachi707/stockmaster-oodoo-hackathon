import sql from "@/app/api/utils/sql";

// Get all locations
export async function GET() {
  try {
    const locations = await sql`
      SELECT id, name, type, address, created_at
      FROM locations
      ORDER BY name
    `;

    return Response.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return Response.json(
      { error: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}

// Create new location
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, type, address } = body;

    if (!name) {
      return Response.json(
        { error: "Location name is required" },
        { status: 400 },
      );
    }

    const newLocation = await sql`
      INSERT INTO locations (name, type, address)
      VALUES (${name}, ${type || "warehouse"}, ${address || null})
      RETURNING *
    `;

    return Response.json(newLocation[0], { status: 201 });
  } catch (error) {
    console.error("Error creating location:", error);
    return Response.json(
      { error: "Failed to create location" },
      { status: 500 },
    );
  }
}
