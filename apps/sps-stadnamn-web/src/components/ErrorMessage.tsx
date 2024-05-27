
export default function ErrorMessage({ error, message }: { error: Record<string, string>, message: string}) {
    return (
        <div  role="status" aria-live="polite" className="space-y-2 m-8 md:m-16">
                <h2 className="text-3xl font-semibold">{error.status}</h2>
                <p className="text-xl">{message}</p>
                <p className="text-neutral-700 mt-4">{error.error}</p>
        </div>
    )
}