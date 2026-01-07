# PRD: Data Export

> **Status:** Not Started
> **Priority:** Medium
> **Effort:** Low (2-3 days)
> **Dependencies:** None

---

## Problem Statement

Users need to export their health data for various reasons:

- **Doctor visits**: Share nutrition/weight history with healthcare providers
- **Data portability**: Switch to another app without losing history
- **Personal analysis**: Use spreadsheet tools for custom analysis
- **Backup**: Keep personal copy of their data
- **Compliance**: GDPR right to data portability

**Goal:** Enable users to export their data in standard, useful formats.

---

## Goals

### Must Have

- [ ] Export food diary (meals, nutrition)
- [ ] Export weight history
- [ ] Export exercise log
- [ ] CSV format support
- [ ] Date range selection
- [ ] Download as file

### Should Have

- [ ] PDF report format
- [ ] Export water intake
- [ ] Export step count
- [ ] JSON format for developers
- [ ] Email export option

### Nice to Have

- [ ] Scheduled automatic exports
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] MyFitnessPal-compatible format
- [ ] Visualizations in PDF report

### Non-Goals

- Real-time API access for third parties
- Importing data from other apps (separate feature)
- Sharing exports with other users

---

## User Stories

### As a user visiting a doctor

- I want to print my food diary for the past month
- I want a summary of my nutrition trends
- I want my weight history as a simple chart

### As a data-conscious user

- I want to download all my data periodically
- I want my export in a standard format I can open anywhere
- I want to choose exactly what data to export

### As a user leaving the app

- I want to take all my historical data with me
- I want the export to be complete and accurate

---

## Export Formats

### CSV (Primary)

Simple, universal format. One file per data type.

**food_diary.csv:**

```csv
date,meal_type,food_name,quantity,calories,protein_g,carbs_g,fat_g
2024-01-15,breakfast,Oatmeal,1 cup,150,5,27,3
2024-01-15,breakfast,Banana,1 medium,105,1,27,0
2024-01-15,lunch,Grilled Chicken,150g,248,46,0,5
```

**weight_history.csv:**

```csv
date,weight_kg,weight_lbs,notes
2024-01-15,80.5,177.5,Morning weigh-in
2024-01-14,80.8,178.1,
```

**exercise_log.csv:**

```csv
date,exercise_name,duration_min,calories_burned,sets,reps,notes
2024-01-15,Running,30,350,,,5K run
2024-01-15,Bench Press,15,75,4,10,
```

### JSON (Developer-friendly)

Complete data export with relationships.

```json
{
  "exportDate": "2024-01-20T10:30:00Z",
  "user": {
    "email": "user@example.com",
    "createdAt": "2023-06-01T00:00:00Z"
  },
  "profile": {
    "height": 180,
    "goalType": "lose_weight",
    "calorieGoal": 2000
  },
  "diaryEntries": [...],
  "weightEntries": [...],
  "workoutSessions": [...],
  "waterIntake": [...],
  "stepCounts": [...]
}
```

### PDF Report

Visual summary with charts.

**Sections:**

1. Profile summary
2. Date range overview
3. Nutrition summary (avg daily intake)
4. Weight trend chart
5. Exercise summary
6. Detailed daily logs (optional)

---

## Technical Architecture

### Export Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │     │   Server     │     │   Database   │
│   (React)    │────▶│   (Node)     │────▶│  (Postgres)  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       │ 1. Request export  │                     │
       │    (format, range) │                     │
       │───────────────────▶│                     │
       │                    │ 2. Query data       │
       │                    │────────────────────▶│
       │                    │                     │
       │                    │ 3. Format data      │
       │                    │◀────────────────────│
       │                    │                     │
       │ 4. Download file   │                     │
       │◀───────────────────│                     │
```

### Server Functions

**File:** `src/server/export.ts`

```typescript
interface ExportOptions {
  format: "csv" | "json" | "pdf";
  startDate: Date;
  endDate: Date;
  include: {
    diary: boolean;
    weight: boolean;
    exercise: boolean;
    water: boolean;
    steps: boolean;
  };
}

// Generate export file
export async function generateExport(
  userId: string,
  options: ExportOptions
): Promise<ExportResult>

