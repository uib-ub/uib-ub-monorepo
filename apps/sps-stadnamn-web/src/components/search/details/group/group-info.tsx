import useGroupData from "@/state/hooks/group-data";

export default function GroupInfo() {
    const { groupData } = useGroupData()

    
    return (
        <div className="p-2 border-b border-neutral-200 w-full">
            <h2 className="text-lg font-semibold mb-2">Resultater</h2>
            {JSON.stringify(groupData)}
        </div>
    );
}