# PRD: AI Food Recognition + Chat

> **Status:** Not Started
> **Priority:** Medium
> **Effort:** High (5-7 days)
> **Dependencies:** AI Vision API, LLM API, Camera Access

---

## Problem Statement

Food logging is the biggest friction point in nutrition tracking:

1. **Manual search is slow**: Finding the right food takes multiple searches
2. **Portion estimation is hard**: Users don't know weights/measurements
3. **Complex meals are tedious**: Logging each ingredient separately
4. **Users need guidance**: Questions about nutrition, substitutions, meal ideas

**Goal:** Enable instant food logging via photo and provide an AI nutritionist for personalized guidance.

---

## Goals

### Must Have

- [ ] Photo-based food recognition
- [ ] Automatic nutrition estimation
- [ ] Portion size estimation from photo
- [ ] AI chat for nutrition questions
- [ ] Manual override/correction of AI results

### Should Have

- [ ] Multiple food items in one photo
- [ ] Recipe/meal breakdown
- [ ] Confidence scores for estimates
- [ ] Learning from user corrections

### Nice to Have

- [ ] Real-time camera recognition (preview before capture)
- [ ] Voice input for chat
- [ ] Meal suggestions based on goals
- [ ] Restaurant menu recognition

### Non-Goals

- Training our own vision model
- Offline AI processing
- Calorie counting from video
- Medical/dietary advice (liability)

---

## User Stories

### As a user logging food

- I want to take a photo of my meal and have it logged automatically
- I want to adjust portions if the AI estimate is wrong
- I want to see confidence levels for AI estimates
- I want to log multiple items from one photo

### As a user seeking guidance

- I want to ask "Is this meal healthy for my goals?"
- I want to get meal suggestions based on my remaining macros
- I want to ask about food substitutions
- I want quick answers without leaving the app

---

## Technical Architecture

### Technology Stack

| Component | Technology | Reasoning |
|-----------|------------|-----------|
| Vision AI | OpenAI GPT-4 Vision or Google Gemini | Best accuracy, handles complex meals |
| Chat LLM | OpenAI GPT-4 or Claude | Natural conversation, nutrition knowledge |
| Image Processing | Sharp/Canvas | Resize before API call |
| Streaming | Server-Sent Events | Real-time chat responses |

### API Selection Comparison

| Feature | GPT-4 Vision | Gemini Pro Vision | Claude 3 |
|---------|--------------|-------------------|----------|
| Food accuracy | Excellent | Good | Good |
| Portion estimation | Good | Fair | Fair |
| Multi-item detection | Excellent | Good | Good |
| Cost per image | ~$0.01-0.03 | ~$0.001 | ~$0.01 |
| Speed | 2-5s | 1-3s | 2-4s |

**Recommendation:** Start with GPT-4 Vision for best accuracy, add Gemini as fallback for cost optimization.

### System Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │     │   Server     │     │   AI APIs    │
│   (React)    │────▶│   (Node)     │────▶│  (OpenAI)    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       │ 1. Capture photo   │                     │
       │───────────────────▶│                     │
       │                    │ 2. Send to Vision API
       │                    │────────────────────▶│
       │                    │                     │
       │                    │ 3. Food + nutrition │
       │                    │◀────────────────────│
       │ 4. Display results │                     │
       │◀───────────────────│                     │
       │                    │                     │
       │ 5. User confirms   │                     │
       │───────────────────▶│                     │
       │                    │ 6. Save to diary    │
```

### Database Schema

```prisma
model FoodRecognition {
  id              String   @id @default(cuid())
  userId          String
  imageUrl        String   // Stored image reference
  recognizedItems Json     // Array of detected foods
  confidence      Decimal  // Overall confidence 0-1
  wasEdited       Boolean  @default(false)
  corrections     Json?    // User corrections for learning
  createdAt       DateTime @default(now())

  user            BetterAuthUser @relation(fields: [userId], references: [id])

  @@map("food_recognition")
}

model ChatConversation {
  id        String   @id @default(cuid())
  userId    String
  title     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  messages  ChatMessage[]
  user      BetterAuthUser @relation(fields: [userId], references: [id])

  @@map("chat_conversation")
}

