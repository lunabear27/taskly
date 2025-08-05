import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export const RealtimeTest: React.FC = () => {
  const [realtimeStatus, setRealtimeStatus] = useState<string>("Not connected");
  const [lastUpdate, setLastUpdate] = useState<string>("No updates yet");
  const [testCardId, setTestCardId] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<string>("");

  useEffect(() => {
    // Test realtime connection
    const testChannel = supabase
      .channel("realtime-test")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cards",
        },
        (payload) => {
          console.log("🔄 Realtime test received:", payload);
          setLastUpdate(
            `Card ${payload.eventType}: ${payload.new?.id || payload.old?.id}`
          );
        }
      )
      .subscribe((status) => {
        console.log("🔄 Realtime test subscription status:", status);
        setRealtimeStatus(status);

        // Add more detailed connection info
        if (status === "SUBSCRIBED") {
          setConnectionDetails("✅ Successfully connected to realtime");
        } else if (status === "TIMED_OUT") {
          setConnectionDetails("❌ Connection timed out");
        } else if (status === "CLOSED") {
          setConnectionDetails("❌ Connection closed");
        } else if (status === "CHANNEL_ERROR") {
          setConnectionDetails("❌ Channel error occurred");
        } else {
          setConnectionDetails(`⏳ Status: ${status}`);
        }
      });

    // Also test a simple presence channel to verify connection
    const presenceChannel = supabase
      .channel("test-presence")
      .on("presence", { event: "sync" }, () => {
        console.log("🔄 Presence sync working");
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("🔄 Presence join:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("🔄 Presence leave:", key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log("🔄 Presence channel status:", status);
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: "test-user",
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(testChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, []);

  const createTestCard = async () => {
    try {
      // First, get a real list ID from the current board
      const { data: lists, error: listsError } = await supabase
        .from("lists")
        .select("id")
        .limit(1);

      if (listsError || !lists || lists.length === 0) {
        console.error("No lists found for test card creation");
        return;
      }

      const listId = lists[0].id;

      const { data: card, error } = await supabase
        .from("cards")
        .insert({
          title: `Test Card ${Date.now()}`,
          list_id: listId,
          position: 0,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating test card:", error);
      } else {
        setTestCardId(card.id);
        console.log("✅ Test card created:", card);
      }
    } catch (error) {
      console.error("Error creating test card:", error);
    }
  };

  const updateTestCard = async () => {
    if (!testCardId) return;

    try {
      const { error } = await supabase
        .from("cards")
        .update({
          title: `Updated Test Card ${Date.now()}`,
        })
        .eq("id", testCardId);

      if (error) {
        console.error("Error updating test card:", error);
      } else {
        console.log("✅ Test card updated");
      }
    } catch (error) {
      console.error("Error updating test card:", error);
    }
  };

  const deleteTestCard = async () => {
    if (!testCardId) return;

    try {
      const { error } = await supabase
        .from("cards")
        .delete()
        .eq("id", testCardId);

      if (error) {
        console.error("Error deleting test card:", error);
      } else {
        setTestCardId(null);
        console.log("✅ Test card deleted");
      }
    } catch (error) {
      console.error("Error deleting test card:", error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Realtime Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Connection Status:</p>
          <p
            className={`text-sm ${
              realtimeStatus === "SUBSCRIBED"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {realtimeStatus}
          </p>
          <p className="text-xs text-gray-500 mt-1">{connectionDetails}</p>
        </div>

        <div>
          <p className="text-sm font-medium">Last Update:</p>
          <p className="text-sm text-gray-600">{lastUpdate}</p>
        </div>

        <div className="space-y-2">
          <Button onClick={createTestCard} className="w-full">
            Create Test Card
          </Button>
          <Button
            onClick={updateTestCard}
            disabled={!testCardId}
            className="w-full"
          >
            Update Test Card
          </Button>
          <Button
            onClick={deleteTestCard}
            disabled={!testCardId}
            variant="destructive"
            className="w-full"
          >
            Delete Test Card
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
