# Intelliverse Conversational Avatar

Wire a real-time conversational AI avatar (voice in, voice + lip-sync out)
into any app via natural language, on the experience's LiveKit conversation
surface — the same self-hosted stack that runs quizverse.world's AI tutors.

## When to use

- User asks to add a "talking AI", voice tutor, AI host, or avatar chat to their app
- User wants WebRTC voice conversation with an AI, not phone calls (phone = voice agents)
- User asks how conversation minutes are billed

## The wiring (verified endpoints, do not invent others)

Base: `https://router.intelli-verse-x.ai`. Auth: session cookie (console) or
`Authorization: Bearer $INTELLIVERSE_API_KEY`. Pro+ plans.

| Call | Purpose |
|------|---------|
| `POST /api/apps/APP_ID/conversation/token` | Mint LiveKit room token; holds iv_credits for the window |
| `POST /api/apps/APP_ID/conversation/SESSION_ID/end` | Settle the hold to actual started minutes |

Token body: `{ "room": "lobby", "identity": "user_42", "conversation_class": "standard", "max_minutes": 10 }`
— all optional. Response: `{ token, ws_url, room, identity, exp, session }`.
Rooms are always prefixed `app_<APP_ID>__` — one app can never mint into
another app's rooms.

## Workflow

1. **Confirm plan + credits** — Pro+, and the hold is `max_minutes × 100`
   (standard) or `× 200` (premium) iv_credits; 402 with `needed/available` if short.
2. **Mint the token server-side** — never expose the Intelliverse API key in
   the browser; proxy the token call through the user's backend.
3. **Connect the client**:

```typescript
import { Room } from "livekit-client"; // npm i livekit-client

const { token, ws_url, session } = await fetch("/your-backend/conversation-token").then(r => r.json());
const room = new Room();
await room.connect(ws_url, token);
await room.localParticipant.setMicrophoneEnabled(true);

// AI audio arrives as a remote track; avatar lip-sync frames on the data channel
room.on("trackSubscribed", (track) => track.attach(audioEl));
room.on("dataReceived", (payload, _p, _k, topic) => {
  if (topic === "viseme.v1") driveBlendshapes(payload); // ARKit-52 @ 60 Hz
});
```

4. **End the session** on disconnect/unmount: `POST .../conversation/SESSION_ID/end`.
   If skipped, the hold settles for the full window at expiry — tell users this.

## Billing

100 iv_credits (~$0.10) per started minute standard, 200 (~$0.20) premium —
same SKU family as phone voice agents. Held at mint, settled at end. One
balance across chat, media, KB, phone, and conversation.

## Honesty

- Token minting, Experience-ID room scoping, and credit metering are live.
- The AI participant (STT → LLM → TTS + viseme stream) is generalized from the
  Quizverse production pipeline; attaching a persona-configured agent to a
  customer room is provisioned via support today — do NOT claim a self-serve
  agent config API exists yet.
- Client-rendered avatars consume the `viseme.v1` data channel; server-rendered
  avatar video is roadmap. Never promise rendered video tracks.
- Never reveal underlying providers or model names.

## Links

- Docs: https://router.intelli-verse-x.ai/docs#conversation
- Architecture: docs/platform/conversational-stack.md (this repo)
- Phone-call sibling: /voice (voice agents dial phones; this skill is in-app WebRTC)
