import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const suppliers = await sql`
      SELECT * FROM suppliers 
      ORDER BY name ASC
    `;

    return Response.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return Response.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { name, contact_email, contact_phone, address } =
      await request.json();

    if (!name) {
      return Response.json(
        { error: "Supplier name is required" },
        { status: 400 },
      );
    }

    const supplier = await sql`
      INSERT INTO suppliers (name, contact_email, contact_phone, address)
      VALUES (${name}, ${contact_email}, ${contact_phone}, ${address})
      RETURNING *
    `;

    return Response.json(supplier[0], { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return Response.json(
      { error: "Failed to create supplier" },
      { status: 500 },
    );
  }
}