// Get export history
export async function getExportHistory(userId: string): Promise<Export[]>
```

### File Generation

| Format | Library | Output |
|--------|---------|--------|
| CSV | `csv-stringify` | Multiple .csv files in .zip |
| JSON | Native JSON | Single .json file |
| PDF | `@react-pdf/renderer` or `pdfkit` | Single .pdf file |

---

## Implementation Plan

### Phase 1: CSV Export (Day 1)

#### 1.1 Export API

**File:** `src/server/export.ts`

```typescript
export async function exportToCSV(
  userId: string,
  options: ExportOptions
): Promise<Buffer> // ZIP file buffer
```

#### 1.2 CSV Generation

- Query each data type within date range
- Format as CSV with headers
- Bundle into ZIP file
- Return for download

#### 1.3 Download UI

**File:** `src/components/export/ExportDialog.tsx`

- Format selection (CSV, JSON, PDF)
- Date range picker
- Data type checkboxes
- Export button
- Progress indicator

### Phase 2: JSON Export (Day 1-2)

#### 2.1 Complete Data Export

```typescript
export async function exportToJSON(
  userId: string,
  options: ExportOptions
): Promise<string>
```

- Include all selected data types
- Preserve relationships
- Pretty-print for readability

### Phase 3: PDF Report (Day 2-3)

#### 3.1 Report Template

**File:** `src/components/export/PDFReport.tsx`

Using `@react-pdf/renderer`:

```typescript
const NutritionReport = ({ data }: ReportProps) => (
  <Document>
    <Page size="A4">
      <Header title="Nutrition Report" />
      <ProfileSummary profile={data.profile} />
      <NutritionSummary diary={data.diary} />
      <WeightChart weights={data.weights} />
      <DailyLogs entries={data.diary} />
    </Page>
  </Document>
);
```

#### 3.2 Charts in PDF

- Weight trend line chart
- Calorie/macro bar charts
- Exercise summary pie chart

### Phase 4: Polish (Day 3)

- Export history tracking
- Email delivery option
- Error handling
- Large export handling (pagination/streaming)

---

## UI/UX Design

### Export Dialog

```
┌─────────────────────────────────┐
│  Export Your Data          ✕    │
├─────────────────────────────────┤
│                                 │
│  Format:                        │
│  ┌─────────────────────────────┐│
│  │ ● CSV (spreadsheet)         ││
│  │ ○ JSON (developer)          ││
│  │ ○ PDF (printable report)    ││
│  └─────────────────────────────┘│
│                                 │
│  Date Range:                    │
│  ┌────────────┐ ┌────────────┐ │
│  │ 2024-01-01 │ │ 2024-01-31 │ │
│  └────────────┘ └────────────┘ │
│  [Last 7 days] [Last 30 days]   │
│  [Last 3 months] [All time]     │
│                                 │
│  Include:                       │
│  ☑ Food Diary                   │
│  ☑ Weight History               │
│  ☑ Exercise Log                 │
│  ☑ Water Intake                 │
│  ☑ Step Count                   │
│                                 │
├─────────────────────────────────┤
│                                 │
│  [Cancel]      [Export & Download]
│                                 │
└─────────────────────────────────┘
```

### PDF Report Preview

```
┌─────────────────────────────────┐
│  HealthMetrics                  │
│  Nutrition Report               │
│  Jan 1 - Jan 31, 2024           │
├─────────────────────────────────┤
│                                 │
│  PROFILE SUMMARY                │
│  ─────────────────────────────  │
│  Goal: Lose Weight              │
│  Daily Target: 2,000 cal        │
│  Starting Weight: 185 lbs       │
│  Current Weight: 180 lbs        │
│                                 │
│  NUTRITION OVERVIEW             │
│  ─────────────────────────────  │
│  Avg Daily Intake: 1,850 cal    │
│  Avg Protein: 120g              │
│  Avg Carbs: 180g                │
│  Avg Fat: 65g                   │
│                                 │
│  WEIGHT TREND                   │
│  ─────────────────────────────  │
│  [Line chart showing trend]     │
│                                 │
│  -5 lbs from start              │
│                                 │
└─────────────────────────────────┘
```

---

## File Structure

```
src/
├── components/
│   └── export/
│       ├── ExportDialog.tsx
│       ├── ExportOptions.tsx
│       ├── ExportProgress.tsx
│       ├── PDFReport.tsx
│       ├── PDFCharts.tsx
│       └── index.ts
├── server/
│   └── export.ts
├── hooks/
│   └── useExport.ts
├── types/
│   └── export.ts
└── utils/
    ├── csv-helpers.ts
    └── pdf-helpers.ts
```

---

## Data Privacy

### Included in Export

- All user-generated content
- Calculated values (totals, averages)
- Timestamps

### Excluded from Export

- Password/authentication data
- Internal IDs (replaced with readable identifiers)
- Billing/payment information
- Other users' data

### Security

- Exports require authentication
- Temporary download links (expire in 1 hour)
- Rate limited (max 5 exports per hour)
- Logged for audit purposes

---

## Error Handling

| Scenario | User Experience |
|----------|-----------------|
| No data in range | "No data found for selected dates" |
| Export too large | Split into multiple files or paginate |
| Generation fails | "Export failed. Please try again" with retry |
| Network error during download | Resume download capability |

---

## Acceptance Criteria

### Functional

- [ ] User can export diary as CSV
- [ ] User can export weight as CSV
- [ ] User can export exercise as CSV
- [ ] User can export all data as JSON
- [ ] User can generate PDF report
- [ ] Date range filtering works
- [ ] Data type selection works

### Data Quality

- [ ] All dates formatted consistently
- [ ] Numbers properly formatted (decimals, units)
- [ ] No data loss in export
- [ ] UTF-8 encoding for special characters

### UX

- [ ] Clear format descriptions
- [ ] Quick presets for date ranges
- [ ] Progress indicator for large exports
- [ ] Successful download confirmation

---

## Future Enhancements

- **Scheduled exports**: Weekly/monthly automatic exports
- **Cloud backup**: Save to Google Drive, Dropbox, iCloud
- **Import**: Import data from MyFitnessPal, Cronometer
- **Share with doctor**: Secure sharing link
- **API access**: Developer API for data access
- **Comparison reports**: Compare two time periods

---

## References

- [csv-stringify](https://csv.js.org/stringify/)
- [@react-pdf/renderer](https://react-pdf.org/)
- [GDPR Data Portability](https://gdpr.eu/right-to-data-portability/)
- [archiver (ZIP)](https://github.com/archiverjs/node-archiver)
