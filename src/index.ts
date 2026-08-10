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

export { Button, buttonVariants, buttonSizes } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button';

export { Tag, tagVariants } from './components/Tag';
export type { TagProps, TagVariant } from './components/Tag';

export { Chip, chipVariants, chipActions } from './components/Chip';
export type { ChipProps, ChipVariant, ChipAction } from './components/Chip';

export { Avatar, AvatarGroup, avatarSizes } from './components/Avatar';
export type { AvatarProps, AvatarGroupProps, AvatarSize } from './components/Avatar';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

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

export * as colorTokens from './tokens/colors';
