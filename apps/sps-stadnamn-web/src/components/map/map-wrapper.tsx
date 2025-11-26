'use client'
import Spinner from "../svg/Spinner";
import dynamic from "next/dynamic";

const MapExplorer = dynamic(() => import("@/components/map/map-explorer"), {
    ssr: false,
    loading: () => (

            <Spinner className="h-32 w-32 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" status="Laster kart"/>
           

    ),
});

export default function MapWrapper() {
    return  <MapExplorer/>
}