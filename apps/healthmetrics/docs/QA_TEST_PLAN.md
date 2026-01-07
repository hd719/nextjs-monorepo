# Health Metrics App - QA Test Plan

Manual testing checklist for comprehensive app QA. Test each flow and mark bugs found.

---

## Test Environment Setup

Before testing, ensure:
- [ ] Database is running and migrated (`bunx prisma migrate dev`)
- [ ] App is running (`bun run dev`)
- [ ] Console is open for error monitoring
- [ ] Network tab open for API errors

**Test URLs:**
- Landing: `http://localhost:3003/`
- Login: `http://localhost:3003/auth/login`
- Signup: `http://localhost:3003/auth/signup`
- Dashboard: `http://localhost:3003/dashboard`

---

## 1. Landing Page

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 1.1 | Page loads | Navigate to `/` | Hero section displays with mockup animation | | |
| 1.2 | CTA buttons work | Click "Get Started" | Navigates to `/auth/signup` | | |
| 1.3 | Login link works | Click "Log In" | Navigates to `/auth/login` | | |
| 1.4 | Theme toggle | Click theme toggle | Switches between light/dark mode | | |
| 1.5 | Responsive layout | Resize to mobile (<768px) | Layout adapts, no overflow | | |
| 1.6 | Hero animation | Observe mockup | Smooth animation, no jank | | |

---

## 2. Authentication - Signup

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 2.1 | Page loads | Navigate to `/auth/signup` | Form displays with all fields | | |
| 2.2 | Empty submit | Click "Create Account" with empty fields | Validation errors shown | | |
| 2.3 | Invalid email | Enter "notanemail", submit | Email validation error | | |
| 2.4 | Password mismatch | Enter different passwords | "Passwords don't match" error | | |
| 2.5 | Short password | Enter password < 8 chars | Password length error | | |
| 2.6 | Valid signup | Enter valid name, email, password | Success, redirect to verify page | | |
| 2.7 | Duplicate email | Try signup with existing email | "Email already exists" error | | |
| 2.8 | Login link | Click "Already have account?" | Navigates to `/auth/login` | | |
| 2.9 | Loading state | Submit form | Button shows loading spinner | | |

---

## 3. Authentication - Login

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 3.1 | Page loads | Navigate to `/auth/login` | Form displays | | |
| 3.2 | Empty submit | Click "Log In" empty | Validation errors | | |
| 3.3 | Invalid credentials | Enter wrong password | "Invalid credentials" error | | |
| 3.4 | Unverified email | Login before verifying email | "Please verify email" error | | |
| 3.5 | Valid login (new user) | Login with verified new user | Redirect to `/onboarding` | | |
| 3.6 | Valid login (existing) | Login with completed onboarding | Redirect to `/dashboard` | | |
| 3.7 | Forgot password link | Click "Forgot password?" | Navigates to forgot password | | |
| 3.8 | Signup link | Click "Don't have account?" | Navigates to `/auth/signup` | | |
| 3.9 | Loading state | Submit form | Button shows loading spinner | | |

---

## 4. Authentication - Email Verification

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 4.1 | Verification email | Check console after signup | Verification URL printed | | |
| 4.2 | Valid token | Click verification link | Success message, can login | | |
| 4.3 | Invalid token | Visit with bad token | "Invalid or expired" error | | |
| 4.4 | Expired token | (If applicable) | Appropriate error message | | |

---

## 5. Authentication - Password Reset

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 5.1 | Forgot password page | Navigate to `/auth/forgot-password` | Form displays | | |
| 5.2 | Invalid email format | Enter invalid email | Validation error | | |
| 5.3 | Valid email | Enter registered email | Success message shown | | |
| 5.4 | Reset email | Check console | Reset URL printed | | |
| 5.5 | Reset page loads | Click reset link | Password form displays | | |
| 5.6 | Password mismatch | Enter different passwords | Validation error | | |
| 5.7 | Valid reset | Enter matching passwords | Success, can login with new password | | |
| 5.8 | Invalid/expired token | Visit with bad token | Error message | | |

---

