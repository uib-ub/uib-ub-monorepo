import { Button } from "@/components/ui/button"
import { signOut } from "@/auth"

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <Button
        type="submit"
        variant="ghost"
        size="sm"
      >
        Logg ut
      </Button>
    </form>
  )
}