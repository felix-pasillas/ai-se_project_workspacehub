import { describe, expect, it } from "vitest";
import {
  validateBookingFormState,
  type BookingFormState,
} from "./bookingValidation";

const buildForm = (
  overrides: Partial<BookingFormState> = {},
): BookingFormState => ({
  title: "Sprint planning",
  description: "",
  startsAt: "2026-04-06T09:00",
  endsAt: "2026-04-06T10:00",
  ...overrides,
});

describe("validateBookingFormState", () => {
  it("returns no errors for a valid form", () => {
    expect(validateBookingFormState(buildForm())).toEqual({});
  });

  describe("required fields", () => {
    it("requires a title", () => {
      expect(validateBookingFormState(buildForm({ title: "" }))).toEqual({
        title: "Title is required.",
      });
    });

    it("treats a title of only spaces as missing", () => {
      expect(validateBookingFormState(buildForm({ title: "   " }))).toEqual({
        title: "Title is required.",
      });
    });

    it("requires a start time", () => {
      expect(validateBookingFormState(buildForm({ startsAt: "" }))).toEqual({
        startsAt: "Start time is required.",
      });
    });

    it("requires an end time", () => {
      expect(validateBookingFormState(buildForm({ endsAt: "" }))).toEqual({
        endsAt: "End time is required.",
      });
    });

    it("reports every missing field at once", () => {
      expect(
        validateBookingFormState(
          buildForm({ title: "", startsAt: "", endsAt: "" }),
        ),
      ).toEqual({
        title: "Title is required.",
        startsAt: "Start time is required.",
        endsAt: "End time is required.",
      });
    });
  });

  describe("title length", () => {
    it("rejects a title shorter than 3 characters", () => {
      expect(validateBookingFormState(buildForm({ title: "ab" }))).toEqual({
        title: "Title must be at least 3 characters.",
      });
    });

    it("measures the title after trimming spaces", () => {
      expect(validateBookingFormState(buildForm({ title: "  ab  " }))).toEqual({
        title: "Title must be at least 3 characters.",
      });
    });

    it("accepts a title of exactly 3 characters", () => {
      expect(validateBookingFormState(buildForm({ title: "Q&A" }))).toEqual({});
    });
  });

  describe("invalid dates", () => {
    it("rejects an invalid start time", () => {
      expect(
        validateBookingFormState(buildForm({ startsAt: "not-a-date" })),
      ).toEqual({
        startsAt: "Start time must be a valid date.",
      });
    });

    it("rejects an invalid end time", () => {
      expect(
        validateBookingFormState(buildForm({ endsAt: "not-a-date" })),
      ).toEqual({
        endsAt: "End time must be a valid date.",
      });
    });
  });

  describe("end time after start time", () => {
    it("rejects an end time before the start time", () => {
      expect(
        validateBookingFormState(
          buildForm({
            startsAt: "2026-04-06T10:00",
            endsAt: "2026-04-06T09:00",
          }),
        ),
      ).toEqual({
        endsAt: "End time must be after the start time.",
      });
    });

    it("rejects an end time equal to the start time", () => {
      expect(
        validateBookingFormState(
          buildForm({
            startsAt: "2026-04-06T09:00",
            endsAt: "2026-04-06T09:00",
          }),
        ),
      ).toEqual({
        endsAt: "End time must be after the start time.",
      });
    });

    it("accepts an end time one minute after the start time", () => {
      expect(
        validateBookingFormState(
          buildForm({
            startsAt: "2026-04-06T09:00",
            endsAt: "2026-04-06T09:01",
          }),
        ),
      ).toEqual({});
    });

    it("does not compare the times when the start time is missing", () => {
      expect(validateBookingFormState(buildForm({ startsAt: "" }))).toEqual({
        startsAt: "Start time is required.",
      });
    });
  });
});