## 6. Onboarding Flow

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 6.1 | Auto-redirect | Login as new user | Redirects to `/onboarding` | | |
| 6.2 | Step 1: Welcome | Select a goal (e.g., "Lose Weight") | Goal selected, Continue enabled | | |
| 6.3 | Step 1: Continue | Click Continue | Advances to Step 2 | | |
| 6.4 | Step 2: Units | Select Imperial/Metric | Units toggle works | | |
| 6.5 | Step 2: Height | Enter height | Field accepts input | | |
| 6.6 | Step 2: Weight | Enter weight | Field accepts input | | |
| 6.7 | Step 2: DOB | Open calendar, select date | Calendar works, date selected | | |
| 6.8 | Step 2: Gender | Select gender | Radio selection works | | |
| 6.9 | Step 2: Activity | Select activity level | Selection works | | |
| 6.10 | Step 2: Back | Click Back | Returns to Step 1 | | |
| 6.11 | Step 2: Continue | Click Continue | Advances to Step 3 | | |
| 6.12 | Step 3: Goals | Calculated goals display | Calories/macros shown | | |
| 6.13 | Step 3: Edit goals | Modify macro values | Values update | | |
| 6.14 | Step 4: Water | Adjust water slider | Slider works, value updates | | |
| 6.15 | Step 4: Steps | Enter step goal | Field accepts input | | |
| 6.16 | Step 4: Presets | Click step preset buttons | Value updates | | |
| 6.17 | Step 4: Timezone | Check timezone dropdown | Browser timezone detected | | |
| 6.18 | Step 5: Complete | View completion screen | Actions displayed | | |
| 6.19 | Skip onboarding | Click "Skip for now" | Redirects to dashboard | | |
| 6.20 | Resume onboarding | Refresh mid-flow | Resumes at correct step | | |
| 6.21 | Complete flow | Click "Go to Dashboard" | Redirects to dashboard | | |
| 6.22 | Step counter | Check header | "Step X of 4" displays correctly | | |

---

## 7. Dashboard

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 7.1 | Page loads | Navigate to `/dashboard` | All components render | | |
| 7.2 | Auth guard | Visit logged out | Redirects to `/` | | |
| 7.3 | Daily summary | Check nutrition card | Shows calories/macros for today | | |
| 7.4 | Date display | Check date in header | Shows current date | | |
| 7.5 | Exercise summary | Check exercise card | Shows today's exercise or empty state | | |
| 7.6 | Water tracker | Check water card | Shows glasses/goal | | |
| 7.7 | Add water | Click + on water | Count increments, toast shows | | |
| 7.8 | Remove water | Click - on water | Count decrements | | |
| 7.9 | Quick actions | Check quick actions | All 4 actions display | | |
| 7.10 | Quick action: Diary | Click food action | Navigates to `/diary` | | |
| 7.11 | Quick action: Exercise | Click exercise action | Navigates to `/exercise` | | |
| 7.12 | Quick action: Weight | Click weight action | Opens weight entry (if implemented) | | |
| 7.13 | Quick action: Progress | Click progress action | Navigates to `/progress` | | |
| 7.14 | Today's diary | Check meals section | Shows today's meals or empty state | | |
| 7.15 | Recent activity | Check activity feed | Shows recent logs | | |
| 7.16 | Profile completion | If incomplete profile | Shows completion card | | |
| 7.17 | Profile completion click | Click completion card | Navigates to `/profile` | | |
| 7.18 | Steps/weight section | Check progress section | Shows current data | | |
| 7.19 | Loading states | Refresh page | Skeletons show during load | | |
| 7.20 | Dev tools (dev only) | Check for gear icon | DevTools visible if `VITE_SHOW_DEV_TOOLS=true` | | |

---

## 8. Diary

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 8.1 | Page loads | Navigate to `/diary` | Page displays for today | | |
| 8.2 | Auth guard | Visit logged out | Redirects to `/` | | |
| 8.3 | Date navigation | Click date picker | Calendar opens | | |
| 8.4 | Change date | Select different date | Diary updates for that date | | |
| 8.5 | Nutrition summary | Check totals | Shows consumed vs goal | | |
| 8.6 | Empty state | View date with no entries | Empty state with CTA | | |
| 8.7 | Add food button | Click "Add Food" | Dialog opens | | |
| 8.8 | Food search | Type food name | Search results appear | | |
| 8.9 | Select food | Click search result | Food selected | | |
| 8.10 | Set quantity | Adjust serving size | Nutrients recalculate | | |
| 8.11 | Select meal type | Choose meal (breakfast, etc.) | Meal type selected | | |
| 8.12 | Save entry | Click Add/Save | Entry added, dialog closes | | |
| 8.13 | View entry | Check meal section | New entry appears | | |
| 8.14 | Meal sections | Check all meal types | Correct categorization | | |
| 8.15 | Copy yesterday | Click copy action | Yesterday's meals copied | | |
| 8.16 | Delete entry | Delete a food item | Item removed, totals update | | |
| 8.17 | Loading states | Refresh | Skeletons show | | |

---

## 9. 🏋️ Exercise

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 9.1 | Page loads | Navigate to `/exercise` | Page displays | | |
| 9.2 | Auth guard | Visit logged out | Redirects to `/` | | |
| 9.3 | Mode selector | View initial screen | Cardio/Strength options | | |
| 9.4 | Select cardio | Click Cardio | Cardio flow starts | | |
| 9.5 | Select strength | Click Strength | Strength flow starts | | |
| 9.6 | Exercise search | Type exercise name | Results appear | | |
| 9.7 | Select exercise | Click result | Exercise selected | | |
| 9.8 | Enter details | Fill duration/sets/reps | Form accepts input | | |
| 9.9 | Calorie estimate | Check calories | Auto-calculated | | |
| 9.10 | Save workout | Click Save | Workout saved | | |
| 9.11 | View workout | Check today's workouts | New workout appears | | |
| 9.12 | Edit workout | Click edit | Edit form opens | | |
| 9.13 | Delete workout | Click delete | Workout removed | | |
| 9.14 | Workout review | Complete a workout | Review screen shows | | |

