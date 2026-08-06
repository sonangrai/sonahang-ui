import { useId, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";

import { formatFileSize, isFileAccepted } from "./isFileAccepted";
import "./FileDrop.css";

const UploadIcon = () => (
  <svg
    className="sh-filedrop__icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 16V4m0 0L8 8m4-4 4 4" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);

const RemoveIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" strokeLinecap="round" />
  </svg>
);

export type FileDropProps = {
  /** Visible label for the field. */
  label?: ReactNode;
  /** Hint shown below the drop zone. Replaced by `error` when that's set. */
  helperText?: ReactNode;
  /** Validation message. Its presence also marks the field invalid. */
  error?: ReactNode;
  /** Prompt inside the drop zone. */
  placeholder?: ReactNode;
  /** Allowed types, same syntax as the `accept` attribute: ".pdf,image/*". */
  accept?: string;
  /** Allow picking more than one file. */
  multiple?: boolean;
  /** Selected files — makes the component controlled. */
  value?: File[];
  /** Initial files when uncontrolled. */
  defaultValue?: File[];
  /** Fired with the full list of selected files. */
  onChange?: (files: File[]) => void;
  /** Fired with files rejected by `accept`, so they're never dropped silently. */
  onReject?: (files: File[]) => void;
  /** Hides the list of selected files. */
  hideFileList?: boolean;
  disabled?: boolean;
  name?: string;
  /** Accessible name when there's no visible `label`. */
  "aria-label"?: string;
  /** Class for the wrapper. Use `inputClassName` for the file input. */
  className?: string;
  inputClassName?: string;
};

/**
 * File picker that accepts both a click and a drag-and-drop.
 *
 * A real `<input type="file">` wrapped in a `<label>`, so clicking anywhere in
 * the zone opens the picker and the control stays keyboard-operable without
 * any JavaScript. The zone itself is painted alongside it.
 */
export function FileDrop({
  label,
  helperText,
  error,
  placeholder = "Drag files here, or click to browse",
  accept,
  multiple = false,
  value,
  defaultValue,
  onChange,
  onReject,
  hideFileList = false,
  disabled = false,
  name,
  "aria-label": ariaLabel,
  className,
  inputClassName,
}: FileDropProps) {
  const inputId = useId();
  const messageId = useId();

  const [uncontrolledFiles, setUncontrolledFiles] = useState<File[]>(defaultValue ?? []);
  const isControlled = value !== undefined;
  const files = isControlled ? value : uncontrolledFiles;

  const [isDragging, setIsDragging] = useState(false);
  // dragenter/dragleave also fire for child elements, so a boolean alone
  // flickers. Counting entries against leaves is what keeps the state stable.
  const dragDepth = useRef(0);

  const invalid = Boolean(error);
  const message = error ?? helperText;

  const commit = (next: File[]) => {
    if (!isControlled) setUncontrolledFiles(next);
    onChange?.(next);
  };

  const acceptFiles = (incoming: File[]) => {
    const allowed = incoming.filter((file) => isFileAccepted(file, accept));
    const rejected = incoming.filter((file) => !isFileAccepted(file, accept));

    if (rejected.length > 0) onReject?.(rejected);
    if (allowed.length === 0) return;

    commit(multiple ? [...files, ...allowed] : [allowed[0]]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFiles(Array.from(event.target.files ?? []));
    // Let the same file be picked again after being removed.
    event.target.value = "";
  };

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (disabled) return;
    // Without this the browser navigates to the file instead of firing drop.
    event.preventDefault();
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    acceptFiles(Array.from(event.dataTransfer?.files ?? []));
  };

  const removeFile = (index: number) => {
    commit(files.filter((_, i) => i !== index));
  };

  const classes = [
    "sh-filedrop",
    invalid && "sh-filedrop--invalid",
    disabled && "sh-filedrop--disabled",
    isDragging && "sh-filedrop--dragging",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {label && (
        <label className="sh-filedrop__label" htmlFor={inputId}>
          {label}
        </label>
      )}

      {/*
        The <label> wrapper is what makes a click anywhere in the zone open the
        picker, with no onClick handler and no ref juggling.
      */}
      <label
        className="sh-filedrop__dropzone"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          type="file"
          className={["sh-filedrop__input", inputClassName].filter(Boolean).join(" ")}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          name={name}
          onChange={handleInputChange}
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={invalid || undefined}
          aria-describedby={message ? messageId : undefined}
        />
        <span className="sh-filedrop__prompt" aria-hidden="true">
          <UploadIcon />
          <span className="sh-filedrop__placeholder">{placeholder}</span>
          {accept && <span className="sh-filedrop__accept">{accept}</span>}
        </span>
      </label>

      {!hideFileList && files.length > 0 && (
        <ul className="sh-filedrop__files">
          {files.map((file, index) => (
            <li className="sh-filedrop__file" key={`${file.name}-${index}`}>
              <span className="sh-filedrop__file-name">{file.name}</span>
              <span className="sh-filedrop__file-size">{formatFileSize(file.size)}</span>
              <button
                type="button"
                className="sh-filedrop__file-remove"
                onClick={() => removeFile(index)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
              >
                <RemoveIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <span id={messageId} className="sh-filedrop__message">
          {message}
        </span>
      )}
    </div>
  );
}
