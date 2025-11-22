import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = `
      SELECT t.*, 
             fl.name as from_location_name,
             tl.name as to_location_name,
             COUNT(ti.id) as item_count
      FROM internal_transfers t
      LEFT JOIN locations fl ON t.from_location_id = fl.id
      LEFT JOIN locations tl ON t.to_location_id = tl.id
      LEFT JOIN transfer_items ti ON t.id = ti.transfer_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND t.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` GROUP BY t.id, fl.name, tl.name ORDER BY t.created_at DESC`;

    const transfers = await sql(query, params);

    return Response.json(transfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return Response.json(
      { error: "Failed to fetch transfers" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { from_location_id, to_location_id, items, notes, created_by } =
      await request.json();

    if (!from_location_id || !to_location_id) {
      return Response.json(
        { error: "From and to locations are required" },
        { status: 400 },
      );
    }

    if (from_location_id === to_location_id) {
      return Response.json(
        { error: "From and to locations cannot be the same" },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Items are required" }, { status: 400 });
    }

    const transferNumber = `TRF-${Date.now()}`;

    // Create transfer and items in transaction
    const [transfer] = await sql.transaction([
      sql`
        INSERT INTO internal_transfers (transfer_number, from_location_id, to_location_id, total_items, notes, created_by)
        VALUES (${transferNumber}, ${from_location_id}, ${to_location_id}, ${items.length}, ${notes}, ${created_by})
        RETURNING *
      `,
      ...items.map(
        (item) => sql`
        INSERT INTO transfer_items (transfer_id, product_id, quantity, notes)
        VALUES ((SELECT id FROM internal_transfers WHERE transfer_number = ${transferNumber}), ${item.product_id}, ${item.quantity}, ${item.notes})
      `,
      ),
    ]);

    return Response.json(transfer[0], { status: 201 });
  } catch (error) {
    console.error("Error creating transfer:", error);
    return Response.json(
      { error: "Failed to create transfer" },
      { status: 500 },
    );
  }
}
