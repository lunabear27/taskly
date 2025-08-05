// Debug script to test boards API
// Run this in your browser console to test the boards endpoint

async function debugBoards() {
  console.log("🔍 Debugging boards API...");

  try {
    // Test 1: Check if we can fetch boards
    console.log("📋 Testing boards fetch...");
    const response = await fetch(
      "https://wjcvlsmychghsfcurghz.supabase.co/rest/v1/boards?select=*&order=created_at.desc",
      {
        headers: {
          apikey: "YOUR_SUPABASE_ANON_KEY", // Replace with your actual key
          Authorization: "Bearer YOUR_SUPABASE_ANON_KEY", // Replace with your actual key
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📊 Response status:", response.status);
    console.log("📊 Response headers:", response.headers);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Boards data:", data);
      console.log("📊 Number of boards:", data.length);
    } else {
      const errorText = await response.text();
      console.error("❌ Error response:", errorText);
    }
  } catch (error) {
    console.error("❌ Fetch error:", error);
  }
}

// Test 2: Check authentication
async function debugAuth() {
  console.log("🔐 Debugging authentication...");

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    console.log("👤 Current user:", user);
    console.log("❌ Auth error:", error);
  } catch (error) {
    console.error("❌ Auth error:", error);
  }
}

// Test 3: Check RLS policies
async function debugRLS() {
  console.log("🔒 Debugging RLS policies...");

  try {
    const { data, error } = await supabase.from("boards").select("*").limit(1);

    console.log("📋 RLS test result:", { data, error });
  } catch (error) {
    console.error("❌ RLS test error:", error);
  }
}

// Run all debug tests
console.log("🚀 Starting debug tests...");
debugAuth();
debugRLS();
debugBoards();
