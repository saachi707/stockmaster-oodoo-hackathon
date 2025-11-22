import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    // Get dashboard KPI stats in one transaction
    const [
      totalProductsResult,
      lowStockResult,
      pendingReceiptsResult,
      pendingDeliveriesResult,
    ] = await sql.transaction([
      // Total unique products in stock across all locations
      sql`
        SELECT COUNT(DISTINCT p.id) as total_products
        FROM products p
        INNER JOIN stock_levels sl ON p.id = sl.product_id
        WHERE sl.quantity > 0
      `,

      // Low stock / out of stock items
      sql`
        SELECT COUNT(*) as low_stock_count
        FROM (
          SELECT p.id, p.min_stock_level, COALESCE(SUM(sl.quantity), 0) as total_stock
          FROM products p
          LEFT JOIN stock_levels sl ON p.id = sl.product_id
          GROUP BY p.id, p.min_stock_level
          HAVING COALESCE(SUM(sl.quantity), 0) <= p.min_stock_level
        ) as low_stock_products
      `,

      // Pending receipts
      sql`
        SELECT COUNT(*) as pending_receipts
        FROM receipts
        WHERE status IN ('draft', 'waiting')
      `,

      // Pending deliveries
      sql`
        SELECT COUNT(*) as pending_deliveries
        FROM delivery_orders
        WHERE status IN ('draft', 'picking', 'packing', 'ready')
      `,
    ]);

    const stats = {
      totalProducts: parseInt(totalProductsResult[0].total_products) || 0,
      lowStockItems: parseInt(lowStockResult[0].low_stock_count) || 0,
      pendingReceipts: parseInt(pendingReceiptsResult[0].pending_receipts) || 0,
      pendingDeliveries:
        parseInt(pendingDeliveriesResult[0].pending_deliveries) || 0,
    };

    return Response.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return Response.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 },
    );
  }
}
