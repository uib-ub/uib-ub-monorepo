'use client'
import Clickable from "@/components/ui/clickable/clickable";

export default function DebugList() {
    return <ul className="absolute bottom-0 left-0 z-[20200] bg-white p-2 flex gap-2 flex-col">
        <li><Clickable link className="focus:bg-blue-100" add={{ group: 'aDNfODgwOWFiNjc2NWZmZmZmX09z' }}>aDNfODgwOWFiNjc2NWZmZmZmX09z</Clickable></li>
        <li><Clickable link className="focus:bg-blue-100" add={{ group: 'aDNfODgwOWFiNjc2NWZmZmZmX090dGVzdGFk' }}>aDNfODgwOWFiNjc2NWZmZmZmX090dGVzdGFk</Clickable></li>
        <li><Clickable link className="focus:bg-blue-100" add={{ group: 'aDNfODgwOWFiNjc2MWZmZmZmX0VsdmV0dW4gKCBvcyAp' }}>aDNfODgwOWFiNjc2MWZmZmZmX0VsdmV0dW4gKCBvcyAp</Clickable></li>
        <li><Clickable link className="focus:bg-blue-100" add={{ group: 'aDNfODgwOWFiNjc2MWZmZmZmX0tyaW5nc2rDpQ' }}>aDNfODgwOWFiNjc2MWZmZmZmX0tyaW5nc2rDpQ</Clickable></li>
        <li><Clickable link className="focus:bg-blue-100" add={{ group: 'aDNfODg2MmMwNGFjOWZmZmZmX09z' }}>aDNfODg2MmMwNGFjOWZmZmZmX09z</Clickable></li>
    </ul>
}