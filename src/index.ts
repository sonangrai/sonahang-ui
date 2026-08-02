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

export * as colorTokens from './tokens/colors';
