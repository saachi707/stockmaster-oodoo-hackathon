import sql from "@/app/api/utils/sql";

// List all products with stock information
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const lowStock = searchParams.get("lowStock") === "true";

    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.sku, 
        p.unit_of_measure,
        p.min_stock_level,
        p.description,
        p.created_at,
        c.name as category_name,
        COALESCE(SUM(sl.quantity), 0) as total_stock,
        COALESCE(SUM(sl.reserved_quantity), 0) as reserved_stock,
        (COALESCE(SUM(sl.quantity), 0) <= p.min_stock_level) as is_low_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock_levels sl ON p.id = sl.product_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND c.name = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (LOWER(p.name) LIKE $${paramCount} OR LOWER(p.sku) LIKE $${paramCount})`;
      params.push(`%${search.toLowerCase()}%`);
    }

    query += `
      GROUP BY p.id, p.name, p.sku, p.unit_of_measure, p.min_stock_level, p.description, p.created_at, c.name
    `;

    if (lowStock) {
      query += ` HAVING COALESCE(SUM(sl.quantity), 0) <= p.min_stock_level`;
    }

    query += ` ORDER BY p.created_at DESC`;

    const products = await sql(query, params);

    return Response.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// Create new product
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, sku, categoryId, unitOfMeasure, minStockLevel, description } =
      body;

    if (!name || !sku || !unitOfMeasure) {
      return Response.json(
        { error: "Name, SKU, and unit of measure are required" },
        { status: 400 },
      );
    }

    const newProduct = await sql`
      INSERT INTO products (name, sku, category_id, unit_of_measure, min_stock_level, description)
      VALUES (${name}, ${sku}, ${categoryId || null}, ${unitOfMeasure}, ${minStockLevel || 0}, ${description || null})
      RETURNING *
    `;

    return Response.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);

    // Handle unique constraint violation
    if (error.code === "23505" && error.constraint === "products_sku_key") {
      return Response.json(
        { error: "SKU already exists. Please use a unique SKU." },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
