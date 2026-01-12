package barcode

import (
	"math"    // float comparisons
	"testing" // Go test framework
)

func TestParseServingSize(t *testing.T) {
	// Table of input strings and expected outputs.
	testCases := []struct {
		input       string  // raw serving size string
		wantValue   float64 // expected numeric value
		wantUnit    string  // expected unit
	}{
		{input: "30 g", wantValue: 30, wantUnit: "g"},   // spaced format
		{input: "30g", wantValue: 30, wantUnit: "g"},    // no-space format
		{input: " 30 G ", wantValue: 30, wantUnit: "g"}, // mixed case + spaces
		{input: "1.5 g", wantValue: 1.5, wantUnit: "g"}, // decimal value
		{input: "", wantValue: 100, wantUnit: "g"},      // empty -> default
		{input: "abc", wantValue: 100, wantUnit: "g"},   // invalid -> default
		{input: "0 g", wantValue: 100, wantUnit: "g"},   // zero -> default
	}

	for _, tc := range testCases { // run each case
		gotValue, gotUnit := parseServingSize(tc.input) // call the parser
		if math.Abs(gotValue-tc.wantValue) > 0.0001 {   // compare floats
			t.Fatalf("input=%q want=%.2f got=%.2f", tc.input, tc.wantValue, gotValue)
		}
		if gotUnit != tc.wantUnit { // compare unit
			t.Fatalf("input=%q want=%s got=%s", tc.input, tc.wantUnit, gotUnit)
		}
	}
}
