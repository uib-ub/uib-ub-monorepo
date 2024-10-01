export default function InfoLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="dataset-info p-8 flex flex-col gap-2 h-full !overflow-y-auto">
        {children}
        </div>
    )
}