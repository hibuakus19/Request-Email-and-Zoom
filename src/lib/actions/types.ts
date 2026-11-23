export type FormActionStatus = "idle" | "success" | "error";

export type FormActionState = {
  status: FormActionStatus;
  message?: string;
  fieldErrors?: Record<string, string>;
  reference?: string;
};

export const initialFormState: FormActionState = {
  status: "idle",
};
