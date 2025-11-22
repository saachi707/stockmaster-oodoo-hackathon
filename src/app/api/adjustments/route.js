import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const locationId = searchParams.get("location_id");

    let query = `
      SELECT a.*, 
             l.name as location_name,
             COUNT(ai.id) as item_count
      FROM inventory_adjustments a
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN adjustment_items ai ON a.id = ai.adjustment_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }

    if (locationId) {
      query += ` AND a.location_id = $${params.length + 1}`;
      params.push(parseInt(locationId));
    }

    query += ` GROUP BY a.id, l.name ORDER BY a.created_at DESC`;

    const adjustments = await sql(query, params);

    return Response.json(adjustments);
  } catch (error) {
    console.error("Error fetching adjustments:", error);
    return Response.json(
      { error: "Failed to fetch adjustments" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { location_id, reason, items, notes, created_by } =
      await request.json();

    if (!location_id) {
      return Response.json({ error: "Location is required" }, { status: 400 });
    }

    if (!reason) {
      return Response.json({ error: "Reason is required" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Items are required" }, { status: 400 });
    }

    const adjustmentNumber = `ADJ-${Date.now()}`;

    // Create adjustment and items in transaction
    const [adjustment] = await sql.transaction([
      sql`
        INSERT INTO inventory_adjustments (adjustment_number, location_id, reason, total_items, notes, created_by)
        VALUES (${adjustmentNumber}, ${location_id}, ${reason}, ${items.length}, ${notes}, ${created_by})
        RETURNING *
      `,
      ...items.map(
        (item) => sql`
        INSERT INTO adjustment_items (adjustment_id, product_id, recorded_quantity, counted_quantity, difference, notes)
        VALUES ((SELECT id FROM inventory_adjustments WHERE adjustment_number = ${adjustmentNumber}), 
                ${item.product_id}, ${item.recorded_quantity}, ${item.counted_quantity}, 
                ${item.counted_quantity - item.recorded_quantity}, ${item.notes})
      `,
      ),
    ]);

    return Response.json(adjustment[0], { status: 201 });
  } catch (error) {
    console.error("Error creating adjustment:", error);
    return Response.json(
      { error: "Failed to create adjustment" },
      { status: 500 },
    );
  }
}