model ChatMessage {
  id             String   @id @default(cuid())
  conversationId String
  role           String   // "user" | "assistant"
  content        String
  imageUrl       String?  // If message includes image
  createdAt      DateTime @default(now())

  conversation   ChatConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@map("chat_message")
}
```

---

## Implementation Plan

### Phase 1: Food Recognition (Day 1-3)

#### 1.1 Image Capture

**File:** `src/components/ai/FoodCamera.tsx`

```typescript
interface FoodCameraProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}
```

- Camera access with framing guide
- Capture button with preview
- Retake option
- Gallery upload alternative

#### 1.2 Vision API Integration

**File:** `src/server/ai-recognition.ts`

```typescript
interface RecognizedFood {
  name: string;
  portion: string;           // "1 cup", "150g", "1 medium"
  confidence: number;        // 0-1
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  alternatives?: string[];   // Other possible matches
}

export async function recognizeFood(imageBase64: string): Promise<RecognizedFood[]>
```

**Prompt Engineering:**

```
Analyze this food image and identify each food item.
For each item, provide:
1. Food name (be specific, e.g., "grilled chicken breast" not just "chicken")
2. Estimated portion size with unit
3. Estimated nutrition per portion (calories, protein, carbs, fat)
4. Confidence level (0-1)

Return as JSON array. If unsure, provide alternatives.
```

#### 1.3 Results UI

**File:** `src/components/ai/FoodRecognitionResults.tsx`

- List of detected foods with edit capability
- Portion size adjustment
- Add to diary button
- "Not quite right?" correction flow

### Phase 2: AI Chat (Day 3-5)

#### 2.1 Chat Interface

**File:** `src/components/ai/NutritionChat.tsx`

```typescript
interface NutritionChatProps {
  initialMessage?: string;
  context?: {
    todaysMeals?: MealEntry[];
    goals?: UserGoals;
    preferences?: UserPreferences;
  };
}
```

- Chat message list
- Text input with send button
- Streaming response display
- Suggested quick questions

#### 2.2 Chat API with Streaming

**File:** `src/server/ai-chat.ts`

```typescript
export async function* streamChatResponse(
  messages: ChatMessage[],
  userContext: UserContext
): AsyncGenerator<string>
```

**System Prompt:**

```
You are a helpful nutrition assistant for HealthMetrics app.
You help users with:
- Understanding their nutrition and meals
- Suggesting healthier alternatives
- Answering questions about macros and calories
- Providing meal ideas based on their goals

User context:
- Daily calorie goal: {calorieGoal}
- Remaining today: {remaining}
- Goal: {goalType}
- Dietary preferences: {preferences}

Be concise, friendly, and practical.
Do not provide medical advice.
If asked about medical conditions, recommend consulting a doctor.
```

#### 2.3 Context-Aware Responses

Include in chat context:

- Today's logged meals and totals
- User's goals and preferences
- Remaining macros
- Recent food recognition results

### Phase 3: Integration (Day 5-6)

#### 3.1 Quick Actions

- "Scan Food" button on diary page
- "Ask AI" button in empty states
- Photo icon in food search

#### 3.2 Chat Entry Points

- Floating chat button (optional)
- "Ask about this meal" on food items
- "What should I eat?" on dashboard

### Phase 4: Polish & Learning (Day 6-7)

- User corrections saved for potential model improvement
- Feedback on AI accuracy
- Usage analytics
- Rate limiting and cost management

---

## UI/UX Design

### Food Camera Screen

```
┌─────────────────────────────────┐
│  ← Back                 🔄 Flip │
├─────────────────────────────────┤
│                                 │
│    ┌───────────────────────┐    │
│    │                       │    │
│    │                       │    │
│    │    [Camera Feed]      │    │
│    │                       │    │
│    │   ┌─────────────┐     │    │
│    │   │  Food Here  │     │    │
│    │   └─────────────┘     │    │
│    │                       │    │
│    └───────────────────────┘    │
│                                 │
│    Center your food in frame    │
│                                 │
├─────────────────────────────────┤
│                                 │
│  📷 Gallery        ○ Capture    │
│                                 │
└─────────────────────────────────┘
```

### Recognition Results

```
┌─────────────────────────────────┐
│  ← Back            Not right?   │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │      [Captured Image]       ││
│  └─────────────────────────────┘│
│                                 │
│  Found 3 items:                 │
│                                 │
│  ┌─────────────────────────────┐│
│  │ ✓ Grilled Chicken Breast   ││
│  │   150g • 248 cal • 46g P   ││
│  │   Confidence: 95%      [✎] ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ ✓ Brown Rice               ││
│  │   1 cup • 216 cal • 5g P   ││
│  │   Confidence: 88%      [✎] ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ ✓ Steamed Broccoli         ││
│  │   1 cup • 55 cal • 4g P    ││
│  │   Confidence: 92%      [✎] ││
│  └─────────────────────────────┘│
│                                 │
│  Total: 519 cal • 55g protein   │
│                                 │
│  ┌─────────────────────────────┐│
│  │     Add to Lunch            ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

