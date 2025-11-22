import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const isActive = searchParams.get("is_active");

    let query = `
      SELECT id, username, email, full_name, role, is_active, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      query += ` AND role = $${params.length + 1}`;
      params.push(role);
    }

    if (isActive !== null) {
      query += ` AND is_active = $${params.length + 1}`;
      params.push(isActive === "true");
    }

    query += ` ORDER BY created_at DESC`;

    const users = await sql(query, params);

    return Response.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { username, email, password, full_name, role } = await request.json();

    if (!username || !email || !password) {
      return Response.json(
        { error: "Username, email, and password are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE username = ${username} OR email = ${email}
    `;

    if (existingUser.length > 0) {
      return Response.json(
        { error: "User with this username or email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const passwordHash = await hash(password);

    const user = await sql`
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES (${username}, ${email}, ${passwordHash}, ${full_name}, ${role || "warehouse_staff"})
      RETURNING id, username, email, full_name, role, is_active, created_at
    `;

    return Response.json(user[0], { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
