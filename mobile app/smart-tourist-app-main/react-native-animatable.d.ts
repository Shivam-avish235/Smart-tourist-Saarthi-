declare module "react-native-animatable" {
  import * as React from "react";
  import { ViewProps, TextProps, ImageProps } from "react-native";

  export interface AnimatableAnimation {
    from?: object;
    to?: object;
  }

  export interface AnimatableProperties {
    animation?: string | AnimatableAnimation;
    duration?: number;
    delay?: number;
    iterationCount?: number | "infinite";
    direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
    easing?: string;
    onAnimationBegin?: () => void;
    onAnimationEnd?: () => void;
    useNativeDriver?: boolean;
  }

  export type AnimatableViewProps = ViewProps & AnimatableProperties;
  export type AnimatableTextProps = TextProps & AnimatableProperties;
  export type AnimatableImageProps = ImageProps & AnimatableProperties;

  export class View extends React.Component<AnimatableViewProps> {}
  export class Text extends React.Component<AnimatableTextProps> {}
  export class Image extends React.Component<AnimatableImageProps> {}

  export function createAnimatableComponent<P>(
    component: React.ComponentType<P>
  ): React.ComponentType<P & AnimatableProperties>;
}
