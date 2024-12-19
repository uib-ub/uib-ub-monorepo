"use client"
import dynamic from 'next/dynamic'

const Viewer = dynamic(() => import('@samvera/clover-iiif/viewer'), {
  ssr: false,
})

const customTheme = {
  colors: {
    /**
     * Black and dark grays in a light theme.
     * All must contrast to 4.5 or greater with `secondary`.
     */
    primary: "#37474F",
    primaryMuted: "#546E7A",
    primaryAlt: "#263238",

    /**
     * Key brand color(s).
     * `accent` must contrast to 4.5 or greater with `secondary`.
     */
    accent: "#C62828",
    accentMuted: "#E57373",
    accentAlt: "#B71C1C",

    /**
     * White and light grays in a light theme.
     * All must must contrast to 4.5 or greater with `primary` and  `accent`.
     */
    secondary: "#FFFFFF",
    secondaryMuted: "#ECEFF1",
    secondaryAlt: "#CFD8DC",
  },
  fonts: {
    sans: "'Helvetica Neue', sans-serif",
    display: "Optima, Georgia, Arial, sans-serif",
  },
};

const ManifestViewer = (props: any) => {
  return <Viewer {...props} theme={customTheme} />
}

export default ManifestViewer