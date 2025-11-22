import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const supplierId = searchParams.get("supplier_id");

    let query = `
      SELECT r.*, s.name as supplier_name,
             COUNT(ri.id) as item_count
      FROM receipts r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      LEFT JOIN receipt_items ri ON r.id = ri.receipt_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND r.status = $${params.length + 1}`;
      params.push(status);
    }

    if (supplierId) {
      query += ` AND r.supplier_id = $${params.length + 1}`;
      params.push(parseInt(supplierId));
    }

    query += ` GROUP BY r.id, s.name ORDER BY r.created_at DESC`;

    const receipts = await sql(query, params);

    return Response.json(receipts);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return Response.json(
      { error: "Failed to fetch receipts" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { supplier_id, items, notes, created_by } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Items are required" }, { status: 400 });
    }

    const receiptNumber = `RCP-${Date.now()}`;

    // Create receipt and items in transaction
    const [receipt] = await sql.transaction([
      sql`
        INSERT INTO receipts (receipt_number, supplier_id, total_items, notes, created_by)
        VALUES (${receiptNumber}, ${supplier_id}, ${items.length}, ${notes}, ${created_by})
        RETURNING *
      `,
      ...items.map(
        (item) => sql`
        INSERT INTO receipt_items (receipt_id, product_id, location_id, quantity_expected)
        VALUES ((SELECT id FROM receipts WHERE receipt_number = ${receiptNumber}), ${item.product_id}, ${item.location_id}, ${item.quantity_expected})
      `,
      ),
    ]);

    return Response.json(receipt[0], { status: 201 });
  } catch (error) {
    console.error("Error creating receipt:", error);
    return Response.json(
      { error: "Failed to create receipt" },
      { status: 500 },
    );
  }
}
