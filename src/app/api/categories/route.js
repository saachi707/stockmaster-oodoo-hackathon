import sql from "@/app/api/utils/sql";

// Get all categories
export async function GET() {
  try {
    const categories = await sql`
      SELECT id, name, description, created_at
      FROM categories
      ORDER BY name
    `;

    return Response.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// Create new category
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return Response.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    const newCategory = await sql`
      INSERT INTO categories (name, description)
      VALUES (${name}, ${description || null})
      RETURNING *
    `;

    return Response.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);

    if (error.code === "23505") {
      return Response.json(
        { error: "Category name already exists" },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
