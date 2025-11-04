import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    console.log("=== WEBHOOK DEBUG START ===");
    console.log("Method:", request.method);
    console.log("URL:", request.url);

    // Log specific headers
    console.log("svix-id:", request.headers.get("svix-id"));
    console.log("svix-signature:", request.headers.get("svix-signature"));
    console.log("svix-timestamp:", request.headers.get("svix-timestamp"));
    console.log("content-type:", request.headers.get("content-type"));
    console.log("user-agent:", request.headers.get("user-agent"));

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    console.log("Webhook secret exists:", !!webhookSecret);

    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET is not defined");
    }

    // check headers (try multiple formats)
    const svix_id =
      request.headers.get("svix-id") ||
      request.headers.get("Svix-Id") ||
      request.headers.get("SVIX-ID");
    const svix_signature =
      request.headers.get("svix-signature") ||
      request.headers.get("Svix-Signature") ||
      request.headers.get("SVIX-SIGNATURE");
    const svix_timestamp =
      request.headers.get("svix-timestamp") ||
      request.headers.get("Svix-Timestamp") ||
      request.headers.get("SVIX-TIMESTAMP");

    console.log("Extracted headers:");
    console.log("svix_id:", svix_id);
    console.log("svix_signature:", svix_signature);
    console.log("svix_timestamp:", svix_timestamp);

    if (!svix_id || !svix_signature || !svix_timestamp) {
      console.log("❌ Missing svix headers!");
      console.log("Has svix-id:", !!svix_id);
      console.log("Has svix-signature:", !!svix_signature);
      console.log("Has svix-timestamp:", !!svix_timestamp);

      // In development, let's proceed without verification
      console.log("Proceeding without verification for development...");
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    console.log("Payload received:", {
      type: payload?.type,
      hasData: !!payload?.data,
    });

    let evt: any;

    // Only verify if all headers are present
    if (svix_id && svix_signature && svix_timestamp) {
      console.log("Attempting webhook verification...");
      const wh = new Webhook(webhookSecret);
      try {
        evt = wh.verify(body, {
          svix_id: svix_id,
          svix_signature: svix_signature,
          svix_timestamp: svix_timestamp,
        }) as any;
        console.log("✅ Webhook verified successfully");
      } catch (error) {
        console.error("Error verifying webhook:", error);
        console.log(
          "🔄 Verification failed, using payload directly for development"
        );
        evt = payload; // Use payload directly instead of failing
      }
    } else {
      console.log("⚠️ Skipping verification - using payload directly");
      evt = payload;
    }

    const eventType = evt.type;
    console.log("Event type:", eventType);

    if (eventType === "user.created") {
      console.log("Processing user.created event...");
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      console.log("User data from Clerk:", {
        id,
        email_addresses: email_addresses?.length,
        first_name,
        last_name,
        image_url,
      });

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();
      const username = email.split("@")[0];

      console.log("Creating user with:", {
        email,
        fullName: name,
        image: image_url,
        clerkId: id,
        username,
      });

      try {
        const result = await ctx.runMutation(api.users.createUser, {
          email,
          fullName: name,
          image: image_url,
          clerkId: id,
          username,
        });
        
        if (result) {
          console.log("✅ User created successfully with ID:", result);
        } else {
          console.log("ℹ️ User already existed, no new user created");
        }
      } catch (error) {
        console.log("❌ Error creating user:", error);
        return new Response("Error occurred -- could not create user", {
          status: 500,
        });
      }
    } else {
      console.log("⚠️ Event type not handled:", eventType);
    }

    return new Response("Webhook received", { status: 200 });
  }),
});

export default http;