---

## 10. Progress

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 10.1 | Page loads | Navigate to `/progress` | Page displays | | |
| 10.2 | Auth guard | Visit logged out | Redirects to `/` | | |
| 10.3 | Date range selector | Click range buttons | Data updates | | |
| 10.4 | Weight chart | Check weight trend | Chart renders | | |
| 10.5 | Calorie chart | Check calorie intake | Chart renders | | |
| 10.6 | Macro breakdown | Check macros | Pie/bar chart renders | | |
| 10.7 | Exercise heatmap | Check exercise grid | Heatmap renders | | |
| 10.8 | Weekly comparison | Check comparison | Data displays | | |
| 10.9 | Streaks card | Check streaks | Current streak shown | | |
| 10.10 | Achievements | Check achievements | Badges/milestones shown | | |
| 10.11 | Insights | Check insights panel | AI insights display | | |
| 10.12 | Sleep data | Check sleep card | Sleep data displays | | |
| 10.13 | Loading states | Refresh | Skeletons show | | |
| 10.14 | Empty states | New user with no data | Appropriate messaging | | |

---

## 11. Profile

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 11.1 | Page loads | Navigate to `/profile` | Profile form displays | | |
| 11.2 | Auth guard | Visit logged out | Redirects to `/` | | |
| 11.3 | Pre-filled data | Check form fields | Current values shown | | |
| 11.4 | Edit display name | Change name | Field updates | | |
| 11.5 | Edit height | Change height | Field updates, converts units | | |
| 11.6 | Edit weight | Change weight | Field updates | | |
| 11.7 | Edit goals | Change calorie/macro goals | Fields update | | |
| 11.8 | Save profile | Click Save | Success message, data persisted | | |
| 11.9 | Validation errors | Enter invalid data | Errors shown | | |
| 11.10 | Avatar upload | Upload image | Avatar updates | | |
| 11.11 | Units toggle | Switch imperial/metric | Values convert | | |
| 11.12 | Loading state | Save form | Button shows loading | | |

---

## 12. Navigation

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 12.1 | Sidebar (desktop) | Check left sidebar | All nav items visible | | |
| 12.2 | Bottom nav (mobile) | Resize to mobile | Bottom nav appears | | |
| 12.3 | Active state | Navigate to page | Active nav highlighted | | |
| 12.4 | Profile menu | Click avatar | Dropdown opens | | |
| 12.5 | Logout | Click Logout | Logged out, redirects to `/` | | |
| 12.6 | Theme toggle | Toggle theme | Theme changes | | |

---

## 13. Dark Mode

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 13.1 | Toggle works | Click theme toggle | Mode switches | | |
| 13.2 | Persists | Refresh page | Theme persisted | | |
| 13.3 | All pages | Navigate all pages in dark | No contrast issues | | |
| 13.4 | Charts readable | Check progress charts | Colors visible | | |
| 13.5 | Forms readable | Check all forms | Inputs visible | | |
| 13.6 | Modals/dialogs | Open dialogs | Correct background | | |

---

## 14. Responsive Design

| # | Test Case | Steps | Expected Result | Pass/Fail | Bug Notes |
|---|-----------|-------|-----------------|-----------|-----------|
| 14.1 | Mobile (375px) | Resize to 375px | No horizontal scroll | | |
| 14.2 | Tablet (768px) | Resize to 768px | Proper layout | | |
| 14.3 | Desktop (1280px) | Resize to 1280px | Full layout | | |
| 14.4 | Touch targets | Test on mobile | Buttons large enough | | |
| 14.5 | Modals mobile | Open dialogs on mobile | Full screen or proper size | | |

---

## Bug Tracking

### Critical Bugs (Blocking)
| Bug ID | Description | Page | Steps to Reproduce | Priority |
|--------|-------------|------|-------------------|----------|
| | | | | |

### Major Bugs (High Impact)
| Bug ID | Description | Page | Steps to Reproduce | Priority |
|--------|-------------|------|-------------------|----------|
| | | | | |

### Minor Bugs (Low Impact)
| Bug ID | Description | Page | Steps to Reproduce | Priority |
|--------|-------------|------|-------------------|----------|
| | | | | |

### UI/UX Issues
| Bug ID | Description | Page | Steps to Reproduce | Priority |
|--------|-------------|------|-------------------|----------|
| | | | | |
