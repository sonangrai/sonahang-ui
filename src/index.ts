/**
 * Package entry point. Only what's exported here is public API —
 * everything else (App, stories, demo assets) is excluded from the
 * published build.
 *
 * Consumers also need the stylesheet:
 *   import 'sonahang-ui/style.css'
 */
import './tokens/fonts.css';
import './tokens/colors.css';
import './tokens/colors.semantic.css';
import './tokens/typography.css';

export { Text, textVariants, textColors, textWeights } from './components/Text';
export type { TextProps, TextVariant, TextColor, TextWeight } from './components/Text';

export { Button, buttonVariants, buttonSizes, buttonClassNames } from './components/Button';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonClassNameOptions,
} from './components/Button';

export { EmptyState } from './components/EmptyState';
export type {
  EmptyStateProps,
  EmptyStateAction,
  EmptyStateHeadingLevel,
} from './components/EmptyState';

export { Tag, tagVariants } from './components/Tag';
export type { TagProps, TagVariant } from './components/Tag';

export { Chip, chipVariants, chipActions } from './components/Chip';
export type { ChipProps, ChipVariant, ChipAction } from './components/Chip';

export { Avatar, AvatarGroup, avatarSizes } from './components/Avatar';
export type { AvatarProps, AvatarGroupProps, AvatarSize } from './components/Avatar';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export { InputOtp, sanitizeOtpValue, otpTypes } from './components/InputOtp';
export type {
  InputOtpProps,
  OtpType,
  SanitizeOtpValueOptions,
} from './components/InputOtp';

export {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from './components/Dropdown';
export type {
  DropdownProps,
  DropdownTriggerProps,
  DropdownMenuProps,
  DropdownItemProps,
  DropdownSeparatorProps,
  DropdownPlacement,
  DropdownAlign,
} from './components/Dropdown';

export { CodeBlock, dedentCode } from './components/CodeBlock';
export type { CodeBlockProps } from './components/CodeBlock';

export { Dialog, dialogSizes, dialogRoles } from './components/Dialog';
export type { DialogProps, DialogSize, DialogRole } from './components/Dialog';

export { Drawer, drawerSides, drawerSizes } from './components/Drawer';
export type { DrawerProps, DrawerSide, DrawerSize } from './components/Drawer';

export { Tooltip, resolveTooltipPlacement } from './components/Tooltip';
export type {
  TooltipProps,
  TooltipPlacement,
  TooltipSide,
  TooltipRect,
  ResolveTooltipPlacementOptions,
} from './components/Tooltip';

export { Select } from './components/Select';
export type { SelectProps, SelectOption, SelectOptionGroup } from './components/Select';

export { Textarea } from './components/Textarea';
export type { TextareaProps, TextareaResize } from './components/Textarea';

export { Checkbox, CheckboxGroup } from './components/Checkbox';
export type { CheckboxProps, CheckboxGroupProps } from './components/Checkbox';

export { Radio, RadioGroup } from './components/Radio';
export type { RadioProps, RadioGroupProps } from './components/Radio';

export { Pagination, getPaginationRange } from './components/Pagination';
export type {
  PaginationProps,
  PaginationItem,
  PaginationRangeOptions,
} from './components/Pagination';

export { Accordion, AccordionItem } from './components/Accordion';
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionType,
  AccordionHeadingLevel,
} from './components/Accordion';

export { Stepper, Step } from './components/Stepper';
export type { StepperProps, StepProps, StepperOrientation, StepStatus } from './components/Stepper';

export { Breadcrumb, BreadcrumbItem } from './components/Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItemProps } from './components/Breadcrumb';

export { Tabs, TabList, Tab, TabPanel } from './components/Tabs';
export type {
  TabsProps,
  TabListProps,
  TabProps,
  TabPanelProps,
  TabsOrientation,
  TabsActivation,
} from './components/Tabs';

export { Skeleton, skeletonVariants, skeletonAnimations } from './components/Skeleton';
export type { SkeletonProps, SkeletonVariant, SkeletonAnimation } from './components/Skeleton';

export { Spinner, spinnerSizes } from './components/Spinner';
export type { SpinnerProps, SpinnerSize } from './components/Spinner';

export { ProgressBar, progressBarSizes } from './components/ProgressBar';
export type { ProgressBarProps, ProgressBarSize } from './components/ProgressBar';

export { Alert, alertVariants } from './components/Alert';
export type { AlertProps, AlertVariant } from './components/Alert';

export { FileDrop, isFileAccepted, formatFileSize } from './components/FileDrop';
export type { FileDropProps } from './components/FileDrop';

export { RangeSlider } from './components/RangeSlider';
export type { RangeSliderProps } from './components/RangeSlider';

export { MinMaxSlider } from './components/MinMaxSlider';
export type { MinMaxSliderProps, MinMaxValue } from './components/MinMaxSlider';

export { Switch, SwitchGroup } from './components/Switch';
export type { SwitchProps, SwitchGroupProps } from './components/Switch';

export { SegmentedControl } from './components/SegmentedControl';
export type {
  SegmentedControlProps,
  SegmentedControlOption,
} from './components/SegmentedControl';

/**
 * Design tokens. The stylesheet already defines every color as a CSS var
 * (`--color-accent-600`, `--color-bg-surface`, …) — these are the same
 * values in JS, for charts, canvases and anywhere a var won't reach.
 */
export { palette, semanticColors, accentFill, colorVar, paletteVar } from './tokens/colors';
export type {
  PaletteName,
  AccentStep,
  NeutralStep,
  DangerStep,
  ColorTheme,
  SemanticColorName,
} from './tokens/colors';
export * as colorTokens from './tokens/colors';
