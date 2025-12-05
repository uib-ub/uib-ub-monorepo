import { GlobalContext } from "@/state/providers/global-provider";
import { useContext } from "react";
import Clickable from "./clickable";
import ClickableIcon from "./clickable-icon";
import { ParamProps } from "./param-types";

export default function DynamicClickable({ children, label, ...rest }: ParamProps) {
    const { isMobile } = useContext(GlobalContext)

    if (isMobile) {
        return <ClickableIcon label={label} {...rest}>{children}</ClickableIcon>

    }
    else {
        return <Clickable {...rest}>{children}</Clickable>
    }
}