export interface BookingFormState {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
}

export type BookingFormErrors = Partial<Record<keyof BookingFormState, string>>;

const MIN_TITLE_LENGTH = 3;

export const validateBookingFormState = (
  formState: BookingFormState,
): BookingFormErrors => {
  const errors: BookingFormErrors = {};
  const title = formState.title.trim();
  const startsAt = new Date(formState.startsAt).getTime();
  const endsAt = new Date(formState.endsAt).getTime();

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length < MIN_TITLE_LENGTH) {
    errors.title = `Title must be at least ${MIN_TITLE_LENGTH} characters.`;
  }

  if (!formState.startsAt) {
    errors.startsAt = "Start time is required.";
  } else if (Number.isNaN(startsAt)) {
    errors.startsAt = "Start time must be a valid date.";
  }

  if (!formState.endsAt) {
    errors.endsAt = "End time is required.";
  } else if (Number.isNaN(endsAt)) {
    errors.endsAt = "End time must be a valid date.";
  }

  if (!errors.startsAt && !errors.endsAt && endsAt <= startsAt) {
    errors.endsAt = "End time must be after the start time.";
  }

  return errors;
};
