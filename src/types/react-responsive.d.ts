declare module 'react-responsive' {
    import * as React from 'react';

    export interface MediaQueryMatchers {
        all?: boolean;
        grid?: boolean;
        aural?: boolean;
        braille?: boolean;
        handheld?: boolean;
        print?: boolean;
        projection?: boolean;
        screen?: boolean;
        tty?: boolean;
        tv?: boolean;
        embossed?: boolean;

        // Media features
        minAspectRatio?: string;
        maxAspectRatio?: string;

        minDeviceAspectRatio?: string;
        maxDeviceAspectRatio?: string;

        minHeight?: number | string;
        maxHeight?: number | string;

        minDeviceHeight?: number | string;
        maxDeviceHeight?: number | string;

        minWidth?: number | string;
        maxWidth?: number | string;

        minDeviceWidth?: number | string;
        maxDeviceWidth?: number | string;

        minColor?: number;
        maxColor?: number;

        minColorIndex?: number;
        maxColorIndex?: number;

        minMonochrome?: number;
        maxMonochrome?: number;

        minResolution?: number | string;
        maxResolution?: number | string;

        scan?: 'progressive' | 'interlace';
        orientation?: 'portrait' | 'landscape';

        // Custom
        device?: MediaQueryMatchers,
        type?: string
    }

    export interface MediaQueryProps extends MediaQueryMatchers {
        component?: React.ReactNode | React.ElementType,
        children?: React.ReactNode | ((matches: boolean) => React.ReactNode),
        query?: string,
        style?: React.CSSProperties,
        className?: string,
        values?: Partial<MediaQueryMatchers>,
        onBeforeChange?: (matches: boolean) => void,
        onChange?: (matches: boolean) => void,
    }

    export default class MediaQuery extends React.Component<MediaQueryProps> {
    }

    export function useMediaQuery(
        settings: Partial<MediaQueryProps>,
        device?: MediaQueryMatchers,
        callback?: (matches: boolean) => void
    ): boolean;
}