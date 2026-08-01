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

export * as colorTokens from './tokens/colors';
