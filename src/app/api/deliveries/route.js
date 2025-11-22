import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = `
      SELECT d.*, 
             COUNT(di.id) as item_count
      FROM delivery_orders d
      LEFT JOIN delivery_items di ON d.id = di.delivery_order_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND d.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` GROUP BY d.id ORDER BY d.created_at DESC`;

    const deliveries = await sql(query, params);

    return Response.json(deliveries);
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    return Response.json(
      { error: "Failed to fetch delivery orders" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const {
      sales_order_id,
      customer_name,
      shipping_address,
      items,
      notes,
      created_by,
    } = await request.json();

    if (!customer_name) {
      return Response.json(
        { error: "Customer name is required" },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Items are required" }, { status: 400 });
    }

    const orderNumber = `DEL-${Date.now()}`;

    // Create delivery order and items in transaction
    const [delivery] = await sql.transaction([
      sql`
        INSERT INTO delivery_orders (order_number, sales_order_id, customer_name, shipping_address, total_items, notes, created_by)
        VALUES (${orderNumber}, ${sales_order_id}, ${customer_name}, ${shipping_address}, ${items.length}, ${notes}, ${created_by})
        RETURNING *
      `,
      ...items.map(
        (item) => sql`
        INSERT INTO delivery_items (delivery_order_id, product_id, location_id, quantity_requested)
        VALUES ((SELECT id FROM delivery_orders WHERE order_number = ${orderNumber}), ${item.product_id}, ${item.location_id}, ${item.quantity_requested})
      `,
      ),
    ]);

    return Response.json(delivery[0], { status: 201 });
  } catch (error) {
    console.error("Error creating delivery order:", error);
    return Response.json(
      { error: "Failed to create delivery order" },
      { status: 500 },
    );
  }
}
