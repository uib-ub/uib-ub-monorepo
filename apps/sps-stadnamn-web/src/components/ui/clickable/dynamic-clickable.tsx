import { useContext } from "react";
import { ParamProps } from "./param-types";
import { GlobalContext } from "@/state/providers/global-provider";
import Clickable from "./clickable";
import ClickableIcon from "./clickable-icon";

export default function DynamicClickable({ children, label, ...rest }: ParamProps) {
    const {isMobile} = useContext(GlobalContext)

    if (isMobile) {
        return <ClickableIcon label={label} {...rest}>{children}</ClickableIcon>
        
    }
    else {
        return <Clickable {...rest}>{children}</Clickable> 
    }
}