### AI Chat

```
┌─────────────────────────────────┐
│  ← Nutrition Assistant    ⋯     │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🤖 Hi! I'm your nutrition  ││
│  │    assistant. How can I    ││
│  │    help you today?         ││
│  └─────────────────────────────┘│
│                                 │
│            ┌───────────────────┐│
│            │ What should I eat ││
│            │ for dinner? I have││
│            │ 600 calories left ││
│            └───────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🤖 Great question! With    ││
│  │    600 calories and your   ││
│  │    goal to build muscle,   ││
│  │    here are some ideas:    ││
│  │                            ││
│  │    • Salmon (200g) with    ││
│  │      roasted vegetables    ││
│  │      ~520 cal, 45g protein ││
│  │                            ││
│  │    • Chicken stir-fry      ││
│  │      with brown rice       ││
│  │      ~580 cal, 40g protein ││
│  └─────────────────────────────┘│
│                                 │
│  Quick questions:               │
│  ┌────────┐ ┌────────┐         │
│  │Healthy?│ │Suggest │         │
│  └────────┘ └────────┘         │
│                                 │
├─────────────────────────────────┤
│  [Type a message...]      [➤]  │
└─────────────────────────────────┘
```

---

## File Structure

```
src/
├── components/
│   └── ai/
│       ├── FoodCamera.tsx
│       ├── FoodRecognitionResults.tsx
│       ├── RecognizedFoodItem.tsx
│       ├── NutritionChat.tsx
│       ├── ChatMessage.tsx
│       ├── QuickQuestions.tsx
│       └── index.ts
├── server/
│   ├── ai-recognition.ts
│   └── ai-chat.ts
├── hooks/
│   ├── useFoodRecognition.ts
│   └── useNutritionChat.ts
├── types/
│   └── ai.ts
└── styles/
    └── components/
        └── ai.css
```

---

## Cost Management

### API Costs (Estimates)

| Action | GPT-4 Vision | Gemini Pro |
|--------|--------------|------------|
| Food recognition | ~$0.02/image | ~$0.001/image |
| Chat message | ~$0.01/msg | ~$0.0005/msg |

### Cost Controls

- Daily limit per user (e.g., 20 scans, 50 messages)
- Image compression before sending
- Caching common food recognitions
- Batch similar requests

### Rate Limiting

```typescript
const AI_LIMITS = {
  foodRecognition: {
    perDay: 20,
    perHour: 10,
  },
  chat: {
    messagesPerDay: 50,
    messagesPerHour: 20,
  },
};
```

---

## Error Handling

| Scenario | User Experience |
|----------|-----------------|
| Image too blurry | "Photo is unclear. Please retake with better lighting" |
| No food detected | "Couldn't identify food. Try a clearer photo or search manually" |
| API rate limited | "AI is busy. Please try again in a minute" |
| API error | "Something went wrong. Your photo was saved - try again later" |
| Low confidence | Show alternatives: "Did you mean...?" |

---

## Acceptance Criteria

### Food Recognition

- [ ] Camera opens and captures image
- [ ] Food identified within 5 seconds
- [ ] Nutrition estimates provided
- [ ] User can edit/correct results
- [ ] Results can be added to diary

### AI Chat

- [ ] Messages stream in real-time
- [ ] Context includes user's data
- [ ] Responses are relevant and helpful
- [ ] Conversation history preserved
- [ ] Quick questions work

### Performance

- [ ] Image processed in < 5 seconds
- [ ] Chat response starts in < 1 second
- [ ] Rate limits enforced
- [ ] Costs tracked per user

---

## Privacy & Safety

- Images processed but not stored long-term (unless user opts in)
- No personally identifiable information sent to AI
- Clear disclaimer: "AI estimates may not be accurate"
- Medical advice disclaimer in chat
- User can delete conversation history

---

## Future Enhancements

- **Offline mode**: On-device recognition for common foods
- **Learning**: Improve from user corrections
- **Restaurant menus**: OCR + nutrition lookup
- **Voice chat**: Hands-free interaction
- **Meal planning**: AI-generated weekly meal plans
- **Integration**: Connect to recipe databases

---

## References

- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [Google Gemini API](https://ai.google.dev/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
